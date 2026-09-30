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
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { t, locale, isRtl } = useLocalization();

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

  // Auth Modal state for seamless volunteer enrollment
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingOpp, setPendingOpp] = useState<VolunteerOpportunity | null>(null);

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

  const handleQuickAuth = async (email: string, pass = 'DemoPass@12345') => {
    setAuthLoading(true);
    setAuthError('');
    const res = await login(email, pass);
    setAuthLoading(false);

    if (res.success) {
      const targetOpp = pendingOpp;
      setShowAuthModal(false);
      setPendingOpp(null);
      if (targetOpp) {
        setSelectedOppForApply(targetOpp);
      }
    } else {
      setAuthError(res.error || 'Authentication failed');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError(locale === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please provide email and password');
      return;
    }
    await handleQuickAuth(authEmail, authPassword);
  };

  return (
    <div style={{ backgroundColor: '#f0fdfa', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* Ocean Teal & Forest Spruce Action Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #0d9488 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          boxShadow: '0 4px 20px rgba(4, 47, 46, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #2dd4bf',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1240px', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(45, 212, 191, 0.2)',
                border: '1px solid rgba(45, 212, 191, 0.4)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#ccfbf1',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Users size={13} color="#ccfbf1" />
              {locale === 'ar' ? 'شبكة العمل التطوعي الميداني' : 'Community Volunteer Action Force'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '0.3rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                color: '#e6fffa',
              }}
            >
              <ShieldCheck size={13} color="#2dd4bf" />
              {locale === 'ar' ? 'تنسيق ميداني موثق وآمن' : 'Vetted Community Missions'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {t('volunteers.title')}
              </h1>
              <p style={{ color: '#ccfbf1', fontSize: '1rem', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
                {t('volunteers.subtitle')}
              </p>
            </div>

            {isOrgOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#2dd4bf',
                  color: '#042f2e',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(45, 212, 191, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5eead4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2dd4bf')}
              >
                <PlusCircle size={18} strokeWidth={2.5} />
                <span>Create Opportunity</span>
              </button>
            )}
          </div>

          {/* Quick Action Metrics strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '0.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(45, 212, 191, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{opportunities.length} Postings</div>
                <div style={{ fontSize: '0.75rem', color: '#ccfbf1' }}>{locale === 'ar' ? 'فرص تطوعية نشطة' : 'Active Field Deployments'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(45, 212, 191, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Flexible Shifts</div>
                <div style={{ fontSize: '0.75rem', color: '#ccfbf1' }}>{locale === 'ar' ? 'أوقات مرنة تناسب جدولك' : 'Weekends & On-Call Shifts'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(45, 212, 191, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Direct Impact</div>
                <div style={{ fontSize: '0.75rem', color: '#ccfbf1' }}>{locale === 'ar' ? 'خدمة كريمة للمجتمع' : 'Hands-on Humanitarian Service'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', marginInline: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #ccfbf1', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('opportunities')}
            style={{
              padding: '0.85rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'opportunities' ? '3px solid #0d9488' : '3px solid transparent',
              color: activeTab === 'opportunities' ? '#0d9488' : '#64748b',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '-2px',
            }}
          >
            {t('volunteers.opportunities_tab')} ({opportunities.length})
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={() => setActiveTab('my-applications')}
                style={{
                  padding: '0.85rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'my-applications' ? '3px solid #0d9488' : '3px solid transparent',
                  color: activeTab === 'my-applications' ? '#0d9488' : '#64748b',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '-2px',
                }}
              >
                <span>{t('volunteers.my_apps_tab')}</span>
                {myApplications.length > 0 && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {myApplications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '0.85rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '3px solid #0d9488' : '3px solid transparent',
                  color: activeTab === 'profile' ? '#0d9488' : '#64748b',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginBottom: '-2px',
                }}
              >
                {t('volunteers.profile_btn')}
              </button>
            </>
          )}
        </div>

        {/* TAB 1: OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <>
            {/* Filters Bar */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid #ccfbf1',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="#0d9488" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Search opportunities by title, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadOpportunities()}
                  style={{ width: '100%', padding: '0.55rem 0.55rem 0.55rem 2.4rem', borderRadius: '8px', border: '1.5px solid #99f6e4', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    appearance: 'none',
                    padding: '0.55rem 2rem 0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #99f6e4',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#f0fdfa',
                    color: '#042f2e',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="FOOD_DISTRIBUTION">Food Distribution</option>
                  <option value="COMMUNITY_SERVICE">Community Service</option>
                  <option value="LOGISTICS">Logistics & Transport</option>
                  <option value="EMERGENCY_RELIEF">Emergency Relief</option>
                </select>
                <ChevronDown size={14} color="#0d9488" style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              <button
                onClick={loadOpportunities}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>

            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ccfbf1' }}>
                <p style={{ color: '#0d9488', fontWeight: 600 }}>Loading volunteer opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ccfbf1' }}>
                <Users size={32} color="#0d9488" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#042f2e' }}>No Opportunities Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Try adjusting your search criteria or check back soon for new service postings.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #ccfbf1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(4, 47, 46, 0.04)',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(13, 148, 136, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(4, 47, 46, 0.04)';
                    }}
                  >
                    {/* Top Ocean Teal Accent Line */}
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #0d9488, #2dd4bf)' }} />

                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            backgroundColor: opp.status === 'OPEN' ? '#dcfce7' : '#f1f5f9',
                            color: opp.status === 'OPEN' ? '#15803d' : '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: opp.status === 'OPEN' ? '#10b981' : '#94a3b8' }} />
                          {opp.status}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700, backgroundColor: '#f0fdfa', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
                          Capacity: {opp.capacity} volunteers
                        </span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#042f2e', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                          {opp.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                          {opp.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          fontSize: '0.8125rem',
                          color: '#334155',
                          backgroundColor: '#f0fdfa',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #ccfbf1',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Calendar size={14} color="#0d9488" />
                          <span>Start: {new Date(opp.startAt).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <MapPin size={14} color="#0d9488" />
                          <span>{opp.location}</span>
                        </div>
                      </div>

                      {opp.requirements && opp.requirements.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#042f2e', backgroundColor: '#e6fffa', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                          <strong>Mission Requirements:</strong> {opp.requirements.join(' • ')}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ borderTop: '1px solid #ccfbf1', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff' }}>
                      {opp.status === 'OPEN' && (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              setPendingOpp(opp);
                              setAuthError('');
                              setShowAuthModal(true);
                              return;
                            }
                            setSelectedOppForApply(opp);
                          }}
                          style={{
                            flex: 1,
                            padding: '0.65rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: '#0d9488',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f766e')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0d9488')}
                        >
                          <span>{t('volunteers.apply_btn')}</span>
                          <span className="dir-flip">&rarr;</span>
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

      {/* AUTH MODAL FOR GUESTS / VISITORS */}
      {showAuthModal && (
        <div className="modal-backdrop" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: '#ffffff',
              border: '1.5px solid #99f6e4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e6fffa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#042f2e', margin: 0 }}>
                    {locale === 'ar' ? 'تسجيل الدخول للانضمام كمتطوع' : 'Sign In to Enlist as Volunteer'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#0f766e', margin: '0.2rem 0 0' }}>
                    {locale === 'ar' ? 'يسجل مساهمتك في سجل الشرف ويحفظ ساعات التطوع' : 'Logs your mission hours and connects you with field team.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <XCircle size={22} />
              </button>
            </div>

            {authError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                {authError}
              </div>
            )}

            {/* Fast One-Click Demo Personas */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                {locale === 'ar' ? 'الدخول السريع بحساب تجريبي (Demo 1-Click):' : 'Instant 1-Click Demo Login:'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickAuth('demo.volunteer@demo.alhusseiniya.app')}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #99f6e4',
                    backgroundColor: '#f0fdfa',
                    color: '#0f766e',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  🌟 Fatima (Volunteer)
                </button>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickAuth('demo.individual@demo.alhusseiniya.app')}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #99f6e4',
                    backgroundColor: '#f0fdfa',
                    color: '#0f766e',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  👤 Amina (Individual)
                </button>
              </div>
            </div>

            {/* Standard Email / Password Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
              <div>
                <input
                  type="email"
                  placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder={locale === 'ar' ? 'كلمة المرور' : 'Password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.6rem' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    flex: 1.5,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {authLoading ? t('common.loading') : (locale === 'ar' ? 'دخول ومتابعة التطوع' : 'Sign In & Enlist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
