import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import ApiClient from '../services/api';
import { Organization, VerificationStatus, PermissionKey, FoodProgram, Event } from '@al-husseiniya/types';
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Utensils,
  Calendar,
  ExternalLink,
  HeartHandshake,
  Activity,
  Plus,
  Search,
  Filter,
  X,
  Users,
} from 'lucide-react';

interface OrgDetailModalData {
  organization: Organization & {
    activeFoodPrograms?: FoodProgram[];
    upcomingEvents?: Event[];
  };
  impact?: {
    mealsDistributed: number;
    requestsFulfilled: number;
    activeProgramsCount: number;
    eventsCount: number;
  };
}

export const OrganizationsPage: React.FC = () => {
  const { hasPermission, isAuthenticated } = useAuth();
  const { t, locale, isRtl } = useLocalization();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetailModalData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);

  // Register Organization modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [newOrg, setNewOrg] = useState({
    name: '',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });

  const canVerify = hasPermission(PermissionKey.ORGANIZATION_VERIFY);

  const loadOrgs = async () => {
    setLoading(true);
    const res = await ApiClient.request<Organization[]>('/organizations');
    if (res.success && res.data) {
      setOrganizations(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleVerify = async (orgId: string) => {
    const res = await ApiClient.request(`/organizations/${orgId}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        status: VerificationStatus.APPROVED,
        decision: 'Administrative verification complete',
        notes: 'Organization verified after operational credential review',
      }),
    });

    if (res.success) {
      loadOrgs();
      if (selectedOrg && selectedOrg.organization.id === orgId) {
        setSelectedOrg({
          ...selectedOrg,
          organization: {
            ...selectedOrg.organization,
            verificationStatus: VerificationStatus.APPROVED,
          },
        });
      }
    }
  };

  const handleViewDetails = async (org: Organization) => {
    setLoadingDetail(true);
    try {
      const [detailRes, impactRes] = await Promise.all([
        ApiClient.request<any>(`/organizations/${org.id}`),
        ApiClient.request<any>(`/impact/organization/${org.id}`),
      ]);

      setSelectedOrg({
        organization: detailRes.success && detailRes.data ? detailRes.data : org,
        impact: impactRes.success && impactRes.data ? impactRes.data : undefined,
      });
    } catch {
      setSelectedOrg({ organization: org });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError('');

    const slug = newOrg.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const res = await ApiClient.request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify({
        ...newOrg,
        slug: slug || `org-${Date.now()}`,
      }),
    });

    setRegistering(false);
    if (res.success) {
      setShowRegisterModal(false);
      setNewOrg({
        name: '',
        description: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
      });
      loadOrgs();
    } else {
      setRegisterError(res.error?.message || 'Failed to register organization');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (filterVerifiedOnly && org.verificationStatus !== VerificationStatus.APPROVED) {
      return false;
    }
    if (
      searchQuery &&
      !org.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !org.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !org.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#f4f7fb', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* Imperial Heritage Navy & Gold Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d2238 50%, #163654 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          boxShadow: '0 4px 20px rgba(7, 21, 36, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #deb95f',
        }}
      >
        {/* Subtle decorative gold crest glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(222, 185, 95, 0.2) 0%, transparent 70%)',
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
                backgroundColor: 'rgba(222, 185, 95, 0.15)',
                border: '1px solid rgba(222, 185, 95, 0.4)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#deb95f',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Building2 size={13} color="#deb95f" />
              {locale === 'ar' ? 'السجل المدني والمؤسسات المعتمدة' : 'Civic Institutional Registry'}
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
                color: '#cbd5e1',
              }}
            >
              <ShieldCheck size={13} color="#deb95f" />
              {locale === 'ar' ? 'تدقيق الحوكمة والنزاهة 100%' : '100% Governance Vetted'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {t('orgs.title')}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
                {t('orgs.subtitle')}
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => setShowRegisterModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#deb95f',
                  color: '#071524',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(222, 185, 95, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#edd38c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#deb95f')}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>{t('orgs.register_btn')}</span>
              </button>
            )}
          </div>

          {/* Institutional Integrity Badges Strip */}
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
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(222, 185, 95, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#deb95f' }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>4 Active Hubs</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{locale === 'ar' ? 'هيئات موثقة ومعتمدة' : 'Verified Relief Foundations'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(222, 185, 95, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#deb95f' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Audited & Safe</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{locale === 'ar' ? 'سجل رقابي ومالي شفاف' : 'Full Operational Transparency'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(222, 185, 95, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#deb95f' }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>24/7 Field Dispatch</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{locale === 'ar' ? 'جاهزية طوارئ وإمداد' : 'Continuous Relief Deployment'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', marginInline: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Filter and Search Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px' }}>
            <Search size={18} color="#0d2238" />
            <input
              type="text"
              placeholder={t('orgs.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterVerifiedOnly}
              onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0d2238' }}
            />
            <span>{t('orgs.filter_verified')}</span>
          </label>

          <span style={{ marginInlineStart: 'auto', fontSize: '0.82rem', fontWeight: 700, color: '#071524', backgroundColor: '#e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
            {filteredOrgs.length} / {organizations.length}
          </span>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
            <p style={{ color: '#0d2238', fontWeight: 600 }}>{t('common.loading')}</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
            <p style={{ color: '#64748b' }}>{t('orgs.no_orgs')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredOrgs.map((org) => {
              const isVerified = org.verificationStatus === VerificationStatus.APPROVED;

              return (
                <div
                  key={org.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1.5px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(7, 21, 36, 0.04)',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(7, 21, 36, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 21, 36, 0.04)';
                  }}
                >
                  {/* Top Architectural Navy & Gold Bar */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #071524 0%, #0d2238 60%, #163654 100%)',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '2px solid #deb95f',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#071524',
                          border: '2px solid #deb95f',
                          color: '#deb95f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {org.name ? org.name[0] : 'O'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
                          {org.name}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#deb95f', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <MapPin size={12} color="#deb95f" /> {org.location}
                        </div>
                      </div>
                    </div>

                    {isVerified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(222, 185, 95, 0.2)',
                          color: '#deb95f',
                          border: '1px solid #deb95f',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '20px',
                        }}
                        title="Verified by Al-Husseiniya administrative team"
                      >
                        <ShieldCheck size={13} color="#deb95f" /> {t('status.verified')}
                      </span>
                    ) : (
                      <span className="badge badge-warning">{t('status.pending')}</span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      {org.description}
                    </p>

                    {/* Civic Operational Highlights Strip */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#0d2238', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        🏛️ Registered Entity
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#0d2238', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        🍲 Relief Distribution
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#0d2238', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        ⚖️ Verified Governance
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      {org.contactEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Mail size={13} color="#0d2238" /> <span>{org.contactEmail}</span>
                        </div>
                      )}
                      {org.contactPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Phone size={13} color="#0d2238" /> <span>{org.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <button
                      onClick={() => handleViewDetails(org)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#071524',
                        color: '#deb95f',
                        border: '1px solid #deb95f',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#deb95f';
                        e.currentTarget.style.color = '#071524';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#071524';
                        e.currentTarget.style.color = '#deb95f';
                      }}
                    >
                      <span>{t('orgs.details_btn')}</span>
                      <span className="dir-flip">&rarr;</span>
                    </button>

                    {canVerify && !isVerified && (
                      <button
                        onClick={() => handleVerify(org.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        {t('orgs.verify_btn')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Organization Detail & Impact Modal */}
      {selectedOrg && (
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
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {selectedOrg.organization.verificationStatus === VerificationStatus.APPROVED ? (
                    <span className="verified-pill">
                      <ShieldCheck size={13} /> Verified Organization
                    </span>
                  ) : (
                    <span className="badge badge-warning">Unverified</span>
                  )}
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                    {selectedOrg.organization.location}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {selectedOrg.organization.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              {selectedOrg.organization.description}
            </p>

            {/* Impact Metric Storytelling */}
            {selectedOrg.impact && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0b1f2a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('orgs.impact_title')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#087f78' }}>
                      {selectedOrg.impact.mealsDistributed.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('home.impact.meals')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>
                      {selectedOrg.impact.requestsFulfilled.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('home.impact.requests')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#85530f' }}>
                      {selectedOrg.impact.activeProgramsCount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('orgs.active_programs_title')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Programs & Events */}
            {selectedOrg.organization.activeFoodPrograms && selectedOrg.organization.activeFoodPrograms.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.5rem' }}>
                  {t('orgs.active_programs_title')} ({selectedOrg.organization.activeFoodPrograms.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrg.organization.activeFoodPrograms.map((p) => (
                    <div key={p.id} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.8125rem', border: '1px solid #bbf7d0' }}>
                      <strong>{p.title}</strong>, {p.programDate} ({p.startTime} - {p.endTime})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setSelectedOrg(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Organization Modal */}
      {showRegisterModal && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Register Community Organization
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Register your Hussainiya, charitable fund, or community center on the Al-Husseiniya platform.
            </p>

            {registerError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Husseiniya Al-Kubra"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karbala, Iraq"
                  value={newOrg.location}
                  onChange={(e) => setNewOrg({ ...newOrg, location: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@hussainiya.org"
                    value={newOrg.contactEmail}
                    onChange={(e) => setNewOrg({ ...newOrg, contactEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+964 770 000 0000"
                    value={newOrg.contactPhone}
                    onChange={(e) => setNewOrg({ ...newOrg, contactPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Mission & Scope of Service *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your regular food distributions, educational programs, and humanitarian reach..."
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn btn-secondary"
                  disabled={registering}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registering}>
                  {registering ? 'Registering...' : 'Submit Registration'}
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
