'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import AuthGate from '@/components/Auth/AuthGate';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <div className="max-w-7xl mx-auto min-h-screen px-4 sm:px-6 py-8">
        <AuthGate>{children}</AuthGate>
      </div>
      <Footer />
    </>
  );
}
