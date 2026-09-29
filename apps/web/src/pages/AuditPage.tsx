import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { AuditLog } from '@al-husseiniya/types';
import { useLocalization } from '../context/LocalizationContext';
import { ClipboardList, Shield, Filter, Search, CheckCircle } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { t, isRtl } = useLocalization();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');

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

  const filteredLogs = logs.filter((l) => {
    if (targetTypeFilter !== 'ALL' && l.targetType !== targetTypeFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ClipboardList size={22} color="#087f78" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1f2a', letterSpacing: '-0.02em', margin: 0 }}>
              {t('audit.title')}
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {t('audit.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8125rem' }}>
          <Filter size={15} />
          <span>{t('audit.entity_filter')}</span>
        </div>

        <select
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
        >
          <option value="ALL">All Entity Types</option>
          <option value="ORGANIZATION">Organization</option>
          <option value="BUSINESS">Business</option>
          <option value="USER">User Account</option>
          <option value="KNOWLEDGE_CONTENT">Knowledge / Article</option>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="REPORT">Report / Moderation</option>
        </select>

        <span style={{ marginInlineStart: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          {t('audit.total_records')} {filteredLogs.length}
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>{t('common.loading')}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No audit records available in this scope.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', padding: 0, borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: isRtl ? 'right' : 'left', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.action_code')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.entity_type')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.entity_id')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.actor')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.ip')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('audit.time')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    <span className="badge badge-neutral">{log.action}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 500 }}>{log.targetType}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{log.targetId}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{log.actorId || 'system'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{log.ipAddress || '127.0.0.1'}</td>
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
