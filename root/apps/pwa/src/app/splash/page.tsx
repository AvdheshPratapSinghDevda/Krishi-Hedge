'use client';

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/LanguageProvider";
import { ArrowRight, Globe } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const { t } = useI18n();

  const roles = [
    { 
      id: 'farmer', 
      label: t('splash.continueFarmer'),
      desc: 'Sell your produce'
    },
    { 
      id: 'buyer', 
      label: t('splash.continueBuyer'),
      desc: 'Purchase oilseeds'
    },
    { 
      id: 'fpo', 
      label: 'FPO Admin',
      desc: 'Manage your organization'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex justify-end border-b border-gray-100">
        <button
          onClick={() => router.push('/language')}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t('language.changeLink')}</span>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {t('common.appName')}
            </h1>
            <p className="text-gray-500 text-sm">
              {t('splash.tagline')}
            </p>
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">
              Continue as
            </p>
            
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => router.push(`/auth/login?role=${role.id}`)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition group"
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900">{role.label}</div>
                  <div className="text-xs text-gray-500">{role.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition" />
              </button>
            ))}
          </div>

          {/* Badge */}
          <div className="mt-8 text-center">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium">
              {t('splash.badge')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
