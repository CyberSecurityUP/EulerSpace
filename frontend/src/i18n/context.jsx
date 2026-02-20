import { createContext, useContext, useState, useCallback } from 'react';

const I18nContext = createContext();

const SUPPORTED_LANGS = ['en', 'pt', 'es'];
const DEFAULT_LANG = 'en';

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

export function I18nProvider({ children, translations }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('euler-lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    const browser = navigator.language?.slice(0, 2);
    if (SUPPORTED_LANGS.includes(browser)) return browser;
    return DEFAULT_LANG;
  });

  const changeLang = useCallback((newLang) => {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLang(newLang);
      localStorage.setItem('euler-lang', newLang);
    }
  }, []);

  const t = useCallback((key, params) => {
    const langData = translations[lang] || translations[DEFAULT_LANG];
    let value = getNestedValue(langData, key);
    if (value === null) {
      value = getNestedValue(translations[DEFAULT_LANG], key);
    }
    if (value === null) return key;
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  }, [lang, translations]);

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t, SUPPORTED_LANGS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export const LANG_META = {
  en: { label: 'English', flag: '🇺🇸' },
  pt: { label: 'Português', flag: '🇧🇷' },
  es: { label: 'Español', flag: '🇪🇸' },
};
