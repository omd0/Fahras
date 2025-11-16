export const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

export const languageOptions = [
  { code: 'en' as const, labelEn: 'English', labelAr: 'الإنجليزية' },
  { code: 'ar' as const, labelEn: 'Arabic', labelAr: 'العربية' },
];

export type LanguageOptionCode = (typeof languageOptions)[number]['code'];

export const translationMap: Record<string, string> = {
  English: 'الإنجليزية',
  Arabic: 'العربية',
  Language: 'اللغة',
  Login: 'تسجيل الدخول',
  'Sign In': 'تسجيل الدخول',
  'Signing In...': 'جاري تسجيل الدخول...',
  'Continue as Guest': 'المتابعة كضيف',
  'Create Account': 'إنشاء حساب',
  'Forgot Password?': 'هل نسيت كلمة المرور؟',
  'Forgot password functionality will be implemented soon!':
    'سيتم تنفيذ ميزة استعادة كلمة المرور قريبًا!',
  'Full name is required': 'الاسم الكامل مطلوب',
  'Invalid email domain.': 'نطاق البريد الإلكتروني غير صالح.',
  'Password must be at least 8 characters': 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
  'Password confirmation is required': 'تأكيد كلمة المرور مطلوب',
  'Passwords do not match': 'كلمتا المرور غير متطابقتين',
  'Join Fahras to start your academic project journey':
    'انضم إلى فهرس لبدء رحلتك الأكاديمية في المشاريع',
  'Full Name': 'الاسم الكامل',
  'Confirm Password': 'تأكيد كلمة المرور',
  'Creating Account...': 'جارٍ إنشاء الحساب...',
  'Already have an account?': 'هل لديك حساب بالفعل؟',
  'Welcome Back': 'مرحبًا بعودتك',
  'Sign in to access your projects and continue your academic journey':
    'سجّل الدخول للوصول إلى مشاريعك ومتابعة مسيرتك الأكاديمية',
  'Email Address': 'البريد الإلكتروني',
  Password: 'كلمة المرور',
  'Email is required': 'البريد الإلكتروني مطلوب',
  'Email is invalid': 'البريد الإلكتروني غير صالح',
  'Password is required': 'كلمة المرور مطلوبة',
  Fahras: 'فهرس',
  or: 'أو',
  "Don't have an account?": 'ليس لديك حساب؟',
  'Loading amazing projects...': 'جارٍ تحميل المشاريع المميزة...',
  'TVTC Project Explorer': 'مستكشف مشاريع المؤسسة العامة للتدريب التقني والمهني',
  'Explore Projects': 'استكشاف المشاريع',
  'Discover innovative student projects across TVTC programs.':
    'اكتشف المشاريع الطلابية المبتكرة في برامج المؤسسة العامة للتدريب التقني والمهني.',
  'Explore Innovation 🚀': 'استكشف الابتكار 🚀',
  'Discover groundbreaking graduation projects from TVTC students. Browse, learn, and get inspired by the next generation of innovators!':
    'اكتشف مشاريع التخرج الرائدة لطلاب المؤسسة العامة للتدريب التقني والمهني. تصفح وتعلم واستلهم من الجيل الجديد من المبتكرين!',
  'Smart Project Discovery': 'اكتشاف المشاريع الذكي',
  'Find projects that match your interests and expertise': 'اعثر على المشاريع التي تتوافق مع اهتماماتك وخبراتك',
  'Search by project name, title, or keywords...': 'ابحث باسم المشروع أو عنوانه أو الكلمات المفتاحية...',
  Filters: 'عوامل التصفية',
  Search: 'بحث',
  Fall: 'الفصل الأول',
  Spring: 'الفصل الثاني',
  Summer: 'الفصل الصيفي',
  'Date Created': 'تاريخ الإنشاء',
  'Last Updated': 'آخر تحديث',
  Title: 'العنوان',
  'Academic Year': 'السنة الأكاديمية',
  Rating: 'التقييم',
  'Apply Filters': 'تطبيق عوامل التصفية',
  Showing: 'عرض',
  of: 'من',
  projects: 'مشاريع',
  'Clear Filters': 'مسح عوامل التصفية',
  'Top Projects ⭐': 'أفضل المشاريع ⭐',
  'Most highly rated and innovative projects': 'أعلى المشاريع تقييمًا وأكثرها ابتكارًا',
  Program: 'البرنامج',
  'All Programs': 'جميع البرامج',
  Department: 'القسم',
  'All Departments': 'جميع الأقسام',
  'All Years': 'جميع السنوات',
  Semester: 'الفصل الدراسي',
  'All Semesters': 'جميع الفصول الدراسية',
  'Sort By': 'ترتيب حسب',
  Order: 'الترتيب',
  'Newest First': 'الأحدث أولًا',
  'Oldest First': 'الأقدم أولًا',
  'Clear All': 'مسح الكل',
  Dashboard: 'لوحة التحكم',
  Projects: 'المشاريع',
  Project: 'المشروع',
  Home: 'الرئيسية',
  Explore: 'استكشاف',
  'View Details': 'عرض التفاصيل',
  Details: 'التفاصيل',
  Overview: 'نظرة عامة',
  'Team Members': 'أعضاء الفريق',
  Advisor: 'المشرف',
  Status: 'الحالة',
  Approved: 'مقبول',
  Pending: 'قيد الانتظار',
  Rejected: 'مرفوض',
  'Under Review': 'قيد المراجعة',
  Completed: 'مكتمل',
  Draft: 'مسودة',
  Submit: 'إرسال',
  Cancel: 'إلغاء',
  Save: 'حفظ',
  Edit: 'تعديل',
  Delete: 'حذف',
  Update: 'تحديث',
  Settings: 'الإعدادات',
  Profile: 'الملف الشخصي',
  Notifications: 'الإشعارات',
  Evaluations: 'التقييمات',
  Analytics: 'التحليلات',
  Approvals: 'الموافقات',
  Users: 'المستخدمون',
  'Language & Region': 'اللغة والمنطقة',
  'Search Projects': 'البحث في المشاريع',
  'No projects found': 'لم يتم العثور على مشاريع',
  'Load More': 'تحميل المزيد',
  Loading: 'جارٍ التحميل',
  Next: 'التالي',
  Previous: 'السابق',
  Page: 'الصفحة',
  Logout: 'تسجيل الخروج',
  Guest: 'ضيف',
  Faculty: 'عضو هيئة التدريس',
  Admin: 'مسؤول',
  Student: 'طالب',
  Reviewer: 'مقيّم',
  'Search Results': 'نتائج البحث',
  'View Project': 'عرض المشروع',
  Back: 'الرجوع',
  Download: 'تنزيل',
  Upload: 'رفع',
};

export const reverseTranslationMap: Record<string, string> = Object.entries(translationMap).reduce(
  (acc, [english, arabic]) => {
    if (arabic) {
      acc[normalizeText(arabic)] = english;
    }
    return acc;
  },
  {} as Record<string, string>,
);
