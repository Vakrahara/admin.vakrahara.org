'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 glass-panel border border-red-500/20 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold mb-3 serif-text tracking-wide text-red-400">
          Access Restricted
        </h1>
        
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your account does not have administrator or staff privileges. This portal is reserved exclusively for authorized coordinators of the Vakrahara Gurukulam.
        </p>

        <div className="space-y-4">
          <Link
            href="https://vakrahara.org"
            className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-medium text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-red-900/20"
          >
            Return to Main Website
          </Link>
          
          <button
            onClick={() => {
              // Clear cookies and force login page
              document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              window.location.href = '/login';
            }}
            className="block w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Sign in with Another Account
          </button>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-600 select-none">
        Vakrahara Gurukulam Security Protocol v1.0
      </div>
    </div>
  );
}
