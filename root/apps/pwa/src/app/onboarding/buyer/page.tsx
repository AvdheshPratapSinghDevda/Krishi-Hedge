'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the buyer onboarding flow
    router.push('/onboarding/buyer/business');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
