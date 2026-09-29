import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { Report, ReportStatus } from '@al-husseiniya/types';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const ModerationPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const res = await ApiClient.request<Report[]>('/reports');
    if (res.success && res.data) {
      setReports(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id: string, status: ReportStatus.RESOLVED | ReportStatus.DISMISSED) => {
    const res = await ApiClient.request(`/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        resolution: status === ReportStatus.RESOLVED ? 'Action taken by moderator' : 'Dismissed after review',
      }),
    });

    if (res.success) {
      loadReports();
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Community Moderation Queue</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Review reported concerns, safety violations, or disputed entity registrations.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading moderation queue...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No pending moderation reports.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge badge-${r.status === 'SUBMITTED' ? 'warning' : 'neutral'}`}>{r.status}</span>
                  <span className="badge badge-info">{r.targetType}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target ID: {r.targetId}</span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Reason: {r.reason}</h4>
                <p style={{ fontSize: '0.875rem', color: '#475569' }}>{r.description}</p>
              </div>

              {r.status === 'SUBMITTED' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleResolve(r.id, ReportStatus.RESOLVED)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                    <CheckCircle size={14} />
                    <span>Resolve</span>
                  </button>
                  <button onClick={() => handleResolve(r.id, ReportStatus.DISMISSED)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                    <XCircle size={14} />
                    <span>Dismiss</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
