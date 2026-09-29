import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import {
  VolunteerOpportunity,
  VolunteerProfile,
  RoleType,
} from '@al-husseiniya/types';
import {
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  PlusCircle,
  UserCheck,
  Clock,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLocalization();

  const [activeTab, setActiveTab] = useState<'opportunities' | 'my-applications' | 'profile'>('opportunities');
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [selectedOppForApply, setSelectedOppForApply] = useState<VolunteerOpportunity | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // Review Applicants Modal (for org staff/admins)
  const [viewingApplicantsOpp, setViewingApplicantsOpp] = useState<VolunteerOpportunity | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Create Opportunity Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'COMMUNITY_SERVICE',
    capacity: 10,
    startAt: '',
    endAt: '',
    requirements: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    skills: '',
    interests: '',
    availability: 'Weekends',
    location: '',
    languages: 'en, ar',
    emergencyContact: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const isOrgOrAdmin =
    user?.roles?.some((r) =>
      [
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.ORGANIZATION_ADMIN,
        RoleType.ORGANIZATION_STAFF,
      ].includes(r),
    ) ||
    user?.role === RoleType.ORGANIZATION_ADMIN ||
    user?.role === RoleType.SUPER_ADMIN;

  const loadOpportunities = async () => {
    setLoading(true);
    let url = '/volunteers/opportunities?limit=50';
    if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await ApiClient.request<VolunteerOpportunity[]>(url);
    if (res.success && res.data) {
      setOpportunities(res.data);
    }
    setLoading(false);
  };

  const loadMyApplications = async () => {
    if (!isAuthenticated) return;
    const res = await ApiClient.request<any[]>('/volunteers/my-applications');
    if (res.success && res.data) {
      setMyApplications(res.data);
    }
  };

  const loadProfile = async () => {
    if (!isAuthenticated) return;
    const res = await ApiClient.request<VolunteerProfile>('/volunteers/profile/me');
    if (res.success && res.data) {
      setProfile(res.data);
      setProfileForm({
        skills: res.data.skills?.join(', ') || '',
        interests: res.data.interests?.join(', ') || '',
        availability: res.data.availability || 'Weekends',
        location: res.data.location || '',
        languages: res.data.languages?.join(', ') || 'en, ar',
        emergencyContact: res.data.emergencyContact || '',
      });
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [categoryFilter]);

  useEffect(() => {
    if (activeTab === 'my-applications') {
      loadMyApplications();
    } else if (activeTab === 'profile') {
      loadProfile();
    }
  }, [activeTab, isAuthenticated]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppForApply) return;
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');

    const res = await ApiClient.request(
      `/volunteers/opportunities/${selectedOppForApply.id}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ message: applyMessage }),
      },
    );

    setApplyLoading(false);
    if (res.success) {
      setApplySuccess('Your volunteer application has been submitted successfully!');
      setTimeout(() => {
        setSelectedOppForApply(null);
        setApplyMessage('');
        setApplySuccess('');
        loadMyApplications();
      }, 1500);
    } else {
      setApplyError(res.error?.message || 'Failed to submit application');
    }
  };

  const openApplicantsView = async (opp: VolunteerOpportunity) => {
    setViewingApplicantsOpp(opp);
    setLoadingApplicants(true);
    const res = await ApiClient.request<any[]>(
      `/volunteers/opportunities/${opp.id}/applications`,
    );
    if (res.success && res.data) {
      setApplicants(res.data);
    }
    setLoadingApplicants(false);
  };

  const handleUpdateApplicantStatus = async (
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    const res = await ApiClient.request(
      `/volunteers/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewNotes: `Updated to ${status} by coordinator`,
        }),
      },
    );

    if (res.success && viewingApplicantsOpp) {
      openApplicantsView(viewingApplicantsOpp);
      loadOpportunities();
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    // Get an organization ID
    let orgId = (user as any)?.orgId || (user as any)?.organizationId;
    if (!orgId) {
      const orgsRes = await ApiClient.request<any[]>('/organizations');
      if (orgsRes.success && orgsRes.data && orgsRes.data.length > 0) {
        orgId = orgsRes.data[0].id;
      }
    }

    if (!orgId) {
      alert('You must be affiliated with an organization to create opportunities');
      setCreateLoading(false);
      return;
    }

    const res = await ApiClient.request('/volunteers/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        organizationId: orgId,
        title: createForm.title,
        description: createForm.description,
        location: createForm.location,
        category: createForm.category,
        capacity: Number(createForm.capacity),
        startAt: createForm.startAt,
        endAt: createForm.endAt,
        requirements: createForm.requirements
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
      }),
    });

    setCreateLoading(false);
    if (res.success) {
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        location: '',
        category: 'COMMUNITY_SERVICE',
        capacity: 10,
        startAt: '',
        endAt: '',
        requirements: '',
      });
      loadOpportunities();
    } else {
      alert(res.error?.message || 'Failed to create opportunity');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');

    const res = await ApiClient.request('/volunteers/profile', {
      method: 'POST',
      body: JSON.stringify({
        skills: profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: profileForm.interests.split(',').map((s) => s.trim()).filter(Boolean),
        availability: profileForm.availability,
        location: profileForm.location,
        languages: profileForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContact: profileForm.emergencyContact,
      }),
    });

    setProfileLoading(false);
    if (res.success) {
      setProfileMessage('Volunteer profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
      loadProfile();
    } else {
      alert(res.error?.message || 'Failed to update profile');
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1b2b', letterSpacing: '-0.02em' }}>
            Volunteer Service Ecosystem
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Serve neighbors with dignity: packaging rations, providing logistics, emergency aid, and educational support.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isOrgOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-teal"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={16} />
              <span>Create Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('opportunities')}
          style={{
            padding: '0.65rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'opportunities' ? '2px solid #1b6b63' : '2px solid transparent',
            color: activeTab === 'opportunities' ? '#1b6b63' : '#64748b',
            fontWeight: activeTab === 'opportunities' ? 600 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Open Opportunities
        </button>

        {isAuthenticated && (
          <>
            <button
              onClick={() => setActiveTab('my-applications')}
              style={{
                padding: '0.65rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'my-applications' ? '2px solid #1b6b63' : '2px solid transparent',
                color: activeTab === 'my-applications' ? '#1b6b63' : '#64748b',
                fontWeight: activeTab === 'my-applications' ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>My Applications</span>
              {myApplications.length > 0 && (
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {myApplications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '0.65rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '2px solid #1b6b63' : '2px solid transparent',
                color: activeTab === 'profile' ? '#1b6b63' : '#64748b',
                fontWeight: activeTab === 'profile' ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              My Volunteer Profile
            </button>
          </>
        )}
      </div>

      {/* TAB 1: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '10px' }} />
              <input
                type="text"
                placeholder="Search opportunities by title, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadOpportunities()}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              <option value="FOOD_DISTRIBUTION">Food Distribution</option>
              <option value="COMMUNITY_SERVICE">Community Service</option>
              <option value="LOGISTICS">Logistics & Transport</option>
              <option value="EMERGENCY_RELIEF">Emergency Relief</option>
            </select>

            <button onClick={loadOpportunities} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Search
            </button>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>Loading volunteer opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Users size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Opportunities Found</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Try adjusting your search criteria or check back soon for new service postings.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {opportunities.map((opp) => (
                <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${opp.status === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}>
                      {opp.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      Capacity: {opp.capacity} volunteers
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                      {opp.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      {opp.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#1b6b63" />
                      <span>Start: {new Date(opp.startAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#1b6b63" />
                      <span>{opp.location}</span>
                    </div>
                  </div>

                  {opp.requirements && opp.requirements.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                      <strong>Requirements:</strong> {opp.requirements.join(', ')}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {opp.status === 'OPEN' && (
                      <button
                        onClick={() => setSelectedOppForApply(opp)}
                        className="btn btn-teal"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        Apply to Serve
                      </button>
                    )}

                    {isOrgOrAdmin && (
                      <button
                        onClick={() => openApplicantsView(opp)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <UserCheck size={14} />
                        <span>Applicants</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'my-applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myApplications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>You have not submitted any volunteer applications yet.</p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`badge ${
                        app.status === 'ACCEPTED'
                          ? 'badge-success'
                          : app.status === 'REJECTED'
                          ? 'badge-error'
                          : 'badge-warning'
                      }`}
                    >
                      {app.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                    {app.opportunity?.title || 'Volunteer Opportunity'}
                  </h4>
                  {app.message && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      <strong>Your note:</strong> {app.message}
                    </p>
                  )}
                  {app.reviewNotes && (
                    <p style={{ fontSize: '0.85rem', color: '#1b6b63', backgroundColor: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <strong>Organizer response:</strong> {app.reviewNotes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: VOLUNTEER PROFILE */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Volunteer Participation Profile
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Keep your skills, languages, and preferred service areas updated so community organizations can assign relevant tasks.
          </p>

          {profileMessage && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Logistics, Driving, First Aid, Translation"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Service Interests (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Food Distribution, Elderly Care, Youth Mentoring"
                value={profileForm.interests}
                onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Availability
              </label>
              <input
                type="text"
                placeholder="Weekends, Friday afternoons, On-call"
                value={profileForm.availability}
                onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Preferred District / Location
              </label>
              <input
                type="text"
                placeholder="Central District, Karbala Outskirts"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Languages (comma-separated)
              </label>
              <input
                type="text"
                placeholder="en, ar, ur"
                value={profileForm.languages}
                onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Emergency Contact Number
              </label>
              <input
                type="text"
                placeholder="+964 780 123 4567"
                value={profileForm.emergencyContact}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button type="submit" disabled={profileLoading} className="btn btn-teal" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}>
              {profileLoading ? 'Saving...' : 'Save Volunteer Profile'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 1: APPLY TO OPPORTUNITY */}
      {selectedOppForApply && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Apply to Serve
            </h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Opportunity: <strong>{selectedOppForApply.title}</strong>
            </p>

            {applySuccess && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {applySuccess}
              </div>
            )}

            {applyError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Availability Note / Message to Coordinator
                </label>
                <textarea
                  rows={3}
                  placeholder="I can assist during the entire Saturday shift..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOppForApply(null)}
                  className="btn btn-secondary"
                  disabled={applyLoading}
                >
                  Cancel
                </button>
                <button type="submit" disabled={applyLoading} className="btn btn-teal">
                  {applyLoading ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW APPLICANTS (COORDINATOR VIEW) */}
      {viewingApplicantsOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Volunteer Applicants</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{viewingApplicantsOpp.title}</p>
              </div>
              <button onClick={() => setViewingApplicantsOpp(null)} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>
                Close
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadingApplicants ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading applicants...</p>
              ) : applicants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No applications received yet.</p>
              ) : (
                applicants.map((app) => (
                  <div key={app.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Volunteer'}
                        </span>
                        <span className={`badge ${app.status === 'ACCEPTED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>
                          {app.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.applicant?.email}</span>
                      {app.message && <span style={{ fontSize: '0.8rem', color: '#475569' }}>"{app.message}"</span>}
                    </div>

                    {app.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleUpdateApplicantStatus(app.id, 'ACCEPTED')}
                          className="btn btn-teal"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateApplicantStatus(app.id, 'REJECTED')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE OPPORTUNITY */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Create Volunteer Opportunity
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Post an open opportunity for community members to volunteer with your organization.
            </p>

            <form onSubmit={handleCreateOpportunity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hot Meals Packaging Volunteers"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain duties, shift schedule, and safety guidelines..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="FOOD_DISTRIBUTION">Food Distribution</option>
                    <option value="COMMUNITY_SERVICE">Community Service</option>
                    <option value="LOGISTICS">Logistics</option>
                    <option value="EMERGENCY_RELIEF">Emergency Relief</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Capacity (Volunteers) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Relief Hub Hall 3, Main Plaza"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.startAt}
                    onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.endAt}
                    onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Punctual, Able to lift boxes, Friendly"
                  value={createForm.requirements}
                  onChange={(e) => setCreateForm({ ...createForm, requirements: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} className="btn btn-teal">
                  {createLoading ? 'Publishing...' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
