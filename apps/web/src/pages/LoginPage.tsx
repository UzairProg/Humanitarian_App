import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Shield, Lock, Mail, AlertCircle, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@alhusseiniya.org');
  const [password, setPassword] = useState('AlHusseiniyaDev2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AlHusseiniyaDev2026!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f5ee',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(11, 31, 42, 0.08)',
          border: '1px solid #e8e3d8',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        }}
      >
        {/* Left Column: Brand & Vision */}
        <div
          style={{
            backgroundColor: '#0b1f2a',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2rem',
          }}
        >
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#123744',
                color: '#deb95f',
                fontSize: '1.4rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                border: '1px solid #c6a24a',
              }}
            >
              ح
            </div>

            <span style={{ color: '#deb95f', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Al-Husseiniya Platform
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.4rem 0 0.75rem' }}>
              Humanitarian coordination with complete dignity.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Access your account to coordinate verified community food programs, volunteer missions,
              emergency aid requests, and educational publications.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>Strictly verified organizations & coordinators</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>Confidentiality guaranteed on relief requests</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>Year-round community service inspired by Karbala</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0b1f2a', margin: '0 0 0.25rem' }}>
              Sign in to your account
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>
              Enter your credentials to access the community portal.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '11px', left: '10px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alhusseiniya.org"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '11px', left: '10px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', marginTop: '0.25rem' }}>
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Fill Personas */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
              Quick Persona Switch (Demo)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@alhusseiniya.org')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                Administrator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('orgadmin@alhusseiniya.org')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                Org Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('moderator@alhusseiniya.org')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                Moderator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('user@alhusseiniya.org')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              >
                Community User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
