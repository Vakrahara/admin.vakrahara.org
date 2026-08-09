'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in with appropriate credentials, redirect immediately
  useEffect(() => {
    if (pb.authStore.isValid) {
      const email = pb.authStore.record?.email?.toLowerCase();
      const adminEmails = ["vkarms.vk@gmail.com"];
      if (email && adminEmails.includes(email)) {
        router.push(redirectTarget);
      }
    }
  }, [router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    setError(null);

    try {
      // Authenticate with PocketBase
      const authData = await pb.collection('users').authWithPassword(identifier, password);
      
      const record = authData.record;
      const email = record?.email?.toLowerCase();
      const adminEmails = ["vkarms.vk@gmail.com"];

      // Hack resistance rule: Reject and clear auth state immediately if not admin
      if (!email || !adminEmails.includes(email)) {
        pb.authStore.clear();
        // Clear cookies
        document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        throw new Error('Access Denied: You do not have administrator permissions.');
      }

      // Success, cookie is written automatically by pb.authStore.onChange in pocketbase.ts
      router.push(redirectTarget);
      router.refresh();

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn">
          <span className="font-bold shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Administrator Email or Username
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-3 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/40 transition-all"
          placeholder="admin@vakrahara.org"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Security Key / Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-4 pr-11 py-3 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/40 transition-all"
            placeholder="••••••••••••"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#d4af37]/10"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying Protocol...
          </span>
        ) : (
          'Access Console'
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic background highlights */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] bg-[#800020]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand/Logo Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#b8860b] to-[#d4af37] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#d4af37]/10">
            <ShieldCheck className="w-7 h-7 text-[#050508]" />
          </div>
          <h1 className="text-2xl font-bold serif-text tracking-wide text-white">
            Vakrahara Gurukulam
          </h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-semibold">
            Administrative Access Node
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-white/10 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <div className="text-center mt-6 text-xs text-gray-600">
          Secure end-to-end communication via pb.vakrahara.org
        </div>
      </div>
    </div>
  );
}
