import { ApiResponse, AuthTokens, RoleType, PermissionKey } from '@al-husseiniya/types';

const API_BASE = '/api/v1';

export class ApiClient {
  private static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private static getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  public static setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  public static clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try token refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry original request once
          headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
          const retryRes = await fetch(url, { ...options, headers });
          return await retryRes.json();
        }
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to communicate with the server',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const json = await res.json();
      if (json.success && json.data) {
        this.setTokens(json.data);
        return true;
      }
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }
}

export default ApiClient;
