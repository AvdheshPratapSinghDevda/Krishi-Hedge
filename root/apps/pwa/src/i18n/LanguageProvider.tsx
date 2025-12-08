'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from './messages/en';
import { hi } from './messages/hi';
import { mr } from './messages/mr';
import { pa } from './messages/pa';

// Order: English, Hindi, Marathi, Punjabi (core), others optional
export type LangCode = 'en' | 'hi' | 'mr' | 'pa' | 'ta' | 'te' | 'bn';

const messagesByLang: Record<LangCode, any> = {
  en,
  hi,
  mr,
  pa,
  ta: en,
  te: en,
  bn: en,
};

interface I18nContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('kh_lang') as LangCode | null;
    if (stored && messagesByLang[stored]) {
      setLangState(stored);
    }
  }, []);

  function setLang(newLang: LangCode) {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('kh_lang', newLang);
    }
    // Optional: also sync to Supabase profile.language via an API route in future.
  }

  function t(key: string): string {
    const currentBundle = messagesByLang[lang] || messagesByLang.en;
    const baseBundle = messagesByLang.en;

    const resolve = (bundle: any, path: string) => {
      const parts = path.split('.');
      let value: any = bundle;
      for (const part of parts) {
        if (value == null) break;
        value = value[part];
      }
      return typeof value === 'string' ? value : undefined;
    };

    const fromCurrent = resolve(currentBundle, key);
    if (fromCurrent !== undefined) return fromCurrent;

    const fromBase = resolve(baseBundle, key);

    if (process.env.NODE_ENV !== 'production' && lang !== 'en' && fromBase !== undefined) {
      // Dev-only warning so new keys don't silently miss translations
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing translation for ${lang}:${key}, falling back to en`);
    }

    return fromBase ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return ctx;
}

