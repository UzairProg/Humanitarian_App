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
} from 'lucide-react';

interface ExtendedEventRegistration extends EventRegistration {
  event?: Event;
}

export const EventsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, isRtl } = useLocalization();

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

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1f2a', letterSpacing: '-0.02em', margin: 0 }}>
            {t('events.title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {t('events.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canCreateEvent && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            >
              <Plus size={16} />
              <span>{t('events.schedule_btn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #087f78' : '3px solid transparent',
            color: activeTab === 'all' ? '#087f78' : '#64748b',
            cursor: 'pointer',
          }}
        >
          {t('events.upcoming_tab')} ({events.length})
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my-events')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'my-events' ? '3px solid #087f78' : '3px solid transparent',
              color: activeTab === 'my-events' ? '#087f78' : '#64748b',
              cursor: 'pointer',
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
              backgroundColor: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
              <Filter size={15} />
              <span>{t('common.filter')}</span>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">{t('events.cat_all')}</option>
              <option value="COMMUNITY_GATHERING">{t('events.cat_gathering')}</option>
              <option value="ORIENTATION">{t('events.cat_orientation')}</option>
              <option value="WORKSHOP">{t('events.cat_workshop')}</option>
              <option value="LOGISTICS">{t('events.cat_logistics')}</option>
              <option value="HUMANITARIAN_DISTRIBUTION">{t('home.pathway.meals.title')}</option>
            </select>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">{t('events.format_all')}</option>
              <option value="ON_SITE">{t('events.format_onsite')}</option>
              <option value="ONLINE">{t('events.format_online')}</option>
              <option value="HYBRID">{t('events.format_hybrid')}</option>
            </select>

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
                }}
              >
                {t('common.cancel')}
              </button>
            )}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>{t('common.loading')}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>{t('events.no_events')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {events.map((evt) => {
                const regCount = evt.registrationCount || 0;
                const capacity = evt.capacity || 100;
                const percentFull = Math.min(100, Math.round((regCount / capacity) * 100));
                const isFull = regCount >= capacity;
                const registered = isUserRegistered(evt.id);

                return (
                  <div
                    key={evt.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-info">{evt.category}</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: evt.format === 'ONLINE' ? '#f0fdf4' : evt.format === 'HYBRID' ? '#eff6ff' : '#f8fafc',
                              color: evt.format === 'ONLINE' ? '#166534' : evt.format === 'HYBRID' ? '#1e40af' : '#475569',
                              border: '1px solid #e2e8f0',
                              fontWeight: 600,
                            }}
                          >
                            {evt.format || 'ON_SITE'}
                          </span>
                          {evt.language && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                              }}
                            >
                              {evt.language.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.4rem' }}>
                          {evt.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                          {evt.description}
                        </p>
                      </div>

                      {/* Schedule and Location info */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          fontSize: '0.8125rem',
                          color: '#475569',
                          backgroundColor: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={15} color="#1b6b63" />
                          <span>{new Date(evt.startAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={15} color="#1b6b63" />
                          <span>
                            {new Date(evt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(evt.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={15} color="#1b6b63" />
                          <span style={{ wordBreak: 'break-all' }}>{evt.location}</span>
                        </div>
                        {evt.accessibilityInfo && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', color: '#0284c7' }}>
                            <Accessibility size={15} />
                            <span>{evt.accessibilityInfo}</span>
                          </div>
                        )}
                      </div>

                      {/* Capacity Meter */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={12} />
                            {regCount} / {capacity}
                          </span>
                          <span>{isFull ? t('status.full') : `${capacity - regCount} ${t('events.spots_left')}`}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percentFull}%`,
                              height: '100%',
                              backgroundColor: isFull ? '#ef4444' : percentFull > 80 ? '#f59e0b' : '#087f78',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1.25rem' }}>
                      {registered ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.8125rem', fontWeight: 600 }}>
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
                            }}
                          >
                            {t('events.cancel_reg')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              alert('Please log in or sign up to register for events.');
                              return;
                            }
                            setSelectedEvent(evt);
                          }}
                          disabled={isFull}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            opacity: isFull ? 0.6 : 1,
                            cursor: isFull ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
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
    </div>
  );
};
