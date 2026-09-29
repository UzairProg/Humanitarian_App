import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

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
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#1b6b63',
              color: '#d4af37',
              fontSize: '1.5rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid #c29b38',
            }}
          >
            ح
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>{t('auth.login')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Access your Al-Husseiniya portal account
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
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>
              {t('field.email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '10px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@alhusseiniya.org"
                style={{ width: '100%', padding: '0.55rem 0.55rem 0.55rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>
              {t('field.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '10px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.55rem 0.55rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-teal" style={{ width: '100%', padding: '0.65rem' }}>
            <span>{loading ? 'Authenticating...' : t('auth.login')}</span>
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Dev Demo Personas
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@alhusseiniya.org')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('orgadmin@alhusseiniya.org')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Org Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('moderator@alhusseiniya.org')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Moderator
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user@alhusseiniya.org')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Individual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
