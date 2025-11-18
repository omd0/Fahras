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
  'My Advising Projects': 'مشاريعي الاستشارية',
  'Archive/Add Project': 'أرشيف / إضافة مشروع',
  'Create New Project': 'إنشاء مشروع جديد',
  'Manage and filter your advising projects': 'إدارة وتصفية مشاريعك الاستشارية',
  'Administrative project management': 'إدارة المشاريع الإدارية',
  'All Projects': 'جميع المشاريع',
  'View All': 'عرض الكل',
  'No projects available yet.': 'لا توجد مشاريع متاحة بعد.',
  'No advising projects yet. You will see projects here once students add you as their advisor.': 'لا توجد مشاريع استشارية بعد. ستظهر المشاريع هنا بمجرد إضافة الطلاب لك كمشرف.',
  project: 'مشروع',
  projects: 'مشاريع',
  'Fahras Dashboard': 'لوحة تحكم فهرس',
  'Project Approvals': 'موافقات المشاريع',
  Profile: 'الملف الشخصي',
  Welcome: 'مرحبًا',
  'Welcome to Fahras': 'مرحبًا بك في فهرس',
  'Welcome back': 'مرحبًا بعودتك',
  'Ready to build something amazing? Let\'s explore your projects and create new innovations.': 'مستعد لبناء شيء رائع؟ دعنا نستكشف مشاريعك ونبتكر أشياء جديدة.',
  'Leadership insights with filters for specialization and year': 'رؤى قيادية مع عوامل تصفية للتخصص والسنة',
  'View Analytics': 'عرض التحليلات',
  'Project Analytics': 'تحليلات المشاريع',
  'Total Projects': 'إجمالي المشاريع',
  'Across all programs': 'عبر جميع البرامج',
  'Recent Activity': 'النشاط الأخير',
  'Last 30 days': 'آخر 30 يومًا',
  Departments: 'الأقسام',
  'Active departments': 'الأقسام النشطة',
  'Academic Years': 'السنوات الأكاديمية',
  'Years tracked': 'السنوات المتتبعة',
  'Advanced Analytics & Filtering': 'التحليلات المتقدمة والتصفية',
  'Filter and analyze projects by program, academic year, and other criteria': 'تصفية وتحليل المشاريع حسب البرنامج والسنة الأكاديمية ومعايير أخرى',
  'Filter Options': 'خيارات التصفية',
  'Loading programs...': 'جاري تحميل البرامج...',
  'No programs available': 'لا توجد برامج متاحة',
  'No academic years available': 'لا توجد سنوات أكاديمية متاحة',
  'Clear Filters': 'مسح عوامل التصفية',
  'Selected Program & Specializations': 'البرنامج المحدد والتخصصات',
  'Program:': 'البرنامج:',
  'Department:': 'القسم:',
  'Specialization:': 'التخصص:',
  'Available specializations for this program': 'التخصصات المتاحة لهذا البرنامج',
  'Related Specializations in': 'التخصصات ذات الصلة في',
  'Filtered Projects': 'المشاريع المصفاة',
  'Selected Program': 'البرنامج المحدد',
  'No projects found for the selected filters.': 'لم يتم العثور على مشاريع لعوامل التصفية المحددة.',
  'Select a program or academic year to view filtered projects': 'حدد برنامجًا أو سنة أكاديمية لعرض المشاريع المصفاة',
  'Use the filters above to explore projects by specialization and year': 'استخدم عوامل التصفية أعلاه لاستكشاف المشاريع حسب التخصص والسنة',
  'Project Status Distribution': 'توزيع حالة المشاريع',
  'Projects by Department': 'المشاريع حسب القسم',
  'Projects by Academic Year': 'المشاريع حسب السنة الأكاديمية',
  'Monthly Project Creation Trend': 'اتجاه إنشاء المشاريع الشهري',
  'View Project': 'عرض المشروع',
  'Explore all available graduation projects': 'استكشف جميع مشاريع التخرج المتاحة',
  files: 'ملفات',
  file: 'ملف',
  members: 'أعضاء',
  member: 'عضو',
  ratings: 'تقييمات',
  rating: 'تقييم',
  more: 'المزيد',
  'View Comments': 'عرض التعليقات',
  'Like Project': 'إعجاب بالمشروع',
  'Share Project': 'مشاركة المشروع',
  'We couldn\'t find any projects matching your search criteria. Try adjusting your filters to discover more amazing projects!': 'لم نتمكن من العثور على أي مشاريع تطابق معايير البحث الخاصة بك. جرب تعديل عوامل التصفية لاكتشاف المزيد من المشاريع الرائعة!',
  'Clear All Filters': 'مسح جميع عوامل التصفية',
  'No projects available yet': 'لا توجد مشاريع متاحة بعد',
  'Check back later to discover amazing graduation projects from TVTC students! We\'re constantly adding new innovative projects to explore.': 'تحقق لاحقًا لاكتشاف مشاريع تخرج رائعة من طلاب المؤسسة العامة للتدريب التقني والمهني! نضيف باستمرار مشاريع مبتكرة جديدة للاستكشاف.',
  'Refresh Page': 'تحديث الصفحة',
  Bytes: 'بايت',
  KB: 'كيلوبايت',
  MB: 'ميجابايت',
  GB: 'جيجابايت',
  'Total Advising Projects': 'إجمالي المشاريع الاستشارية',
  "Projects you're advising": 'المشاريع التي تشرف عليها',
  'Under Review': 'قيد المراجعة',
  'Projects in review': 'المشاريع قيد المراجعة',
  'Successfully completed': 'مكتمل بنجاح',
  'This Month': 'هذا الشهر',
  'New this month': 'جديد هذا الشهر',
  'Advisor Projects': 'مشاريع المستشارين',
  'My Projects': 'مشاريعي',
  'In Progress': 'قيد التنفيذ',
  'Pending Approval': 'في انتظار الموافقة',
  'Recent Activity': 'النشاط الأخير',
  'Stay updated with your projects': 'ابق على اطلاع بمشاريعك',
  Live: 'مباشر',
  'Loading notifications...': 'جاري تحميل الإشعارات...',
  'View All Notifications': 'عرض جميع الإشعارات',
  'No recent activity': 'لا يوجد نشاط حديث',
  "You're all caught up! Check back later for updates.": 'أنت محدث بالكامل! تحقق لاحقًا للحصول على التحديثات.',
  'Ready to Build Something Amazing?': 'مستعد لبناء شيء رائع؟',
  'Create a new graduation project and start documenting your work. Share your innovations with the TVTC community and make your mark in technology.': 'أنشئ مشروع تخرج جديد وابدأ توثيق عملك. شارك ابتكاراتك مع مجتمع المؤسسة العامة للتدريب التقني والمهني واترك بصمتك في التكنولوجيا.',
  'Innovation Ready': 'جاهز للابتكار',
  'Community Driven': 'مدفوع بالمجتمع',
  'Excellence Focused': 'مركز على التميز',
  'Smart Project Discovery': 'اكتشاف المشاريع الذكي',
  'Showing': 'عرض',
  projects: 'مشاريع',
  'Community Projects': 'مشاريع المجتمع',
  'Discover innovative projects from fellow students': 'اكتشف مشاريع مبتكرة من زملائك الطلاب',
  'View All Projects': 'عرض جميع المشاريع',
  'No matching projects found': 'لم يتم العثور على مشاريع مطابقة',
  'Try adjusting your search filters to discover more projects from the community.': 'جرب تعديل عوامل تصفية البحث لاكتشاف المزيد من المشاريع من المجتمع.',
  'No community projects yet': 'لا توجد مشاريع مجتمعية بعد',
  "Be the first to create a project and inspire others in the community!": 'كن أول من ينشئ مشروعًا ويلهم الآخرين في المجتمع!',
  'Clear Filters': 'مسح عوامل التصفية',
  'Create First Project': 'إنشاء المشروع الأول',
  'No projects yet': 'لا توجد مشاريع بعد',
  'Create your first graduation project to get started on your journey of innovation and learning.': 'أنشئ مشروع التخرج الأول الخاص بك للبدء في رحلة الابتكار والتعلم.',
  'Create Your First Project': 'أنشئ مشروعك الأول',
  'Edit Project': 'تعديل المشروع',
  Progress: 'التقدم',
  'Search projects...': 'البحث في المشاريع...',
  'Search & Filter Options': 'خيارات البحث والتصفية',
  'All Statuses': 'جميع الحالات',
  'Date Created': 'تاريخ الإنشاء',
  Clear: 'مسح',
  'Advising Projects': 'المشاريع الاستشارية',
  'No projects match your current filters.': 'لا توجد مشاريع تطابق عوامل التصفية الحالية.',
  'Project Members': 'أعضاء المشروع',
  'Select or Type Member Name': 'حدد أو اكتب اسم العضو',
  Role: 'الدور',
  Member: 'عضو',
  'Project Files (Optional)': 'ملفات المشروع (اختياري)',
  'Upload Files': 'رفع الملفات',
  'Selected Files': 'الملفات المحددة',
  'Unknown': 'غير معروف',
  'No abstract available': 'لا يوجد ملخص متاح',
  views: 'مشاهدات',
  'Discover and explore innovative graduation projects from students across TVTC programs': 'اكتشف واستكشف مشاريع تخرج مبتكرة من الطلاب في جميع برامج المؤسسة العامة للتدريب التقني والمهني',
  'Submit a Project': 'تقديم مشروع',
  'Recent Projects': 'المشاريع الأخيرة',
  'Explore the latest graduation projects from our talented students': 'استكشف أحدث مشاريع التخرج من طلابنا الموهوبين',
  'Show More Projects': 'عرض المزيد من المشاريع',
  'No projects available yet': 'لا توجد مشاريع متاحة بعد',
  "Be the first to submit a project!": 'كن أول من يقدم مشروعًا!',
  'Ready to Share Your Work?': 'مستعد لمشاركة عملك؟',
  'Join TVTC\'s growing community of innovators. Submit your graduation project and showcase your achievements to the world.': 'انضم إلى مجتمع المبتكرين المتنامي في المؤسسة العامة للتدريب التقني والمهني. قدم مشروع التخرج الخاص بك واعرض إنجازاتك للعالم.',
  'Submit Your Project': 'قدم مشروعك',
  'Get Started - Register Now': 'ابدأ - سجل الآن',
  'Unknown Author': 'مؤلف غير معروف',
  'in your portfolio': 'في محفظتك',
  'Loading your dashboard...': 'جاري تحميل لوحة التحكم...',
  'View Analytics': 'عرض التحليلات',
  'Total': 'الإجمالي',
  'with advanced search and sorting': 'مع بحث وفرز متقدم',
  Submitted: 'مقدم',
  Repository: 'المستودع',
  Register: 'التسجيل',
  'Project Files': 'ملفات المشروع',
  'files available': 'ملفات متاحة',
  'No files uploaded yet': 'لم يتم رفع أي ملفات بعد',
  'Files uploaded during project creation will appear here': 'ستظهر الملفات التي تم رفعها أثناء إنشاء المشروع هنا',
  Public: 'عام',
  'Project Abstract': 'ملخص المشروع',
  'Admin Notes': 'ملاحظات المسؤول',
  Hidden: 'مخفي',
  'Project Team': 'فريق المشروع',
  Lead: 'قائد',
  Add: 'إضافة',
  'Administrator Dashboard': 'لوحة تحكم المسؤول',
  'Manage projects, users, and system settings': 'إدارة المشاريع والمستخدمين وإعدادات النظام',
  'Supervise and evaluate student projects': 'الإشراف على مشاريع الطلاب وتقييمها',
  'Create and manage your graduation projects': 'إنشاء مشاريع التخرج وإدارتها',
  'Reviewer Dashboard': 'لوحة تحكم المقيّم',
  'Review and evaluate project submissions': 'مراجعة وتقييم مشاريع الطلاب',
  'Project Management System': 'نظام إدارة المشاريع',
  'Edit User': 'تعديل المستخدم',
  'Deactivate': 'تعطيل',
  Activate: 'تفعيل',
  'Delete User': 'حذف المستخدم',
  Remarks: 'ملاحظات',
  'Confirm Delete': 'تأكيد الحذف',
  'Are you sure you want to delete this project?': 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟',
  'This action cannot be undone.': 'لا يمكن التراجع عن هذا الإجراء.',
  'Back to Dashboard': 'العودة إلى لوحة التحكم',
  'This project is not available for viewing.': 'هذا المشروع غير متاح للعرض.',
  available: 'متاح',
  'Student Dashboard': 'لوحة تحكم الطالب',
  'Faculty Dashboard': 'لوحة تحكم عضو هيئة التدريس',
  'Project not found': 'المشروع غير موجود',
  'Add keyword': 'إضافة كلمة مفتاحية',
  'Add Keyword': 'إضافة كلمة مفتاحية',
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
