import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import {
  KnowledgeContent,
  ContributorProfile,
  RoleType,
  ContentPublicationStatus,
  ContributorReviewStatus,
  ContributorType,
} from '@al-husseiniya/types';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import {
  BookOpen,
  Info,
  PenTool,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Plus,
  ShieldCheck,
  Award,
  Globe,
  Filter,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, locale, isRtl } = useLocalization();

  const [activeTab, setActiveTab] = useState<'catalog' | 'contributor' | 'editorial'>('catalog');
  const [articles, setArticles] = useState<KnowledgeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'ar'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Article Reader Modal
  const [readingArticle, setReadingArticle] = useState<KnowledgeContent | null>(null);

  // Contributor Workspace State
  const [contributorProfile, setContributorProfile] = useState<ContributorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [myArticles, setMyArticles] = useState<KnowledgeContent[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftSubmitting, setDraftSubmitting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [newDraft, setNewDraft] = useState({
    title: '',
    summary: '',
    body: '',
    category: 'Theological Ethics & Morality',
    language: 'en',
    mediaUrl: '',
  });

  // Contributor Application State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [contributorApplication, setContributorApplication] = useState({
    contributorType: ContributorType.COMMUNITY_EDUCATOR,
    biography: '',
    institution: '',
    publications: '',
  });

  // Editorial Review Queue (for Admins / Moderators)
  const isModeratorOrAdmin =
    isAuthenticated &&
    user?.roles?.some((r) =>
      [RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.MODERATOR, RoleType.COMMUNITY_ADMIN].includes(
        r as RoleType
      )
    );
  const [reviewQueue, setReviewQueue] = useState<KnowledgeContent[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // 1. Load Public Articles
  const loadPublicArticles = async () => {
    setLoading(true);
    let url = '/knowledge';
    const params = new URLSearchParams();
    if (selectedLanguage !== 'all') params.append('lang', selectedLanguage);
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await ApiClient.request<KnowledgeContent[]>(url);
    if (res.success && res.data) {
      setArticles(res.data);
    }
    setLoading(false);
  };

  // 2. Load Contributor Info & My Articles
  const loadContributorWorkspace = async () => {
    if (!isAuthenticated) return;
    setLoadingProfile(true);
    try {
      const [profileRes, articlesRes] = await Promise.all([
        ApiClient.request<ContributorProfile>('/contributors/profile/me'),
        ApiClient.request<KnowledgeContent[]>('/knowledge/contributor/my-articles'),
      ]);

      if (profileRes.success && profileRes.data) {
        setContributorProfile(profileRes.data);
      }
      if (articlesRes.success && articlesRes.data) {
        setMyArticles(articlesRes.data);
      }
    } catch {
      // Ignored
    }
    setLoadingProfile(false);
  };

  // 3. Load Editorial Review Queue
  const loadEditorialQueue = async () => {
    if (!isModeratorOrAdmin) return;
    const res = await ApiClient.request<KnowledgeContent[]>('/knowledge/editorial/queue');
    if (res.success && res.data) {
      setReviewQueue(res.data);
    }
  };

  useEffect(() => {
    loadPublicArticles();
  }, [selectedLanguage, selectedCategory]);

  useEffect(() => {
    if (isAuthenticated) {
      loadContributorWorkspace();
    }
    if (isModeratorOrAdmin) {
      loadEditorialQueue();
    }
  }, [isAuthenticated, isModeratorOrAdmin, activeTab]);

  // Contributor Application Submit
  const handleApplyContributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplyError('');
    setApplySuccess('');

    const res = await ApiClient.request<ContributorProfile>('/contributors/apply', {
      method: 'POST',
      body: JSON.stringify({
        contributorType: contributorApplication.contributorType,
        biography: contributorApplication.biography,
        credentialsMetadata: {
          institution: contributorApplication.institution,
          publications: contributorApplication.publications,
        },
      }),
    });

    setApplySubmitting(false);
    if (res.success && res.data) {
      setApplySuccess('Application submitted successfully! Our editorial team will review your credentials.');
      setContributorProfile(res.data);
      setTimeout(() => setShowApplyModal(false), 1500);
    } else {
      setApplyError(res.error?.message || 'Failed to submit contributor application');
    }
  };

  // Create Draft Article
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setDraftSubmitting(true);
    setDraftError('');

    const res = await ApiClient.request<KnowledgeContent>('/knowledge', {
      method: 'POST',
      body: JSON.stringify(newDraft),
    });

    setDraftSubmitting(false);
    if (res.success) {
      setShowDraftModal(false);
      setNewDraft({
        title: '',
        summary: '',
        body: '',
        category: 'Theological Ethics & Morality',
        language: 'en',
        mediaUrl: '',
      });
      loadContributorWorkspace();
    } else {
      setDraftError(res.error?.message || 'Failed to save draft');
    }
  };

  // Submit Article for Editorial Review
  const handleSubmitForReview = async (articleId: string) => {
    const res = await ApiClient.request(`/knowledge/${articleId}/submit`, { method: 'POST' });
    if (res.success) {
      loadContributorWorkspace();
    } else {
      alert(res.error?.message || 'Failed to submit article for review');
    }
  };

  // Editorial Decision
  const handleEditorialDecision = async (articleId: string, action: 'publish' | 'reject') => {
    setReviewingId(articleId);
    const notes = reviewNotes[articleId] || '';
    const res = await ApiClient.request(`/knowledge/${articleId}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes: notes }),
    });

    setReviewingId(null);
    if (res.success) {
      loadEditorialQueue();
      loadPublicArticles();
    } else {
      alert(res.error?.message || `Failed to ${action} article`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '1.5rem 1rem 3rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Scholarly Deep Sapphire Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #091320 0%, #0f2744 50%, #0c4a6e 100%)',
            borderRadius: '18px',
            padding: '2.5rem 2.25rem',
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(12, 74, 110, 0.22)',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '3px solid #38bdf8',
          }}
        >
          {/* Subtle Ambient Decorative Circles */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '10%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '720px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.14)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#bae6fd',
                  marginBottom: '1rem',
                  letterSpacing: '0.02em',
                }}
              >
                <BookOpen size={15} color="#38bdf8" />
                <span>Scholarly Library & Thought Leadership • الفكر والمعرفة</span>
              </div>

              <h1 style={{ fontSize: '2.15rem', fontWeight: 800, margin: '0 0 0.65rem 0', color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                {t('knowledge.title')}
              </h1>

              <p style={{ color: '#cbd5e1', fontSize: '0.975rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                {t('knowledge.subtitle')} Explore peer-reviewed theological treatises, ethical analyses, and humanitarian histories authored by authenticated scholars and community educators.
              </p>

              {/* Academic Charter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Sparkles size={12} color="#38bdf8" />
                  Peer-Reviewed Treatises
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Globe size={12} color="#38bdf8" />
                  Bilingual Arabic & English
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <ShieldCheck size={12} color="#38bdf8" />
                  Strict Ethical Review Charter
                </span>
              </div>
            </div>

            {/* Author / Contributor CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignSelf: 'center' }}>
              {isAuthenticated && contributorProfile?.verificationStatus === 'APPROVED' ? (
                <button
                  onClick={() => setShowDraftModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.35rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <PenTool size={16} />
                  <span>{t('knowledge.write_btn')}</span>
                </button>
              ) : isAuthenticated && !contributorProfile ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.35rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Award size={16} color="#38bdf8" />
                  <span>{t('knowledge.apply_contributor')}</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mandatory Architectural & Scope Disclaimer */}
        <div
          style={{
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            borderLeft: '4px solid #ca8a04',
            color: '#854d0e',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            fontSize: '0.8125rem',
            lineHeight: 1.55,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <Info size={19} style={{ flexShrink: 0, marginTop: '2px', color: '#ca8a04' }} />
          <div>
            <strong style={{ color: '#713f12', fontSize: '0.85rem' }}>{t('home.scope.title')}</strong>
            <span style={{ display: 'block', marginTop: '0.2rem', color: '#854d0e' }}>
              {t('home.scope.desc')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            gap: '0.75rem',
            paddingBottom: '0.25rem',
          }}
        >
          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'catalog' ? '#e0f2fe' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'catalog' ? '3px solid #0284c7' : '3px solid transparent',
              borderRadius: '8px 8px 0 0',
              color: activeTab === 'catalog' ? '#0369a1' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s',
            }}
          >
            <BookOpen size={16} />
            <span>{t('knowledge.public_tab')} ({articles.length})</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('contributor')}
              style={{
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: activeTab === 'contributor' ? '#e0f2fe' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'contributor' ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                color: activeTab === 'contributor' ? '#0369a1' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s',
              }}
            >
              <PenTool size={16} />
              <span>{t('knowledge.contributor_tab')} {contributorProfile && `(${contributorProfile.verificationStatus})`}</span>
            </button>
          )}

          {isModeratorOrAdmin && (
            <button
              onClick={() => setActiveTab('editorial')}
              style={{
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: activeTab === 'editorial' ? '#e0f2fe' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'editorial' ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                color: activeTab === 'editorial' ? '#0369a1' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s',
              }}
            >
              <ShieldCheck size={16} />
              <span>{t('knowledge.editorial_tab')} ({reviewQueue.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Public Catalog */}
        {activeTab === 'catalog' && (
          <>
            {/* Custom Curated Filter Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                backgroundColor: '#ffffff',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Category Quick Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem' }}>
                  <Filter size={14} color="#0284c7" />
                  Category:
                </span>
                {[
                  { label: 'All Categories', value: 'all' },
                  { label: 'Ethics & Morality', value: 'Theological Ethics & Morality' },
                  { label: 'Historical Reflections', value: 'Historical Reflections' },
                  { label: 'Humanitarian Service', value: 'Humanitarian Service' },
                  { label: 'Community Welfare', value: 'Community Welfare' },
                ].map((cat) => {
                  const isActive = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 700 : 500,
                        border: isActive ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                        color: isActive ? '#0369a1' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Language Dropdown Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Globe size={14} color="#0284c7" />
                  Language:
                </span>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '0.45rem 2.2rem 0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <option value="all">🌐 All Languages</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#64748b',
                    }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.9rem' }}>Loading scholarly knowledge treatises...</p>
              </div>
            ) : articles.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <BookOpen size={42} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  No Treatises Match Filter
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                  Try switching categories or view all published works.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLanguage('all');
                  }}
                  style={{
                    padding: '0.45rem 1rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {articles.map((item) => {
                  const estReadingTime = Math.max(3, Math.ceil((item.body?.length || 600) / 450));
                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      {/* Top Scholarly Accent Line */}
                      <div style={{ height: '4px', background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }} />

                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                        {/* Meta Tags Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              backgroundColor: '#f0f9ff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                            }}
                          >
                            {item.category}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#64748b',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                backgroundColor: '#f8fafc',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <Clock size={12} color="#64748b" />
                              {estReadingTime} min read
                            </span>

                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: item.language === 'ar' ? '#fef3c7' : '#f1f5f9',
                                color: item.language === 'ar' ? '#92400e' : '#475569',
                                fontWeight: 700,
                                border: item.language === 'ar' ? '1px solid #fde68a' : '1px solid #e2e8f0',
                              }}
                            >
                              {item.language === 'ar' ? 'العربية' : 'EN'}
                            </span>
                          </div>
                        </div>

                        {/* Article Title */}
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.35,
                            margin: 0,
                            letterSpacing: '-0.015em',
                          }}
                        >
                          {item.title}
                        </h3>

                        {/* Summary Excerpt */}
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#475569',
                            lineHeight: 1.6,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.summary}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          borderTop: '1px solid #f1f5f9',
                          padding: '0.85rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <BookOpen size={13} color="#94a3b8" />
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Published'}
                        </span>

                        <button
                          onClick={() => setReadingArticle(item)}
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            padding: '0.45rem 0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Eye size={14} />
                          <span>{t('knowledge.read_btn')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      {/* Tab 2: Contributor Portal */}
      {activeTab === 'contributor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!contributorProfile ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
              <Award size={48} color="#1b6b63" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
                Join the Al-Husseiniya Contributor Circle
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Are you an Islamic scholar, academic researcher, or community educator? Apply for a trusted
                contributor account to publish reflections, historical scholarship, and educational content.
              </p>
              <button onClick={() => setShowApplyModal(true)} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                Apply as Contributor
              </button>
            </div>
          ) : (
            <>
              {/* Profile Status Card */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className={`badge badge-${contributorProfile.verificationStatus === 'APPROVED' ? 'success' : 'warning'}`}>
                      Status: {contributorProfile.verificationStatus}
                    </span>
                    <span className="badge badge-info">{contributorProfile.contributorType}</span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b' }}>
                    Contributor Profile: {user?.firstName} {user?.lastName}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {contributorProfile.biography}
                  </p>
                </div>

                {contributorProfile.verificationStatus === 'APPROVED' && (
                  <button onClick={() => setShowDraftModal(true)} className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: '0.4rem' }} />
                    New Article Draft
                  </button>
                )}
              </div>

              {/* Contributor Articles */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '1rem' }}>
                  My Articles ({myArticles.length})
                </h3>

                {myArticles.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#64748b' }}>You haven't created any articles yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myArticles.map((a) => (
                      <div
                        key={a.id}
                        className="card"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '650px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              className={`badge badge-${
                                a.publicationStatus === ContentPublicationStatus.PUBLISHED
                                  ? 'success'
                                  : a.reviewStatus === ContributorReviewStatus.SUBMITTED || a.reviewStatus === ContributorReviewStatus.UNDER_ADMIN_REVIEW
                                  ? 'warning'
                                  : 'neutral'
                              }`}
                            >
                              {a.publicationStatus === ContentPublicationStatus.PUBLISHED
                                ? 'PUBLISHED'
                                : a.reviewStatus}
                            </span>
                            <span className="badge badge-info">{a.category}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Lang: {a.language.toUpperCase()}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0b1b2b' }}>{a.title}</h4>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{a.summary}</p>
                          {a.reviewNotes && (
                            <p style={{ fontSize: '0.8125rem', color: '#d97706', fontStyle: 'italic', marginTop: '0.2rem' }}>
                              Editorial Note: "{a.reviewNotes}"
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {a.reviewStatus === ContributorReviewStatus.DRAFT && (
                            <button
                              onClick={() => handleSubmitForReview(a.id)}
                              className="btn btn-primary"
                              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                            >
                              <Send size={14} style={{ marginRight: '0.35rem' }} />
                              Submit for Review
                            </button>
                          )}
                          <button
                            onClick={() => setReadingArticle(a)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                          >
                            <Eye size={14} style={{ marginRight: '0.35rem' }} />
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Editorial Review Queue (Moderators & Admins) */}
      {activeTab === 'editorial' && isModeratorOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b' }}>
            Articles Awaiting Editorial Approval ({reviewQueue.length})
          </h3>

          {reviewQueue.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>The editorial queue is clear. No articles awaiting review.</p>
            </div>
          ) : (
            reviewQueue.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-warning">Pending Review</span>
                      <span className="badge badge-info">{item.category}</span>
                      <span className="badge badge-neutral">Lang: {item.language.toUpperCase()}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0b1b2b' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>{item.summary}</p>
                  </div>
                  <button
                    onClick={() => setReadingArticle(item)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                  >
                    <Eye size={14} style={{ marginRight: '0.35rem' }} /> Full Text
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                    Editorial Feedback / Review Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Provide constructive feedback, citation verification, or publication approval remarks..."
                    value={reviewNotes[item.id] || ''}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [item.id]: e.target.value })}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleEditorialDecision(item.id, 'reject')}
                    disabled={reviewingId === item.id}
                    className="btn btn-secondary"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.8125rem' }}
                  >
                    <XCircle size={15} style={{ marginRight: '0.35rem' }} />
                    Request Revisions / Reject
                  </button>
                  <button
                    onClick={() => handleEditorialDecision(item.id, 'publish')}
                    disabled={reviewingId === item.id}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <CheckCircle2 size={15} style={{ marginRight: '0.35rem' }} />
                    Approve & Publish to Library
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reader Modal */}
      {readingArticle && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{readingArticle.category}</span>
                <span className="badge badge-neutral">Language: {readingArticle.language.toUpperCase()}</span>
                {readingArticle.publishedAt && (
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Published: {new Date(readingArticle.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1b2b', lineHeight: 1.3 }}>
              {readingArticle.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#475569', fontStyle: 'italic', borderLeft: '3px solid #1b6b63', paddingLeft: '1rem' }}>
              {readingArticle.summary}
            </p>

            <div
              style={{
                fontSize: '0.95rem',
                color: '#1e293b',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1.25rem',
              }}
            >
              {readingArticle.body}
            </div>

            {/* Platform Religious Authority Disclaimer inside modal */}
            <div
              style={{
                backgroundColor: '#fbf4e6',
                border: '1px solid #f5e4be',
                color: '#7e5b10',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                lineHeight: 1.4,
                marginTop: '1rem',
              }}
            >
              <strong>Disclaimer:</strong> This content is published for educational and communal reflection under the
              author's individual scholarly responsibility. Al-Husseiniya does not issue religious rulings.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setReadingArticle(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contributor Application Modal */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Apply to Become a Verified Contributor
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Publish educational articles, ethical guidance, and cultural scholarship with verified attribution.
            </p>

            {applyError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {applyError}
              </div>
            )}
            {applySuccess && (
              <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {applySuccess}
              </div>
            )}

            <form onSubmit={handleApplyContributor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Contributor Profile Type *
                </label>
                <select
                  value={contributorApplication.contributorType}
                  onChange={(e) =>
                    setContributorApplication({ ...contributorApplication, contributorType: e.target.value as any })
                  }
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value={ContributorType.SCHOLAR}>Islamic Scholar / Theologian</option>
                  <option value={ContributorType.RESEARCHER}>Academic Researcher</option>
                  <option value={ContributorType.COMMUNITY_EDUCATOR}>Community Educator</option>
                  <option value={ContributorType.PREACHER}>Religious Preacher</option>
                  <option value={ContributorType.ACADEMIC}>University Academic</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Affiliated Seminary / University / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hawza Ilmiyya of Najaf / Al-Mustafa International University"
                  value={contributorApplication.institution}
                  onChange={(e) =>
                    setContributorApplication({ ...contributorApplication, institution: e.target.value })
                  }
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Scholarly Biography & Background *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your qualifications, areas of study, and previous contributions..."
                  value={contributorApplication.biography}
                  onChange={(e) =>
                    setContributorApplication({ ...contributorApplication, biography: e.target.value })
                  }
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Previous Articles / Links / Works (Optional)
                </label>
                <input
                  type="text"
                  placeholder="URLs or citations of published books or essays"
                  value={contributorApplication.publications}
                  onChange={(e) =>
                    setContributorApplication({ ...contributorApplication, publications: e.target.value })
                  }
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  disabled={applySubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={applySubmitting}>
                  {applySubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Article Draft Modal */}
      {showDraftModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Create New Article Draft
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Draft your article, review its contents, and submit it for editorial review.
            </p>

            {draftError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {draftError}
              </div>
            )}

            <form onSubmit={handleCreateDraft} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={newDraft.title}
                  onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })}
                  placeholder="e.g. The Philosophy of Self-Sacrifice in the Karbala Movement"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Category *
                  </label>
                  <select
                    value={newDraft.category}
                    onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Theological Ethics & Morality">Theological Ethics & Morality</option>
                    <option value="Historical Reflections">Historical Reflections</option>
                    <option value="Humanitarian Service">Humanitarian Service</option>
                    <option value="Community Welfare">Community Welfare</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Language *
                  </label>
                  <select
                    value={newDraft.language}
                    onChange={(e) => setNewDraft({ ...newDraft, language: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Executive Summary / Abstract *
                </label>
                <input
                  type="text"
                  required
                  value={newDraft.summary}
                  onChange={(e) => setNewDraft({ ...newDraft, summary: e.target.value })}
                  placeholder="A concise 1-2 sentence preview of the article's core thesis..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Article Body (Full Text) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={newDraft.body}
                  onChange={(e) => setNewDraft({ ...newDraft, body: e.target.value })}
                  placeholder="Compose your article, citing credible sources and historical references..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="btn btn-secondary"
                  disabled={draftSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={draftSubmitting}>
                  {draftSubmitting ? 'Saving Draft...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
