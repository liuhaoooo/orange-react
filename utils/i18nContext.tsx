
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './locales/en';
import { cn } from './locales/cn';
import { fr } from './locales/fr';
import { ar } from './locales/ar';
import { el } from './locales/el';

type LanguageCode = 'en' | 'cn' | 'fr' | 'ar' | 'el';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, ...args: (string | number)[]) => string;
  dir: 'ltr' | 'rtl';
}

interface Language {
  value: string;
  name: string;
  bit: number;
}

export const languageAllList: Language[] = [
  { value: 'cn', name: '中文（简体）', bit: 0 },
  { value: 'en', name: 'English', bit: 1 },
  { value: 'el', name: 'Español', bit: 3 },
  { value: 'ar', name: 'العربية', bit: 6 },
  { value: 'fr', name: 'Français', bit: 7 },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  en,
  cn,
  fr,
  ar,
  el
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.dir = newDir;
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, ...args: (string | number)[]) => {
    let text = translations[language][key] || translations['en'][key] || key;
    args.forEach((arg, index) => {
      text = text.replace(`{${index}}`, String(arg));
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
