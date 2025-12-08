'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

export default function EducationPage() {
  const [progress, setProgress] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    const p = localStorage.getItem("kh_edu_progress");
    if (p) setProgress(parseInt(p));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-green-800">{t('education.title')}</h1>
            <p className="text-xs text-gray-500">{t('education.subtitle')}</p>
          </div>
        </div>
        
        <div className="mt-3 bg-gray-100 rounded-full h-2 w-full overflow-hidden">
          <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-[10px] text-right text-gray-400 mt-1">{progress}% Completed</p>
      </div>

      <div className="p-4 space-y-4">
        <Link href="/education/hedging" className="block bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-800">{t('education.cardHedgingTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('education.cardHedgingSubtitle')}</p>
            </div>
            <i className="fa-solid fa-shield-alt text-yellow-500 text-xl"></i>
          </div>
        </Link>

        <Link href="/education/forecast" className="block bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-800">{t('education.cardForecastTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('education.cardForecastSubtitle')}</p>
            </div>
            <i className="fa-solid fa-chart-line text-green-500 text-xl"></i>
          </div>
        </Link>
      </div>
    </div>
  );
}
