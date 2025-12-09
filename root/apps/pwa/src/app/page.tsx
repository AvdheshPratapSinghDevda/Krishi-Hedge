'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomeScreen from "../components/HomeScreen";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      const lang = window.localStorage.getItem("kh_lang");
      const userId = window.localStorage.getItem("kh_user_id");

      console.log('[HOME] Auth check:', { lang, userId: userId ? 'exists' : 'missing' });

      if (!lang) {
        // No language chosen yet -> go to dedicated language selection screen first
        console.log('[HOME] No language, redirecting to /language');
        router.replace("/language");
        setShowHome(false);
      } else if (!userId) {
        // Language is chosen but user not logged in -> show splash with role options
        console.log('[HOME] No user ID, redirecting to /splash');
        router.replace("/splash");
        setShowHome(false);
      } else {
        // Language is chosen and user is logged in -> show main farmer home
        console.log('[HOME] User authenticated, showing home');
        setShowHome(true);
      }

      setReady(true);
    };

    // Small delay to ensure localStorage is fully loaded
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (!ready || !showHome) {
    // While deciding or redirecting, render nothing to avoid flicker
    return null;
  }

  return <HomeScreen />;
}
