import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { HumanitarianRequest, RequestCategory } from '@al-husseiniya/types';
import { Plus, Lock, Globe, AlertCircle } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HumanitarianRequest[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [formError, setFormError] = useState('');

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

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Humanitarian Requests</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {user ? 'View your submitted requests and status updates' : 'Explore community assistance needs'}
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-teal">
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading humanitarian requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No Requests Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Submit an emergency food or healthcare assistance request to connect with community relief.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Create First Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {requests.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge badge-${r.status === 'FULFILLED' ? 'success' : 'info'}`}>
                  {r.status}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
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

              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0b1b2b' }}>{r.title}</h4>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, flexGrow: 1 }}>
                {r.description}
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Location: {r.location}</span>
                <span>Priority: {r.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
