'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

export default function SetupWarningBanner() {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const isConfigured = Boolean(supabaseUrl && 
                        supabaseKey && 
                        !supabaseUrl.includes('demo') && 
                        !supabaseUrl.includes('placeholder') &&
                        !supabaseKey.includes('demo') &&
                        !supabaseKey.includes('placeholder') &&
                        supabaseUrl.includes('.supabase.co'));
    
    setIsSupabaseConfigured(isConfigured);
    
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('setup-warning-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('setup-warning-dismissed', 'true');
  };

  if (isSupabaseConfigured || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <span className="flex p-2 rounded-lg bg-white/20">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium sm:text-base">
                <span className="font-bold">Setup Required:</span> Supabase is not configured. 
                <span className="hidden sm:inline"> Authentication and database features won't work until you set up Supabase.</span>
              </p>
              <p className="text-xs mt-1 opacity-90">
                <span className="hidden sm:inline">Takes only 5 minutes • Free tier available • </span>
                <a 
                  href="/SUPABASE_SETUP_REQUIRED.md" 
                  target="_blank"
                  className="underline font-semibold hover:text-white/80 inline-flex items-center gap-1"
                >
                  View Setup Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center mt-2 sm:mt-0">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-4 py-2 bg-white text-orange-600 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Set Up Now</span>
              <span className="sm:hidden">Setup</span>
            </a>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
