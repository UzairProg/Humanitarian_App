import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import ApiClient from '../services/api';
import { HumanitarianRequest, RequestCategory, RequestStatus, RoleType, RequestPriority } from '@al-husseiniya/types';
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
  ChevronDown,
  Sparkles,
  Wheat,
  Flame,
  Stethoscope,
  Home,
  Truck,
  UserCheck,
  LogIn,
  Check,
  Info,
} from 'lucide-react';

const CANONICAL_STEPS = [
  RequestStatus.SUBMITTED,
  RequestStatus.UNDER_REVIEW,
  RequestStatus.MATCHED,
  RequestStatus.ACCEPTED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.COMPLETED,
];

// Rich Assistance Tracks data
const ASSISTANCE_TRACKS = [
  {
    id: 'track-food',
    categoryKey: 'FOOD_AND_NUTRITION',
    icon: Wheat,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    titleEn: 'Emergency Food & Nutrition Hamper',
    titleAr: 'سلة الغذاء والتموين الطارئ',
    descriptionEn: 'Essential halal pantry staples, infant formula, fresh produce vouchers, and 7-day family rations.',
    descriptionAr: 'حصص غذائية حلال أساسية، حليب أطفال، قسائم خضار طازجة، وإمدادات تموينية متكاملة للأسرة.',
    turnaroundEn: 'Response under 4 hours',
    turnaroundAr: 'استجابة خلال 4 ساعات',
    priority: 'HIGH',
    itemsEn: ['7-Day Halal Dry Rations', 'Infant Formula & Diapers', 'Fresh Bread & Produce Voucher'],
    itemsAr: ['مؤونة جافة تكفي 7 أيام', 'حليب ومستلزمات أطفال', 'قسيمة خبز وخضار طازجة'],
  },
  {
    id: 'track-winter',
    categoryKey: 'WINTER_RELIEF',
    icon: Flame,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    titleEn: 'Winter Warmth & Heating Assistance',
    titleAr: 'إغاثة الشتاء ومخصصات التدفئة',
    descriptionEn: 'Kerosene heating fuel vouchers, heavy thermal insulation blankets, and winter clothing kits for children.',
    descriptionAr: 'قسائم وقود تدفئة، بطانيات حرارية عازلة، وكسوة شتوية دافئة للأطفال وكبار السن.',
    turnaroundEn: 'Response within 24 hours',
    turnaroundAr: 'استجابة خلال 24 ساعة',
    priority: 'HIGH',
    itemsEn: ['Heating Fuel Vouchers', 'Thermal Wool Blankets', 'Children Winter Jackets & Boots'],
    itemsAr: ['قسيمة وقود للتدفئة', 'بطانيات صوفية سميكة', 'معاطف وأحذية شتوية للأطفال'],
  },
  {
    id: 'track-medical',
    categoryKey: 'MEDICAL_ASSISTANCE',
    icon: Stethoscope,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    titleEn: 'Urgent Prescription & Pediatric Medical Aid',
    titleAr: 'الأدوية العاجلة والمساعدات الطبية للأطفال',
    descriptionEn: 'Critical prescription refills, insulin, asthma nebulizers, and urgent clinic consultation subsidies.',
    descriptionAr: 'تأمين أدوية الأمراض المزمنة، إنسولين، جلسات استنشاق الربو، وتغطية تكاليف الفحوصات العاجلة.',
    turnaroundEn: 'Priority response under 2 hours',
    turnaroundAr: 'أولوية قصوى خلال ساعتين',
    priority: 'URGENT',
    itemsEn: ['Insulin & Chronic Rx Refill', 'Pediatric Nebulizers & Inhalers', 'Clinic & Lab Co-pay Voucher'],
    itemsAr: ['توفير أدوية الإنسولين والمزمنة', 'أجهزة تنفس وبخاخات للأطفال', 'تغطية الفحوصات والعيادات'],
  },
  {
    id: 'track-housing',
    categoryKey: 'HOUSING_SUPPORT',
    icon: Home,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    titleEn: 'Family Rental & Eviction Defense Aid',
    titleAr: 'سند الإيجار وحماية العوائل من الإخلاء',
    descriptionEn: 'Direct emergency rental assistance grants, landlord mediation, and temporary emergency shelter placement.',
    descriptionAr: 'منح مالية طارئة لتسديد الإيجار، وساطة مع الملاك، وترتيب مأوى طارئ يصون كرامة الأسرة.',
    turnaroundEn: 'Review within 48 hours',
    turnaroundAr: 'مراجعة خلال 48 ساعة',
    priority: 'STANDARD',
    itemsEn: ['Emergency Rent Contribution', 'Mediation & Protection', 'Transitional Shelter Coordination'],
    itemsAr: ['مساهمة طارئة في الإيجار', 'وساطة وحماية قانونية', 'تأمين مأوى بديل مؤقت'],
  },
  {
    id: 'track-transit',
    categoryKey: 'TRANSPORT_SUPPORT',
    icon: Truck,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    titleEn: 'Dignified Transit & Elder Medical Transport',
    titleAr: 'النقل الصحي الميسر ومرافقة كبار السن',
    descriptionEn: 'Wheelchair-accessible transport to dialysis centers, oncology clinics, and physical therapy appointments.',
    descriptionAr: 'نقل مجهز وميسر لذوي الاحتياجات وكبار السن إلى مراكز غسيل الكلى والعلاج الطبيعي.',
    turnaroundEn: 'Dispatch within 12 hours',
    turnaroundAr: 'ترتيب الرحلة خلال 12 ساعة',
    priority: 'HIGH',
    itemsEn: ['Wheelchair-Accessible Van', 'Trained Care Companion', 'Scheduled Round-Trip Service'],
    itemsAr: ['مركبة مجهزة للكراسي المتحركة', 'مرافق تطوعي مدرب', 'رحلات ذهاب وإياب مجدولة'],
  },
];

// Fallback canonical demonstration requests for guests/visitors showcasing the complete lifecycle
const DEMO_LIFECYCLE_REQUESTS: HumanitarianRequest[] = [
  {
    id: 'demo-req-102',
    requesterId: 'demo-req-user',
    categoryId: 'cat-food',
    title: 'Urgent Halal Dry Food Basket & Infant Nutrition',
    description: 'Family of 6 requires dry rations, baby milk formula (Stage 2), rice, and cooking oil following temporary displacement.',
    location: 'Al-Kadhimiya, Sector 4, Baghdad',
    status: RequestStatus.COMPLETED,
    priority: RequestPriority.HIGH,
    isPrivate: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000),
  },
  {
    id: 'demo-req-103',
    requesterId: 'demo-req-user',
    categoryId: 'cat-medical',
    title: 'Pediatric Insulin & Nebulizer Medication Support',
    description: '8-year-old child requiring immediate Lantus insulin refill and salbutamol inhaler for acute bronchial asthma.',
    location: 'Al-Askari District, Najaf Al-Ashraf',
    status: RequestStatus.IN_PROGRESS,
    priority: RequestPriority.URGENT,
    isPrivate: true,
    createdAt: new Date(Date.now() - 18 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
  },
  {
    id: 'demo-req-104',
    requesterId: 'demo-req-user',
    categoryId: 'cat-winter',
    title: 'Winter Fuel Voucher & Heavy Thermal Bedding',
    description: 'Elderly couple in unheated home requiring heating kerosene subsidy and two heavy wool thermal blankets.',
    location: 'Bab Baghdad Neighborhood, Karbala',
    status: RequestStatus.ACCEPTED,
    priority: RequestPriority.HIGH,
    isPrivate: true,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000),
  },
  {
    id: 'demo-req-105',
    requesterId: 'demo-req-user',
    categoryId: 'cat-housing',
    title: 'Family Eviction Defense & Rental Subsidy Support',
    description: 'Widowed mother facing imminent eviction deadline. Emergency rental contribution approved to secure shelter lease.',
    location: 'Al-Zafraniya, Baghdad',
    status: RequestStatus.MATCHED,
    priority: RequestPriority.NORMAL,
    isPrivate: true,
    createdAt: new Date(Date.now() - 10 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    id: 'demo-req-106',
    requesterId: 'demo-req-user',
    categoryId: 'cat-transit',
    title: 'Elderly Escorted Transport to Renal Dialysis Unit',
    description: 'Bi-weekly wheelchair transportation needed from residential home to Najaf Central Teaching Hospital.',
    location: 'Old City, Kufa',
    status: RequestStatus.UNDER_REVIEW,
    priority: RequestPriority.HIGH,
    isPrivate: true,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000),
  },
  {
    id: 'demo-req-107',
    requesterId: 'demo-req-user',
    categoryId: 'cat-food',
    title: 'Newborn Winter Clothing & Thermal Diaper Hamper',
    description: 'Single mother with 3-week-old infant requiring thermal sleep suits, baby diapers, and nutritional vitamins.',
    location: 'Al-Hurra District, Samarra',
    status: RequestStatus.SUBMITTED,
    priority: RequestPriority.NORMAL,
    isPrivate: true,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000),
  },
];

export const RequestsPage: React.FC = () => {
  const { user, login } = useAuth();
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

  // Auth Modal state for unauthenticated guests
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

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
  }, [user]);

  const handleOpenCreateModal = (prefillTitle = '') => {
    if (!user) {
      setPendingAction(prefillTitle || 'NEW_REQUEST');
      setAuthError('');
      setShowAuthModal(true);
      return;
    }

    if (prefillTitle) {
      setTitle(prefillTitle);
    }
    setStep(1);
    setSubmissionSuccess(false);
    setFormError('');
    setShowModal(true);
  };

  const handleQuickAuth = async (email: string, pass = 'DemoPass@12345') => {
    setAuthLoading(true);
    setAuthError('');
    const res = await login(email, pass);
    setAuthLoading(false);

    if (res.success) {
      const action = pendingAction;
      setShowAuthModal(false);
      setPendingAction(null);
      await loadData();
      if (action && action !== 'NEW_REQUEST') {
        handleOpenCreateModal(action);
      } else {
        handleOpenCreateModal();
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

  // Determine display list: if user is logged in and has requests, use them.
  // Otherwise, display canonical lifecycle showcase so the page is richly populated with active data.
  const activeRequestsList = requests.length > 0 ? requests : DEMO_LIFECYCLE_REQUESTS;
  const isDemonstrationFeed = requests.length === 0;

  const filteredRequests = activeRequestsList.filter((r) => {
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
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* Unique Compassionate Relief Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #032b22 0%, #064e3b 50%, #0f766e 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          boxShadow: '0 4px 20px rgba(6, 78, 59, 0.25)',
          position: 'relative',
          overflow: 'hidden',
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
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
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
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(110, 231, 183, 0.4)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#6ee7b7',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Heart size={13} fill="#6ee7b7" />
              {locale === 'ar' ? 'شبكة الإغاثة الإنسانية المباشرة' : 'Direct Humanitarian Relief Network'}
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
                color: '#e2e8f0',
              }}
            >
              <ShieldCheck size={13} color="#6ee7b7" />
              {locale === 'ar' ? 'خصوصية وكرامة مضمونة 100%' : '100% Confidential & Dignified'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {locale === 'ar' ? 'طلب المساعدة والدعم الإنساني' : 'Find Help & Relief Assistance'}
              </h1>
              <p style={{ color: '#a7f3d0', fontSize: '1rem', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
                {locale === 'ar'
                  ? 'بوابة آمنة ومباشرة لتقديم طلبات الإغاثة الغذائية والطبية والشتوية. تُراجع الطلبات بسرية تامة وتُربط فوراً بالجمعيات المعتمدة.'
                  : 'A secure, dignified portal for confidential emergency aid. Request food baskets, winter heating, prescription support, or family assistance.'}
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#10b981',
                color: '#022c22',
                fontWeight: 800,
                fontSize: '0.92rem',
                padding: '0.85rem 1.6rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>{t('requests.new_btn')}</span>
            </button>
          </div>

          {/* Quick Relief Metrics strip */}
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
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>&lt; 4 Hours</div>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>{locale === 'ar' ? 'متوسط سرعة الاستجابة' : 'Average First Response'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>1,420+ Cases</div>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>{locale === 'ar' ? 'عائلة تمت إغاثتها هذا الموسم' : 'Families Dignified This Season'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>End-to-End</div>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>{locale === 'ar' ? 'تشفير تام وحماية الهوية' : 'Beneficiary Privacy Sealed'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', marginInline: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECTION 1: Active Assistance Tracks (Program Pathways) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#059669" />
                {locale === 'ar' ? 'مسارات الدعم والإغاثة المتاحة' : 'Available Relief & Assistance Tracks'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#047857', margin: '0.2rem 0 0' }}>
                {locale === 'ar' ? 'اختر مسار الإغاثة المناسب لاحتياجك للبدء الفوري بالتسجيل' : 'Select a relief pathway to request fast, specialized support.'}
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', backgroundColor: '#d1fae5', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
              {ASSISTANCE_TRACKS.length} {locale === 'ar' ? 'مسارات فعالة' : 'Active Pathways'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {ASSISTANCE_TRACKS.map((track) => {
              const IconComp = track.icon;
              return (
                <div
                  key={track.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: `1.5px solid ${track.border}`,
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 78, 59, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: track.bg,
                          color: track.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '12px',
                          backgroundColor: track.priority === 'URGENT' ? '#fee2e2' : '#ecfdf5',
                          color: track.priority === 'URGENT' ? '#dc2626' : '#059669',
                        }}
                      >
                        {track.priority}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                        {locale === 'ar' ? track.titleAr : track.titleEn}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                        {locale === 'ar' ? track.descriptionAr : track.descriptionEn}
                      </p>
                    </div>

                    {/* What is included */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      {(locale === 'ar' ? track.itemsAr : track.itemsEn).map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#334155' }}>
                          <Check size={11} color="#059669" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
                      <Clock size={12} color="#059669" />
                      <span>{locale === 'ar' ? track.turnaroundAr : track.turnaroundEn}</span>
                    </div>

                    <button
                      onClick={() => handleOpenCreateModal(locale === 'ar' ? track.titleAr : track.titleEn)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        backgroundColor: track.bg,
                        color: track.color,
                        border: `1px solid ${track.border}`,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = track.color;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = track.bg;
                        e.currentTarget.style.color = track.color;
                      }}
                    >
                      <span>{locale === 'ar' ? 'طلب هذا المسار' : 'Request This Aid'}</span>
                      <ArrowRight size={13} className="dir-flip" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Pledge Banner */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(6, 78, 59, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} color="#059669" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#064e3b' }}>
                {locale === 'ar' ? 'ميثاق كرامة وسرية المستفيد' : 'Beneficiary Dignity & Strict Privacy Pledge'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                {t('requests.privacy_banner')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#065f46', backgroundColor: '#f0fdf4', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              🔒 {locale === 'ar' ? 'بيانات مشفرة' : 'Encrypted Vault'}
            </span>
          </div>
        </div>

        {actionError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.875rem' }}>
            {actionError}
          </div>
        )}

        {/* SECTION 2: HIGH-END FILTER BAR WITH BEAUTIFUL DROPDOWNS & PILLS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            border: '1.5px solid #d1fae5',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064e3b', fontWeight: 800, fontSize: '0.9rem' }}>
              <Filter size={16} color="#059669" />
              <span>{locale === 'ar' ? 'تصفية طلبات الإغاثة والحالات' : 'Filter Relief Requests & Lifecycle'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Category Dropdown - Custom styled */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700, marginInlineEnd: '0.5rem' }}>
                  {t('common.category')}:
                </span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '0.45rem 2rem 0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#064e3b',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">{t('common.all')} ({locale === 'ar' ? 'جميع الفئات' : 'All Categories'})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === 'ar' ? (c.nameAr || c.nameEn) : c.nameEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    color="#059669"
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Status Dropdown - Custom styled */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700, marginInlineEnd: '0.5rem' }}>
                  {t('common.status')}:
                </span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      appearance: 'none',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '0.45rem 2rem 0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#064e3b',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">{t('common.all')} ({locale === 'ar' ? 'جميع الحالات' : 'All Stages'})</option>
                    <option value="SUBMITTED">1. SUBMITTED (تم الاستلام)</option>
                    <option value="UNDER_REVIEW">2. UNDER_REVIEW (قيد المراجعة)</option>
                    <option value="MATCHED">3. MATCHED (تم الربط)</option>
                    <option value="ACCEPTED">4. ACCEPTED (مقبول للتنفيذ)</option>
                    <option value="IN_PROGRESS">5. IN_PROGRESS (جاري التوصيل)</option>
                    <option value="COMPLETED">6. COMPLETED (تم الإنجاز بنجاح)</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#059669"
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857', backgroundColor: '#dcfce7', padding: '0.35rem 0.7rem', borderRadius: '6px' }}>
                {filteredRequests.length} / {activeRequestsList.length}
              </span>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f0fdf4' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {locale === 'ar' ? 'وصول سريع:' : 'Quick Select:'}
            </span>
            <button
              onClick={() => { setFilterCategory('ALL'); setFilterStatus('ALL'); }}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: filterCategory === 'ALL' && filterStatus === 'ALL' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                backgroundColor: filterCategory === 'ALL' && filterStatus === 'ALL' ? '#059669' : '#f8fafc',
                color: filterCategory === 'ALL' && filterStatus === 'ALL' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {locale === 'ar' ? 'الكل' : 'All Requests'}
            </button>
            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: filterStatus === 'IN_PROGRESS' ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                backgroundColor: filterStatus === 'IN_PROGRESS' ? '#0284c7' : '#f8fafc',
                color: filterStatus === 'IN_PROGRESS' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🚀 {locale === 'ar' ? 'جاري التنفيذ' : 'In Progress'}
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: filterStatus === 'COMPLETED' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                backgroundColor: filterStatus === 'COMPLETED' ? '#059669' : '#f8fafc',
                color: filterStatus === 'COMPLETED' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ✅ {locale === 'ar' ? 'تم الإنجاز' : 'Completed'}
            </button>
            <button
              onClick={() => setFilterStatus('UNDER_REVIEW')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                border: filterStatus === 'UNDER_REVIEW' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                backgroundColor: filterStatus === 'UNDER_REVIEW' ? '#d97706' : '#f8fafc',
                color: filterStatus === 'UNDER_REVIEW' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ⏳ {locale === 'ar' ? 'قيد المراجعة' : 'Under Review'}
            </button>
          </div>
        </div>

        {/* SECTION 3: REQUESTS LIST (OR DEMO LIFECYCLE SHOWCASE) */}
        <div>
          {isDemonstrationFeed && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#065f46' }}>
                <Info size={16} color="#059669" />
                <span>
                  {locale === 'ar'
                    ? 'عرض توضيحي مباشر لمسار الطلبات الإنسانية عبر مراحلها الست المعتمدة.'
                    : 'Interactive demonstration feed illustrating humanitarian cases progressing across all 6 verified lifecycle steps.'}
                </span>
              </div>
              <button
                onClick={() => handleOpenCreateModal()}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#064e3b',
                  backgroundColor: '#ffffff',
                  border: '1px solid #a7f3d0',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {locale === 'ar' ? '+ تقديم طلبك الخاص' : '+ Submit Your Own Request'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#059669', fontWeight: 600 }}>{t('common.loading')}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #d1fae5' }}>
              <AlertCircle size={40} color="#059669" style={{ marginInline: 'auto', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>
                {locale === 'ar' ? 'لا توجد طلبات مطابقة لهذه التصفية' : 'No Requests Matching Criteria'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {locale === 'ar' ? 'يمكنك تقديم طلب جديد للحصول على المساعدة اللازمة.' : 'No assistance requests match your active filters.'}
              </p>
              <button onClick={() => handleOpenCreateModal()} className="btn btn-primary">
                {t('requests.new_btn')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1.5px solid #d1fae5',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 2px 10px rgba(6, 78, 59, 0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: isRtl ? 'auto' : 0,
                      right: isRtl ? 0 : 'auto',
                      width: '5px',
                      backgroundColor: req.status === 'COMPLETED' ? '#10b981' : req.status === 'IN_PROGRESS' ? '#0284c7' : '#059669',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${getStatusBadgeClass(req.status)}`} style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                        {req.status}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        #{req.id.replace('demo-req-', 'REQ-2026-')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {req.isPrivate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#047857' }}>
                            <Lock size={12} /> {locale === 'ar' ? 'طلب سري ومحمي' : 'Confidential Intake'}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#0284c7' }}>
                            <Globe size={12} /> {locale === 'ar' ? 'مرئي للعموم' : 'Community Visible'}
                          </span>
                        )}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewHistory(req)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', borderRadius: '6px' }}
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.35rem' }}>
                      {req.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                      {req.description}
                    </p>
                    {req.location && (
                      <p style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <strong>{locale === 'ar' ? 'المنطقة والموقع:' : 'Location Area:'}</strong> {req.location}
                      </p>
                    )}
                  </div>

                  {/* Canonical 6-Step Visual Progression Stepper Bar */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', overflowX: 'auto' }}>
                      {CANONICAL_STEPS.map((s, idx) => {
                        const currentIdx = CANONICAL_STEPS.indexOf(req.status as any);
                        const isDone = currentIdx >= idx;
                        const isCurrent = req.status === s;
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isCurrent ? '#059669' : isDone ? '#10b981' : '#e2e8f0',
                                color: isDone || isCurrent ? '#ffffff' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                              }}
                            >
                              {idx + 1}
                            </div>
                            <span style={{ color: isCurrent ? '#064e3b' : isDone ? '#0f172a' : '#94a3b8', fontWeight: isCurrent ? 800 : 500 }}>
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
                    <div style={{ backgroundColor: '#f0fdf4', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#064e3b' }}>
                        {locale === 'ar' ? 'إجراءات المنسق الميداني:' : 'Staff Coordination Actions:'}
                      </span>
                      {req.status === 'SUBMITTED' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'UNDER_REVIEW')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                          {locale === 'ar' ? 'بدء المراجعة' : 'Mark In Review'}
                        </button>
                      )}
                      {req.status === 'UNDER_REVIEW' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'MATCHED')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                          {locale === 'ar' ? 'تنسيق مع الجهة' : 'Match Responders'}
                        </button>
                      )}
                      {req.status === 'MATCHED' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                          {locale === 'ar' ? 'قبول التكليف' : 'Accept Assignment'}
                        </button>
                      )}
                      {req.status === 'ACCEPTED' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                          {locale === 'ar' ? 'بدء التنفيذ' : 'Start Delivery'}
                        </button>
                      )}
                      {req.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'COMPLETED')} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                          {locale === 'ar' ? 'إنجاز الطلب' : 'Complete Request'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
                border: '1.5px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                      {locale === 'ar' ? 'تسجيل الدخول لطلب المساعدة' : 'Sign In to Request Relief'}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#047857', margin: '0.2rem 0 0' }}>
                      {locale === 'ar' ? 'حسابك يحفظ سرية طلبك ويتيح لك متابعة تقدمه' : 'Protects confidentiality & allows you to track request progress.'}
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
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  {locale === 'ar' ? 'الدخول السريع بحساب تجريبي (Demo 1-Click):' : 'Instant 1-Click Demo Login:'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handleQuickAuth('demo.requester@demo.alhusseiniya.app')}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
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
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
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
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {authLoading ? t('common.loading') : (locale === 'ar' ? 'دخول ومتابعة الطلب' : 'Sign In & Continue')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROGRESSIVE MULTI-STEP HELP REQUEST MODAL */}
        {showModal && (
          <div className="modal-backdrop" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                border: '1.5px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                  {t('requests.modal.title')}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Progress Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', zIndex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: step >= s ? '#059669' : '#e2e8f0',
                        color: step >= s ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {s}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: step >= s ? '#064e3b' : '#94a3b8', fontWeight: 600 }}>
                      {s === 1 ? t('requests.modal.step1') : s === 2 ? t('requests.modal.step2') : s === 3 ? t('requests.modal.step3') : t('requests.modal.step4')}
                    </span>
                  </div>
                ))}
              </div>

              {submissionSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={48} color="#059669" style={{ marginInline: 'auto', marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>
                    {locale === 'ar' ? 'تم استلام طلبك بنجاح' : 'Request Submitted Successfully'}
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {locale === 'ar'
                      ? 'تم تسجيل طلبك بأعلى درجات السرية وسيقوم المنسق الإنساني بمراجعته وربطه بالجهة المناسبة فوراً.'
                      : 'Your request has been securely recorded. Our humanitarian coordinators will review and match it with a verified local organization.'}
                  </p>
                  <button onClick={() => setShowModal(false)} className="btn btn-primary" style={{ backgroundColor: '#059669' }}>
                    {t('common.done')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {formError && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                      {formError}
                    </div>
                  )}

                  {/* STEP 1: Select Category */}
                  {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#064e3b' }}>
                        {locale === 'ar' ? 'اختر فئة الدعم والمساعدة:' : 'Select Assistance Category:'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                        {categories.map((c) => {
                          const isSelected = categoryId === c.id;
                          return (
                            <div
                              key={c.id}
                              onClick={() => setCategoryId(c.id)}
                              style={{
                                border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                                backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                                padding: '1rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#064e3b' : '#1e293b' }}>
                                {locale === 'ar' ? (c.nameAr || c.nameEn) : c.nameEn}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {locale === 'ar' ? (c.descriptionAr || c.descriptionEn) : c.descriptionEn}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Title and Description */}
                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.35rem' }}>
                          {locale === 'ar' ? 'عنوان الطلب المقتضب *' : 'Request Summary Title *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={locale === 'ar' ? 'مثال: سلة تموينية طارئة لعائلة من 5 أفراد' : 'e.g. Emergency dry rations for family of 5'}
                          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.35rem' }}>
                          {locale === 'ar' ? 'شرح تفاصيل الاحتياج *' : 'Detailed Situation Description *'}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={locale === 'ar' ? 'يرجى ذكر عدد الأفراد، الحالات الصحية الطارئة، أو نوع المساعدة المطلوبة...' : 'Please specify household size, medical urgency, or dietary constraints...'}
                          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Location and Privacy Setting */}
                  {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.35rem' }}>
                          {locale === 'ar' ? 'المدينة والمنطقة العامة (دون تفاصيل شخصية) *' : 'General City & District Area *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={locale === 'ar' ? 'مثال: بغداد - الكاظمية' : 'e.g. Baghdad - Kadhimiya'}
                          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                          {locale === 'ar' ? 'لحمايتك، لا تضع عنوان بيتك التفصيلي هنا؛ سيتم طلبه عند التوصيل فقط.' : 'For your safety, provide only the general neighborhood.'}
                        </span>
                      </div>

                      <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            style={{ marginTop: '0.2rem', width: '16px', height: '16px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#064e3b' }}>
                              {locale === 'ar' ? 'طلب سري (موصى به - يظهر للمنسقين المعتمدين فقط)' : 'Confidential (Recommended - Verified Staff Only)'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {locale === 'ar' ? 'لن يظهر هذا الطلب للمستخدمين العاديين على المنصة حفاظاً على كرامتك.' : 'Keeps your identity completely private.'}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Confirmation & Review */}
                  {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#064e3b' }}>
                        {locale === 'ar' ? 'مراجعة بيانات الطلب قبل الإرسال' : 'Review Before Submission'}
                      </h4>

                      <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div><strong>{t('common.category')}:</strong> {selectedCategoryObj ? (locale === 'ar' ? (selectedCategoryObj.nameAr || selectedCategoryObj.nameEn) : selectedCategoryObj.nameEn) : categoryId}</div>
                        <div><strong>{locale === 'ar' ? 'العنوان:' : 'Title:'}</strong> {title}</div>
                        <div><strong>{locale === 'ar' ? 'التفاصيل:' : 'Details:'}</strong> {description}</div>
                        <div><strong>{locale === 'ar' ? 'المنطقة:' : 'Location Area:'}</strong> {location}</div>
                        <div><strong>{locale === 'ar' ? 'مستوى الخصوصية:' : 'Privacy:'}</strong> {isPrivate ? (locale === 'ar' ? 'سري ومحمي 🔒' : 'Confidential 🔒') : (locale === 'ar' ? 'عام للجميع 🌐' : 'Public 🌐')}</div>
                      </div>

                      <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#065f46', border: '1px solid #a7f3d0' }}>
                        {locale === 'ar'
                          ? 'بإرسالك لهذا الطلب، فإنك توافق على مراجعته من قبل المنسقين الإنسانيين المعتمدين لدى منصة الحسينية.'
                          : 'By submitting, you agree to review by vetted humanitarian coordinators under our Dignity Charter.'}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep((s) => (s - 1) as any)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ArrowLeft size={16} className="dir-flip" />
                        <span>{t('requests.modal.back')}</span>
                      </button>
                    ) : <div />}

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (step === 1 && !categoryId) {
                            setFormError(locale === 'ar' ? 'يرجى اختيار الفئة للمتابعة' : 'Please select a category');
                            return;
                          }
                          if (step === 2 && (!title.trim() || !description.trim())) {
                            setFormError(locale === 'ar' ? 'يرجى ملء العنوان والشرح' : 'Please fill title and description');
                            return;
                          }
                          if (step === 3 && !location.trim()) {
                            setFormError(locale === 'ar' ? 'يرجى تحديد المنطقة' : 'Please specify location');
                            return;
                          }
                          setFormError('');
                          setStep((s) => (s + 1) as any);
                        }}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '0.6rem 1.25rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>{t('requests.modal.next')}</span>
                        <ArrowRight size={16} className="dir-flip" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '0.6rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {submitting ? t('common.loading') : (locale === 'ar' ? 'إرسال طلب الإغاثة' : 'Submit Assistance Request')}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* REQUEST HISTORY AUDIT MODAL */}
        {selectedHistory && (
          <div className="modal-backdrop" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1.5px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                  {locale === 'ar' ? 'سجل متابعة وتدقيق الطلب' : 'Request Lifecycle Audit Trail'}
                </h3>
                <button
                  onClick={() => setSelectedHistory(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <XCircle size={22} />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {selectedHistory.requestTitle}
              </p>

              {selectedHistory.history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  {locale === 'ar' ? 'لا توجد تحديثات سابقة مسجلة' : 'No recorded history updates yet'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {selectedHistory.history.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: `4px solid #059669`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#064e3b' }}>{h.toStatus || h.status}</span>
                        <span style={{ color: '#94a3b8' }}>
                          {new Date(h.createdAt || h.timestamp).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
                        </span>
                      </div>
                      {h.notes && (
                        <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                          {h.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setSelectedHistory(null)} className="btn btn-secondary" style={{ alignSelf: 'flex-end' }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
