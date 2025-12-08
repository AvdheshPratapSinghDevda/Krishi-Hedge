'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FpoOption {
  id: string;
  fpo_name: string;
  district: string;
  state: string;
}

export default function FpoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fpos, setFpos] = useState<FpoOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/fpo?verified=true');
        if (!res.ok) {
          setError('Failed to load FPO list');
          return;
        }
        const json = await res.json();
        const data: FpoOption[] = json.data || [];
        setFpos(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (e) {
        console.error('[FPO LOGIN] load error', e);
        setError('Could not reach server');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fpo_id', selectedId);
    }
    router.push('/fpo/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading FPOs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-emerald-800">FPO Admin Login</h1>
          <p className="text-xs text-gray-500 mt-1">
            For demo, select your FPO to open the dashboard. Proper auth can be added on top of this flow.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}

        {fpos.length === 0 ? (
          <p className="text-sm text-gray-600">
            No FPO records found. Please run the Supabase FPO setup script and try again.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select your FPO / अपना FPO चुनें
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {fpos.map((fpo) => (
                  <option key={fpo.id} value={fpo.id}>
                    {fpo.fpo_name} — {fpo.district}, {fpo.state}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Continue to Dashboard
            </button>
          </form>
        )}

        <p className="text-[11px] text-gray-400 text-center mt-1">
          This is a SIH demo flow – real deployments can plug in OTP / password based FPO admin auth.
        </p>
      </div>
    </div>
  );
}

