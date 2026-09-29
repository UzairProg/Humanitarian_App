import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { HumanitarianRequest, RequestCategory, RequestStatus, RoleType } from '@al-husseiniya/types';
import {
  Plus,
  Lock,
  Globe,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  History,
  AlertTriangle,
  Filter,
} from 'lucide-react';

const CANONICAL_STEPS = [
  RequestStatus.SUBMITTED,
  RequestStatus.UNDER_REVIEW,
  RequestStatus.MATCHED,
  RequestStatus.ACCEPTED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.COMPLETED,
];

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HumanitarianRequest[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [formError, setFormError] = useState('');

  // History modal state
  const [selectedHistory, setSelectedHistory] = useState<{
    requestTitle: string;
    history: any[];
  } | null>(null);

  const isStaffOrAdmin =
    user?.roles?.some((r) =>
      [
        RoleType.SUPER_ADMIN,
        RoleType.COMMUNITY_ADMIN,
        RoleType.ORGANIZATION_ADMIN,
        RoleType.ORGANIZATION_STAFF,
      ].includes(r),
    ) ||
    user?.role === RoleType.ORGANIZATION_ADMIN ||
    user?.role === RoleType.ORGANIZATION_STAFF ||
    user?.role === RoleType.SUPER_ADMIN;

  const loadData = async () => {
    setLoading(true);
    const [reqRes, catRes] = await Promise.all([
      ApiClient.request<HumanitarianRequest[]>('/requests'),
      ApiClient.request<RequestCategory[]>('/requests/categories'),
    ]);

    if (reqRes.success && reqRes.data) {
      setRequests(reqRes.data);
    }
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = await ApiClient.request('/requests', {
      method: 'POST',
      body: JSON.stringify({
        categoryId,
        title,
        description,
        location,
        isPrivate,
      }),
    });

    if (res.success) {
      setShowModal(false);
      setTitle('');
      setDescription('');
      setLocation('');
      loadData();
    } else {
      setFormError(res.error?.message || 'Failed to submit request');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string, notes?: string) => {
    setActionError('');
    const res = await ApiClient.request(`/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus,
        notes: notes || `Status updated to ${newStatus}`,
      }),
    });

    if (res.success) {
      loadData();
    } else {
      setActionError(res.error?.message || 'Failed to transition status');
    }
  };

  const handleViewHistory = async (request: HumanitarianRequest) => {
    const res = await ApiClient.request<any[]>(`/requests/${request.id}/history`);
    if (res.success && res.data) {
      setSelectedHistory({
        requestTitle: request.title,
        history: res.data,
      });
    } else {
      setSelectedHistory({
        requestTitle: request.title,
        history: [],
      });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterCategory !== 'ALL' && r.categoryId !== filterCategory) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'FULFILLED':
        return 'badge-success';
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return 'badge-info';
      case 'CANCELLED':
      case 'REJECTED':
        return 'badge-error';
      case 'ESCALATED':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Humanitarian Aid Requests</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {user ? 'Track your active requests and review community assistance workflows' : 'Explore community assistance needs'}
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-teal">
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      {actionError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          {actionError}
        </div>
      )}

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8125rem' }}>
          <Filter size={15} />
          <span>Filters:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="MATCHED">MATCHED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {filteredRequests.length} of {requests.length}
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading humanitarian requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No Requests Match Filter</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Submit an emergency food or healthcare assistance request to connect with community relief.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Create First Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredRequests.map((r) => {
            const isRequester = user && (r.requesterId === user.id || (r as any).requester?.id === user.id);
            const isTerminal = ['COMPLETED', 'FULFILLED', 'CANCELLED', 'REJECTED'].includes(r.status);
            const isCurrentStep = (step: string) => r.status === step;
            const currentStepIdx = CANONICAL_STEPS.indexOf(r.status as RequestStatus);

            return (
              <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                    {r.status}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
                    {r.isPrivate ? (
                      <>
                        <Lock size={12} color="#c29b38" />
                        <span>Confidential</span>
                      </>
                    ) : (
                      <>
                        <Globe size={12} color="#1b6b63" />
                        <span>Public</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Progression Bar */}
                {['CANCELLED', 'REJECTED', 'ESCALATED'].includes(r.status) ? (
                  <div
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: r.status === 'ESCALATED' ? '#fffbeb' : '#fef2f2',
                      color: r.status === 'ESCALATED' ? '#b45309' : '#b91c1c',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {r.status === 'ESCALATED' ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                    <span>Status: {r.status}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', margin: '0.25rem 0' }}>
                    {CANONICAL_STEPS.map((step, idx) => {
                      const isPastOrCurrent = currentStepIdx >= idx;
                      return (
                        <div
                          key={step}
                          title={step}
                          style={{
                            flex: 1,
                            height: '5px',
                            borderRadius: '3px',
                            backgroundColor: isPastOrCurrent ? '#1b6b63' : '#e2e8f0',
                            transition: 'background-color 0.2s',
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0b1b2b', margin: 0 }}>{r.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, flexGrow: 1, margin: 0 }}>
                  {r.description}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Location: {r.location}</span>
                  <span>Priority: {r.priority}</span>
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #f8fafc', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => handleViewHistory(r)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1d3557',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                    }}
                  >
                    <History size={13} />
                    <span>View History</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
                    {/* Requester Cancel Action */}
                    {isRequester && !isTerminal && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'CANCELLED', 'Cancelled by requester')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#fca5a5' }}
                      >
                        Cancel
                      </button>
                    )}

                    {/* Staff/Admin Next Stage Actions */}
                    {isStaffOrAdmin && !isTerminal && (
                      <>
                        {r.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'UNDER_REVIEW', 'Reviewed by organization staff')}
                            className="btn btn-teal"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            Review
                          </button>
                        )}
                        {r.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'ACCEPTED', 'Accepted by organization')}
                            className="btn btn-teal"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            Accept
                          </button>
                        )}
                        {r.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS', 'Relief work in progress')}
                            className="btn btn-teal"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            Start Aid
                          </button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'COMPLETED', 'Assistance completed successfully')}
                            className="btn btn-teal"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            Complete
                          </button>
                        )}
                        {['SUBMITTED', 'UNDER_REVIEW'].includes(r.status) && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REJECTED', 'Aid criteria not met')}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#ef4444' }}
                          >
                            Reject
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Modal */}
      {selectedHistory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 27, 43, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Status Lifecycle Trail
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
              {selectedHistory.requestTitle}
            </p>

            {selectedHistory.history.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
                Initial submission state recorded.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedHistory.history.map((h, i) => (
                  <div
                    key={h.id || i}
                    style={{
                      borderLeft: '3px solid #1b6b63',
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{h.fromStatus}</span>
                      <ArrowRight size={12} />
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{h.toStatus}</span>
                    </div>
                    {h.notes && (
                      <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>
                        {h.notes}
                      </p>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(h.changedAt || h.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedHistory(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Request Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 27, 43, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Submit Humanitarian Request
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Request emergency aid. Private requests are protected and only visible to you and verified reviewers.
            </p>

            {formError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly dry ration assistance"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide essential details about the assistance required..."
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Location / District</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. West Sector, Neighborhood 5"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label htmlFor="isPrivate" style={{ fontSize: '0.8125rem', color: '#334155' }}>
                  Keep request confidential (private to reviewers only)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
