import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Link } from 'react-router-dom';
import ApiClient from '../services/api';
import { FaedaEcosystemSection } from '../components/FaedaEcosystemSection';
import {
  HeartHandshake,
  Utensils,
  Building2,
  Users,
  ArrowRight,
  Calendar,
  CheckCircle2,
  BookOpen,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Info,
  ChevronRight,
  Compass,
  Award,
  Heart,
  Scale,
  Sparkles,
  Search,
  Check,
  X,
} from 'lucide-react';

interface ImpactSummaryData {
  totalMealsDistributed: number;
  totalRequestsFulfilled: number;
  activeProgramsCount: number;
  activeVolunteersCount: number;
  verifiedOrganizationsCount: number;
  upcomingEventsCount: number;
}

interface HighlightProgram {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  remainingCapacity: number;
  capacity?: number;
}

interface HighlightEvent {
  id: string;
  title: string;
  category: string;
  startAt: string;
  location: string;
}

interface HighlightArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  language: string;
}

interface HighlightOrg {
  id: string;
  name: string;
  description: string;
  location: string;
  verificationStatus: string;
}

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, locale, isRtl } = useLocalization();

  const [impact, setImpact] = useState<ImpactSummaryData | null>(null);
  const [activePrograms, setActivePrograms] = useState<HighlightProgram[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<HighlightEvent[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<HighlightArticle[]>([]);
  const [organizations, setOrganizations] = useState<HighlightOrg[]>([]);
  const [loading, setLoading] = useState(true);

  // Around You active tab: 'meals' | 'events' | 'orgs'
  const [aroundTab, setAroundTab] = useState<'meals' | 'events' | 'orgs'>('meals');

  // Dismissable first-time community onboarding
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('al_husseiniya_onboarded');
  });

  const handleDismissOnboarding = () => {
    localStorage.setItem('al_husseiniya_onboarded', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [impactRes, programsRes, eventsRes, knowledgeRes, orgsRes] = await Promise.all([
          ApiClient.request<ImpactSummaryData>('/impact/summary'),
          ApiClient.request<HighlightProgram[]>('/food-programs'),
          ApiClient.request<HighlightEvent[]>('/events'),
          ApiClient.request<HighlightArticle[]>(`/knowledge?lang=${locale}`),
          ApiClient.request<HighlightOrg[]>('/organizations'),
        ]);

        if (impactRes.success && impactRes.data) setImpact(impactRes.data);
        if (programsRes.success && programsRes.data) setActivePrograms(programsRes.data.slice(0, 3));
        if (eventsRes.success && eventsRes.data) setUpcomingEvents(eventsRes.data.slice(0, 3));
        if (knowledgeRes.success && knowledgeRes.data) setFeaturedArticles(knowledgeRes.data.slice(0, 3));
        if (orgsRes.success && orgsRes.data) setOrganizations(orgsRes.data.slice(0, 3));
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [locale]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'clip' }}>
      {/* =========================================================================
          1. HERO SECTION (Warm Ivory Background with Split Layout & Authentic Imagery)
          ========================================================================= */}
      <section
        className="section-ivory"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4rem 3.5rem',
          paddingInline: '1.25rem',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            width: '100%',
            marginInline: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Hero Content: In RTL appears on the RIGHT, in LTR appears on the LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Eyebrow Tag: Culturally dignified */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#fbf5e6',
                border: '1px solid #fae8be',
                color: '#85530f',
                paddingInline: '0.85rem',
                paddingBlock: '0.35rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                alignSelf: 'flex-start',
              }}
            >
              <Award size={15} color="#c6a24a" />
              <span>{t('home.eyebrow')}</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4.2vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.22,
                color: '#0b1f2a',
                margin: 0,
              }}
            >
              {t('home.hero.title')}
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.975rem, 1.6vw, 1.15rem)',
                color: '#475569',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {t('home.hero.desc')}
            </p>

            {/* CTAs with clear priority */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Link
                to="/requests"
                className="btn btn-primary"
                style={{
                  paddingInline: '1.5rem',
                  paddingBlock: '0.75rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <HeartHandshake size={18} />
                <span>{t('home.cta.need_help')}</span>
              </Link>

              <Link
                to="/volunteers"
                className="btn btn-secondary"
                style={{
                  paddingInline: '1.5rem',
                  paddingBlock: '0.75rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Users size={18} color="#087f78" />
                <span>{t('home.cta.want_help')}</span>
              </Link>

              <Link
                to="/food-programs"
                className="btn btn-navy"
                style={{
                  paddingInline: '1.5rem',
                  paddingBlock: '0.75rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Utensils size={18} color="#deb95f" />
                <span>{t('home.cta.explore_meals')}</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(11, 31, 42, 0.12), 0 2px 8px rgba(11, 31, 42, 0.04)',
                border: '1px solid #e2dcd0',
                position: 'relative',
              }}
            >
              <img
                src="/images/hero_hospitality.jpg"
                alt={locale === 'ar' ? 'ضيافة مجتمعية وخدمة إنسانية' : 'Community hospitality and humanitarian service'}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Image Badge Overlay: Uses authentic service/heart icon instead of generic sparkle */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  insetInlineStart: '1.25rem',
                  backgroundColor: 'rgba(11, 31, 42, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '0.75rem 1.15rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(222, 185, 95, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
              >
                <HeartHandshake size={20} color="#deb95f" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#deb95f' }}>
                    {t('home.badge.hospitality')}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#cbd5e1' }}>
                    {t('home.badge.spirit')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TRUST STRIP (Warm Sand Background)
          ========================================================================= */}
      <section
        className="section-sand"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '1.35rem',
          paddingInline: '1.25rem',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            width: '100%',
            marginInline: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#e5ddd0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#087f78', flexShrink: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1f2a' }}>
                {t('home.trust.verified')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {locale === 'ar' ? 'تدقيق الحسينيات والمؤسسات' : 'Strictly vetted community orgs'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#e5ddd0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#087f78', flexShrink: 0 }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1f2a' }}>
                {t('home.trust.services')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {locale === 'ar' ? 'خصوصية وكرامة إنسانية' : 'Dignified and private assistance'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#e5ddd0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#087f78', flexShrink: 0 }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1f2a' }}>
                {t('home.trust.volunteers')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {locale === 'ar' ? 'سواعد مستعدة في الميدان' : 'Community volunteers on the ground'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#e5ddd0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#087f78', flexShrink: 0 }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0b1f2a' }}>
                {t('home.trust.impact')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {locale === 'ar' ? 'شفافية كاملة في النتائج' : 'Transparent, verifiable outcomes'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FIRST-TIME COMMUNITY ONBOARDING BANNER (Optional & Dismissible)
          ========================================================================= */}
      {showOnboarding && (
        <section
          style={{
            backgroundColor: '#faf6ec',
            borderBottom: '1px solid #fae8be',
            paddingBlock: '1.25rem',
            paddingInline: '1.25rem',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              marginInline: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1f2a' }}>
                {t('home.onboarding.title')}: {t('home.onboarding.subtitle')}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                <Link
                  to="/requests"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', padding: '0.3rem 0.65rem' }}
                >
                  {t('home.onboarding.opt_need_help')}
                </Link>
                <Link
                  to="/volunteers"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', padding: '0.3rem 0.65rem' }}
                >
                  {t('home.onboarding.opt_volunteer')}
                </Link>
                <Link
                  to="/businesses"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', padding: '0.3rem 0.65rem' }}
                >
                  {t('home.onboarding.opt_support')}
                </Link>
                <Link
                  to="/knowledge"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', padding: '0.3rem 0.65rem' }}
                >
                  {t('home.onboarding.opt_learn')}
                </Link>
                <Link
                  to="/events"
                  className="badge badge-neutral"
                  style={{ textDecoration: 'none', padding: '0.3rem 0.65rem' }}
                >
                  {t('home.onboarding.opt_events')}
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissOnboarding}
              style={{
                background: 'none',
                border: '1px solid #dcd4c5',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.785rem',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{t('home.onboarding.dismiss')}</span>
              <X size={13} />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          4. WHY WE HELP SECTION ("لماذا نساعد؟")
          ========================================================================= */}
      <section
        className="section-white"
        style={{
          paddingBlock: '4rem 3.5rem',
          paddingInline: '1.25rem',
          borderBottom: '1px solid #f1ece1',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '850px', marginInline: 'auto', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              <Heart size={15} />
              <span>{locale === 'ar' ? 'الغاية والمنطلق' : 'Purpose & Motivation'}</span>
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
              {t('home.why_we_help.title')}
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.75, marginTop: '0.65rem' }}>
              {t('home.why_we_help.desc')}
            </p>
          </div>

          {/* 5 Core Values Pill Chain */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Value 1: Dignity */}
            <div
              style={{
                backgroundColor: '#faf8f2',
                border: '1px solid #e8e3d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#087f78' }}>
                <HeartHandshake size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {t('home.values.dignity')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.values.dignity_desc')}
              </p>
            </div>

            {/* Value 2: Compassion */}
            <div
              style={{
                backgroundColor: '#faf8f2',
                border: '1px solid #e8e3d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#087f78' }}>
                <Heart size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {t('home.values.mercy')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.values.mercy_desc')}
              </p>
            </div>

            {/* Value 3: Justice */}
            <div
              style={{
                backgroundColor: '#faf8f2',
                border: '1px solid #e8e3d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#087f78' }}>
                <Scale size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {t('home.values.justice')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.values.justice_desc')}
              </p>
            </div>

            {/* Value 4: Service */}
            <div
              style={{
                backgroundColor: '#faf8f2',
                border: '1px solid #e8e3d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#087f78' }}>
                <Utensils size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {t('home.values.service')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.values.service_desc')}
              </p>
            </div>

            {/* Value 5: Community */}
            <div
              style={{
                backgroundColor: '#faf8f2',
                border: '1px solid #e8e3d8',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#087f78' }}>
                <Users size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {t('home.values.community')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.values.community_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. DIRECT PATHWAYS: "كيف يمكننا خدمتك اليوم؟" (4 Tinted Cards)
          ========================================================================= */}
      <section
        className="section-ivory"
        style={{
          paddingBlock: '4rem',
          paddingInline: '1.25rem',
          borderBottom: '1px solid #e8e3d8',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
              {t('home.pathways.title')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.45rem' }}>
              {t('home.pathways.subtitle')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Pathway 1: Help (Soft Teal) */}
            <Link
              to="/requests"
              style={{
                backgroundColor: '#f0fbf9',
                border: '1px solid #bceae6',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#087f78',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeartHandshake size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                  {t('home.pathway.help.title')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {t('home.pathway.help.desc')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
                <span>{t('home.cta.need_help')}</span>
                <ArrowRight size={14} className="dir-flip" />
              </div>
            </Link>

            {/* Pathway 2: Meals (Warm Sand/Gold) */}
            <Link
              to="/food-programs"
              style={{
                backgroundColor: '#fbf7ee',
                border: '1px solid #fae8be',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#c6a24a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Utensils size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                  {t('home.pathway.meals.title')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {t('home.pathway.meals.desc')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9e7f33', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
                <span>{t('home.cta.explore_meals')}</span>
                <ArrowRight size={14} className="dir-flip" />
              </div>
            </Link>

            {/* Pathway 3: Volunteers (Soft Blue / Sky) */}
            <Link
              to="/volunteers"
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                  {t('home.pathway.volunteer.title')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {t('home.pathway.volunteer.desc')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
                <span>{t('home.cta.want_help')}</span>
                <ArrowRight size={14} className="dir-flip" />
              </div>
            </Link>

            {/* Pathway 4: Businesses (Warm Terracotta) */}
            <Link
              to="/businesses"
              style={{
                backgroundColor: '#fbeee9',
                border: '1px solid #f6cfc1',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#b96e52',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Store size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                  {t('home.pathway.business.title')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {t('home.pathway.business.desc')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b96e52', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
                <span>{t('nav.businesses')}</span>
                <ArrowRight size={14} className="dir-flip" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW VALUES TURN INTO SERVICE (5-Step Visual Chain)
          "كيف تتحول القيم إلى خدمة؟"
          ========================================================================= */}
      <section
        className="section-teal-tint"
        style={{
          paddingBlock: '4.5rem',
          paddingInline: '1.25rem',
          borderBottom: '1px solid #d4ede9',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
              {t('home.how_values_serve.title')}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {t('home.how_values_serve.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Step 1 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bceae6', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.65rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#087f78', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                ١
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.how_values_serve.step1_title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {t('home.how_values_serve.step1_desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bceae6', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.65rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0b1f2a', color: '#deb95f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', border: '2px solid #deb95f' }}>
                ٢
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.how_values_serve.step2_title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {t('home.how_values_serve.step2_desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bceae6', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.65rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#087f78', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                ٣
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.how_values_serve.step3_title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {t('home.how_values_serve.step3_desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bceae6', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.65rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0b1f2a', color: '#deb95f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', border: '2px solid #deb95f' }}>
                ٤
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.how_values_serve.step4_title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {t('home.how_values_serve.step4_desc')}
              </p>
            </div>

            {/* Step 5 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bceae6', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.65rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#deb95f', color: '#0b1f2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                ٥
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.how_values_serve.step5_title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {t('home.how_values_serve.step5_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. COMMUNITY AROUND YOU ("ما يحدث حولك" - Interactive Filter Tabs)
          ========================================================================= */}
      <section
        className="section-ivory"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700 }}>
                <Compass size={16} />
                <span>{locale === 'ar' ? 'استكشاف محلي ومجتمعي' : 'Local Community Explorer'}</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0b1f2a', margin: '0.25rem 0 0' }}>
                {t('home.around_you.title')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                {t('home.around_you.subtitle')}
              </p>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#e8e2d5', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAroundTab('meals')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: aroundTab === 'meals' ? 700 : 500,
                  backgroundColor: aroundTab === 'meals' ? '#ffffff' : 'transparent',
                  color: aroundTab === 'meals' ? '#087f78' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: aroundTab === 'meals' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {locale === 'ar' ? 'الوجبات المتاحة' : 'Meals'}
              </button>
              <button
                type="button"
                onClick={() => setAroundTab('events')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: aroundTab === 'events' ? 700 : 500,
                  backgroundColor: aroundTab === 'events' ? '#ffffff' : 'transparent',
                  color: aroundTab === 'events' ? '#087f78' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: aroundTab === 'events' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {locale === 'ar' ? 'الفعاليات' : 'Gatherings'}
              </button>
              <button
                type="button"
                onClick={() => setAroundTab('orgs')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: aroundTab === 'orgs' ? 700 : 500,
                  backgroundColor: aroundTab === 'orgs' ? '#ffffff' : 'transparent',
                  color: aroundTab === 'orgs' ? '#087f78' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: aroundTab === 'orgs' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {locale === 'ar' ? 'الجهات الموثقة' : 'Organizations'}
              </button>
            </div>
          </div>

          {/* Tab 1: Meals */}
          {aroundTab === 'meals' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {activePrograms.length === 0 ? (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  {locale === 'ar' ? 'لا توجد وجبات معلنة في هذا الوقت. تابعنا قريباً.' : 'No active food distributions listed right now.'}
                </div>
              ) : (
                activePrograms.map((p) => (
                  <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success">{t('status.open')}</span>
                      <span style={{ fontSize: '0.75rem', color: '#087f78', fontWeight: 700 }}>
                        {p.remainingCapacity} {t('home.meals.remaining')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1f2a' }}>{p.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} color="#087f78" />
                        <span>{t('food.serving_time')}: {p.startTime} - {p.endTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={13} color="#087f78" />
                        <span>{p.location}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <Link to="/food-programs" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{t('home.meals.details')}</span>
                        <ArrowRight size={13} className="dir-flip" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Events */}
          {aroundTab === 'events' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {upcomingEvents.length === 0 ? (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  {locale === 'ar' ? 'لا توجد فعاليات مجدولة حالياً.' : 'No upcoming gatherings currently scheduled.'}
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <div key={evt.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info">{evt.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(evt.startAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : undefined)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1f2a' }}>{evt.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      <MapPin size={13} color="#087f78" />
                      <span>{evt.location}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <Link to="/events" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{locale === 'ar' ? 'تفاصيل الفعالية' : 'Event Details'}</span>
                        <ArrowRight size={13} className="dir-flip" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Organizations */}
          {aroundTab === 'orgs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {organizations.length === 0 ? (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  {locale === 'ar' ? 'جاري توثيق الجهات والمؤسسات الشريكة.' : 'Partner organizations being onboarded.'}
                </div>
              ) : (
                organizations.map((org) => (
                  <div key={org.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success">
                        <ShieldCheck size={13} /> {t('status.verified')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{org.location}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1f2a' }}>{org.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                      {org.description}
                    </p>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <Link to="/organizations" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{t('home.orgs.explore')}</span>
                        <ArrowRight size={13} className="dir-flip" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. VALUES FROM KARBALA (Deep Navy Section `#0B1F2A` with Gold Accents)
          "من قيم كربلاء إلى خدمة الإنسان"
          ========================================================================= */}
      <section
        id="values"
        className="section-deep-navy"
        style={{
          paddingBlock: '5rem 4.5rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          {/* Header & Core Thesis */}
          <div style={{ maxWidth: '850px', marginBottom: '3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#deb95f',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              <Award size={16} />
              <span>{locale === 'ar' ? 'القيم والمنطلقات الإنسانية' : 'Enduring Values & Principles'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.85rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, margin: 0 }}>
              {t('home.values.title')}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.7, marginTop: '1rem' }}>
              {t('home.values.subtitle')}
            </p>
          </div>

          {/* 6 Value Pillars Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3.5rem',
            }}
          >
            {/* Pillar 1: Dignity */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <HeartHandshake size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.dignity')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.dignity_desc')}
              </p>
            </div>

            {/* Pillar 2: Compassion */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <Heart size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.mercy')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.mercy_desc')}
              </p>
            </div>

            {/* Pillar 3: Justice */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <Scale size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.justice')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.justice_desc')}
              </p>
            </div>

            {/* Pillar 4: Service */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <Utensils size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.service')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.service_desc')}
              </p>
            </div>

            {/* Pillar 5: Community */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <Users size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.community')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.community_desc')}
              </p>
            </div>

            {/* Pillar 6: Enduring Impact */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(222, 185, 95, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#deb95f' }}>
                <Award size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {t('home.values.impact')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {t('home.values.impact_desc')}
              </p>
            </div>
          </div>

          {/* Editorial Block: "لماذا كربلاء؟" & "من موسم الخدمة إلى مجتمع دائم" */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(222, 185, 95, 0.25)',
              borderRadius: '16px',
              padding: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#deb95f',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                <BookOpen size={16} />
                <span>{locale === 'ar' ? 'الرسالة والرؤية' : 'The Inspiration'}</span>
              </div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                {t('home.values.why_karbala')}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.8, margin: 0 }}>
                {t('home.values.why_karbala_desc')}
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link
                  to="/knowledge"
                  className="btn btn-gold"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    paddingInline: '1.25rem',
                    paddingBlock: '0.6rem',
                    borderRadius: '8px',
                  }}
                >
                  <span>{locale === 'ar' ? 'اكتشف المعرفة والقيم' : 'Explore Knowledge & Values'}</span>
                  <ArrowRight size={14} className="dir-flip" />
                </Link>
              </div>
            </div>

            {/* Cultural Heritage Image Box */}
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(222, 185, 95, 0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="/images/karbala_heritage.jpg"
                alt={locale === 'ar' ? 'أصالة كربلاء وقيم العطاء' : 'Values of Karbala and Service'}
                style={{
                  width: '100%',
                  height: '280px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. THE HUMAN ECOSYSTEM / GIVING PATHWAYS ("العطاء له أكثر من طريق")
          ========================================================================= */}
      <section
        className="section-warm-earth"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4.5rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
              {t('home.ecosystem.title')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {t('home.ecosystem.subtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Box 1: Individuals */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
              <div style={{ color: '#087f78' }}>
                <HeartHandshake size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'الأفراد والأسر' : 'Individuals & Families'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {locale === 'ar' ? 'طلب المساعدة الإنسانية والوجبات بكرامة وسرية تامة دون حرج.' : 'Seeking dignified and confidential relief with full respect.'}
              </p>
            </div>

            {/* Box 2: Organizations */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
              <div style={{ color: '#0b1f2a' }}>
                <Building2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'الحسينيات والمنظمات' : 'Hussainiyas & NGOs'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {locale === 'ar' ? 'مراكز العطاء الميداني المعتمدة التي تدير المطابخ والإغاثة المباشرة.' : 'Vetted community coordinators managing distributions and aid.'}
              </p>
            </div>

            {/* Box 3: Volunteers */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
              <div style={{ color: '#0284c7' }}>
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'المتطوعون والمبادرون' : 'Volunteers'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {locale === 'ar' ? 'سواعد الميدان الذين يقدمون وقتهم وخبراتهم في خدمة الناس.' : 'Ground responders giving their time, skills, and solidarity.'}
              </p>
            </div>

            {/* Box 4: Businesses */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
              <div style={{ color: '#b96e52' }}>
                <Store size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'المطابخ والأعمال' : 'Kitchens & Businesses'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {locale === 'ar' ? 'رعاية برامج الإطعام وتقديم فائض الطعام والخدمات اللوجستية.' : 'Sponsoring food programs and donating surplus meals.'}
              </p>
            </div>

            {/* Box 5: Knowledge */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
              <div style={{ color: '#c6a24a' }}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'المعرفة والقيم' : 'Knowledge & Values'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {locale === 'ar' ? 'محتوى توعوي وأخلاقي موثق يرسخ ثقافة العطاء والإيثار المجتمعي.' : 'Vetted cultural and ethical insights guiding continuous care.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. LEARN TO SERVE / KNOWLEDGE & CULTURAL LEARNING
          "نتعلم لنخدم: معرفة تقود إلى عمل، وعمل يصنع أثراً"
          ========================================================================= */}
      <section
        className="section-ivory"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4.5rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c6a24a', fontSize: '0.8125rem', fontWeight: 700 }}>
                <BookOpen size={16} />
                <span>{t('home.learn_to_serve.title')}</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0b1f2a', margin: '0.25rem 0 0' }}>
                {t('home.knowledge.title')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                {t('home.learn_to_serve.desc')}
              </p>
            </div>
            <Link to="/knowledge" style={{ color: '#087f78', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>{t('home.knowledge.all')}</span>
              <ChevronRight size={16} className="dir-flip" />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {featuredArticles.length === 0 ? (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                {locale === 'ar' ? 'المقالات ستظهر هنا فور نشرها من قبل المساهمين المعتمدين.' : 'Articles will appear here as verified contributors publish.'}
              </div>
            ) : (
              featuredArticles.map((art) => (
                <div key={art.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-gold">{art.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {art.language === 'ar' ? 'العربية' : 'English'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0b1f2a', margin: '0.2rem 0' }}>
                    {art.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {art.summary}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                    <Link to="/knowledge" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>{t('knowledge.read_btn')}</span>
                      <ArrowRight size={13} className="dir-flip" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. VOLUNTEER & BUSINESS COLLABORATION SPOTLIGHT (White Section)
          ========================================================================= */}
      <section
        className="section-white"
        style={{
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Box A: Volunteers */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2dcd0',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fbf9', color: '#087f78', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'اجعل وقتك أثراً' : 'Turn Your Time into Impact'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {locale === 'ar'
                  ? 'شارك بمهاراتك ووقتك في تنظيم الوجبات، وتوزيع المساعدات، والدعم الميداني مع مؤسسات موثوقة تخدم الناس بكرامة.'
                  : 'Offer your skills, field coordination, and time with verified organizations serving community welfare.'}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Link
                  to="/volunteers"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                  }}
                >
                  <span>{locale === 'ar' ? 'استكشف فرص التطوع' : 'Explore Opportunities'}</span>
                  <ArrowRight size={14} className="dir-flip" />
                </Link>
              </div>
            </div>

            {/* Box B: Businesses */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2dcd0',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fbeee9', color: '#b96e52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={22} />
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {locale === 'ar' ? 'للأعمال دور في خدمة المجتمع' : 'Businesses Powering Community Care'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {locale === 'ar'
                  ? 'المطابخ والمتاجر والشركات تساهم في تقديم الوجبات، وتبرعات فائض الطعام، وتوفير الخدمات اللوجستية للمحتاجين.'
                  : 'Local restaurants, kitchens, and businesses collaborate by donating food supplies and logistical aid.'}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <Link
                  to="/businesses"
                  className="btn btn-navy"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                  }}
                >
                  <span>{locale === 'ar' ? 'شراكات الأعمال والمطابخ' : 'Business Partnerships'}</span>
                  <ArrowRight size={14} className="dir-flip" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. REAL DATA IMPACT SUMMARY (Deep Navy Background `#0B1F2A`)
          "معاً نصنع أثراً" - Real Aggregated MongoDB Metrics
          ========================================================================= */}
      <section
        className="section-deep-navy"
        style={{
          paddingBlock: '4.5rem',
          paddingInline: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div style={{ maxWidth: '750px', marginBottom: '3rem' }}>
            <span style={{ color: '#deb95f', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t('home.impact.eyebrow')}
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
              {t('home.impact.title')}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.75, marginTop: '0.65rem' }}>
              {t('home.impact.desc')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {/* Meals Metric */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#deb95f', lineHeight: 1 }}>
                {(impact?.totalMealsDistributed ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.meals')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {locale === 'ar' ? 'وجبات غذائية ساخنة وُزعت للأفراد والأسر' : 'Hot meals distributed to families'}
              </div>
            </div>

            {/* Requests Metric */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                {(impact?.totalRequestsFulfilled ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.requests')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {locale === 'ar' ? 'مساعدات إنسانية ومعيشية تم إنجازها' : 'Humanitarian requests fulfilled'}
              </div>
            </div>

            {/* Organizations Metric */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>
                {(impact?.verifiedOrganizationsCount ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.orgs')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {locale === 'ar' ? 'حسينيات ومؤسسات معتمدة وموثقة' : 'Vetted community coordinators'}
              </div>
            </div>

            {/* Volunteers Metric */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
                {(impact?.activeVolunteersCount ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.volunteers')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {locale === 'ar' ? 'متطوعون نشطون في الميدان' : 'Active responders on the ground'}
              </div>
            </div>
          </div>

          {/* Context Quote */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem 2rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderInlineStart: '4px solid #deb95f',
              borderRadius: '6px',
            }}
          >
            <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#e2e8f0', margin: 0, lineHeight: 1.7 }}>
              {locale === 'ar'
                ? '«كل وجبة وكل مساعدة هي أكثر من مجرد رقم، إنها رسالة تضامن وكرامة إنسانية تحفظ ماء الوجه وتجمع القلوب طوال العام.»'
                : '"Every meal and act of support is far more than a statistic; it is a sacred bond of human solidarity and dignity that unites us year-round."'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          13. FINAL HIGH IMPACT CTA ("الخير يبدأ بخطوة")
          ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0d4440 0%, #0b1f2a 100%)',
          color: '#ffffff',
          paddingBlock: '4.5rem',
          paddingInline: '1.25rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', marginInline: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            {t('home.cta.title')}
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, maxWidth: '650px', margin: 0 }}>
            {t('home.cta.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link
              to="/requests"
              className="btn btn-gold"
              style={{
                fontSize: '0.95rem',
                paddingInline: '1.75rem',
                paddingBlock: '0.75rem',
                borderRadius: '8px',
              }}
            >
              <HeartHandshake size={18} />
              <span>{t('home.cta.need_help')}</span>
            </Link>
            <Link
              to="/volunteers"
              className="btn btn-secondary"
              style={{
                fontSize: '0.95rem',
                paddingInline: '1.75rem',
                paddingBlock: '0.75rem',
                borderRadius: '8px',
              }}
            >
              <Users size={18} color="#087f78" />
              <span>{t('home.cta.want_help')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          14. PLATFORM ARCHITECTURAL NOTICE
          ========================================================================= */}
      <section style={{ padding: '2rem 1.25rem', backgroundColor: '#faf8f2' }}>
        <div style={{ maxWidth: '1280px', marginInline: 'auto' }}>
          <div className="authority-notice">
            <Info size={22} color="#9e7f33" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#85530f', margin: '0 0 0.25rem' }}>
                {t('home.scope.title')}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                {t('home.scope.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          15. FAEDA PARENT COMPANY & PRODUCT ECOSYSTEM SECTION
          ========================================================================= */}
      <FaedaEcosystemSection />
    </div>
  );
};

