"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for authenticated user
    const checkAuth = async () => {
      try {
        const raw = window.localStorage?.getItem("admin_user");
        if (raw) {
          setUser(JSON.parse(raw));
        } else {
          // No user found, redirect to login
          router.push("/login");
        }
      } catch (e) {
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Sync changes across tabs
    function onStorage() {
      try {
        const raw = window.localStorage?.getItem("admin_user");
        setUser(raw ? JSON.parse(raw) : null);
        if (!raw) {
          router.push("/login");
        }
      } catch (e) {
        setUser(null);
        router.push("/login");
      }
    }
    
    window.addEventListener("storage", onStorage);
    window.addEventListener("admin_user_change", onStorage);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("admin_user_change", onStorage);
    };
  }, [router]);

  // Show nothing while checking to prevent flash
  if (isChecking) {
    return null;
  }

  // If no user after check, return null (redirect handles navigation)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
