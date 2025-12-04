"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage?.getItem('admin_user');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to load user from localStorage:", e);
    }
  }, []);

  async function signOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.localStorage?.removeItem("admin_user");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  }

  return (
    <main className="overview-container max-w-4xl py-6">
      <Header title="Account" subtitle="Manage admin profile, credentials and session preferences." />
      
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Admin User'}</h2>
              <p className="text-sm text-gray-600">{user?.email || 'admin@krishihedge.com'}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display Name</p>
                <p className="text-base font-medium text-gray-900">{user?.name || 'Admin Demo'}</p>
              </div>
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email Address</p>
                <p className="text-base font-medium text-gray-900">{user?.email || 'admin@krishihedge.com'}</p>
              </div>
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</p>
                <p className="text-base font-medium text-gray-900">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'ADMIN'}
                  </span>
                </p>
              </div>
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account ID</p>
                <p className="text-sm font-mono text-gray-600">{user?.id?.slice(0, 8) || '••••••••'}...</p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Security & Access</h3>
            <div className="rounded-xl border border-dashed border-gray-200 p-6 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Password & Authentication</p>
                  <p className="text-sm text-gray-500">
                    Manage your password and two-factor authentication settings. Keep your account secure.
                  </p>
                </div>
                <button 
                  onClick={() => alert('Password change not implemented yet')}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button 
              onClick={() => alert('Edit profile not implemented yet')}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
            <button 
              onClick={signOut}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </section>

      {/* Activity Section */}
      <section className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Logged in successfully</p>
              <p className="text-xs text-gray-500">Today at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="text-center py-6 text-sm text-gray-400">
            Activity log will appear here
          </div>
        </div>
      </section>
    </main>
  );
}

