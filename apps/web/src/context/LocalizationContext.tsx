import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLocale = 'ar' | 'en';

interface LocalizationContextType {
  locale: SupportedLocale;
  isRtl: boolean;
  setLocale: (loc: SupportedLocale) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLocale, Record<string, string>> = {
  ar: {
    // 1. Navigation & Brand
    'app.title': 'منصة الحسينية',
    'app.tagline': 'منصة إنسانية ومجتمعية على مدار العام',
    'nav.home': 'الرئيسية',
    'nav.help': 'طلب مساعدة',
    'nav.meals': 'وجبات مجتمعية',
    'nav.organizations': 'جهات تخدم المجتمع',
    'nav.events': 'فعاليات المجتمع',
    'nav.knowledge': 'المعرفة من كربلاء',
    'nav.volunteers': 'اجعل وقتك أثراً',
    'nav.businesses': 'للأعمال دور',
    'nav.moderation': 'طابور الإشراف',
    'nav.audit': 'سجل التدقيق',
    'nav.profile': 'حسابي',

    // Search
    'search.placeholder': 'ابحث في المنصة عن خدمات، وجبات، فعاليات...',
    'search.results_for': 'نتائج البحث عن',
    'search.no_results': 'لا توجد نتائج مطابقة لبحثك في هذا النطاق.',

    // Notifications & Auth
    'notif.title': 'الإشعارات',
    'notif.mark_all_read': 'تحديد الكل كمقروء',
    'notif.empty': 'لا توجد إشعارات حالياً',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب جديد',
    'auth.logout': 'تسجيل الخروج',
    'auth.welcome_back': 'مرحباً بعودتك',
    'auth.portal_desc': 'الوصول إلى منصة الحسينية للتنسيق الإنساني والخدمة المجتمعية',
    'field.email': 'البريد الإلكتروني',
    'field.password': 'كلمة المرور',

    // Statuses
    'status.active': 'نشط',
    'status.pending': 'قيد المراجعة',
    'status.verified': 'جهة موثقة',
    'status.unverified': 'غير موثقة',
    'status.open': 'متاح الآن',
    'status.full': 'مكتمل الحجز',
    'status.limited': 'أماكن محدودة',
    'status.closed': 'منتهي',

    // Home Page
    'home.eyebrow': 'مجتمع الحسينية • خدمة وكرامة على مدار العام',
    'home.hero.title': 'المساعدة أقرب مما تتوقع',
    'home.hero.desc':
      'من الوجبات المجتمعية والمساعدة الإنسانية إلى التطوع والفعاليات، نربط الناس بالخدمات والأشخاص الذين يصنعون فرقاً حقيقياً — طوال العام مستلهمين قيم كربلاء.',
    'home.cta.need_help': 'أحتاج إلى مساعدة',
    'home.cta.want_help': 'أريد أن أساعد',
    'home.cta.explore_meals': 'استكشف الوجبات',
    'home.pathways.title': 'كيف يمكننا خدمتك اليوم؟',
    'home.pathways.subtitle': 'اختر المسار المناسب لاكتشاف الخدمات الموثوقة أو المشاركة الفعالة في خدمة المجتمع.',
    'home.pathway.help.title': 'طلب مساعدة',
    'home.pathway.help.desc': 'دعم غذائي وطبي واحتياجات معيشية بخصوصية وكرامة إنسانية تامة.',
    'home.pathway.meals.title': 'وجبات مجتمعية',
    'home.pathway.meals.desc': 'وجبات طازجة وساخنة تقدم يومياً بالمجان في مراكز المجتمع.',
    'home.pathway.volunteer.title': 'اجعل وقتك أثراً',
    'home.pathway.volunteer.desc': 'شارك بوقتك وخبراتك الميدانية في دعم المبادرات الإنسانية.',
    'home.pathway.business.title': 'للأعمال دور',
    'home.pathway.business.desc': 'مساهمة المطاعم والشركات برعاية الوجبات وفائض الطعام والخدمات.',
    'home.pathway.organizations.title': 'جهات تخدم المجتمع',
    'home.pathway.organizations.desc': 'تصفح الحسينيات الموثقة والجمعيات الإنسانية في مدينتك.',
    'home.meals.title': 'وجبات مجتمعية قريبة منك',
    'home.meals.remaining': 'وجبة متبقية',
    'home.meals.details': 'التفاصيل والاتجاهات',
    'home.events.title': 'فعاليات المجتمع',
    'home.events.all': 'كل الفعاليات',
    'home.knowledge.title': 'من قيم كربلاء',
    'home.knowledge.all': 'مكتبة المعرفة',
    'home.impact.eyebrow': 'أثرنا معاً',
    'home.impact.title': 'كل وجبة وخدمة هي أكثر من رقم، بل كرامة إنسان',
    'home.impact.desc': 'نوثق الأثر الإنساني بشفافية ومسؤولية لنضمن استدامة الخير ووصوله إلى مستحقيه.',
    'home.impact.meals': 'وجبة طعام قُدمت',
    'home.impact.requests': 'طلب مساعدة أُنجز',
    'home.impact.orgs': 'جهة خدمت المجتمع',
    'home.impact.volunteers': 'متطوع شارك',
    'home.scope.title': 'طبيعة المنصة وحدود دورها الإداري',
    'home.scope.desc':
      'منصة الحسينية هي بنية تحتية تقنية وإدارية لتنسيق الخدمات المجتمعية والإنسانية. المنصة لا تصدر فتاوى أو أحكاماً شرعية، والمساهمون المعتمدون ينشرون مقالاتهم تحت مسؤوليتهم العلمية.',

    // Humanitarian Requests
    'requests.title': 'طلب مساعدة إنسانية',
    'requests.subtitle': 'مساحة آمنة تضمن كرامتك لطلب الاحتياجات الأساسية من الجهات الموثوقة.',
    'requests.new_btn': 'طلب مساعدة',
    'requests.privacy_banner':
      'معلوماتك في أمان: تفاصيل طلبك خاصة ومحمية ولا يطلع عليها سوى المنسقين المخولين بالجهات الموثقة.',
    'requests.step1': 'ما نوع المساعدة التي تحتاجها؟',
    'requests.step2': 'أخبرنا بما تحتاجه بالتفصيل',
    'requests.step3': 'أين يمكن الوصول إليك؟',
    'requests.step4': 'مراجعة وتأكيد الطلب',
    'requests.success_title': 'تم استلام طلبك بكرامة واهتمام',
    'requests.success_desc':
      'سيقوم منسق معتمد بمراجعة احتياجاتك بسرية تامة وسيتم إشعارك فور تعيين فريق المساعدة.',
    'requests.summary_label': 'عنوان الطلب أو ملخص الاحتياج',
    'requests.details_label': 'التفاصيل والمعلومات الإضافية',
    'requests.location_label': 'المدينة أو الحي التقريبي',
    'requests.private_checkbox': 'إبقاء الطلب سرياً ومقتصراً على المنسقين فقط (موصى به)',

    // Food Programs
    'food.hero.eyebrow': 'الإطعام والكرامة المجتمعية',
    'food.hero.title': 'الخير يبدأ من مائدة',
    'food.hero.desc': 'اكتشف وجبات الطعام المجتمعية الطازجة الموزعة مجاناً في أحيائك بكل احترام وكرم.',
    'food.schedule_btn': 'جدولة توزيع وجبات',
    'food.reserve_btn': 'حجز وجبة',
    'food.serving_time': 'أوقات التوزيع',
    'food.pickup_notes': 'تعليمات الاستلام',
    'food.remaining_count': 'وجبة متاحة اليوم',

    // Organizations
    'orgs.title': 'جهات تخدم المجتمع',
    'orgs.subtitle': 'الحسينيات والجمعيات الإنسانية الموثقة التي تقدم خدمات الإغاثة والدعم.',
    'orgs.register_btn': 'تسجيل منظمة أو حسينية',
    'orgs.filter_verified': 'عرض الجهات المعتمدة فقط',
    'orgs.details_btn': 'عرض البرامج والأثر',

    // Events
    'events.title': 'فعاليات المجتمع والمبادرات',
    'events.subtitle': 'جلسات التوجيه، وورش العمل التدريبية، واللقاءات الإنسانية والاجتماعية.',
    'events.schedule_btn': 'جدولة فعالية',
    'events.register_btn': 'تسجيل الحضور',
    'events.registered_badge': 'تم تأكيد تسجيلك',
    'events.cancel_reg': 'إلغاء التسجيل',
    'events.my_registrations': 'تسجيلاتي',
    'events.upcoming_tab': 'الفعاليات القادمة',

    // Knowledge
    'knowledge.title': 'المعرفة من كربلاء',
    'knowledge.subtitle': 'مقالات فكرية، ودروس أخلاقية، وإشراقات تاريخية مستلهمة من نهضة الإمام الحسين عليه السلام.',
    'knowledge.write_btn': 'كتابة مقال',
    'knowledge.apply_contributor': 'الانضمام كباحث أو كاتب',
    'knowledge.read_btn': 'قراءة المقال',
    'knowledge.editorial_tab': 'طابور المراجعة التحريرية',
    'knowledge.contributor_tab': 'بوابة المساهمين',
    'knowledge.public_tab': 'المقالات المنشورة',

    // Volunteers
    'volunteers.title': 'اجعل وقتك أثراً',
    'volunteers.subtitle': 'اكتشف فرصاً حقيقية لتوظيف مهاراتك ووقتك في خدمة الناس.',
    'volunteers.apply_btn': 'التقديم للتطوع',
    'volunteers.profile_btn': 'ملفي التطوعي',
    'volunteers.opportunities_tab': 'فرص التطوع المتاحة',
    'volunteers.my_apps_tab': 'طلباتي السابقة',

    // Businesses
    'businesses.title': 'للأعمال دور في خدمة المجتمع',
    'businesses.subtitle': 'مشاركة أصحاب المتاجر والمطاعم برعاية الوجبات وفائض الطعام والخدمات اللوجستية.',
    'businesses.register_btn': 'تسجيل مؤسسة تجارية',
    'businesses.pledge_btn': 'تقديم مساهمة مجتمعية',

    // Moderation
    'moderation.title': 'مركز الثقة والأمان والإشراف',
    'moderation.subtitle': 'مراجعة البلاغات والشكاوى المجتمعية وحماية نزاهة المنصة.',
    'moderation.pending_tab': 'البلاغات قيد المراجعة',
    'moderation.resolved_tab': 'الأرشيف المنجز',

    // Audit
    'audit.title': 'سجلات التدقيق والامتثال',
    'audit.subtitle': 'سجل تشغيلي غير قابل للتعديل يوثق القرارات الإدارية والتحققات وتحديثات الصلاحيات.',
    'audit.entity_filter': 'تصفية حسب نوع الكيان:',
    'audit.total_records': 'إجمالي السجلات:',
    'audit.action_code': 'رمز الإجراء',
    'audit.entity_type': 'نوع الكيان',
    'audit.entity_id': 'معرف الكيان',
    'audit.actor': 'المنفذ',
    'audit.ip': 'عنوان IP',
    'audit.time': 'وقت التسجيل',

    // Additional Detail Keys
    'orgs.search_placeholder': 'ابحث بالاسم أو المدينة...',
    'orgs.impact_title': 'الأثر المجتمعي المعتمد',
    'orgs.active_programs_title': 'برامج الإطعام النشطة',
    'orgs.no_orgs': 'لم يتم العثور على منظمات مطابقة.',
    'orgs.verify_btn': 'اعتماد المنظمة',
    'events.search_placeholder': 'ابحث في الفعاليات...',
    'events.spots_left': 'مقاعد متبقية',
    'events.no_events': 'لا توجد فعاليات حالياً.',
    'events.format_all': 'كافة الصيغ',
    'events.format_onsite': 'حضوري',
    'events.format_online': 'عبر الإنترنت',
    'events.format_hybrid': 'مختلط',
    'events.cat_all': 'كافة الفئات',
    'events.cat_gathering': 'تجمع مجتمعي',
    'events.cat_workshop': 'ورشة عمل',
    'events.cat_orientation': 'توجيه متطوعين',
    'events.cat_fundraiser': 'جمع تبرعات',
    'events.cat_logistics': 'اجتماع لوجستي',

    // Common
    'common.filter': 'تصفية:',
    'common.category': 'الفئة:',
    'common.status': 'الحالة:',
    'common.all': 'الكل',
    'common.close': 'إغلاق',
    'common.cancel': 'إلغاء',
    'common.continue': 'متابعة',
    'common.back': 'رجوع',
    'common.submit': 'إرسال',
    'common.loading': 'جارٍ التحميل...',
  },
  en: {
    // 1. Navigation & Brand
    'app.title': 'Al-Husseiniya',
    'app.tagline': 'Year-Round Community & Humanitarian Platform',
    'nav.home': 'Home',
    'nav.help': 'Find Help',
    'nav.meals': 'Community Meals',
    'nav.organizations': 'Organizations',
    'nav.events': 'Events',
    'nav.knowledge': 'Knowledge & Values',
    'nav.volunteers': 'Volunteers',
    'nav.businesses': 'Businesses',
    'nav.moderation': 'Moderation Center',
    'nav.audit': 'Audit Logs',
    'nav.profile': 'My Account',

    // Search
    'search.placeholder': 'Search services, meals, events...',
    'search.results_for': 'Search results for',
    'search.no_results': 'No matching results found in this scope.',

    // Notifications & Auth
    'notif.title': 'Notifications',
    'notif.mark_all_read': 'Mark all as read',
    'notif.empty': 'No notifications currently',
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.logout': 'Sign Out',
    'auth.welcome_back': 'Welcome Back',
    'auth.portal_desc': 'Access your Al-Husseiniya portal account for community coordination',
    'field.email': 'Email Address',
    'field.password': 'Password',

    // Statuses
    'status.active': 'Active',
    'status.pending': 'Pending Review',
    'status.verified': 'Verified Partner',
    'status.unverified': 'Unverified',
    'status.open': 'Open Now',
    'status.full': 'Fully Booked',
    'status.limited': 'Limited Spots',
    'status.closed': 'Completed',

    // Home Page
    'home.eyebrow': 'AL-HUSSEINIYA COMMUNITY • YEAR-ROUND DIGNITY & SERVICE',
    'home.hero.title': 'Help is closer than you think.',
    'home.hero.desc':
      'From community meals and humanitarian relief to volunteering and events, we connect people with trusted services that make a real difference — all year round, inspired by the enduring values of Karbala.',
    'home.cta.need_help': 'I Need Help',
    'home.cta.want_help': 'I Want to Help',
    'home.cta.explore_meals': 'Explore Meals',
    'home.pathways.title': 'How can we serve you today?',
    'home.pathways.subtitle': 'Choose a pathway to discover verified services or participate in the community.',
    'home.pathway.help.title': 'Request Help',
    'home.pathway.help.desc': 'Confidential family relief, emergency food, medical supplies, and living support.',
    'home.pathway.meals.title': 'Community Meals',
    'home.pathway.meals.desc': 'Fresh, hot meals distributed daily free of charge across community centers.',
    'home.pathway.volunteer.title': 'Volunteer Time',
    'home.pathway.volunteer.desc': 'Lend your time, logistics support, or medical care to community initiatives.',
    'home.pathway.business.title': 'Business Partners',
    'home.pathway.business.desc': 'Local merchants and caterers pledging surplus food and sponsorship.',
    'home.pathway.organizations.title': 'Organizations',
    'home.pathway.organizations.desc': 'Explore verified Hussainiyas and charitable relief foundations.',
    'home.meals.title': 'Community Meals Near You',
    'home.meals.remaining': 'meals remaining today',
    'home.meals.details': 'Details & Directions',
    'home.events.title': 'Community Gatherings & Events',
    'home.events.all': 'All Events',
    'home.knowledge.title': 'Values & Knowledge from Karbala',
    'home.knowledge.all': 'Knowledge Library',
    'home.impact.eyebrow': 'Our Impact Together',
    'home.impact.title': 'Every meal and service is more than a number — it is human dignity.',
    'home.impact.desc': 'We document verified humanitarian impact with full transparency to ensure ongoing trust.',
    'home.impact.meals': 'Hot Meals Distributed',
    'home.impact.requests': 'Relief Requests Fulfilled',
    'home.impact.orgs': 'Verified Organizations',
    'home.impact.volunteers': 'Mobilized Volunteers',
    'home.scope.title': 'Platform Role & Administrative Scope',
    'home.scope.desc':
      'Al-Husseiniya provides technical and operational infrastructure for community coordination. The platform does not independently issue religious rulings (fatwas). Verified scholars publish under their own named credentials.',

    // Humanitarian Requests
    'requests.title': 'Find Help & Relief Assistance',
    'requests.subtitle': 'A safe, dignified space to request essential support from verified community organizations.',
    'requests.new_btn': 'Request Assistance',
    'requests.privacy_banner':
      'Privacy Assured: Your request details are strictly confidential, shared only with authorized coordinators.',
    'requests.step1': 'What kind of support is needed?',
    'requests.step2': 'Tell us a little more about the situation',
    'requests.step3': 'Where can responders reach you?',
    'requests.step4': 'Review and confirm your request',
    'requests.success_title': 'Your request has been received with dignity',
    'requests.success_desc':
      'A verified coordinator will discreetly review your needs and dispatch assistance as soon as matched.',
    'requests.summary_label': 'Request Summary / Core Need',
    'requests.details_label': 'Description and Pertinent Details',
    'requests.location_label': 'Location / General Neighborhood',
    'requests.private_checkbox': 'Keep this request confidential (Recommended)',

    // Food Programs
    'food.hero.eyebrow': 'Nutrition & Nourishment',
    'food.hero.title': 'Food should never be out of reach.',
    'food.hero.desc': 'Fresh, hot meals distributed daily by verified community kitchens with complete dignity and warmth.',
    'food.schedule_btn': 'Schedule Meal Distribution',
    'food.reserve_btn': 'Reserve Meal Kit',
    'food.serving_time': 'Serving Schedule',
    'food.pickup_notes': 'Pickup Instructions',
    'food.remaining_count': 'meals remaining today',

    // Organizations
    'orgs.title': 'Organizations Serving the Community',
    'orgs.subtitle': 'Verified Hussainiyas, relief funds, and civil society partners mobilizing humanitarian aid.',
    'orgs.register_btn': 'Register Organization',
    'orgs.filter_verified': 'Show Verified Partners Only',
    'orgs.details_btn': 'View Programs & Impact',

    // Events
    'events.title': 'Community Events & Mobilization',
    'events.subtitle': 'Volunteer orientations, educational workshops, logistics meetings, and communal gatherings.',
    'events.schedule_btn': 'Schedule Community Event',
    'events.register_btn': 'Register for Event',
    'events.registered_badge': 'Registration Confirmed',
    'events.cancel_reg': 'Cancel Registration',
    'events.my_registrations': 'My Registrations',
    'events.upcoming_tab': 'Upcoming Events',

    // Knowledge
    'knowledge.title': 'Knowledge & Cultural Library',
    'knowledge.subtitle': 'Educational articles, community guidance, and historical reflections inspired by Karbala.',
    'knowledge.write_btn': 'Write Article',
    'knowledge.apply_contributor': 'Become a Contributor',
    'knowledge.read_btn': 'Read Article',
    'knowledge.editorial_tab': 'Editorial Review Queue',
    'knowledge.contributor_tab': 'Contributor Portal',
    'knowledge.public_tab': 'Public Articles',

    // Volunteers
    'volunteers.title': 'Make Your Time an Impact',
    'volunteers.subtitle': 'Discover authentic opportunities to serve your community with dignity.',
    'volunteers.apply_btn': 'Apply for Opportunity',
    'volunteers.profile_btn': 'Volunteer Profile',
    'volunteers.opportunities_tab': 'Available Opportunities',
    'volunteers.my_apps_tab': 'My Applications',

    // Businesses
    'businesses.title': 'Businesses Can Serve Too',
    'businesses.subtitle': 'Local merchants and caterers pledging surplus food, sponsorships, and services.',
    'businesses.register_btn': 'Register Business Profile',
    'businesses.pledge_btn': 'Pledge Community Support',

    // Moderation
    'moderation.title': 'Trust, Safety & Moderation Center',
    'moderation.subtitle': 'Review reported concerns, safety violations, or disputed entity registrations.',
    'moderation.pending_tab': 'Pending Review Queue',
    'moderation.resolved_tab': 'Resolved Archive',

    // Audit
    'audit.title': 'System Audit & Compliance Logs',
    'audit.subtitle': 'Immutable operational journal recording administrative decisions, verifications, and permission updates.',
    'audit.entity_filter': 'Entity Filter:',
    'audit.total_records': 'Total Audit Records:',
    'audit.action_code': 'Action Code',
    'audit.entity_type': 'Entity Type',
    'audit.entity_id': 'Entity ID',
    'audit.actor': 'Actor',
    'audit.ip': 'IP Address',
    'audit.time': 'Recorded Time',

    // Additional Detail Keys
    'orgs.search_placeholder': 'Search organizations by name or city...',
    'orgs.impact_title': 'Community Outcomes & Verified Impact',
    'orgs.active_programs_title': 'Active Food Programs',
    'orgs.no_orgs': 'No organizations found matching your criteria.',
    'orgs.verify_btn': 'Verify Org',
    'events.search_placeholder': 'Search events...',
    'events.spots_left': 'spots remaining',
    'events.no_events': 'No upcoming events at this time.',
    'events.format_all': 'All Formats',
    'events.format_onsite': 'On-site',
    'events.format_online': 'Online',
    'events.format_hybrid': 'Hybrid',
    'events.cat_all': 'All Categories',
    'events.cat_gathering': 'Community Gathering',
    'events.cat_workshop': 'Workshop / Seminar',
    'events.cat_orientation': 'Volunteer Orientation',
    'events.cat_fundraiser': 'Fundraiser / Relief',
    'events.cat_logistics': 'Logistics Meeting',

    // Common
    'common.filter': 'Filter:',
    'common.category': 'Category:',
    'common.status': 'Status:',
    'common.all': 'All',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ARABIC IS THE PRIMARY DEFAULT (as specified in Section 9 & 10)
  const [locale, setLocaleState] = useState<SupportedLocale>('ar');

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    localStorage.setItem('preferred_locale', loc);
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = loc;
  };

  useEffect(() => {
    const saved = localStorage.getItem('preferred_locale') as SupportedLocale;
    if (saved === 'en' || saved === 'ar') {
      setLocale(saved);
    } else {
      // Default to Arabic-first with dir="rtl"
      setLocale('ar');
    }
  }, []);

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations['ar']?.[key] || translations['en']?.[key] || key;
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

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationContext;
