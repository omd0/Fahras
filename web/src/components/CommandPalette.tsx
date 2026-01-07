import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Bookmark as BookmarkIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/features/auth/store';
import { Box, useTheme, alpha } from '@mui/material';
import { useLanguage } from '@/providers/LanguageContext';

interface CommandItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  onSelect: () => void;
  category: string;
  categoryAr: string;
  keywords: string[];
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');

  const isArabic = language === 'ar';

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  // Check if user has required role
  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user || !user.roles) return false;
    return user.roles.some(role => allowedRoles.includes(role.name));
  };

  // Define all commands
  const allCommands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Home',
      labelAr: 'الذهاب للصفحة الرئيسية',
      icon: <HomeIcon fontSize="small" />,
      onSelect: () => { navigate('/'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['home', 'main', 'الرئيسية'],
    },
    {
      id: 'nav-explore',
      label: 'Explore Projects',
      labelAr: 'استكشاف المشاريع',
      icon: <SearchIcon fontSize="small" />,
      onSelect: () => { navigate('/explore'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['explore', 'search', 'projects', 'استكشاف', 'بحث', 'مشاريع'],
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      labelAr: 'الذهاب للوحة التحكم',
      icon: <DashboardIcon fontSize="small" />,
      onSelect: () => { navigate('/dashboard'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['dashboard', 'لوحة', 'تحكم'],
      requiresAuth: true,
    },
    {
      id: 'nav-bookmarks',
      label: 'My Bookmarks',
      labelAr: 'إشاراتي المرجعية',
      icon: <BookmarkIcon fontSize="small" />,
      onSelect: () => { navigate('/bookmarks'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['bookmarks', 'saved', 'favorites', 'إشارات', 'محفوظات'],
    },
    {
      id: 'nav-profile',
      label: 'My Profile',
      labelAr: 'ملفي الشخصي',
      icon: <PersonIcon fontSize="small" />,
      onSelect: () => { navigate('/profile'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['profile', 'account', 'ملف', 'حساب'],
      requiresAuth: true,
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      labelAr: 'الإعدادات',
      icon: <SettingsIcon fontSize="small" />,
      onSelect: () => { navigate('/settings'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['settings', 'preferences', 'إعدادات', 'تفضيلات'],
      requiresAuth: true,
    },
    {
      id: 'nav-notifications',
      label: 'Notifications',
      labelAr: 'الإشعارات',
      icon: <NotificationsIcon fontSize="small" />,
      onSelect: () => { navigate('/notifications'); onClose(); },
      category: 'Navigation',
      categoryAr: 'التنقل',
      keywords: ['notifications', 'alerts', 'إشعارات', 'تنبيهات'],
      requiresAuth: true,
    },

    // Actions
    {
      id: 'action-create-project',
      label: 'Create New Project',
      labelAr: 'إنشاء مشروع جديد',
      icon: <AddIcon fontSize="small" />,
      onSelect: () => { navigate('/pr/create'); onClose(); },
      category: 'Actions',
      categoryAr: 'الإجراءات',
      keywords: ['create', 'new', 'project', 'إنشاء', 'جديد', 'مشروع'],
      requiresAuth: true,
    },

    // Student Routes
    {
      id: 'student-my-projects',
      label: 'My Projects',
      labelAr: 'مشاريعي',
      icon: <FolderIcon fontSize="small" />,
      onSelect: () => { navigate('/student/my-projects'); onClose(); },
      category: 'Student',
      categoryAr: 'طالب',
      keywords: ['my', 'projects', 'student', 'مشاريعي', 'طالب'],
      requiresAuth: true,
      allowedRoles: ['student'],
    },

    // Faculty Routes
    {
      id: 'faculty-advisor-projects',
      label: 'Advisor Projects',
      labelAr: 'مشاريع المستشار',
      icon: <SchoolIcon fontSize="small" />,
      onSelect: () => { navigate('/advisor-projects'); onClose(); },
      category: 'Faculty',
      categoryAr: 'أعضاء هيئة التدريس',
      keywords: ['advisor', 'faculty', 'projects', 'مستشار', 'أستاذ', 'مشاريع'],
      requiresAuth: true,
      allowedRoles: ['faculty'],
    },
    {
      id: 'faculty-pending-approval',
      label: 'Pending Approvals',
      labelAr: 'الموافقات المعلقة',
      icon: <CheckCircleIcon fontSize="small" />,
      onSelect: () => { navigate('/faculty/pending-approval'); onClose(); },
      category: 'Faculty',
      categoryAr: 'أعضاء هيئة التدريس',
      keywords: ['pending', 'approval', 'faculty', 'معلق', 'موافقة', 'أستاذ'],
      requiresAuth: true,
      allowedRoles: ['faculty'],
    },
    {
      id: 'faculty-evaluations',
      label: 'Evaluations',
      labelAr: 'التقييمات',
      icon: <AssessmentIcon fontSize="small" />,
      onSelect: () => { navigate('/evaluations'); onClose(); },
      category: 'Faculty',
      categoryAr: 'أعضاء هيئة التدريس',
      keywords: ['evaluations', 'grades', 'assessment', 'تقييمات', 'درجات'],
      requiresAuth: true,
      allowedRoles: ['faculty', 'admin'],
    },

    // Admin Routes
    {
      id: 'admin-users',
      label: 'User Management',
      labelAr: 'إدارة المستخدمين',
      icon: <PeopleIcon fontSize="small" />,
      onSelect: () => { navigate('/users'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['users', 'management', 'admin', 'مستخدمين', 'إدارة'],
      requiresAuth: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'admin-approvals',
      label: 'Project Approvals',
      labelAr: 'موافقات المشاريع',
      icon: <CheckCircleIcon fontSize="small" />,
      onSelect: () => { navigate('/approvals'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['approvals', 'projects', 'admin', 'موافقات', 'مشاريع', 'إدارة'],
      requiresAuth: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'admin-projects',
      label: 'Admin Projects',
      labelAr: 'إدارة المشاريع',
      icon: <AdminIcon fontSize="small" />,
      onSelect: () => { navigate('/admin/projects'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['admin', 'projects', 'management', 'إدارة', 'مشاريع'],
      requiresAuth: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'admin-access-control',
      label: 'Access Control',
      labelAr: 'التحكم في الوصول',
      icon: <SecurityIcon fontSize="small" />,
      onSelect: () => { navigate('/admin/access-control'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['access', 'control', 'roles', 'permissions', 'وصول', 'تحكم', 'صلاحيات'],
      requiresAuth: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'admin-milestone-templates',
      label: 'Milestone Templates',
      labelAr: 'قوالب المراحل',
      icon: <BookIcon fontSize="small" />,
      onSelect: () => { navigate('/admin/milestone-templates'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['milestone', 'templates', 'admin', 'مراحل', 'قوالب', 'إدارة'],
      requiresAuth: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'admin-analytics',
      label: 'Analytics',
      labelAr: 'التحليلات',
      icon: <AssessmentIcon fontSize="small" />,
      onSelect: () => { navigate('/analytics'); onClose(); },
      category: 'Admin',
      categoryAr: 'إدارة',
      keywords: ['analytics', 'statistics', 'reports', 'تحليلات', 'إحصائيات', 'تقارير'],
      requiresAuth: true,
    },

    // Auth Actions
    {
      id: 'auth-login',
      label: 'Login',
      labelAr: 'تسجيل الدخول',
      icon: <LoginIcon fontSize="small" />,
      onSelect: () => { navigate('/login'); onClose(); },
      category: 'Account',
      categoryAr: 'الحساب',
      keywords: ['login', 'signin', 'تسجيل', 'دخول'],
      requiresAuth: false,
    },
    {
      id: 'auth-register',
      label: 'Register',
      labelAr: 'التسجيل',
      icon: <PersonAddIcon fontSize="small" />,
      onSelect: () => { navigate('/register'); onClose(); },
      category: 'Account',
      categoryAr: 'الحساب',
      keywords: ['register', 'signup', 'تسجيل', 'حساب', 'جديد'],
      requiresAuth: false,
    },
  ], [navigate, onClose]);

  // Filter commands based on auth state and roles
  const filteredCommands = useMemo(() => {
    return allCommands.filter(command => {
      // Check auth requirement
      if (command.requiresAuth && !isAuthenticated) return false;
      if (command.requiresAuth === false && isAuthenticated) return false;
      
      // Check role requirement
      if (command.allowedRoles && !hasRole(command.allowedRoles)) return false;
      
      return true;
    });
  }, [allCommands, isAuthenticated, user]);

  // Group commands by category
  const commandsByCategory = useMemo(() => {
    const categories: Record<string, CommandItem[]> = {};
    
    filteredCommands.forEach(command => {
      const categoryKey = isArabic ? command.categoryAr : command.category;
      if (!categories[categoryKey]) {
        categories[categoryKey] = [];
      }
      categories[categoryKey].push(command);
    });
    
    return categories;
  }, [filteredCommands, isArabic]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        padding: 2,
      }}
      onClick={onClose}
    >
      <CommandPrimitive
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[8],
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        value={search}
        onValueChange={setSearch}
        filter={(value, search) => {
          const command = filteredCommands.find(c => c.id === value);
          if (!command) return 0;
          
          const searchLower = search.toLowerCase();
          const label = (isArabic ? command.labelAr : command.label).toLowerCase();
          const keywords = command.keywords.join(' ').toLowerCase();
          
          if (label.includes(searchLower)) return 1;
          if (keywords.includes(searchLower)) return 0.8;
          return 0;
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            gap: 1,
          }}
        >
          <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          <CommandPrimitive.Input
            placeholder={isArabic ? 'ابحث عن أمر أو انتقل إلى...' : 'Search for a command or navigate to...'}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}
          />
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.text.secondary,
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            ESC
          </Box>
        </Box>

        <CommandPrimitive.List
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          <CommandPrimitive.Empty
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: theme.palette.text.secondary,
            }}
          >
            {isArabic ? 'لا توجد نتائج.' : 'No results found.'}
          </CommandPrimitive.Empty>

          {Object.entries(commandsByCategory).map(([category, commands]) => (
            <CommandPrimitive.Group
              key={category}
              heading={category}
              style={{
                padding: '8px',
              }}
            >
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  mb: 1,
                  px: 1,
                }}
              >
                {category}
              </Box>
              {commands.map((command) => (
                <CommandPrimitive.Item
                  key={command.id}
                  value={command.id}
                  onSelect={command.onSelect}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    color: theme.palette.text.primary,
                  }}
                  className="command-item"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.primary.main,
                    }}
                  >
                    {command.icon}
                  </Box>
                  <span style={{ flex: 1 }}>
                    {isArabic ? command.labelAr : command.label}
                  </span>
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.Group>
          ))}
        </CommandPrimitive.List>
      </CommandPrimitive>

      <style>{`
        .command-item[data-selected="true"] {
          background-color: ${alpha(theme.palette.primary.main, 0.1)};
        }
        .command-item:hover {
          background-color: ${alpha(theme.palette.primary.main, 0.08)};
        }
      `}</style>
    </Box>
  );
};
