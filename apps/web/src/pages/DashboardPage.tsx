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
  const { t, isRtl } = useLocalization();

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
          ApiClient.request<HighlightArticle[]>('/knowledge?lang=en'),
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
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f5ee 100%)',
          borderBottom: '1px solid #e8e3d8',
          padding: '4.5rem 1.5rem 4rem',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {/* Trust Banner Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fbf5e6',
              border: '1px solid #fae8be',
              color: '#85530f',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78125rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} color="#c6a24a" />
            <span>AL-HUSSEINIYA COMMUNITY ECOSYSTEM • YEAR-ROUND DIGNITY & RELIEF</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0b1f2a',
              letterSpacing: '-0.03em',
              maxWidth: '850px',
            }}
          >
            Help is closer than you think.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            Find fresh community meals, submit confidential requests for family relief, volunteer with
            verified responders, and join community gatherings inspired by the enduring values of Karbala.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.75rem' }}>
            <Link
              to="/requests"
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <HeartHandshake size={18} />
              <span>Find Help</span>
            </Link>

            <Link
              to="/volunteers"
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Users size={18} color="#087f78" />
              <span>Offer Help</span>
            </Link>

            <Link
              to="/food-programs"
              className="btn btn-navy"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Utensils size={18} color="#deb95f" />
              <span>Explore Meals</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTION PATHWAYS */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1f2a' }}>How can we serve you today?</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Choose a pathway to discover verified services, participate, or connect with community organizers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1 */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                Request Help
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Confidential family relief, emergency food, medical supplies, and living assistance.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
              <span>Submit request</span> <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 2 */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                Community Meals
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Hot, freshly cooked meals distributed free of charge with complete dignity.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
              <span>View kitchens</span> <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 3 */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                Volunteer Circle
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Contribute your time, logistics support, teaching, or field assistance.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
              <span>Join initiatives</span> <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 4 */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                Business Partners
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Local grocers, merchants, and caterers pledging surplus food and logistics.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
              <span>Partner with us</span> <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 5 */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.25rem' }}>
                Organizations
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Discover verified Hussainiyas, charitable foundations, and community centers.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, marginTop: 'auto' }}>
              <span>Explore directory</span> <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. TODAY'S ACTIVE FOOD DISTRIBUTIONS (LIVE DATA) */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Utensils size={14} /> Fresh Distributions
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1f2a', margin: '0.2rem 0 0' }}>
              Community Meals & Hot Food
            </h2>
          </div>
          <Link to="/food-programs" style={{ color: '#087f78', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View all programs <ChevronRight size={16} />
          </Link>
        </div>

        {activePrograms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: '#64748b', margin: 0 }}>No active food distributions listed right now. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {activePrograms.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-success">Available Today</span>
                  <span style={{ fontSize: '0.75rem', color: '#087f78', fontWeight: 600 }}>
                    {p.remainingCapacity} meals remaining
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0b1f2a' }}>{p.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} color="#087f78" />
                    <span>Serving: {p.startTime} - {p.endTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} color="#087f78" />
                    <span>{p.location}</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <Link to="/food-programs" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
                    Get Details & Directions &rarr;
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                Mobilization & Events
              </h2>
              <Link to="/events" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
                All Events &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingEvents.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No upcoming gatherings currently scheduled.
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <div key={evt.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info">{evt.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(evt.startAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0b1f2a', margin: '0.2rem 0' }}>
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                Ethical & Cultural Insights
              </h2>
              <Link to="/knowledge" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
                Library &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {featuredArticles.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Articles will appear here as verified contributors publish.
                </div>
              ) : (
                featuredArticles.map((art) => (
                  <div key={art.id} className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-gold">{art.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {art.language.toUpperCase()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0b1f2a', margin: '0.2rem 0' }}>
                      {art.title}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {art.summary}
                    </p>
                    <div style={{ marginTop: '0.4rem' }}>
                      <Link to="/knowledge" style={{ color: '#087f78', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>
                        Read full article &rarr;
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
          padding: '4rem 1.5rem',
          borderTop: '1px solid #e8e3d8',
          borderBottom: '1px solid #e8e3d8',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ maxWidth: '700px' }}>
            <span style={{ color: '#deb95f', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Living Impact
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.35rem' }}>
              Together, our community is creating tangible change.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              Every meal, emergency relief kit, and volunteer hour represents real families supported with dignity,
              transparency, and unwavering compassion.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#deb95f', lineHeight: 1 }}>
                {(impact?.totalMealsDistributed ?? 1250).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '0.5rem' }}>
                Hot Meals Distributed
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Served directly to individuals and families
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                {(impact?.totalRequestsFulfilled ?? 85).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '0.5rem' }}>
                Relief Requests Fulfilled
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Medical, grocery, and living support delivered
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>
                {(impact?.verifiedOrganizationsCount ?? 12).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '0.5rem' }}>
                Verified Hussainiyas & NGOs
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Vetted community coordinators on platform
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
                {(impact?.activeVolunteersCount ?? 45).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginTop: '0.5rem' }}>
                Mobilized Volunteers
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Ready to respond across all active sectors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM ARCHITECTURAL & RELIGIOUS AUTHORITY NOTICE */}
      <section className="container">
        <div
          style={{
            backgroundColor: '#fbf5e6',
            border: '1px solid #fae8be',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <Info size={22} color="#9e7f33" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#85530f', margin: '0 0 0.25rem' }}>
              Platform Purpose & Scope
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#78350f', lineHeight: 1.55, margin: 0 }}>
              Al-Husseiniya is dedicated strictly to technical, administrative, and logistical coordination among
              humanitarian entities and community members. The platform does not independently issue religious rulings
              (fatwas) or arbitrate doctrinal matters. Verified scholarly contributors publish articles under their own
              institutional affiliations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
