import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Utensils,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, isRtl } = useLocalization();

  const metrics = [
    { title: 'Community Meals Served', value: '1,250+', icon: Utensils, color: '#1b6b63', bg: '#f0fdf4' },
    { title: 'Active Relief Programs', value: '12', icon: HeartHandshake, color: '#1d3557', bg: '#f0f4f8' },
    { title: 'Participating Hussainiyas & NGOs', value: '8', icon: Building2, color: '#c29b38', bg: '#fbf4e6' },
    { title: 'Registered Volunteers', value: '45', icon: Users, color: '#2a9d8f', bg: '#e0f2f1' },
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0b1b2b 0%, #12263f 60%, #1b6b63 100%)',
          color: '#ffffff',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} />
            <span>Year-round Community & Humanitarian Service</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {user ? `Welcome back, ${user.firstName}` : 'Welcome to Al-Husseiniya'}
          </h2>
          <p style={{ color: '#d9e2ec', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Inspired by the values and lessons of Karbala, connecting individuals in need with verified
            community organizations, food drives, and humanitarian volunteers year-round.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/requests" className="btn btn-teal">
              <span>{t('button.create_request')}</span>
              <ArrowRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </Link>
            <Link to="/food-programs" className="btn btn-secondary">
              <span>Explore Food Programs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: m.bg,
                  color: m.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{m.title}</p>
                <p style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0b1b2b' }}>{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f0f4f8', color: '#1d3557' }}>
              <HeartHandshake size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Get & Give Help</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Submit confidential requests for emergency food, healthcare support, or shelter. All private requests
            are protected by strict object-level authorization.
          </p>
          <Link to="/requests" className="btn btn-secondary" style={{ width: '100%' }}>
            View Requests
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#1b6b63' }}>
              <Utensils size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Community Kitchens</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Coordinate and reserve meals provided by community Hussainiyas, catering kitchens, and volunteers
            distributing nutritious sustenance.
          </p>
          <Link to="/food-programs" className="btn btn-secondary" style={{ width: '100%' }}>
            Browse Programs
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fbf4e6', color: '#c29b38' }}>
              <Building2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Verified Organizations</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Trust by design: discover verified NGOs and charitable community hubs with transparent verification
            histories.
          </p>
          <Link to="/organizations" className="btn btn-secondary" style={{ width: '100%' }}>
            Directory
          </Link>
        </div>
      </div>
    </div>
  );
};
