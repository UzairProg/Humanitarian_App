import React, { createContext, useContext, useState, useEffect } from 'react';

type SupportedLocale = 'en' | 'ar';

interface LocalizationContextType {
  locale: SupportedLocale;
  isRtl: boolean;
  setLocale: (loc: SupportedLocale) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLocale, Record<string, string>> = {
  en: {
    'app.title': 'Al-Husseiniya',
    'app.tagline': 'Year-Round Community & Humanitarian Service',
    'nav.dashboard': 'Dashboard',
    'nav.requests': 'Humanitarian Requests',
    'nav.food': 'Food Programs',
    'nav.community': 'Hussainiyas & NGOs',
    'nav.businesses': 'Businesses & Merchants',
    'nav.events': 'Community Events',
    'nav.knowledge': 'Knowledge & Teachings',
    'nav.volunteers': 'Volunteers',
    'nav.moderation': 'Moderation Queue',
    'nav.audit': 'Audit Logs',
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.logout': 'Sign Out',
    'status.active': 'Active',
    'status.pending': 'Pending Review',
    'status.verified': 'Verified',
    'button.create_request': 'Get Help / Submit Request',
    'button.verify': 'Approve Verification',
    'field.email': 'Email Address',
    'field.password': 'Password',
  },
  ar: {
    'app.title': 'الحسينية',
    'app.tagline': 'خدمة مجتمعية وإنسانية مستمرة على مدار العام',
    'nav.dashboard': 'لوحة التحكم',
    'nav.requests': 'الطلبات الإنسانية',
    'nav.food': 'البرامج الغذائية',
    'nav.community': 'الحسينيات والجمعيات',
    'nav.businesses': 'المؤسسات والمتاجر',
    'nav.events': 'الفعاليات المجتمعية',
    'nav.knowledge': 'المعرفة والمحتوى الثقافي',
    'nav.volunteers': 'المتطوعون',
    'nav.moderation': 'طابور الإشراف',
    'nav.audit': 'سجل التدقيق',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب جديد',
    'auth.logout': 'تسجيل الخروج',
    'status.active': 'نشط',
    'status.pending': 'قيد المراجعة',
    'status.verified': 'معتمد',
    'button.create_request': 'طلب مساعدة إنسانية',
    'button.verify': 'اعتماد التحقق',
    'field.email': 'البريد الإلكتروني',
    'field.password': 'كلمة المرور',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    localStorage.setItem('preferred_locale', loc);
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = loc;
  };

  useEffect(() => {
    const saved = localStorage.getItem('preferred_locale') as SupportedLocale;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocale(saved);
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LocalizationContext.Provider
      value={{
        locale,
        isRtl: locale === 'ar',
        setLocale,
        t,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
