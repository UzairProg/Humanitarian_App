import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { Event } from '@al-husseiniya/types';
import { Calendar, MapPin, Clock } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await ApiClient.request<Event[]>('/events');
      if (res.success && res.data) {
        setEvents(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Community Events & Gatherings</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Educational gatherings, volunteer orientations, and humanitarian mobilization meetings.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading community events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No upcoming events currently scheduled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {events.map((evt) => (
            <div key={evt.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span className="badge badge-info" style={{ alignSelf: 'flex-start' }}>
                {evt.category}
              </span>

              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                  {evt.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                  {evt.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#1b6b63" />
                  <span>Start: {new Date(evt.startAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="#1b6b63" />
                  <span>End: {new Date(evt.endAt).toLocaleTimeString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#1b6b63" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
