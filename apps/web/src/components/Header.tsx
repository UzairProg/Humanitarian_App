import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { Globe, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useLocalization();

  return (
    <header
      style={{
        backgroundColor: '#0b1b2b',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#1b6b63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37',
              fontWeight: '700',
              fontSize: '1.2rem',
              border: '1px solid #c29b38',
            }}
          >
            ح
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              {t('app.title')}
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9fb3c8', margin: 0 }}>
              {t('app.tagline')}
            </p>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8125rem',
          }}
          title="Switch language / تغيير اللغة"
        >
          <Globe size={15} />
          <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#d9e2ec',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#334e68',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserIcon size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500 }}>
                  {user.firstName} {user.lastName}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#9fb3c8' }}>{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                background: 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-teal" style={{ padding: '0.4rem 0.85rem' }}>
              {t('auth.login')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
