import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Business, VerificationStatus, RoleType } from '@al-husseiniya/types';
import {
  Store,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  PlusCircle,
  HandHeart,
  Search,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const BusinessesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, locale, isRtl } = useLocalization();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    category: 'WHOLESALE_GROCERY',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    participationTypes: 'MEAL_SUPPORT, SURPLUS_FOOD',
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  // Participation Modal
  const [selectedBizForParticipation, setSelectedBizForParticipation] = useState<Business | null>(null);
  const [participations, setParticipations] = useState<any[]>([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);
  const [participationForm, setParticipationForm] = useState({
    participationType: 'MEAL_SUPPORT',
    description: '',
    quantity: 100,
  });
  const [submittingPart, setSubmittingPart] = useState(false);

  const canVerify =
    user?.roles?.some((r) =>
      [RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.MODERATOR].includes(r),
    ) ||
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.ADMIN;

  const loadBusinesses = async () => {
    setLoading(true);
    let url = '/businesses?limit=50';
    if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await ApiClient.request<Business[]>(url);
    if (res.success && res.data) {
      setBusinesses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBusinesses();
  }, [categoryFilter]);

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    const res = await ApiClient.request('/businesses', {
      method: 'POST',
      body: JSON.stringify({
        ...registerForm,
        participationTypes: registerForm.participationTypes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });

    setRegisterLoading(false);
    if (res.success) {
      setShowRegisterModal(false);
      setRegisterForm({
        name: '',
        category: 'WHOLESALE_GROCERY',
        description: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
        participationTypes: 'MEAL_SUPPORT, SURPLUS_FOOD',
      });
      loadBusinesses();
    } else {
      alert(res.error?.message || 'Failed to register business');
    }
  };

  const handleVerifyBusiness = async (bizId: string, status: VerificationStatus) => {
    const res = await ApiClient.request(`/businesses/${bizId}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        decision: `Merchant verification status set to ${status} by reviewer`,
      }),
    });

    if (res.success) {
      loadBusinesses();
    } else {
      alert(res.error?.message || 'Verification update failed');
    }
  };

  const openParticipationModal = async (biz: Business) => {
    setSelectedBizForParticipation(biz);
    setLoadingParticipations(true);
    const res = await ApiClient.request<any[]>(`/businesses/${biz.id}/participations`);
    if (res.success && res.data) {
      setParticipations(res.data);
    }
    setLoadingParticipations(false);
  };

  const handleSubmitParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForParticipation) return;
    setSubmittingPart(true);

    const res = await ApiClient.request(
      `/businesses/${selectedBizForParticipation.id}/participations`,
      {
        method: 'POST',
        body: JSON.stringify(participationForm),
      },
    );

    setSubmittingPart(false);
    if (res.success) {
      setParticipationForm({
        participationType: 'MEAL_SUPPORT',
        description: '',
        quantity: 100,
      });
      openParticipationModal(selectedBizForParticipation);
    } else {
      alert(res.error?.message || 'Failed to submit participation offer');
    }
  };

  return (
    <div style={{ backgroundColor: '#fffdfa', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* Warm Bronze & Terracotta Solidarity Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #b45309 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          boxShadow: '0 4px 20px rgba(69, 26, 3, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #f59e0b',
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
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
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
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fef3c7',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Store size={13} color="#fef3c7" />
              {locale === 'ar' ? 'دليل التجار والشركاء التجاريين المتضامنين' : 'Solidarity Commercial Directory'}
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
                color: '#fef3c7',
              }}
            >
              <ShieldCheck size={13} color="#f59e0b" />
              {locale === 'ar' ? 'تجار معتمدون وملتزمون بالإغاثة' : 'Verified Mutual Aid Merchants'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {t('businesses.title')}
              </h1>
              <p style={{ color: '#fef3c7', fontSize: '1rem', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
                {t('businesses.subtitle')}
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => setShowRegisterModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#f59e0b',
                  color: '#451a03',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fbbf24')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f59e0b')}
              >
                <PlusCircle size={18} strokeWidth={2.5} />
                <span>{t('businesses.register_btn')}</span>
              </button>
            )}
          </div>

          {/* Quick Merchant Metrics strip */}
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
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Store size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{businesses.length} Merchants</div>
                <div style={{ fontSize: '0.75rem', color: '#fef3c7' }}>{locale === 'ar' ? 'متاجر وشركات مسجلة' : 'Registered Solidarity Partners'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <HandHeart size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Mutual Aid</div>
                <div style={{ fontSize: '0.75rem', color: '#fef3c7' }}>{locale === 'ar' ? 'تعهدات تموينية وإغاثية' : 'Surplus & Meal Pledges'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Fair Trade</div>
                <div style={{ fontSize: '0.75rem', color: '#fef3c7' }}>{locale === 'ar' ? 'تجارة عادلة وتكافل أهلي' : 'Dignified Community Commerce'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', marginInline: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Filter and Search */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 2px 10px rgba(69, 26, 3, 0.03)',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#b45309" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder="Search merchants by name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadBusinesses()}
              style={{ width: '100%', padding: '0.55rem 0.55rem 0.55rem 2.4rem', borderRadius: '8px', border: '1.5px solid #fed7aa', fontSize: '0.85rem', outline: 'none' }}
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
                border: '1.5px solid #fed7aa',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: '#fffbeb',
                color: '#451a03',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">All Categories</option>
              <option value="WHOLESALE_GROCERY">Wholesale Grocery</option>
              <option value="BAKERY_WHOLESALE">Bakery & Provisions</option>
              <option value="PHARMACY_MEDICAL">Pharmacy & Supplies</option>
              <option value="LOGISTICS_TRANSPORT">Logistics & Transport</option>
            </select>
            <ChevronDown size={14} color="#b45309" style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <button
            onClick={loadBusinesses}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#b45309',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Filter
          </button>
        </div>

        {/* Business Cards Grid */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #fed7aa' }}>
            <p style={{ color: '#b45309', fontWeight: 600 }}>Loading business registry...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #fed7aa' }}>
            <Store size={32} color="#b45309" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#451a03' }}>No Businesses Registered</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Be the first community merchant to register and pledge service support.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {businesses.map((biz) => {
              const isVerified = biz.verificationStatus === VerificationStatus.APPROVED;
              return (
                <div
                  key={biz.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1.5px solid #fed7aa',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(69, 26, 3, 0.04)',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(180, 83, 9, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(69, 26, 3, 0.04)';
                  }}
                >
                  {/* Top Warm Bronze Accent Line */}
                  <div style={{ height: '4px', background: 'linear-gradient(90deg, #78350f, #f59e0b)' }} />

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          border: '1px solid #fde68a',
                        }}
                      >
                        {biz.category}
                      </span>
                      {isVerified ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#b45309',
                            border: '1px solid #f59e0b',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <ShieldCheck size={12} color="#b45309" />
                          <span>Verified Partner</span>
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#451a03', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                        {biz.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                        {biz.description}
                      </p>
                    </div>

                    {biz.participationTypes && biz.participationTypes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {biz.participationTypes.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#fffbeb',
                              color: '#92400e',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #fde68a',
                            }}
                          >
                            🤝 {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        backgroundColor: '#fffdfa',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #fef3c7',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={14} color="#b45309" />
                        <span>{biz.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Mail size={14} color="#b45309" />
                        <span>{biz.contactEmail}</span>
                      </div>
                      {biz.contactPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Phone size={14} color="#b45309" />
                          <span>{biz.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #fef3c7', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff' }}>
                    <button
                      onClick={() => openParticipationModal(biz)}
                      style={{
                        flex: 1,
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#92400e';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fffbeb';
                        e.currentTarget.style.color = '#92400e';
                      }}
                    >
                      <HandHeart size={14} />
                      <span>Community Pledges</span>
                    </button>

                    {canVerify && !isVerified && (
                      <button
                        onClick={() => handleVerifyBusiness(biz.id, VerificationStatus.APPROVED)}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          backgroundColor: '#b45309',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title="Verify Merchant"
                      >
                        <ShieldCheck size={14} />
                        <span>Verify</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* MODAL 1: REGISTER BUSINESS */}
      {showRegisterModal && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Register Merchant / Business
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Join the Al-Husseiniya community partner network. Submissions undergo verification before badge issuance.
            </p>

            <form onSubmit={handleRegisterBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Baraka Provisions"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Category *
                </label>
                <select
                  value={registerForm.category}
                  onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="WHOLESALE_GROCERY">Wholesale Grocery</option>
                  <option value="BAKERY_WHOLESALE">Bakery & Flour Wholesale</option>
                  <option value="PHARMACY_MEDICAL">Pharmacy & Medical Supplies</option>
                  <option value="LOGISTICS_TRANSPORT">Logistics & Transportation</option>
                  <option value="COMMUNITY_RESTAURANT">Community Kitchen / Restaurant</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Business Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe goods, services, and how you support local community programs..."
                  value={registerForm.description}
                  onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Physical Location / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address, Market district"
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="merchant@example.com"
                    value={registerForm.contactEmail}
                    onChange={(e) => setRegisterForm({ ...registerForm, contactEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+964 770 123 4567"
                    value={registerForm.contactPhone}
                    onChange={(e) => setRegisterForm({ ...registerForm, contactPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Participation Types (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="MEAL_SUPPORT, SURPLUS_FOOD, IN_KIND, SPONSORSHIP"
                  value={registerForm.participationTypes}
                  onChange={(e) => setRegisterForm({ ...registerForm, participationTypes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn btn-secondary"
                  disabled={registerLoading}
                >
                  Cancel
                </button>
                <button type="submit" disabled={registerLoading} className="btn btn-teal">
                  {registerLoading ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMMUNITY PARTICIPATION / PLEDGES */}
      {selectedBizForParticipation && (
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
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Community Pledges & Support</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedBizForParticipation.name}</p>
              </div>
              <button onClick={() => setSelectedBizForParticipation(null)} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>
                Close
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Existing Participations */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.5rem' }}>
                  Recorded Support Offers
                </h4>
                {loadingParticipations ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading pledges...</p>
                ) : participations.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No pledges recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {participations.map((p) => (
                      <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                              {p.participationType.replace('_', ' ')}
                            </span>
                            <span className={`badge ${p.status === 'APPROVED' ? 'badge-success' : 'badge-neutral'}`}>
                              {p.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.25rem' }}>{p.description}</p>
                          {p.quantity > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pledged quantity: {p.quantity} units</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Participation Form */}
              {isAuthenticated && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.5rem' }}>
                    Pledge Community Support
                  </h4>
                  <form onSubmit={handleSubmitParticipation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                          Support Type
                        </label>
                        <select
                          value={participationForm.participationType}
                          onChange={(e) => setParticipationForm({ ...participationForm, participationType: e.target.value })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        >
                          <option value="MEAL_SUPPORT">Hot Meals Support</option>
                          <option value="SURPLUS_FOOD">Surplus Food Donation</option>
                          <option value="IN_KIND">In-Kind Goods</option>
                          <option value="SPONSORSHIP">Sponsorship</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                          Quantity (Rations / Packs)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={participationForm.quantity}
                          onChange={(e) => setParticipationForm({ ...participationForm, quantity: Number(e.target.value) })}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                        Pledge Details *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100 fresh bread packs every Friday afternoon"
                        value={participationForm.description}
                        onChange={(e) => setParticipationForm({ ...participationForm, description: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>

                    <button type="submit" disabled={submittingPart} className="btn btn-teal" style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                      {submittingPart ? 'Submitting...' : 'Submit Pledge'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
