import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
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
  ArrowLeft,
  History,
  AlertTriangle,
  Filter,
  ShieldCheck,
  Heart,
  ChevronRight,
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
  const { t, locale, isRtl } = useLocalization();
  const [requests, setRequests] = useState<HumanitarianRequest[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Progressive Disclosure Multi-Step Form state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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
      ].includes(r as RoleType)
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

  const handleOpenCreateModal = () => {
    setStep(1);
    setSubmissionSuccess(false);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

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

    setSubmitting(false);
    if (res.success) {
      setSubmissionSuccess(true);
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

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1240px', marginInline: 'auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
            {t('requests.title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {t('requests.subtitle')}
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ paddingInline: '1.25rem', paddingBlock: '0.55rem' }}>
          <Plus size={16} />
          <span>{t('requests.new_btn')}</span>
        </button>
      </div>

      {/* Privacy Pledge Banner */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          paddingInline: '1.25rem',
          paddingBlock: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: '#166534',
        }}
      >
        <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
        <div>{t('requests.privacy_banner')}</div>
      </div>

      {actionError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          {actionError}
        </div>
      )}

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          paddingInline: '1rem',
          paddingBlock: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8125rem' }}>
          <Filter size={15} />
          <span>{t('common.filter')}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>{t('common.category')}</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ paddingInline: '0.6rem', paddingBlock: '0.35rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">{t('common.all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === 'ar' ? (c.nameAr || c.nameEn) : c.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>{t('common.status')}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ paddingInline: '0.6rem', paddingBlock: '0.35rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">{t('common.all')}</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="MATCHED">MATCHED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <span style={{ marginInlineStart: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          {filteredRequests.length} / {requests.length}
        </span>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>{t('common.loading')}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <AlertCircle size={40} color="#94a3b8" style={{ marginInline: 'auto', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
            {locale === 'ar' ? 'لا توجد طلبات مطابقة لهذه التصفية' : 'No Requests Matching Criteria'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {locale === 'ar' ? 'يمكنك تقديم طلب جديد للحصول على المساعدة اللازمة.' : 'No assistance requests match your active filters.'}
          </p>
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            {t('requests.new_btn')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                    {req.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {req.isPrivate ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Lock size={12} /> {locale === 'ar' ? 'طلب سري ومحمي' : 'Confidential'}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Globe size={12} /> {locale === 'ar' ? 'مرئي للعموم' : 'Community Visible'}
                      </span>
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleViewHistory(req)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    <History size={13} style={{ marginInlineEnd: '0.25rem' }} />
                    <span>{locale === 'ar' ? 'سجل الحالة' : 'History'}</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(req.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : undefined)}
                  </span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                  {req.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {req.description}
                </p>
                {req.location && (
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.4rem' }}>
                    <strong>{locale === 'ar' ? 'الموقع:' : 'Location:'}</strong> {req.location}
                  </p>
                )}
              </div>

              {/* Progress Stepper Bar */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', overflowX: 'auto' }}>
                  {CANONICAL_STEPS.map((s, idx) => {
                    const currentIdx = CANONICAL_STEPS.indexOf(req.status as any);
                    const isDone = currentIdx >= idx;
                    const isCurrent = req.status === s;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: isCurrent ? '#087f78' : isDone ? '#10b981' : '#e2e8f0',
                            color: isDone || isCurrent ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ color: isCurrent ? '#087f78' : isDone ? '#1e293b' : '#94a3b8', fontWeight: isCurrent ? 700 : 500 }}>
                          {s.replace('_', ' ')}
                        </span>
                        {idx < CANONICAL_STEPS.length - 1 && (
                          <span style={{ color: '#cbd5e1', marginInline: '0.3rem' }} className="dir-flip">
                            &rarr;
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff / Coordinator Status Controls */}
              {isStaffOrAdmin && (
                <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    {locale === 'ar' ? 'إجراءات المنسق:' : 'Staff Actions:'}
                  </span>
                  {req.status === 'SUBMITTED' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'UNDER_REVIEW')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {locale === 'ar' ? 'بدء المراجعة' : 'Mark In Review'}
                    </button>
                  )}
                  {req.status === 'UNDER_REVIEW' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'MATCHED')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {locale === 'ar' ? 'تنسيق مع الجهة' : 'Match Responders'}
                    </button>
                  )}
                  {req.status === 'MATCHED' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {locale === 'ar' ? 'قبول التكليف' : 'Accept Assignment'}
                    </button>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {locale === 'ar' ? 'بدء التنفيذ' : 'Start Delivery'}
                    </button>
                  )}
                  {req.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus(req.id, 'COMPLETED')} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {locale === 'ar' ? 'إنجاز الطلب' : 'Complete Request'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progressive Multi-Step Help Request Modal */}
      {showModal && (
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
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                  {submissionSuccess ? t('requests.success_title') : t('requests.title')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  {submissionSuccess
                    ? (locale === 'ar' ? 'تم استلام احتياجك بكرامة واهتمام تام' : 'Your request details have been securely recorded.')
                    : (locale === 'ar' ? `المرحلة ${step} من 4: مساندة مجتمعية قائمة على الكرامة` : `Step ${step} of 4: Dignified Community Support`)}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {formError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            {/* Success State Screen */}
            {submissionSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={54} color="#16a34a" style={{ marginInline: 'auto', marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b1f2a', marginBottom: '0.5rem' }}>
                  {t('requests.success_title')}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, maxWidth: '480px', marginInline: 'auto', marginBottom: '1.5rem' }}>
                  {t('requests.success_desc')}
                </p>
                <button onClick={() => setShowModal(false)} className="btn btn-primary">
                  {locale === 'ar' ? 'العودة إلى قائمة الطلبات' : 'Return to Requests'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Step 1: Category Selection */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a' }}>
                      {t('requests.step1')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {categories.map((c) => {
                        const selected = categoryId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setCategoryId(c.id)}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              border: selected ? '2px solid #087f78' : '1px solid #cbd5e1',
                              backgroundColor: selected ? '#f0fbf9' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: selected ? '#087f78' : '#0b1f2a' }}>
                              {locale === 'ar' ? (c.nameAr || c.nameEn) : c.nameEn}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {locale === 'ar' ? (c.descriptionAr || 'إغاثة ودعم مجتمعي أساسي') : (c.descriptionEn || 'Essential community relief')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!categoryId}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <span>{t('common.continue')}</span>
                        <ArrowRight size={15} className="dir-flip" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a' }}>
                      {t('requests.step2')}
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {t('requests.summary_label')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: سلة غذائية عاجلة وحليب أطفال لعائلة مكونة من 4 أفراد' : 'e.g. Urgent baby formula and winter blankets for family'}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {t('requests.details_label')} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={locale === 'ar' ? 'يرجى توضيح أي تفاصيل معيشية أو صحية أو موعد الاحتياج الضروري...' : 'Share any pertinent context, dietary requirements, or urgency details...'}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                        <ArrowLeft size={15} className="dir-flip" /> {t('common.back')}
                      </button>
                      <button
                        type="button"
                        disabled={!title.trim() || !description.trim()}
                        onClick={() => setStep(3)}
                        className="btn btn-primary"
                      >
                        {t('common.continue')} <ArrowRight size={15} className="dir-flip" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Location & Privacy */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a' }}>
                      {t('requests.step3')}
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {t('requests.location_label')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={locale === 'ar' ? 'مثال: حي الكرامة، النجف الأشرف أو جانب الكرخ، بغداد' : 'e.g. Al-Adhamiya, Baghdad or Najaf Old City'}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1f2a' }}>
                          {t('requests.private_checkbox')}
                        </span>
                      </label>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', marginInlineStart: '1.6rem' }}>
                        {t('requests.privacy_banner')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                        <ArrowLeft size={15} className="dir-flip" /> {t('common.back')}
                      </button>
                      <button
                        type="button"
                        disabled={!location.trim()}
                        onClick={() => setStep(4)}
                        className="btn btn-primary"
                      >
                        {t('common.continue')} <ArrowRight size={15} className="dir-flip" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Submit */}
                {step === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a' }}>
                      {t('requests.step4')}
                    </h4>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div>
                        <strong>{locale === 'ar' ? 'نوع الدعم:' : 'Category:'}</strong>{' '}
                        {locale === 'ar' ? (selectedCategoryObj?.nameAr || selectedCategoryObj?.nameEn) : selectedCategoryObj?.nameEn}
                      </div>
                      <div>
                        <strong>{locale === 'ar' ? 'العنوان:' : 'Title:'}</strong> {title}
                      </div>
                      <div>
                        <strong>{locale === 'ar' ? 'التفاصيل:' : 'Details:'}</strong> {description}
                      </div>
                      <div>
                        <strong>{locale === 'ar' ? 'الموقع التقريبي:' : 'Location:'}</strong> {location}
                      </div>
                      <div>
                        <strong>{locale === 'ar' ? 'مستوى الخصوصية:' : 'Privacy:'}</strong>{' '}
                        {isPrivate ? (locale === 'ar' ? 'سري وخاص بالمنسقين فقط' : 'Confidential') : (locale === 'ar' ? 'مرئي للعموم' : 'Public')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setStep(3)} className="btn btn-secondary" disabled={submitting}>
                        <ArrowLeft size={15} className="dir-flip" /> {t('common.back')}
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? t('common.loading') : (locale === 'ar' ? 'تأكيد وإرسال الطلب' : 'Confirm & Submit Request')}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {selectedHistory && (
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
          <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '1.75rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              {locale === 'ar' ? 'سجل مراحل الطلب' : 'Status Lifecycle History'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {locale === 'ar' ? 'للطلب:' : 'For request:'} <strong>{selectedHistory.requestTitle}</strong>
            </p>

            {selectedHistory.history.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {locale === 'ar' ? 'لا توجد انتقالات سابقة مسجلة.' : 'No status transitions recorded yet.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedHistory.history.map((h, i) => (
                  <div
                    key={h.id || i}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info">{h.newStatus}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {new Date(h.timestamp || h.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
                      </span>
                    </div>
                    {h.reason && (
                      <p style={{ color: '#475569', margin: '0.35rem 0 0' }}>
                        {locale === 'ar' ? 'ملاحظة:' : 'Notes:'} {h.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedHistory(null)} className="btn btn-secondary">
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
