'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/pushNotifications';

export default function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Only show prompt if user has shown interest (e.g., visited alerts page)
      // Don't auto-show on every page load
      const hasInteracted = sessionStorage.getItem('user_interacted');
      if (Notification.permission === 'default' && hasInteracted) {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        const success = await subscribeToPushNotifications();
        if (success) {
          setPermission('granted');
          setShowPrompt(false);
        }
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed (don't show again this session)
    sessionStorage.setItem('notif_prompt_dismissed', 'true');
  };

  // Don't show if already granted/denied or user dismissed
  if (permission !== 'default' || !showPrompt) return null;
  if (typeof window !== 'undefined' && sessionStorage.getItem('notif_prompt_dismissed')) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <span className="text-lg">🔔</span>
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-gray-900 tracking-tight">Notifications</h3>
              <p className="text-[13px] text-gray-500 font-normal">Get updates on your contracts</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full hover:bg-gray-100/80 active:bg-gray-200/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
          >
            <span className="text-xl leading-none font-light">×</span>
          </button>
        </div>

        <div className="px-4 pb-4 flex gap-2.5">
          <button
            onClick={handleDismiss}
            disabled={isSubscribing}
            className="flex-1 px-4 py-2.5 bg-gray-100/80 hover:bg-gray-200/80 active:scale-[0.98] disabled:bg-gray-50 text-gray-700 rounded-xl text-[15px] font-medium transition-all"
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="flex-1 px-4 py-2.5 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl text-[15px] font-semibold transition-all shadow-lg shadow-green-500/25"
          >
            {isSubscribing ? 'Enabling...' : 'Allow'}
          </button>
        </div>
      </div>
    </div>
  );
}
