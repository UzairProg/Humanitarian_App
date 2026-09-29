import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { AuditLog } from '@al-husseiniya/types';
import { ClipboardList } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await ApiClient.request<AuditLog[]>('/audit');
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>System Audit Logs</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Immutable operational trail tracking entity creation, role assignments, and verification actions.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading audit records...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No audit records available.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actor ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    <span className="badge badge-neutral">{log.action}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{log.targetType}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{log.targetId}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{log.actorId || 'system'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{log.ipAddress || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
