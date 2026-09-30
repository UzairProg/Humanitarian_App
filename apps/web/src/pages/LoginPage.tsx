import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Shield, Lock, Mail, AlertCircle, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t, isRtl } = useLocalization();
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

  const isDevOrDemo =
    Boolean((import.meta as any).env?.DEV) ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('demo');

  const handleQuickFill = (demoEmail: string, demoPass = 'DemoPass@12345') => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
                fontFamily: "'Amiri', serif",
              }}
            >
              ح
            </div>

            <span style={{ color: '#deb95f', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t('app.title')}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.4rem 0 0.75rem' }}>
              {isRtl ? 'التنسيق الإنساني بكرامة واحترام كامل.' : 'Humanitarian coordination with complete dignity.'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              {isRtl
                ? 'سجل دخولك لتنسيق برامج الإطعام المجتمعي المعتمدة، وفرص التطوع، وطلبات الإغاثة، ومقالات المعرفة المستلهمة من قيم كربلاء.'
                : 'Access your account to coordinate verified community food programs, volunteer missions, emergency aid requests, and educational publications.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>{isRtl ? 'منظمات ومنسقون معتمدون وموثقون' : 'Strictly verified organizations & coordinators'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>{isRtl ? 'سرية تامة ومضمونة لكافة طلبات الدعم' : 'Confidentiality guaranteed on relief requests'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#deb95f" />
              <span>{isRtl ? 'خدمة إنسانية طوال العام مستلهمة من كربلاء' : 'Year-round community service inspired by Karbala'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0b1f2a', margin: '0 0 0.25rem' }}>
              {t('auth.welcome_back')}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>
              {t('auth.portal_desc')}
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
                {t('field.email')}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '11px', [isRtl ? 'right' : 'left']: '10px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alhusseiniya.org"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.6rem',
                    paddingInlineStart: '2.25rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                {t('field.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '11px', [isRtl ? 'right' : 'left']: '10px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.6rem',
                    paddingInlineStart: '2.25rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', marginTop: '0.25rem' }}>
              <span>{loading ? t('common.loading') : t('auth.login')}</span>
            </button>
          </form>

          {/* Quick Fill Personas — Development / Demo Helper */}
          {isDevOrDemo && (
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' }}>
                  {isRtl ? 'حسابات العرض التجريبي (Demo Personas)' : 'CEO Demonstration Accounts'}
                </p>
                <span style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 600, backgroundColor: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  DEMO ONLY
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: '0 0 0.65rem', lineHeight: 1.4 }}>
                {isRtl ? 'حسابات وهمية مجهزة لتجربة المنصة بالكامل. كلمة المرور: DemoPass@12345' : 'Fictional demo profiles. Pre-loaded with DemoPass@12345.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.admin@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '👑 مدير المنصة (Admin)' : '👑 Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.organization@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '🏢 حسينية / جهة (Org Admin)' : '🏢 Org Admin (Hassan)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.requester@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '🤝 طالب مساعدة (Requester)' : '🤝 Requester (Omar)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.individual@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '👤 فرد مجتمعي (Individual)' : '👤 Individual (Amina)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.volunteer@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '🌱 متطوع (Volunteer)' : '🌱 Volunteer (Zainab)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.business@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '🥖 شريك تجاري (Business)' : '🥖 Business (Karim)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.contributor@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '✍️ مساهم معرفي (Contributor)' : '✍️ Contributor (Mahdi)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('demo.moderator@demo.alhusseiniya.app')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textAlign: 'start' }}
                >
                  {isRtl ? '🛡️ مشرف محتوى (Moderator)' : '🛡️ Moderator (Demo)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
