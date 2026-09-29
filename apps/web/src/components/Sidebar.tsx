import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import {
  LayoutDashboard,
  HeartHandshake,
  Utensils,
  Building2,
  Store,
  Calendar,
  BookOpen,
  Users,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import { RoleType, PermissionKey } from '@al-husseiniya/types';

export const Sidebar: React.FC = () => {
  const { hasRole, hasPermission } = useAuth();
  const { t } = useLocalization();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/requests', label: t('nav.requests'), icon: HeartHandshake },
    { to: '/food-programs', label: t('nav.food'), icon: Utensils },
    { to: '/organizations', label: t('nav.community'), icon: Building2 },
    { to: '/businesses', label: t('nav.businesses'), icon: Store },
    { to: '/events', label: t('nav.events'), icon: Calendar },
    { to: '/knowledge', label: t('nav.knowledge'), icon: BookOpen },
    { to: '/volunteers', label: t('nav.volunteers'), icon: Users },
  ];

  const canSeeModeration = hasPermission(PermissionKey.REPORT_VIEW) || hasRole(RoleType.MODERATOR, RoleType.ADMIN);
  const canSeeAudit = hasPermission(PermissionKey.AUDIT_VIEW) || hasRole(RoleType.ADMIN, RoleType.SUPER_ADMIN);

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderInlineEnd: '1px solid #e5e9f0',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        minHeight: 'calc(100vh - 61px)',
      }}
    >
      <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Services & Community
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#1b6b63' : '#334155',
              backgroundColor: isActive ? '#f0fdf4' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease-in-out',
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {(canSeeModeration || canSeeAudit) && (
        <>
          <div
            style={{
              padding: '1.5rem 0.5rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Administration
          </div>

          {canSeeModeration && (
            <NavLink
              to="/moderation"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ef4444' : '#334155',
                backgroundColor: isActive ? '#fef2f2' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <ShieldAlert size={18} />
              <span>{t('nav.moderation')}</span>
            </NavLink>
          )}

          {canSeeAudit && (
            <NavLink
              to="/audit"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#1d3557' : '#334155',
                backgroundColor: isActive ? '#f0f4f8' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <ClipboardList size={18} />
              <span>{t('nav.audit')}</span>
            </NavLink>
          )}
        </>
      )}
    </aside>
  );
};
