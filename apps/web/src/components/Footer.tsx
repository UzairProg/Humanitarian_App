import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import { Heart, Shield, Info, Globe2, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, locale, isRtl } = useLocalization();

  return (
    <footer
      style={{
        backgroundColor: '#0b1f2a',
        color: '#f8f5ee',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBlock: '3rem 2rem',
        paddingInline: '1.5rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1240px', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {t('app.title')}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {locale === 'ar'
                ? 'تنسيق إنساني وخدمة مجتمعية مستمرة على مدار العام مستلهمة من قيم كربلاء الخالدة، لربط أصحاب الحاجة بالجهات الموثوقة والمتطوعين بكرامة واحترام.'
                : 'Dignified humanitarian coordination and community welfare inspired by the enduring values of Karbala. Available year-round to connect those in need with trusted responders.'}
            </p>
          </div>

          {/* Column 2: Community Services */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              {locale === 'ar' ? 'الخدمات المجتمعية' : 'Community Services'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/requests" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.help')}
                </Link>
              </li>
              <li>
                <Link to="/food-programs" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.meals')}
                </Link>
              </li>
              <li>
                <Link to="/organizations" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.organizations')}
                </Link>
              </li>
              <li>
                <Link to="/events" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.events')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Participation & Knowledge */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              {locale === 'ar' ? 'المشاركة والمعرفة' : 'Participation & Knowledge'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
              <li>
                <Link to="/volunteers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.volunteers')}
                </Link>
              </li>
              <li>
                <Link to="/businesses" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.businesses')}
                </Link>
              </li>
              <li>
                <Link to="/knowledge" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {t('nav.knowledge')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Architecture Notice */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#deb95f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              {locale === 'ar' ? 'طبيعة المنصة والدور' : 'Platform Governance'}
            </h4>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                lineHeight: 1.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#deb95f', fontWeight: 600, marginBottom: '0.2rem' }}>
                <Info size={14} /> {locale === 'ar' ? 'توضيح إداري وتنظيمي' : 'Architectural Clarification'}
              </div>
              {locale === 'ar'
                ? 'الحسينية تقدم بنية تحتية تقنية وإدارية لتنسيق الخدمات الإنسانية والمجتمعية، ولا تصدر فتاوى أو أحكاماً شرعية.'
                : 'Al-Husseiniya provides technical and administrative infrastructure for community coordination. The platform does not independently issue religious rulings.'}
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
            &copy; {new Date().getFullYear()} {t('app.title')}.{' '}
            {locale === 'ar' ? 'مكرسة لخدمة المجتمع الإنساني بكرامة واحترام.' : 'Dedicated to community service with complete dignity.'}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>{locale === 'ar' ? 'خصوصية تامة' : 'Privacy Assured'}</span>
            <span>{locale === 'ar' ? 'جهات معتمدة' : 'Verified Partners'}</span>
            <span>{locale === 'ar' ? 'تنسيق مجتمعي' : 'Community Care'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
