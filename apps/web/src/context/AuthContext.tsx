import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoleType, PermissionKey, IUser } from '@al-husseiniya/types';
import ApiClient from '../services/api';

interface AuthContextType {
  user: IUser | null;
  roles: RoleType[];
  permissions: PermissionKey[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (...roles: RoleType[]) => boolean;
  hasPermission: (...permissions: PermissionKey[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on mount
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setRoles(parsed.roles || []);
        setPermissions(parsed.permissions || []);
      } catch {
        ApiClient.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await ApiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      const { user: userData, roles: userRoles, permissions: userPerms, tokens } = res.data;
      ApiClient.setTokens(tokens);
      setUser(userData);
      setRoles(userRoles);
      setPermissions(userPerms);
      localStorage.setItem(
        'user_session',
        JSON.stringify({ user: userData, roles: userRoles, permissions: userPerms }),
      );
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Login failed. Please check your credentials.',
    };
  };

  const logout = () => {
    ApiClient.clearTokens();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const hasRole = (...requiredRoles: RoleType[]): boolean => {
    if (roles.includes(RoleType.SUPER_ADMIN)) return true;
    return requiredRoles.some((r) => roles.includes(r));
  };

  const hasPermission = (...requiredPermissions: PermissionKey[]): boolean => {
    if (roles.includes(RoleType.SUPER_ADMIN)) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
