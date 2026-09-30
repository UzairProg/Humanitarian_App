import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import { Info, HeartHandshake, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { ApiClient } from '../services/api';
import { ICompany } from '@al-husseiniya/types';

export const Footer: React.FC = () => {
  const { t, locale, isRtl } = useLocalization();
  const [company, setCompany] = useState<ICompany | null>(null);

  useEffect(() => {
    let active = true;
    ApiClient.request<ICompany>('/company').then((res) => {
      if (active && res.success && res.data) {
        setCompany(res.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer
      style={{
        backgroundColor: '#0b1f2a',
        color: '#f8f5ee',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBlock: '3.5rem 2rem',
        paddingInline: '1.5rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1280px', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {/* Column 1: Brand & Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#123744',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#deb95f',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  border: '1px solid #c6a24a',
                }}
              >
                ح
              </div>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'block', lineHeight: 1.15 }}>
                  {t('app.title')}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#cbd5e1', fontWeight: 500 }}>
                  {t('app.tagline')}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              {locale === 'ar'
                ? 'تنسيق إنساني وخدمة مجتمعية مستمرة على مدار العام مستلهمة من قيم كربلاء الخالدة، لربط أصحاب الحاجة بالجهات الموثوقة والمتطوعين بكرامة واحترام.'
                : 'Dignified humanitarian coordination and community welfare inspired by the enduring values of Karbala. Available year-round to connect those in need with trusted responders.'}
            </p>

            {/* Subtle Parent Company Relationship */}
            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(198, 162, 74, 0.06)',
                border: '1px solid rgba(198, 162, 74, 0.28)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#fbf5e6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#c6a24a', textShadow: '0 0 5px rgba(198, 162, 74, 0.8)' }}>●</span>
                <span>{locale === 'ar' ? 'جزء من منظومة Faeda' : 'A Faeda product'}</span>
              </div>
              {company?.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.7rem',
                    color: '#deb95f',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{locale === 'ar' ? 'اكتشف Faeda' : 'Explore Faeda'}</span>
                  <ExternalLink size={11} />
                </a>
              ) : (
                <a
                  href="#faeda-ecosystem"
                  style={{
                    fontSize: '0.7rem',
                    color: '#deb95f',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{locale === 'ar' ? 'اكتشف منظومة Faeda' : 'Explore Faeda Ecosystem'}</span>
                  <span>&darr;</span>
                </a>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: '#deb95f', fontSize: '0.75rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>{locale === 'ar' ? 'منصة مجتمعية مستقلة وموثقة' : 'Independent Community Platform'}</span>
            </div>
          </div>


          {/* Column 2: الخدمات (Services) */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {locale === 'ar' ? 'الخدمات المجتمعية' : 'Community Services'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/requests" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.help')}
                </Link>
              </li>
              <li>
                <Link to="/food-programs" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.meals')}
                </Link>
              </li>
              <li>
                <Link to="/organizations" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.organizations')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: المشاركة (Participation) */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {locale === 'ar' ? 'المشاركة والعطاء' : 'Participation'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/volunteers" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.volunteers')}
                </Link>
              </li>
              <li>
                <Link to="/events" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/businesses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.businesses')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: المعرفة (Knowledge) */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {locale === 'ar' ? 'المعرفة والقيم' : 'Knowledge & Values'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/knowledge" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('nav.knowledge')}
                </Link>
              </li>
              <li>
                <a href="#values" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {locale === 'ar' ? 'قيم كربلاء والخدمة' : 'Values of Karbala'}
                </a>
              </li>
              <li>
                <a href="#how-it-works" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                  {t('home.how_it_works.title')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Platform Clarification & Governance */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {locale === 'ar' ? 'طبيعة المنصة والدور' : 'Governance & Role'}
            </h4>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                lineHeight: 1.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#deb95f', fontWeight: 600, marginBottom: '0.3rem' }}>
                <Info size={14} /> {locale === 'ar' ? 'توضيح إداري وتنظيمي' : 'Architectural Clarification'}
              </div>
              {locale === 'ar'
                ? 'الحسينية تقدم بنية تحتية تقنية لتنسيق الخدمات الإنسانية والمجتمعية، ولا تصدر فتاوى أو أحكاماً شرعية.'
                : 'Al-Husseiniya provides technical infrastructure for community coordination and does not issue religious rulings.'}
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
            &copy; {new Date().getFullYear()} {t('app.title')}{' '}
            <span style={{ color: '#deb95f', fontWeight: 600 }}>({locale === 'ar' ? 'إحدى منصات Faeda' : 'A Faeda product'})</span>.{' '}
            {locale === 'ar' ? 'مكرسة لخدمة المجتمع الإنساني بكرامة واحترام.' : 'Dedicated to community service with complete dignity.'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(222, 185, 95, 0.12)',
                border: '1px solid rgba(222, 185, 95, 0.3)',
                color: '#deb95f',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#deb95f',
                  display: 'inline-block',
                }}
              />
              {locale === 'ar' ? 'نسخة تجريبية' : 'Demo Environment'}
            </span>
            <span>{locale === 'ar' ? 'خصوصية تامة' : 'Privacy Assured'}</span>
            <span>{locale === 'ar' ? 'جهات معتمدة' : 'Verified Partners'}</span>
            <span>{locale === 'ar' ? 'تنسيق مجتمعي دائم' : 'Year-Round Care'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
