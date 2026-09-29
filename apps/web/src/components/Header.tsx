import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import ApiClient from '../services/api';
import { Notification, RoleType } from '@al-husseiniya/types';
import {
  Globe,
  User as UserIcon,
  LogOut,
  Bell,
  Clock,
  Search,
  Menu,
  X,
  HeartHandshake,
  Utensils,
  Building2,
  Calendar,
  BookOpen,
  Users,
  Store,
  ShieldAlert,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

interface SearchResultItem {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  location?: string;
}

interface SearchResults {
  opportunities?: SearchResultItem[];
  businesses?: SearchResultItem[];
  events?: SearchResultItem[];
  knowledge?: SearchResultItem[];
  requests?: SearchResultItem[];
  foodPrograms?: SearchResultItem[];
  organizations?: SearchResultItem[];
}

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { locale, setLocale, t, isRtl } = useLocalization();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User dropdown & Mobile drawer
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isModeratorOrAdmin =
    isAuthenticated &&
    hasRole(RoleType.MODERATOR, RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.COMMUNITY_ADMIN);

  // Load Notifications
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const [listRes, countRes] = await Promise.all([
        ApiClient.request<Notification[]>('/notifications'),
        ApiClient.request<{ count: number }>('/notifications/unread-count'),
      ]);
      if (listRes.success && listRes.data) {
        setNotifications(listRes.data);
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const res = await ApiClient.request<SearchResults>(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.success && res.data) {
        setSearchResults(res.data);
        setShowSearchDropdown(true);
      }
      setSearchLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkAsRead = async (id: string) => {
    await ApiClient.request(`/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await ApiClient.request('/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNavigateResult = (url: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(url);
  };

  const navLinks = [
    { to: '/requests', label: t('nav.help') },
    { to: '/food-programs', label: t('nav.meals') },
    { to: '/organizations', label: t('nav.organizations') },
    { to: '/events', label: t('nav.events') },
    { to: '/knowledge', label: t('nav.knowledge') },
    { to: '/volunteers', label: t('nav.volunteers') },
    { to: '/businesses', label: t('nav.businesses') },
  ];

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e3d8',
        boxShadow: '0 1px 4px rgba(11, 31, 42, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          marginInline: 'auto',
          paddingInline: '1.5rem',
          paddingBlock: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#0b1f2a',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                backgroundColor: '#0b1f2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#deb95f',
                fontWeight: 700,
                fontSize: '1.25rem',
                border: '1px solid #c6a24a',
                boxShadow: '0 2px 5px rgba(11, 31, 42, 0.15)',
              }}
            >
              ح
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1f2a', lineHeight: 1.15 }}>
                {t('app.title')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                {t('app.tagline')}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexWrap: 'wrap',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#087f78' : '#334155',
                backgroundColor: isActive ? '#f0fbf9' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Search, Language Switcher, Notifications, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Global Search Bar */}
          <div style={{ position: 'relative' }} ref={searchRef}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#faf8f2',
                border: '1px solid #e5dfd2',
                borderRadius: '20px',
                paddingInline: '0.75rem',
                paddingBlock: '0.35rem',
                gap: '0.4rem',
                width: '185px',
                transition: 'width 0.2s ease, border-color 0.2s ease',
              }}
            >
              <Search size={14} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchResults) setShowSearchDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8125rem',
                  color: '#0b1f2a',
                  width: '100%',
                }}
              />
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && searchResults && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  insetInlineEnd: 0,
                  width: '380px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(11, 31, 42, 0.12), 0 2px 6px rgba(11, 31, 42, 0.04)',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  zIndex: 110,
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                  {t('search.results_for')} "{searchQuery}"
                </div>

                {/* Events */}
                {searchResults.events && searchResults.events.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#087f78', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <Calendar size={13} /> {t('nav.events')} ({searchResults.events.length})
                    </div>
                    {searchResults.events.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => handleNavigateResult('/events')}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <strong>{evt.title}</strong>
                        {evt.category && <span style={{ fontSize: '0.7rem', color: '#64748b', marginInlineStart: '0.5rem' }}>{evt.category}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Knowledge Articles */}
                {searchResults.knowledge && searchResults.knowledge.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#087f78', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <BookOpen size={13} /> {t('nav.knowledge')} ({searchResults.knowledge.length})
                    </div>
                    {searchResults.knowledge.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => handleNavigateResult('/knowledge')}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <strong>{k.title}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Volunteer Opportunities */}
                {searchResults.opportunities && searchResults.opportunities.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#087f78', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <Users size={13} /> {t('nav.volunteers')} ({searchResults.opportunities.length})
                    </div>
                    {searchResults.opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        onClick={() => handleNavigateResult('/volunteers')}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <strong>{opp.title}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Businesses */}
                {searchResults.businesses && searchResults.businesses.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#087f78', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <Store size={13} /> {t('nav.businesses')} ({searchResults.businesses.length})
                    </div>
                    {searchResults.businesses.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleNavigateResult('/businesses')}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <strong>{b.name}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {!searchResults.events?.length &&
                  !searchResults.knowledge?.length &&
                  !searchResults.opportunities?.length &&
                  !searchResults.businesses?.length && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                      {t('search.no_results')}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Language Switcher: In Arabic mode shows 'English', in English mode shows 'العربية' */}
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#faf8f2',
              border: '1px solid #e5dfd2',
              color: '#0b1f2a',
              paddingInline: '0.65rem',
              paddingBlock: '0.35rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
            title={locale === 'ar' ? 'التحويل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <Globe size={14} color="#087f78" />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Authenticated user items: Notifications & Profile */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Notifications */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    position: 'relative',
                    backgroundColor: '#faf8f2',
                    border: '1px solid #e5dfd2',
                    color: '#0b1f2a',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={t('notif.title')}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        insetInlineEnd: '-4px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        borderRadius: '9999px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      insetInlineEnd: 0,
                      width: '320px',
                      maxHeight: '400px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('notif.title')}</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#087f78',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {t('notif.mark_all_read')}
                        </button>
                      )}
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                          {t('notif.empty')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: n.isRead ? '#ffffff' : '#f0fbf9',
                              cursor: n.isRead ? 'default' : 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: n.isRead ? 500 : 700, color: '#0b1f2a' }}>
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#087f78',
                                    flexShrink: 0,
                                    marginTop: '4px',
                                  }}
                                />
                              )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                              <Clock size={11} />
                              <span>{new Date(n.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : undefined)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#0b1f2a',
                      color: '#deb95f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                    }}
                  >
                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      insetInlineEnd: 0,
                      width: '220px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      border: '1px solid #e2e8f0',
                      padding: '0.5rem 0',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0b1f2a' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    </div>

                    {isModeratorOrAdmin && (
                      <>
                        <Link
                          to="/moderation"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.8125rem',
                            color: '#1e293b',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <ShieldAlert size={14} color="#087f78" /> {t('nav.moderation')}
                        </Link>
                        <Link
                          to="/audit"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.8125rem',
                            color: '#1e293b',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <ClipboardList size={14} color="#087f78" /> {t('nav.audit')}
                        </Link>
                        <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
                      </>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8125rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        textAlign: isRtl ? 'right' : 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      <LogOut size={14} /> {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-navy"
              style={{
                fontSize: '0.8125rem',
                paddingInline: '1rem',
                paddingBlock: '0.4rem',
                borderRadius: '6px',
              }}
            >
              {t('auth.login')}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.3rem',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e8e3d8',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.5rem 0',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0b1f2a',
                textDecoration: 'none',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {link.label}
            </Link>
          ))}
          {isModeratorOrAdmin && (
            <>
              <Link
                to="/moderation"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.5rem 0',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#087f78',
                  textDecoration: 'none',
                }}
              >
                {t('nav.moderation')}
              </Link>
              <Link
                to="/audit"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.5rem 0',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#087f78',
                  textDecoration: 'none',
                }}
              >
                {t('nav.audit')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
