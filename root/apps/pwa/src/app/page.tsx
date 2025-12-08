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

    const lang = window.localStorage.getItem("kh_lang");
    const userId = window.localStorage.getItem("kh_user_id");

    if (!lang) {
      // No language chosen yet -> go to dedicated language selection screen first
      router.replace("/language");
      setShowHome(false);
    } else if (!userId) {
      // Language is chosen but user not logged in -> show splash with role options
      router.replace("/splash");
      setShowHome(false);
    } else {
      // Language is chosen and user is logged in -> show main farmer home
      setShowHome(true);
    }

    setReady(true);
  }, [router]);

  if (!ready || !showHome) {
    // While deciding or redirecting, render nothing to avoid flicker
    return null;
  }

  return <HomeScreen />;
}
