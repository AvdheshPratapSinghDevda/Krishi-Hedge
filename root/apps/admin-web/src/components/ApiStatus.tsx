"use client";

import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      // Check local API
      try {
        const res = await fetch(`http://localhost:3001/api/contracts`);
        if (res.ok) {
          setApiConnected(true);
          // If API works, Supabase is likely connected
          setSupabaseConnected(true);
        } else {
          setApiConnected(false);
          setSupabaseConnected(false);
        }
      } catch (error) {
        setApiConnected(false);
        setSupabaseConnected(false);
      }
      setChecked(true);
    })();
  }, []);

  if (!checked) return <div className="text-xs text-gray-500">Checking connections...</div>;
  
  return (
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 rounded-full ${supabaseConnected ? "bg-green-500" : "bg-gray-300"}`} />
        <span className={supabaseConnected ? "text-green-600 font-medium" : "text-gray-500 font-medium"}>
          Supabase {supabaseConnected ? "connected" : "disconnected"}
        </span>
      </div>
      <div className="inline-flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-green-500" : "bg-gray-300"}`} />
        <span className={apiConnected ? "text-green-600 font-medium" : "text-gray-500 font-medium"}>
          Admin API {apiConnected ? "ready" : "unavailable"}
        </span>
      </div>
    </div>
  );
}
