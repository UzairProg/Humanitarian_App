import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { Event, EventRegistration, RoleType } from '@al-husseiniya/types';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Info,
  Globe2,
  Accessibility,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ExtendedEventRegistration extends EventRegistration {
  event?: Event;
}

export const EventsPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { t, locale, isRtl } = useLocalization();

  const [activeTab, setActiveTab] = useState<'all' | 'my-events'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<ExtendedEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');

  // Register Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Auth Modal state for seamless event registration
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);

  // Create Event Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'COMMUNITY_GATHERING',
    format: 'ON_SITE',
    startAt: '',
    endAt: '',
    location: '',
    capacity: 50,
    language: 'en',
    accessibilityInfo: '',
  });

  const canCreateEvent =
    isAuthenticated &&
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.ORGANIZATION_ADMIN, RoleType.COMMUNITY_ADMIN].includes(
        r as RoleType
      )
    );

  const loadEvents = async () => {
    setLoading(true);
    let query = '/events';
    const params = new URLSearchParams();
    if (categoryFilter) params.append('category', categoryFilter);
    if (formatFilter) params.append('format', formatFilter);
    const queryString = params.toString();
    if (queryString) query += `?${queryString}`;

    const res = await ApiClient.request<Event[]>(query);
    if (res.success && res.data) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  const loadMyRegistrations = async () => {
    if (!isAuthenticated) return;
    const res = await ApiClient.request<ExtendedEventRegistration[]>('/events/user/registrations');
    if (res.success && res.data) {
      setMyRegistrations(res.data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [categoryFilter, formatFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyRegistrations();
    }
  }, [isAuthenticated, activeTab]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegistering(true);
    setRegisterError('');
    setRegisterSuccess('');

    const res = await ApiClient.request(`/events/${selectedEvent.id}/register`, {
      method: 'POST',
      body: JSON.stringify({ notes: registrationNotes }),
    });

    setRegistering(false);
    if (res.success) {
      setRegisterSuccess('Successfully registered for event!');
      setTimeout(() => {
        setSelectedEvent(null);
        setRegisterSuccess('');
        setRegistrationNotes('');
        loadEvents();
        loadMyRegistrations();
      }, 1200);
    } else {
      setRegisterError(res.error?.message || 'Failed to register for this event.');
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    const res = await ApiClient.request(`/events/${eventId}/register`, {
      method: 'DELETE',
    });
    if (res.success) {
      loadEvents();
      loadMyRegistrations();
    } else {
      alert(res.error?.message || 'Failed to cancel registration');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError('');

    const payload = {
      ...newEvent,
      capacity: Number(newEvent.capacity),
      startAt: new Date(newEvent.startAt).toISOString(),
      endAt: new Date(newEvent.endAt).toISOString(),
    };

    const res = await ApiClient.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setCreateSubmitting(false);
    if (res.success) {
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        category: 'COMMUNITY_GATHERING',
        format: 'ON_SITE',
        startAt: '',
        endAt: '',
        location: '',
        capacity: 50,
        language: 'en',
        accessibilityInfo: '',
      });
      loadEvents();
    } else {
      setCreateError(res.error?.message || 'Failed to create event');
    }
  };

  const isUserRegistered = (eventId: string) => {
    return myRegistrations.some((r) => r.eventId === eventId && r.status === 'CONFIRMED');
  };

  const handleQuickAuth = async (email: string, pass = 'DemoPass@12345') => {
    setAuthLoading(true);
    setAuthError('');
    const res = await login(email, pass);
    setAuthLoading(false);

    if (res.success) {
      const targetEvt = pendingEvent;
      setShowAuthModal(false);
      setPendingEvent(null);
      if (targetEvt) {
        setSelectedEvent(targetEvt);
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
    <div style={{ backgroundColor: '#f8f7ff', minHeight: '100vh', paddingBottom: '3.5rem' }}>
      {/* Royal Indigo & Lavender Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          boxShadow: '0 4px 20px rgba(30, 27, 75, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #818cf8',
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
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, transparent 70%)',
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
                backgroundColor: 'rgba(192, 132, 252, 0.2)',
                border: '1px solid rgba(192, 132, 252, 0.4)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#e9d5ff',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Calendar size={13} color="#e9d5ff" />
              {locale === 'ar' ? 'التقويم المجتمعي والمجالس' : 'Community Calendar & Gatherings'}
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
                color: '#e0e7ff',
              }}
            >
              <Sparkles size={13} color="#c084fc" />
              {locale === 'ar' ? 'حضور متاح وجاهزية تامة' : 'Open Registration & Live Access'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                {t('events.title')}
              </h1>
              <p style={{ color: '#e0e7ff', fontSize: '1rem', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
                {t('events.subtitle')}
              </p>
            </div>

            {canCreateEvent && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#818cf8',
                  color: '#1e1b4b',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(129, 140, 248, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a5b4fc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#818cf8')}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>{t('events.schedule_btn')}</span>
              </button>
            )}
          </div>

          {/* Quick Calendar Metrics strip */}
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
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{events.length} Upcoming</div>
                <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>{locale === 'ar' ? 'فعاليات ومجالس مجدولة' : 'Scheduled Majalis & Workshops'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Globe2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Hybrid & On-Site</div>
                <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>{locale === 'ar' ? 'بث مباشر وحضور شخصي' : 'In-Person & Virtual Stream'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Free Attendance</div>
                <div style={{ fontSize: '0.75rem', color: '#e0e7ff' }}>{locale === 'ar' ? 'حضور مجاني لجميع الفئات' : 'All Welcome With Dignity'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', marginInline: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e0e7ff', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.85rem 1.5rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'all' ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === 'all' ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            {t('events.upcoming_tab')} ({events.length})
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my-events')}
              style={{
                padding: '0.85rem 1.5rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'my-events' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'my-events' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              {t('events.my_registrations')} ({myRegistrations.filter((r) => r.status === 'CONFIRMED').length})
            </button>
          )}
        </div>

        {/* Tab: Upcoming Events */}
        {activeTab === 'all' && (
          <>
            {/* Filters Bar */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor: '#ffffff',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid #e0e7ff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#312e81', fontSize: '0.85rem', fontWeight: 700 }}>
                <Filter size={16} color="#4f46e5" />
                <span>{t('common.filter')}</span>
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    appearance: 'none',
                    padding: '0.45rem 2rem 0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #c7d2fe',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#f5f3ff',
                    color: '#1e1b4b',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">{t('events.cat_all')}</option>
                  <option value="COMMUNITY_GATHERING">{t('events.cat_gathering')}</option>
                  <option value="ORIENTATION">{t('events.cat_orientation')}</option>
                  <option value="WORKSHOP">{t('events.cat_workshop')}</option>
                  <option value="LOGISTICS">{t('events.cat_logistics')}</option>
                  <option value="HUMANITARIAN_DISTRIBUTION">{t('home.pathway.meals.title')}</option>
                </select>
                <ChevronDown size={14} color="#4f46e5" style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  style={{
                    appearance: 'none',
                    padding: '0.45rem 2rem 0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #c7d2fe',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#f5f3ff',
                    color: '#1e1b4b',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">{t('events.format_all')}</option>
                  <option value="ON_SITE">{t('events.format_onsite')}</option>
                  <option value="ONLINE">{t('events.format_online')}</option>
                  <option value="HYBRID">{t('events.format_hybrid')}</option>
                </select>
                <ChevronDown size={14} color="#4f46e5" style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              {(categoryFilter || formatFilter) && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setFormatFilter('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  {t('common.cancel')}
                </button>
              )}

              <span style={{ marginInlineStart: 'auto', fontSize: '0.82rem', fontWeight: 700, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                {events.length} {locale === 'ar' ? 'فعاليات' : 'Events'}
              </span>
            </div>

            {/* Events Grid with Calendar Ticket Block Cards */}
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e0e7ff' }}>
                <p style={{ color: '#4f46e5', fontWeight: 600 }}>{t('common.loading')}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e0e7ff' }}>
                <p style={{ color: '#64748b' }}>{t('events.no_events')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {events.map((evt) => {
                  const regCount = evt.registrationCount || 0;
                  const capacity = evt.capacity || 100;
                  const percentFull = Math.min(100, Math.round((regCount / capacity) * 100));
                  const isFull = regCount >= capacity;
                  const registered = isUserRegistered(evt.id);

                  const startDate = new Date(evt.startAt);
                  const monthName = isNaN(startDate.getTime())
                    ? 'UPCOMING'
                    : startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const dayNum = isNaN(startDate.getTime()) ? '•' : startDate.getDate();
                  const timeFormatted = isNaN(startDate.getTime())
                    ? ''
                    : startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={evt.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '14px',
                        border: '1.5px solid #e0e7ff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 14px rgba(30, 27, 75, 0.04)',
                        overflow: 'hidden',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(79, 70, 229, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(30, 27, 75, 0.04)';
                      }}
                    >
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Header with Calendar Ticket Block */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          {/* Calendar Ticket Block */}
                          <div
                            style={{
                              width: '56px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1.5px solid #c7d2fe',
                              flexShrink: 0,
                              textAlign: 'center',
                              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)',
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: '#312e81',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.2rem 0',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {monthName}
                            </div>
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#1e1b4b',
                                fontSize: '1.45rem',
                                fontWeight: 900,
                                padding: '0.25rem 0',
                                lineHeight: 1,
                              }}
                            >
                              {dayNum}
                            </div>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  backgroundColor: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                }}
                              >
                                {evt.category}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '20px',
                                  backgroundColor: evt.format === 'ONLINE' ? '#ecfdf5' : evt.format === 'HYBRID' ? '#eff6ff' : '#f5f3ff',
                                  color: evt.format === 'ONLINE' ? '#047857' : evt.format === 'HYBRID' ? '#1d4ed8' : '#6d28d9',
                                  border: '1px solid #c7d2fe',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: evt.format === 'ONLINE' ? '#10b981' : evt.format === 'HYBRID' ? '#3b82f6' : '#8b5cf6' }} />
                                {evt.format || 'ON_SITE'}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0, lineHeight: 1.3 }}>
                              {evt.title}
                            </h3>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                          {evt.description}
                        </p>

                        {/* Schedule and Location info */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            fontSize: '0.8125rem',
                            color: '#334155',
                            backgroundColor: '#f5f3ff',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            border: '1px solid #ede9fe',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} color="#6366f1" />
                            <span>
                              {timeFormatted || 'Schedule Pending'} - {new Date(evt.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} color="#6366f1" />
                            <span style={{ wordBreak: 'break-all' }}>{evt.location}</span>
                          </div>
                          {evt.accessibilityInfo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 600 }}>
                              <Accessibility size={14} />
                              <span>{evt.accessibilityInfo}</span>
                            </div>
                          )}
                        </div>

                        {/* Capacity Meter */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Users size={13} color="#4f46e5" />
                              {regCount} / {capacity} {locale === 'ar' ? 'حاضر' : 'Attending'}
                            </span>
                            <span style={{ color: isFull ? '#ef4444' : '#4f46e5', fontWeight: 700 }}>
                              {isFull ? t('status.full') : `${capacity - regCount} ${t('events.spots_left')}`}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e0e7ff', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${percentFull}%`,
                                height: '100%',
                                backgroundColor: isFull ? '#ef4444' : percentFull > 80 ? '#f59e0b' : '#6366f1',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div style={{ borderTop: '1px solid #ede9fe', padding: '1rem 1.5rem', backgroundColor: '#ffffff' }}>
                        {registered ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>
                              <CheckCircle size={16} /> {t('events.registered_badge')}
                            </span>
                            <button
                              onClick={() => handleCancelRegistration(evt.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 600,
                              }}
                            >
                              {t('events.cancel_reg')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!isAuthenticated) {
                                setPendingEvent(evt);
                                setAuthError('');
                                setShowAuthModal(true);
                                return;
                              }
                              setSelectedEvent(evt);
                            }}
                            disabled={isFull}
                            style={{
                              width: '100%',
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              backgroundColor: isFull ? '#e2e8f0' : '#4f46e5',
                              color: isFull ? '#94a3b8' : '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              border: 'none',
                              opacity: isFull ? 0.7 : 1,
                              cursor: isFull ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isFull) e.currentTarget.style.backgroundColor = '#4338ca';
                            }}
                            onMouseLeave={(e) => {
                              if (!isFull) e.currentTarget.style.backgroundColor = '#4f46e5';
                            }}
                          >
                            <span>{isFull ? t('status.full') : t('events.register_btn')}</span>
                            {!isFull && <span className="dir-flip">&rarr;</span>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      {/* Tab: My Registrations */}
      {activeTab === 'my-events' && (
        <div>
          {myRegistrations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>You have not registered for any upcoming events yet.</p>
              <button onClick={() => setActiveTab('all')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Explore Events
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${reg.status === 'CONFIRMED' ? 'success' : 'neutral'}`}>
                        {reg.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b' }}>
                      {reg.event?.title || `Event ID: ${reg.eventId}`}
                    </h3>
                    {reg.event?.location && (
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} /> {reg.event.location}
                      </p>
                    )}
                    {reg.notes && (
                      <p style={{ fontSize: '0.8125rem', color: '#475569', fontStyle: 'italic' }}>
                        Notes: "{reg.notes}"
                      </p>
                    )}
                  </div>

                  {reg.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelRegistration(reg.eventId)}
                      className="btn btn-secondary"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.8125rem' }}
                    >
                      <XCircle size={14} style={{ marginRight: '0.35rem' }} />
                      Cancel Registration
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Register for Event
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Confirm your attendance for: <strong>{selectedEvent.title}</strong>
            </p>

            {registerError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Special Requests / Accommodation Notes (Optional)
                </label>
                <textarea
                  value={registrationNotes}
                  onChange={(e) => setRegistrationNotes(e.target.value)}
                  placeholder="E.g., require translation, wheelchair access assistance, or dietary notice..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="btn btn-secondary"
                  disabled={registering}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registering}>
                  {registering ? 'Confirming...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Schedule Community Event
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Publish a new official event, workshop, orientation, or humanitarian coordination gathering.
            </p>

            {createError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Volunteer Orientation & Training Session"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Category *
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="COMMUNITY_GATHERING">Community Gathering</option>
                    <option value="ORIENTATION">Orientation</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="COMMEMORATION">Commemoration</option>
                    <option value="LOGISTICS">Logistics</option>
                    <option value="HUMANITARIAN_DISTRIBUTION">Humanitarian Distribution</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Format *
                  </label>
                  <select
                    value={newEvent.format}
                    onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ON_SITE">On-Site</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startAt}
                    onChange={(e) => setNewEvent({ ...newEvent, startAt: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endAt}
                    onChange={(e) => setNewEvent({ ...newEvent, endAt: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Location or Virtual Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g. Husseini Community Hall, Najaf or Zoom URL"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Capacity Limit *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Accessibility Information
                </label>
                <input
                  type="text"
                  value={newEvent.accessibilityInfo}
                  onChange={(e) => setNewEvent({ ...newEvent, accessibilityInfo: e.target.value })}
                  placeholder="e.g. Wheelchair accessible ramps, sign language interpreters available"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detailed agenda, requirements, and information for attendees..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={createSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                  {createSubmitting ? 'Creating Event...' : 'Publish Event'}
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
              border: '1.5px solid #c7d2fe',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                    {locale === 'ar' ? 'تسجيل الدخول لتأكيد الحضور' : 'Sign In to Register Attendance'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#6366f1', margin: '0.2rem 0 0' }}>
                    {locale === 'ar' ? 'يضمن حجز مقعدك واستلام تفاصيل التجمع' : 'Guarantees your reservation & attendance reminder.'}
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
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                {locale === 'ar' ? 'الدخول السريع بحساب تجريبي (Demo 1-Click):' : 'Instant 1-Click Demo Login:'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickAuth('demo.individual@demo.alhusseiniya.app')}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#f5f3ff',
                    color: '#3730a3',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  👤 Amina (Attendee)
                </button>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => handleQuickAuth('demo.requester@demo.alhusseiniya.app')}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#f5f3ff',
                    color: '#3730a3',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  🤝 Omar (Requester)
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
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {authLoading ? t('common.loading') : (locale === 'ar' ? 'دخول وتأكيد الحجز' : 'Sign In & Reserve')}
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
