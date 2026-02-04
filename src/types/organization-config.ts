export interface OrganizationConfig {
  organization: {
    name: string;
    display_name: { en: string; ar: string };
    description: { en: string; ar: string };
    slug: string;
    parent_organization: {
      name: string;
      display_name: { en: string; ar: string };
      abbreviation: string;
      website: string;
      logo_path: string;
    };
  };
  project: {
    name: string;
    display_name: { en: string; ar: string };
    description: { en: string; ar: string };
    full_description: { en: string; ar: string };
    version: string;
    repository_prefix: string;
    repositories: {
      api: { name: string; display_name: string; description: string; type: string };
      web: { name: string; display_name: string; description: string; type: string };
      docs: { name: string; display_name: string; description: string; type: string };
    };
  };
  branding: {
    colors: {
      primary: string; secondary: string; accent: string;
      success: string; warning: string; error: string; info: string;
    };
    logos: {
      organization: { path: string; alt: string };
      project: { path: string; alt: string };
      favicon: { path: string; sizes: string[] };
    };
    typography: {
      font_family: { primary: string; arabic: string };
      font_sizes: { xs: string; sm: string; md: string; lg: string; xl: string; xxl: string };
    };
  };
  contact: {
    email: { support: string; info: string; admin: string };
    phone: { primary: string; support: string };
    address: { en: string; ar: string };
  };
  urls: {
    app: { production: string; staging: string; development: string };
    api: { production: string; staging: string; development: string };
    forgejo: { production: string; development: string; organization: string };
    documentation: string;
    social: { twitter: string; linkedin: string; github: string };
  };
  cicd: {
    forgejo: { organization: string; runner_token_env: string; workflows_path: string };
    registry: { url: string; namespace: string; images: { api: string; web: string } };
    build: { node_version: string; php_version: string; composer_version: string };
  };
  app: {
    name: string;
    name_full: string;
    locale: { default: string; fallback: string; supported: string[]; rtl_languages: string[] };
    timezone: string;
    email: { from_address: string; from_name: string; reply_to: string };
  };
  legal: {
    copyright: { year: string; holder: string; text: string };
    license: { type: string; description: string };
    privacy_policy_url: string;
    terms_of_service_url: string;
  };
  metadata: {
    seo: {
      title: { en: string; ar: string };
      description: { en: string; ar: string };
      keywords: { en: string[]; ar: string[] };
    };
    open_graph: { type: string; site_name: string; image: string };
    manifest: {
      name: string; short_name: string; theme_color: string;
      background_color: string; display: string; orientation: string;
    };
  };
  features: {
    forgejo_integration: boolean;
    ci_cd_enabled: boolean;
    container_registry: boolean;
    multi_language: boolean;
    rtl_support: boolean;
  };
}
