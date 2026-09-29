import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { Report, ReportStatus } from '@al-husseiniya/types';
import { useLocalization } from '../context/LocalizationContext';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Filter,
  Eye,
  MessageSquare,
  ShieldCheck,
  Ban,
  Clock,
} from 'lucide-react';

export const ModerationPage: React.FC = () => {
  const { t, isRtl } = useLocalization();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  // Resolution modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ReportStatus.RESOLVED | ReportStatus.DISMISSED>(
    ReportStatus.RESOLVED
  );
  const [actionTaken, setActionTaken] = useState<string>('WARN_USER');
  const [resolutionMessage, setResolutionMessage] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadReports = async () => {
    setLoading(true);
    let url = '/reports';
    const params = new URLSearchParams();
    if (activeTab === 'pending') {
      params.append('status', 'SUBMITTED');
    } else {
      params.append('status', 'RESOLVED');
    }
    if (targetTypeFilter !== 'all') {
      params.append('targetType', targetTypeFilter);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await ApiClient.request<Report[]>(url);
    if (res.success && res.data) {
      setReports(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [activeTab, targetTypeFilter]);

  const handleOpenResolveModal = (report: Report, status: ReportStatus.RESOLVED | ReportStatus.DISMISSED) => {
    setSelectedReport(report);
    setResolutionStatus(status);
    setActionTaken(status === ReportStatus.RESOLVED ? 'WARN_USER' : 'NONE');
    setResolutionMessage(
      status === ReportStatus.RESOLVED
        ? 'Thank you for reporting. This concern has been reviewed and appropriate corrective measures have been implemented in accordance with community guidelines.'
        : 'Thank you for your report. After thorough evaluation, this item was found to comply with platform guidelines.'
    );
    setInternalNotes('');
    setErrorMsg('');
  };

  const handleExecuteResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    setErrorMsg('');

    const res = await ApiClient.request(`/reports/${selectedReport.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        status: resolutionStatus,
        resolution: resolutionMessage,
        actionTaken: resolutionStatus === ReportStatus.RESOLVED ? actionTaken : undefined,
        internalNotes: internalNotes || undefined,
      }),
    });

    setSubmitting(false);
    if (res.success) {
      setSelectedReport(null);
      loadReports();
    } else {
      setErrorMsg(res.error?.message || 'Failed to resolve report.');
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldAlert size={24} color="#087f78" />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1f2a', letterSpacing: '-0.02em', margin: 0 }}>
              {t('moderation.title')}
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {t('moderation.subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #087f78' : '3px solid transparent',
            color: activeTab === 'pending' ? '#087f78' : '#64748b',
            cursor: 'pointer',
          }}
        >
          {t('moderation.pending_tab')}
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'resolved' ? '3px solid #087f78' : '3px solid transparent',
            color: activeTab === 'resolved' ? '#087f78' : '#64748b',
            cursor: 'pointer',
          }}
        >
          {t('moderation.resolved_tab')}
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#f8fafc',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
          <Filter size={15} />
          <span>Target Type:</span>
        </div>

        <select
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8125rem',
            backgroundColor: '#ffffff',
          }}
        >
          <option value="all">All Entity Types</option>
          <option value="KNOWLEDGE_CONTENT">Knowledge / Article</option>
          <option value="ORGANIZATION">Organization</option>
          <option value="BUSINESS">Business</option>
          <option value="VOLUNTEER_OPPORTUNITY">Volunteer Opportunity</option>
          <option value="REQUEST">Humanitarian Request</option>
          <option value="USER">User Account</option>
        </select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading moderation queue...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ShieldCheck size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b' }}>No Reports in this Queue</h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            All community items are currently in good standing.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '700px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    className={`badge badge-${
                      r.status === 'SUBMITTED' ? 'warning' : r.status === 'RESOLVED' ? 'success' : 'neutral'
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="badge badge-info">{r.targetType}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    ID: {r.targetId}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Reported on {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.2rem' }}>
                    Reason: {r.reason}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                    "{r.description}"
                  </p>
                </div>

                {r.resolution && (
                  <div style={{ fontSize: '0.8125rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <strong>Moderator Resolution:</strong> {r.resolution}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {r.status === 'SUBMITTED' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
                  <button
                    onClick={() => handleOpenResolveModal(r, ReportStatus.RESOLVED)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle size={15} />
                    <span>Resolve Report</span>
                  </button>
                  <button
                    onClick={() => handleOpenResolveModal(r, ReportStatus.DISMISSED)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <XCircle size={15} />
                    <span>Dismiss</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {resolutionStatus === ReportStatus.RESOLVED ? (
                <CheckCircle size={22} color="#1b6b63" />
              ) : (
                <XCircle size={22} color="#64748b" />
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', margin: 0 }}>
                {resolutionStatus === ReportStatus.RESOLVED ? 'Resolve Incident Report' : 'Dismiss Report'}
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Target: <strong>{selectedReport.targetType}</strong> (ID: {selectedReport.targetId})
            </p>

            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleExecuteResolution} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resolutionStatus === ReportStatus.RESOLVED && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Remedial Action Taken *
                  </label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="WARN_USER">Issue Formal Warning to Subject</option>
                    <option value="HIDE_CONTENT">Hide / Unpublish Content</option>
                    <option value="SUSPEND_ACCOUNT">Suspend Offending Entity / Account</option>
                    <option value="CORRECT_INFO">Administrative Record Correction</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Public Resolution Summary (Sent to Reporter) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Internal Safety / Investigation Notes (Moderator Team Only)
                </label>
                <textarea
                  rows={2}
                  placeholder="Private internal log for future reference and audit trails..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Applying Decision...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
