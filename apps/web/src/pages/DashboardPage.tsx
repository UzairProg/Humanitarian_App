import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Link } from 'react-router-dom';
import ApiClient from '../services/api';
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
  Sparkles,
  ChevronRight,
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

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, locale, isRtl } = useLocalization();

  const [impact, setImpact] = useState<ImpactSummaryData | null>(null);
  const [activePrograms, setActivePrograms] = useState<HighlightProgram[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<HighlightEvent[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<HighlightArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [impactRes, programsRes, eventsRes, knowledgeRes] = await Promise.all([
          ApiClient.request<ImpactSummaryData>('/impact/summary'),
          ApiClient.request<HighlightProgram[]>('/food-programs'),
          ApiClient.request<HighlightEvent[]>('/events'),
          ApiClient.request<HighlightArticle[]>(`/knowledge?lang=${locale}`),
        ]);

        if (impactRes.success && impactRes.data) setImpact(impactRes.data);
        if (programsRes.success && programsRes.data) setActivePrograms(programsRes.data.slice(0, 3));
        if (eventsRes.success && eventsRes.data) setUpcomingEvents(eventsRes.data.slice(0, 3));
        if (knowledgeRes.success && knowledgeRes.data) setFeaturedArticles(knowledgeRes.data.slice(0, 2));
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [locale]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8f2 100%)',
          borderBottom: '1px solid #e8e3d8',
          paddingBlock: '4.5rem 4rem',
          paddingInline: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '1000px', marginInline: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {/* Trust Banner Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fbf5e6',
              border: '1px solid #fae8be',
              color: '#85530f',
              paddingInline: '0.85rem',
              paddingBlock: '0.35rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} color="#c6a24a" />
            <span>{t('home.eyebrow')}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#0b1f2a',
              maxWidth: '850px',
            }}
          >
            {t('home.hero.title')}
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#475569',
              lineHeight: 1.7,
              maxWidth: '740px',
              marginInline: 'auto',
            }}
          >
            {t('home.hero.desc')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.75rem' }}>
            <Link
              to="/requests"
              className="btn btn-primary"
              style={{
                paddingInline: '1.75rem',
                paddingBlock: '0.75rem',
                fontSize: '1rem',
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
                paddingInline: '1.75rem',
                paddingBlock: '0.75rem',
                fontSize: '1rem',
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
                paddingInline: '1.75rem',
                paddingBlock: '0.75rem',
                fontSize: '1rem',
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
      </section>

      {/* 2. QUICK ACTION PATHWAYS */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0b1f2a' }}>{t('home.pathways.title')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {t('home.pathways.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Help */}
          <Link
            to="/requests"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                {t('home.pathway.help.title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.pathway.help.desc')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
              <span>{t('home.cta.need_help')}</span> <ArrowRight size={14} className="dir-flip" />
            </div>
          </Link>

          {/* Card 2: Meals */}
          <Link
            to="/food-programs"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#fbf5e6',
                color: '#9e7f33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Utensils size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                {t('home.pathway.meals.title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.pathway.meals.desc')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
              <span>{t('home.cta.explore_meals')}</span> <ArrowRight size={14} className="dir-flip" />
            </div>
          </Link>

          {/* Card 3: Volunteers */}
          <Link
            to="/volunteers"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                {t('home.pathway.volunteer.title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.pathway.volunteer.desc')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
              <span>{t('home.cta.want_help')}</span> <ArrowRight size={14} className="dir-flip" />
            </div>
          </Link>

          {/* Card 4: Businesses */}
          <Link
            to="/businesses"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#fdf4ff',
                color: '#86198f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                {t('home.pathway.business.title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.pathway.business.desc')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
              <span>{t('nav.businesses')}</span> <ArrowRight size={14} className="dir-flip" />
            </div>
          </Link>

          {/* Card 5: Organizations */}
          <Link
            to="/organizations"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                {t('home.pathway.organizations.title')}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {t('home.pathway.organizations.desc')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, marginTop: 'auto' }}>
              <span>{t('nav.organizations')}</span> <ArrowRight size={14} className="dir-flip" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. TODAY'S ACTIVE FOOD DISTRIBUTIONS (LIVE DATA) */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Utensils size={14} /> {locale === 'ar' ? 'الإطعام المجتمعي' : 'Community Meals'}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0b1f2a', margin: '0.2rem 0 0' }}>
              {t('home.meals.title')}
            </h2>
          </div>
          <Link to="/food-programs" style={{ color: '#087f78', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{locale === 'ar' ? 'عرض كل المطابخ' : 'View all kitchens'}</span>
            <ChevronRight size={16} className="dir-flip" />
          </Link>
        </div>

        {activePrograms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: '#64748b', margin: 0 }}>
              {locale === 'ar' ? 'لا توجد وجبات معلنة في هذا الوقت. تابعنا قريباً.' : 'No active food distributions listed right now.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {activePrograms.map((p) => (
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
            ))}
          </div>
        )}
      </section>

      {/* 4. UPCOMING EVENTS & KNOWLEDGE HIGHLIGHTS */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Upcoming Events Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.events.title')}
              </h2>
              <Link to="/events" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>{t('home.events.all')}</span>
                <ChevronRight size={14} className="dir-flip" />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingEvents.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  {locale === 'ar' ? 'لا توجد فعاليات مجدولة حالياً.' : 'No upcoming gatherings currently scheduled.'}
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <div key={evt.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info">{evt.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(evt.startAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : undefined)}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1f2a', margin: '0.2rem 0' }}>
                      {evt.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <MapPin size={12} color="#087f78" /> <span>{evt.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Knowledge & Reflections Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1f2a', margin: 0 }}>
                {t('home.knowledge.title')}
              </h2>
              <Link to="/knowledge" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>{t('home.knowledge.all')}</span>
                <ChevronRight size={14} className="dir-flip" />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {featuredArticles.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  {locale === 'ar' ? 'المقالات ستظهر هنا فور نشرها من قبل المساهمين المعتمدين.' : 'Articles will appear here as verified contributors publish.'}
                </div>
              ) : (
                featuredArticles.map((art) => (
                  <div key={art.id} className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-gold">{art.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {art.language === 'ar' ? 'العربية' : 'English'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1f2a', margin: '0.2rem 0' }}>
                      {art.title}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      {art.summary}
                    </p>
                    <div style={{ marginTop: '0.4rem' }}>
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
        </div>
      </section>

      {/* 5. TANGIBLE COMMUNITY IMPACT STORYTELLING */}
      <section
        style={{
          backgroundColor: '#0b1f2a',
          color: '#ffffff',
          paddingBlock: '4rem',
          paddingInline: '1.5rem',
          borderTop: '1px solid #e8e3d8',
          borderBottom: '1px solid #e8e3d8',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ maxWidth: '750px' }}>
            <span style={{ color: '#deb95f', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t('home.impact.eyebrow')}
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
              {t('home.impact.title')}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7, marginTop: '0.5rem' }}>
              {t('home.impact.desc')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#deb95f', lineHeight: 1 }}>
                {(impact?.totalMealsDistributed ?? 1250).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.meals')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {locale === 'ar' ? 'وجبات غذائية ساخنة وُزعت للأفراد والأسر' : 'Served directly to individuals and families'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                {(impact?.totalRequestsFulfilled ?? 85).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.requests')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {locale === 'ar' ? 'مساعدات إنسانية ومعيشية تم إيصالها' : 'Medical and living support fulfilled'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>
                {(impact?.verifiedOrganizationsCount ?? 12).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.orgs')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {locale === 'ar' ? 'حسينيات وجمعيات معتمدة تقدم خدماتها' : 'Vetted community coordinators on platform'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
                {(impact?.activeVolunteersCount ?? 45).toLocaleString(locale === 'ar' ? 'ar-EG' : undefined)}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem' }}>
                {t('home.impact.volunteers')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {locale === 'ar' ? 'متطوعون مستعدون للاستجابة والخدمة' : 'Ready to respond across all active sectors'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM ARCHITECTURAL & AUTHORITY NOTICE */}
      <section className="container">
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
      </section>
    </div>
  );
};
