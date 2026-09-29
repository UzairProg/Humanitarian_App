import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { VolunteerOpportunity } from '@al-husseiniya/types';
import { Users, Calendar, MapPin, CheckCircle } from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await ApiClient.request<VolunteerOpportunity[]>('/volunteers/opportunities');
      if (res.success && res.data) {
        setOpportunities(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Volunteer Opportunities</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Engage in direct community service: packaging food rations, driving aid kits, and logistical support.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading volunteer opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No open volunteer opportunities right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {opportunities.map((opp) => (
            <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Open</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Capacity: {opp.capacity} volunteers</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                  {opp.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                  {opp.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#1b6b63" />
                  <span>Start: {new Date(opp.startAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#1b6b63" />
                  <span>{opp.location}</span>
                </div>
              </div>

              {opp.requirements && opp.requirements.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                  <strong>Requirements:</strong> {opp.requirements.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
