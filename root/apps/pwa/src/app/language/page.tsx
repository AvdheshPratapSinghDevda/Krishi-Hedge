'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/LanguageProvider';
import type { LangCode } from '@/i18n/LanguageProvider';

const CORE_LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

export default function LanguagePage() {
  const router = useRouter();
  const { lang, setLang, t } = useI18n();

  function handleSelect(code: LangCode) {
    setLang(code);
    router.push('/splash');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-emerald-800 text-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-green-950/40 border border-green-700 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{t('language.title')}</h1>
          <p className="text-xs text-green-100">{t('language.subtitle')}</p>
        </div>

        <div className="space-y-3 mt-4">
          {CORE_LANGS.map((item) => (
            <button
              key={item.code}
              onClick={() => handleSelect(item.code)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                lang === item.code
                  ? 'bg-white text-green-900 border-white shadow-md'
                  : 'bg-green-900/40 border-green-600 text-green-50 hover:bg-green-800'
              }`}
            >
              <span>{item.label}</span>
              {lang === item.code && <span className="text-[10px] uppercase tracking-wide text-green-700">Selected</span>}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-green-100 mt-4">
          {t('language.footer')}
        </p>
      </div>
    </div>
  );
}

