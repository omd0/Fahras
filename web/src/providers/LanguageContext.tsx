import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { normalizeText, reverseTranslationMap, translationMap } from '@/i18n/translations';

export type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (text: string, replacements?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'fahras.language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const SKIP_TRANSLATION_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'CODE',
  'PRE',
]);

const applyReplacements = (text: string, replacements?: Record<string, string | number>) => {
  if (!replacements) {
    return text;
  }

  return Object.entries(replacements).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{${key}}`, 'g');
    return acc.replace(pattern, String(value));
  }, text);
};

interface LanguageProviderProps {
  children: ReactNode;
}

const applyDocumentTranslations = (targetLanguage: Language) => {
  if (typeof document === 'undefined') {
    return;
  }

  const map = targetLanguage === 'ar' ? translationMap : reverseTranslationMap;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node || !node.nodeValue) {
      continue;
    }

    const parentElement = node.parentElement;
    if (parentElement && SKIP_TRANSLATION_TAGS.has(parentElement.tagName)) {
      continue;
    }

    const normalized = normalizeText(node.nodeValue);
    if (!normalized) {
      continue;
    }

    const translation = map[normalized];
    if (translation && translation !== node.nodeValue) {
      nodes.push(node);
    }
  }

  nodes.forEach(node => {
    const normalized = normalizeText(node.nodeValue ?? '');
    if (!normalized) {
      return;
    }
    const translation = map[normalized];
    if (translation && node.nodeValue !== translation) {
      node.nodeValue = translation;
    }
  });
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'ar' ? 'ar' : 'en';
  });

  // Enable RTL on all pages when Arabic is selected
  const direction: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newLanguage);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('dir', direction);
    document.body.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [direction, language]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    let rafId: number | null = null;

    const scheduleTranslation = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => applyDocumentTranslations(language));
    };

    scheduleTranslation();

    if (language === 'ar') {
      const observer = new MutationObserver(() => scheduleTranslation());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }
        observer.disconnect();
      };
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [language]);

  const translate = useCallback(
    (text: string, replacements?: Record<string, string | number>) => {
      if (!text) {
        return text;
      }

      const fallback = applyReplacements(text, replacements);

      if (language === 'en') {
        return fallback;
      }

      const normalized = normalizeText(text);
      const translation = translationMap[normalized];

      if (!translation) {
        return fallback;
      }

      return applyReplacements(translation, replacements);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      toggleLanguage,
      t: translate,
    }),
    [direction, language, setLanguage, toggleLanguage, translate],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};


