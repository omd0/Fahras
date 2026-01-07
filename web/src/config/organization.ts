/**
 * Organization Configuration Loader
 * Loads and provides access to organization-config.yml
 */

import type { OrganizationConfig } from '../types/organization-config';

// Initialize with default config immediately for synchronous access
// This ensures the app works even if YAML loading fails
let orgConfig: OrganizationConfig = getDefaultConfig();

/**
 * Load organization configuration
 * In development, this loads from the YAML file
 * In production, this could load from a static JSON file or API
 * This is async and runs in the background - the default config is always available
 */
export async function loadOrganizationConfig(): Promise<OrganizationConfig> {
  try {
    // Try to load from YAML file (requires js-yaml)
    // Note: YAML loading is optional - if js-yaml is not installed, we use defaults
    if (import.meta.env.DEV) {
      try {
        const yaml = await import('js-yaml');
        const response = await fetch('/organization-config.yml');
        if (response.ok) {
          const yamlText = await response.text();
          const loadedConfig = yaml.load(yamlText) as OrganizationConfig;
            // Only update if we successfully loaded valid config
            if (loadedConfig && loadedConfig.project && loadedConfig.organization) {
              orgConfig = loadedConfig;
            }
          }
      } catch (yamlError) {
        // Silently fall back to default config if YAML loading fails
        console.debug('Using default organization config (YAML not available)');
      }
    } else {
      // In production, use static config or fetch from API
      // For now, use hardcoded fallback that matches the YAML structure
      orgConfig = getDefaultConfig();
    }
  } catch (error) {
    // Silently use default config on any error
    console.debug('Using default organization config:', error);
  }

  return orgConfig;
}

/**
 * Get organization configuration (synchronous)
 * Always returns a valid config - uses default if YAML hasn't loaded yet
 */
export function getOrganizationConfig(): OrganizationConfig {
  return orgConfig;
}

/**
 * Default configuration (fallback)
 * This matches the structure in organization-config.yml
 */
function getDefaultConfig(): OrganizationConfig {
  return {
    organization: {
      name: 'Fahras-Org',
      display_name: {
        en: 'Fahras Organization',
        ar: 'منظمة فهرس',
      },
      description: {
        en: 'Fahras Project Organization',
        ar: 'منظمة مشروع الفهرس',
      },
      slug: 'fahras-org',
      parent_organization: {
        name: 'TVTC',
        display_name: {
          en: 'Technical and Vocational Training Corporation',
          ar: 'المؤسسة العامة للتدريب التقني والمهني',
        },
        abbreviation: 'TVTC',
        website: 'https://www.tvtc.gov.sa',
        logo_path: '/assets/logos/tvtc-logo.svg',
      },
    },
    project: {
      name: 'Fahras',
      display_name: {
        en: 'Fahras',
        ar: 'فهرس',
      },
      description: {
        en: 'Project Management System',
        ar: 'نظام إدارة المشاريع',
      },
      full_description: {
        en: 'Fahras - A comprehensive project management system for technical and vocational training projects',
        ar: 'فهرس - نظام شامل لإدارة مشاريع التدريب التقني والمهني',
      },
      version: '1.0.0',
      repository_prefix: 'fahras',
      repositories: {
        api: {
          name: 'fahras-api',
          display_name: 'Fahras API',
          description: 'Laravel Backend API',
          type: 'backend',
        },
        web: {
          name: 'fahras-web',
          display_name: 'Fahras Web',
          description: 'React Frontend Application',
          type: 'frontend',
        },
        docs: {
          name: 'fahras-docs',
          display_name: 'Fahras Documentation',
          description: 'Project Documentation',
          type: 'documentation',
        },
      },
    },
    branding: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        accent: '#00acc1',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
      },
      logos: {
        organization: {
          path: '/assets/logos/fahras-org-logo.svg',
          alt: 'Fahras Organization Logo',
        },
        project: {
          path: '/assets/logos/fahras-logo.svg',
          alt: 'Fahras Project Logo',
        },
        favicon: {
          path: '/assets/logos/fahras-favicon.ico',
          sizes: ['16x16', '32x32', '48x48'],
        },
      },
      typography: {
        font_family: {
          primary: 'Roboto, Arial, sans-serif',
          arabic: 'Cairo, Arial, sans-serif',
        },
        font_sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.25rem',
          xl: '1.5rem',
          xxl: '2rem',
        },
      },
    },
    contact: {
      email: {
        support: 'support@fahras.org',
        info: 'info@fahras.org',
        admin: 'admin@fahras.org',
      },
      phone: {
        primary: '+966-XX-XXX-XXXX',
        support: '+966-XX-XXX-XXXX',
      },
      address: {
        en: 'Technical and Vocational Training Corporation, Riyadh, Saudi Arabia',
        ar: 'المؤسسة العامة للتدريب التقني والمهني، الرياض، المملكة العربية السعودية',
      },
    },
    urls: {
      app: {
        production: 'https://fahras.tvtc.gov.sa',
        staging: 'https://staging.fahras.tvtc.gov.sa',
        development: 'http://localhost:5173',
      },
      api: {
        production: 'https://api.fahras.tvtc.gov.sa',
        staging: 'https://api-staging.fahras.tvtc.gov.sa',
        development: 'http://localhost:8000',
      },
      forgejo: {
        production: 'https://forgejo.fahras.tvtc.gov.sa',
        development: 'http://localhost:3000',
        organization: 'https://forgejo.fahras.tvtc.gov.sa/fahras-org',
      },
      documentation: 'https://docs.fahras.tvtc.gov.sa',
      social: {
        twitter: '',
        linkedin: '',
        github: 'https://forgejo.fahras.tvtc.gov.sa/fahras-org',
      },
    },
    cicd: {
      forgejo: {
        organization: 'fahras-org',
        runner_token_env: 'FORGEJO_RUNNER_TOKEN',
        workflows_path: '.forgejo/workflows',
      },
      registry: {
        url: 'forgejo.fahras.tvtc.gov.sa:3000',
        namespace: 'fahras-org',
        images: {
          api: 'fahras-org/fahras-api',
          web: 'fahras-org/fahras-web',
        },
      },
      build: {
        node_version: '20',
        php_version: '8.2',
        composer_version: 'latest',
      },
    },
    app: {
      name: 'Fahras',
      name_full: 'Fahras Project Management System',
      locale: {
        default: 'en',
        fallback: 'en',
        supported: ['en', 'ar'],
        rtl_languages: ['ar'],
      },
      timezone: 'Asia/Riyadh',
      email: {
        from_address: 'noreply@fahras.tvtc.gov.sa',
        from_name: 'Fahras System',
        reply_to: 'support@fahras.org',
      },
    },
    legal: {
      copyright: {
        year: '2024',
        holder: 'Technical and Vocational Training Corporation',
        text: '© 2024 Technical and Vocational Training Corporation. All rights reserved.',
      },
      license: {
        type: 'Proprietary',
        description: 'Internal use only - TVTC',
      },
      privacy_policy_url: '/privacy-policy',
      terms_of_service_url: '/terms-of-service',
    },
    metadata: {
      seo: {
        title: {
          en: 'Fahras - Project Management System',
          ar: 'فهرس - نظام إدارة المشاريع',
        },
        description: {
          en: 'Comprehensive project management system for technical and vocational training projects',
          ar: 'نظام شامل لإدارة مشاريع التدريب التقني والمهني',
        },
        keywords: {
          en: ['project management', 'TVTC', 'training', 'education', 'Saudi Arabia'],
          ar: ['إدارة المشاريع', 'التدريب التقني', 'التعليم', 'السعودية'],
        },
      },
      open_graph: {
        type: 'website',
        site_name: 'Fahras',
        image: '/assets/og-image.png',
      },
      manifest: {
        name: 'Fahras Project Management System',
        short_name: 'Fahras',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
      },
    },
    features: {
      forgejo_integration: true,
      ci_cd_enabled: true,
      container_registry: true,
      multi_language: true,
      rtl_support: true,
    },
  };
}

// Export convenience getters
export const getOrgName = (locale: 'en' | 'ar' = 'en') => 
  getOrganizationConfig().organization.display_name[locale];

export const getAppName = (locale: 'en' | 'ar' = 'en') => 
  getOrganizationConfig().project.display_name[locale];

export const getProjectDescription = (locale: 'en' | 'ar' = 'en') => 
  getOrganizationConfig().project.description[locale];

export const getTVTCDisplayName = (locale: 'en' | 'ar' = 'en') => 
  getOrganizationConfig().organization.parent_organization.display_name[locale];

export const getCopyrightText = () => 
  getOrganizationConfig().legal.copyright.text;

// Initialize config on module load (loads YAML in background if available)
// The default config is already set, so this is non-blocking
if (typeof window !== 'undefined') {
  // Load YAML config in background (non-blocking)
  loadOrganizationConfig().catch(() => {
    // Silently fail - default config is already set
  });
}

