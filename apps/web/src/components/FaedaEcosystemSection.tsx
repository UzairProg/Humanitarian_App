import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { ApiClient } from '../services/api';
import { ICompany, ICompanyProduct } from '@al-husseiniya/types';
import { Layers, Briefcase, Heart, ExternalLink, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const FaedaEcosystemSection: React.FC = () => {
  const { t, locale, isRtl } = useLocalization();

  const [company, setCompany] = useState<ICompany | null>(null);
  const [products, setProducts] = useState<ICompanyProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEcosystem() {
      try {
        setLoading(true);
        setError(null);

        const [compRes, prodRes] = await Promise.all([
          ApiClient.request<ICompany>('/company'),
          ApiClient.request<ICompanyProduct[]>('/company/products'),
        ]);

        if (!isMounted) return;

        if (compRes.success && compRes.data) {
          setCompany(compRes.data);
        }

        if (prodRes.success && prodRes.data) {
          // Sort products by displayOrder (lowest number first)
          const sorted = [...prodRes.data].sort((a, b) => a.displayOrder - b.displayOrder);
          setProducts(sorted);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load ecosystem');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEcosystem();

    return () => {
      isMounted = false;
    };
  }, []);

  const getLocalized = (field: { ar?: string; en?: string } | string | undefined | null): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return locale === 'ar' ? field.ar || field.en || '' : field.en || field.ar || '';
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section
      id="faeda-ecosystem"
      aria-label="Faeda Ecosystem"
      style={{
        backgroundColor: '#0a1721',
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14, 116, 144, 0.12), transparent 70%)',
        color: '#f8f5ee',
        paddingBlock: '4.5rem 4rem',
        paddingInline: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1200px', marginInline: 'auto' }}>
        {/* Subtle Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', marginInline: 'auto', marginBottom: '3.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(198, 162, 74, 0.12)',
              border: '1px solid rgba(198, 162, 74, 0.35)',
              borderRadius: '999px',
              padding: '0.3rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#deb95f',
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            <Layers size={14} color="#deb95f" />
            <span>{company ? getLocalized(company.name) : t('faeda.ecosystem.title')}</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.15rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              margin: '0 0 0.85rem 0',
              letterSpacing: '-0.01em',
            }}
          >
            {t('faeda.ecosystem.title')}
          </h2>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {company?.description
              ? getLocalized(company.description)
              : t('faeda.ecosystem.desc')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '3rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderTopColor: '#38bdf8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        )}

        {/* Dynamic Products Display */}
        {!loading && products.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              alignItems: 'stretch',
            }}
          >
            {products.map((product) => {
              const isCurrentProduct = product.featured || product.slug === 'al-husseiniya';

              return (
                <div
                  key={product.id || product.slug}
                  style={{
                    borderRadius: '14px',
                    padding: isCurrentProduct ? '2.25rem 2rem' : '1.85rem 1.75rem',
                    backgroundColor: isCurrentProduct
                      ? 'rgba(18, 55, 68, 0.45)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrentProduct
                      ? '1px solid rgba(198, 162, 74, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isCurrentProduct
                      ? '0 12px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div>
                    {/* Header badge & status */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      {/* Contextual Badge */}
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: isCurrentProduct
                            ? 'rgba(198, 162, 74, 0.15)'
                            : 'rgba(14, 116, 144, 0.15)',
                          color: isCurrentProduct ? '#f4d58d' : '#38bdf8',
                          border: isCurrentProduct
                            ? '1px solid rgba(198, 162, 74, 0.3)'
                            : '1px solid rgba(14, 116, 144, 0.3)',
                        }}
                      >
                        {isCurrentProduct ? (
                          <>
                            <Heart size={12} fill="#f4d58d" />
                            <span>{t('faeda.current_platform')}</span>
                          </>
                        ) : (
                          <>
                            <Briefcase size={12} />
                            <span>{t('faeda.related_product')}</span>
                          </>
                        )}
                      </span>

                      {/* Category Label */}
                      <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>
                        {getLocalized(product.category)}
                      </span>
                    </div>

                    {/* Product Brand Header (Logo fallback + Name) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      {product.logo ? (
                        <img
                          src={product.logo}
                          alt={getLocalized(product.name)}
                          style={{
                            width: isCurrentProduct ? '44px' : '38px',
                            height: isCurrentProduct ? '44px' : '38px',
                            borderRadius: '10px',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: isCurrentProduct ? '44px' : '38px',
                            height: isCurrentProduct ? '44px' : '38px',
                            borderRadius: '10px',
                            backgroundColor: isCurrentProduct ? '#123744' : '#1e293b',
                            border: isCurrentProduct ? '1px solid #c6a24a' : '1px solid #334155',
                            color: isCurrentProduct ? '#deb95f' : '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: isCurrentProduct ? '1.25rem' : '1.1rem',
                            flexShrink: 0,
                          }}
                        >
                          {isCurrentProduct ? 'ح' : 'ف'}
                        </div>
                      )}

                      <div>
                        <h3
                          style={{
                            fontSize: isCurrentProduct ? '1.35rem' : '1.15rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            margin: 0,
                            lineHeight: 1.2,
                          }}
                        >
                          {getLocalized(product.name)}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          {getLocalized(product.shortDescription)}
                        </div>
                      </div>
                    </div>

                    {/* Product Detailed Description from Database */}
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#cbd5e1',
                        lineHeight: 1.65,
                        margin: '0 0 1.5rem 0',
                      }}
                    >
                      {getLocalized(product.description)}
                    </p>
                  </div>

                  {/* Actions / Links */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                      <ShieldCheck size={14} color="#deb95f" />
                      <span>
                        {isCurrentProduct
                          ? (locale === 'ar' ? 'أنت تتصفح هذه المنصة الآن' : 'You are currently viewing this product')
                          : (locale === 'ar' ? 'ضمن منظومة Faeda الموحدة' : 'Under unified Faeda ecosystem')}
                      </span>
                    </div>

                    {product.website ? (
                      <a
                        href={product.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#38bdf8',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <span>{t('faeda.learn_more')}</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                        }}
                      >
                        {isCurrentProduct ? (locale === 'ar' ? 'المنصة النشطة' : 'Active platform') : (locale === 'ar' ? 'المنصة الشقيقة' : 'Sister platform')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty / Fallback State */}
        {!loading && products.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              fontSize: '0.875rem',
            }}
          >
            {t('faeda.ecosystem.desc')}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Subtle Bottom Relationship Endorsement */}
        <div
          style={{
            marginTop: '2.75rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.5rem',
          }}
        >
          {locale === 'ar'
            ? 'منظومة Faeda: منتجات رقمية تهدف إلى خدمة المجتمع ودعم العمل الإنساني والمهني.'
            : 'The Faeda Ecosystem: Digital platforms built to serve people, support community welfare, and empower careers.'}
        </div>

      </div>
    </section>
  );
};

export default FaedaEcosystemSection;
