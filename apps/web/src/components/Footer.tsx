import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Info, Globe2, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0b1f2a',
        color: '#f8f5ee',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {/* Column 1: Brand & Purpose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  backgroundColor: '#123744',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#deb95f',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  border: '1px solid #c6a24a',
                }}
              >
                ح
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Al-Husseiniya
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Dignified humanitarian coordination and community welfare inspired by the enduring values of Karbala.
              Available year-round to connect those who need help with verified responders.
            </p>
          </div>

          {/* Column 2: Community Services */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Community Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/requests" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Request Emergency Help
                </Link>
              </li>
              <li>
                <Link to="/food-programs" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Nearby Community Meals
                </Link>
              </li>
              <li>
                <Link to="/organizations" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Verified Organizations Directory
                </Link>
              </li>
              <li>
                <Link to="/events" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Community Events & Mobilization
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Participation & Knowledge */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Participation & Study
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/volunteers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Volunteer Opportunities
                </Link>
              </li>
              <li>
                <Link to="/businesses" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Merchant & Business Sponsorship
                </Link>
              </li>
              <li>
                <Link to="/knowledge" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  Knowledge & Reflections Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Architecture Notice */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Platform Governance
            </h4>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#deb95f', fontWeight: 600, marginBottom: '0.2rem' }}>
                <Info size={14} /> Architectural Clarification
              </div>
              Al-Husseiniya provides technical and administrative coordination software. It does not independently
              issue religious rulings (fatwas).
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} Al-Husseiniya Platform. Dedicated to community service with dignity.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Assured</span>
            <span>Verified Responders</span>
            <span>Strict MERN Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
