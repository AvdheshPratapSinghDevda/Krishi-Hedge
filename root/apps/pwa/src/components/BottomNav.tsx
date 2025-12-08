'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/LanguageProvider';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  // Hide on public pages
  // We hide it on language selection, splash, auth pages, and onboarding
  if (pathname === '/language' || pathname === '/splash' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  const isBuyer = pathname.startsWith('/buyer') || pathname.startsWith('/market');

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  if (isBuyer) {
    return (
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t border-slate-800 flex justify-around py-3 pb-5 z-50 text-slate-400">
        <button 
            onClick={() => router.push('/buyer/home')} 
            className={`${isActive('/buyer/home') ? 'text-blue-400 font-bold' : 'hover:text-slate-200'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-building-columns text-xl mb-1"></i>{t('nav.dashboard')}
        </button>
        
        <button 
            onClick={() => router.push('/market')} 
            className={`${isActive('/market') ? 'text-blue-400 font-bold' : 'hover:text-slate-200'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-globe text-xl mb-1"></i>{t('nav.market')}
        </button>
        
        <button 
            onClick={() => router.push('/buyer/portfolio')} 
            className={`${isActive('/buyer/portfolio') ? 'text-blue-400 font-bold' : 'hover:text-slate-200'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-briefcase text-xl mb-1"></i>{t('nav.portfolio')}
        </button>
        
        <button 
            onClick={() => router.push('/buyer/profile')} 
            className={`${isActive('/buyer/profile') ? 'text-blue-400 font-bold' : 'hover:text-slate-200'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-user-tie text-xl mb-1"></i>{t('nav.profile')}
        </button>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-evenly py-3 pb-5 z-50">
        <button 
            onClick={() => router.push('/')} 
            className={`${isActive('/') ? 'text-green-700 font-bold' : 'text-gray-400'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-home text-xl mb-1"></i>{t('nav.home')}
        </button>
        
        <button 
            onClick={() => router.push('/forecast')} 
            className={`${isActive('/forecast') ? 'text-green-700 font-bold' : 'text-gray-400'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-chart-line text-xl mb-1"></i>{t('nav.forecast')}
        </button>
        
        <button 
            onClick={() => router.push('/education')} 
            className={`${isActive('/education') ? 'text-green-700 font-bold' : 'text-gray-400'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-book-open text-xl mb-1"></i>{t('nav.education')}
        </button>
        
        <button 
            onClick={() => router.push('/contracts')} 
            className={`${isActive('/contracts') ? 'text-green-700 font-bold' : 'text-gray-400'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-file-contract text-xl mb-1"></i>{t('nav.contracts')}
        </button>
        
        <button 
            onClick={() => router.push('/profile')} 
            className={`${isActive('/profile') ? 'text-green-700 font-bold' : 'text-gray-400'} flex flex-col items-center text-xs`}
        >
            <i className="fa-solid fa-user text-xl mb-1"></i>{t('nav.profile')}
        </button>
    </nav>
  );
}
