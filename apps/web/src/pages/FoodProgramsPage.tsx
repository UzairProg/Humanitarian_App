import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import ApiClient from '../services/api';
import { FoodProgram, RoleType, Organization } from '@al-husseiniya/types';
import {
  Utensils,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Building2,
  Info,
} from 'lucide-react';

export const FoodProgramsPage: React.FC = () => {
  const { user, login } = useAuth();
  const { t, locale, isRtl } = useLocalization();
  const [programs, setPrograms] = useState<FoodProgram[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auth / Sign-in Modal for meal reservation
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Program Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormError, setCreateFormError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orgId, setOrgId] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [mealType, setMealType] = useState('HOT_MEAL');
  const [instructions, setInstructions] = useState('');

  const isStaffOrAdmin =
    user?.roles?.some((r) =>
      [
        RoleType.SUPER_ADMIN,
        RoleType.COMMUNITY_ADMIN,
        RoleType.ORGANIZATION_ADMIN,
        RoleType.ORGANIZATION_STAFF,
      ].includes(r as RoleType)
    ) ||
    user?.role === RoleType.ORGANIZATION_ADMIN ||
    user?.role === RoleType.ORGANIZATION_STAFF ||
    user?.role === RoleType.SUPER_ADMIN;

  const loadData = async () => {
    setLoading(true);
    const [progRes, orgRes] = await Promise.all([
      ApiClient.request<FoodProgram[]>('/food-programs'),
      ApiClient.request<Organization[]>('/organizations'),
    ]);

    if (progRes.success && progRes.data) {
      setPrograms(progRes.data);
    }
    if (orgRes.success && orgRes.data) {
      setOrganizations(orgRes.data);
      if (orgRes.data.length > 0 && !orgId) {
        setOrgId(orgRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const executeReserve = async (programId: string) => {
    setSuccessMsg('');
    setErrorMsg('');

    const res = await ApiClient.request(`/food-programs/${programId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ count: 1 }),
    });

    if (res.success) {
      setSuccessMsg(
        locale === 'ar'
          ? 'تم حجز وجبتك بنجاح! تم حفظ طلبك وتجهيزه لدى مركز التوزيع.'
          : 'Meal kit successfully reserved! Your confirmation is recorded and ready for pickup.'
      );
      loadData();
    } else {
      setErrorMsg(res.error?.message || (locale === 'ar' ? 'تعذر إتمام الحجز حالياً' : 'Failed to complete reservation'));
    }
  };

  const handleReserve = async (programId: string) => {
    // If not authenticated, open the friendly Sign-In / Register window
    if (!user) {
      setPendingProgramId(programId);
      setAuthError('');
      setShowAuthModal(true);
      return;
    }

    await executeReserve(programId);
  };

  const handleQuickAuth = async (email: string, pass = 'DemoPass@12345') => {
    setAuthLoading(true);
    setAuthError('');
    const res = await login(email, pass);
    setAuthLoading(false);

    if (res.success) {
      const targetProg = pendingProgramId;
      setShowAuthModal(false);
      setPendingProgramId(null);
      if (targetProg) {
        await executeReserve(targetProg);
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

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError('');

    const res = await ApiClient.request('/food-programs', {
      method: 'POST',
      body: JSON.stringify({
        organizationId: orgId,
        title,
        description,
        programDate,
        startTime,
        endTime,
        location,
        capacity: Number(capacity),
        mealType,
        instructions,
      }),
    });

    if (res.success) {
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setInstructions('');
      loadData();
    } else {
      setCreateFormError(res.error?.message || (locale === 'ar' ? 'فشل جدول توزيع الوجبات' : 'Failed to create food program'));
    }
  };

  const filteredPrograms = programs.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (
      searchQuery &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #fffbf2 0%, #fdf5ea 100%)',
        minHeight: '100vh',
        padding: '2rem 1.25rem',
      }}
    >
      <div style={{ maxWidth: '1240px', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Editorial Culinary Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1f1206 0%, #381c07 45%, #5a2608 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            paddingBlock: '2.5rem',
            paddingInline: '2.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 8px 30px rgba(90, 38, 8, 0.15)',
            border: '1px solid rgba(222, 185, 95, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle warm glow background accent */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              [isRtl ? 'left' : 'right']: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: 'rgba(222, 185, 95, 0.15)', border: '1px solid rgba(222, 185, 95, 0.35)', padding: '0.2rem 0.65rem', borderRadius: '20px', marginBottom: '0.65rem' }}>
              <Utensils size={13} color="#deb95f" />
              <span style={{ color: '#deb95f', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('food.hero.eyebrow')} • {programs.length} {locale === 'ar' ? 'برامج ومطابخ مفعلة' : 'Active Community Kitchens'}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', fontWeight: 800, color: '#fffaf0', margin: '0 0 0.65rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {t('food.hero.title')}
            </h1>
            <p style={{ color: '#fed7aa', fontSize: '0.95rem', lineHeight: 1.65, margin: 0, opacity: 0.95 }}>
              {t('food.hero.desc')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {isStaffOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
                style={{
                  paddingInline: '1.4rem',
                  paddingBlock: '0.7rem',
                  background: 'linear-gradient(135deg, #c6a24a 0%, #9e7f33 100%)',
                  border: 'none',
                  color: '#07141c',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(198, 162, 74, 0.35)',
                }}
              >
                <Plus size={16} />
                <span>{t('food.schedule_btn')}</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#065f46',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.875rem',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)',
            }}
          >
            <CheckCircle size={20} color="#059669" />
            <span style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.875rem',
              boxShadow: '0 2px 10px rgba(244, 63, 94, 0.1)',
            }}
          >
            <AlertCircle size={20} color="#e11d48" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Warm Filter and Search Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            paddingInline: '1.25rem',
            paddingBlock: '1rem',
            borderRadius: '14px',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 12px rgba(180, 83, 9, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px' }}>
            <Search size={16} color="#d97706" />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن الوجبات والمطابخ بالاسم أو الحي...' : 'Search kitchens by name or district...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingInline: '0.75rem',
                paddingBlock: '0.45rem',
                borderRadius: '8px',
                border: '1px solid #fbd38d',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: '#fffdfa',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9a3412' }}>{t('common.status')}:</span>
            {(['ALL', 'ACTIVE', 'LIMITED', 'FULL'] as const).map((st) => {
              const active = statusFilter === st || (st === 'ACTIVE' && statusFilter === 'OPEN');
              const label =
                st === 'ALL'
                  ? t('common.all')
                  : st === 'ACTIVE'
                  ? t('status.open')
                  : st === 'LIMITED'
                  ? t('status.limited')
                  : t('status.full');

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st === 'ACTIVE' ? 'ALL' : st)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    border: active ? '1px solid #d97706' : '1px solid #fed7aa',
                    backgroundColor: active ? '#fff7ed' : '#ffffff',
                    color: active ? '#c2410c' : '#78350f',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span style={{ marginInlineStart: 'auto', fontSize: '0.8125rem', fontWeight: 600, color: '#b45309' }}>
            {filteredPrograms.length} / {programs.length} {locale === 'ar' ? 'وجبة متاحة' : 'programs'}
          </span>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #fed7aa' }}>
            <p style={{ color: '#9a3412', fontWeight: 500 }}>{t('common.loading')}</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #fed7aa' }}>
            <Utensils size={40} color="#d97706" style={{ marginInline: 'auto', marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#78350f', marginBottom: '0.5rem' }}>
              {locale === 'ar' ? 'لا توجد وجبات تطابق التصفية الحالية' : 'No community meals match your filter'}
            </h3>
            <p style={{ color: '#9a3412', fontSize: '0.875rem' }}>
              {locale === 'ar' ? 'جرب تغيير خيارات التصفية أو البحث في حي آخر.' : 'Try changing your search terms or view all programs.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filteredPrograms.map((p) => {
              const isFull = p.remainingCapacity <= 0;
              const isLimited = p.remainingCapacity > 0 && p.remainingCapacity < 25;
              const percentClaimed = Math.min(100, Math.round(((p.capacity - p.remainingCapacity) / Math.max(1, p.capacity)) * 100));

              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #fde68a',
                    boxShadow: '0 4px 20px rgba(180, 83, 9, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Top warm accent line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: isFull
                        ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                        : isLimited
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isFull ? '#ffe4e6' : isLimited ? '#fef3c7' : '#dcfce7',
                          color: isFull ? '#be123c' : isLimited ? '#b45309' : '#15803d',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isFull ? '#e11d48' : isLimited ? '#f59e0b' : '#10b981' }} />
                        {isFull ? t('status.full') : isLimited ? t('status.limited') : t('status.open')}
                      </span>

                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isFull ? '#e11d48' : '#b45309' }}>
                        {p.remainingCapacity} {locale === 'ar' ? 'وجبة متبقية' : 'meals available'}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#271406', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#574134', lineHeight: 1.6, margin: 0 }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>
                        <span>{t('home.capacity.reserved')}: {p.capacity - p.remainingCapacity}</span>
                        <span>{t('home.capacity.total')}: {p.capacity}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#fed7aa', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentClaimed}%`,
                            height: '100%',
                            backgroundColor: isFull ? '#f43f5e' : isLimited ? '#f59e0b' : '#10b981',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Serving Details Box */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        fontSize: '0.8125rem',
                        color: '#451a03',
                        backgroundColor: '#fff7ed',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #ffedd5',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="#d97706" />
                        <span style={{ fontWeight: 600 }}>{p.programDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="#d97706" />
                        <span>{t('food.serving_time')}: {p.startTime} - {p.endTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#d97706" />
                        <span>{p.location}</span>
                      </div>
                    </div>

                    {p.instructions && (
                      <div style={{ fontSize: '0.75rem', color: '#78350f', fontStyle: 'italic', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        <strong>{t('food.pickup_notes')}:</strong> {p.instructions}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #fed7aa', paddingTop: '1rem', marginTop: '1.25rem' }}>
                    <button
                      onClick={() => handleReserve(p.id)}
                      disabled={isFull}
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        background: isFull
                          ? '#e2e8f0'
                          : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        color: isFull ? '#94a3b8' : '#ffffff',
                        boxShadow: isFull ? 'none' : '0 4px 14px rgba(217, 119, 6, 0.3)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isFull ? t('status.full') : t('food.reserve_btn')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RESERVATION SIGN-IN / SIGN-UP MODAL WINDOW (Prevents raw Auth error) */}
        {showAuthModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                maxWidth: '480px',
                width: '100%',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid #fed7aa',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706',
                    border: '1px solid #fed7aa',
                    flexShrink: 0,
                  }}
                >
                  <Utensils size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {locale === 'ar' ? 'حجز وجبتك الكريمة' : 'Reserve Your Meal'}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                    {locale === 'ar' ? 'الطعام حق إنساني متاح دائماً بكرامة ووضوح' : 'Food should never be out of reach.'}
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.5 }}>
                {locale === 'ar'
                  ? 'لتجهيز وجبتك وإصدار رمز الاستلام وحفظ نصيبك، يرجى تسجيل الدخول أو استخدام أحد الحسابات التجريبية بنقرة واحدة.'
                  : 'To confirm your meal allocation and generate your pickup token, please sign in or use one-click demo login below.'}
              </div>

              {authError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {authError}
                </div>
              )}

              {/* Fast One-Click Demo Personas */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  {locale === 'ar' ? 'الدخول السريع بحساب تجريبي (Demo 1-Click):' : 'Instant 1-Click Demo Login & Reserve:'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handleQuickAuth('demo.requester@demo.alhusseiniya.app')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa',
                      backgroundColor: '#fff7ed',
                      color: '#c2410c',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'start',
                    }}
                  >
                    🤝 Omar (Requester)
                  </button>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handleQuickAuth('demo.individual@demo.alhusseiniya.app')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #fed7aa',
                      backgroundColor: '#fff7ed',
                      color: '#c2410c',
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
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder={locale === 'ar' ? 'كلمة المرور' : 'Password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
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
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {authLoading ? t('common.loading') : (locale === 'ar' ? 'دخول وحجز الوجبة' : 'Sign In & Reserve')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Program Modal */}
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
          >
            <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '18px', border: '1px solid #fed7aa' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#271406', marginBottom: '0.35rem' }}>
                {t('food.schedule_btn')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1.25rem' }}>
                {locale === 'ar' ? 'تسجيل وتنسيق توزيع وجبات طازجة عبر منظمتك المعتمدة' : 'Register an upcoming fresh meal service hosted by your verified organization.'}
              </p>

              {createFormError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {createFormError}
                </div>
              )}

              <form onSubmit={handleCreateProgram} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {locale === 'ar' ? 'الجهة المنظمة المسؤولة *' : 'Hosting Organization *'}
                  </label>
                  <select
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} — {org.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {locale === 'ar' ? 'عنوان برنامج الوجبات *' : 'Program Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={locale === 'ar' ? 'مثال: وجبة العشاء المجتمعية اليومية في حسينية النور' : 'e.g. Daily Community Dinner Distribution'}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {locale === 'ar' ? 'تاريخ التوزيع *' : 'Distribution Date *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={programDate}
                      onChange={(e) => setProgramDate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {locale === 'ar' ? 'وقت البدء *' : 'Start Time *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {locale === 'ar' ? 'وقت الانتهاء *' : 'End Time *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {locale === 'ar' ? 'الموقع وعنوان الاستلام *' : 'Location / Address *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={locale === 'ar' ? 'مثال: باحة الحسينية المركزية، النجف الأشرف' : 'e.g. Al-Husseiniya Courtyard, Najaf'}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {locale === 'ar' ? 'العدد المتاح للوجبات *' : 'Meal Capacity *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {locale === 'ar' ? 'تفاصيل الوجبة والمعلومات *' : 'Description *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={locale === 'ar' ? 'تفاصيل القائمة الغذائية وملاحظات الحساسية...' : 'Details regarding menu, allergens, and dietary accommodations...'}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    {t('food.pickup_notes')}
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={locale === 'ar' ? 'مثال: الدخول من البوابة الشرقية، إبراز رسالة الحجز' : 'e.g. Enter through Gate B, bring confirmation SMS'}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {locale === 'ar' ? 'نشر وتفعيل التوزيع' : 'Publish Meal Distribution'}
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

