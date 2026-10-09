'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, AlertCircle, LogOut } from 'lucide-react';
import { useDashboardStats } from './hooks/useDashboardStats';
import { FinancialKpis } from './components/FinancialKpis';
import { ActivityKpis } from './components/ActivityKpis';
import { DemographicsCharts } from './components/DemographicsCharts';
import { clearAuthState } from '@/lib/auth';

export default function AnalyticsSummaryPage() {
  const { stats, loading, refreshing, error, isAuthError, handleRefresh } = useDashboardStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOutAndReLogin = () => {
    clearAuthState();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?signed_out=true';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-10 w-24 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/5 border border-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/5 border border-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-white/5 border border-white/5 rounded-2xl" />
          <div className="h-80 bg-white/5 border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#d4af37]" />
            Dashboard Summary
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gurukulam telemetry and somatic progression analysis.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0d0d15] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-wider text-gray-300 disabled:opacity-40 transition-colors shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Live Aggregates
        </button>
      </div>

      {/* Telemetry Warning Banner (if sync degraded or error) */}
      {error && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Telemetry sync notice: {error}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isAuthError && (
              <button
                onClick={handleSignOutAndReLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-semibold text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out & Re-Login
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-200 transition-colors"
            >
              Retry Sync
            </button>
          </div>
        </div>
      )}

      {/* Financial KPIs Grid (Total Revenue, Active Subscribers, MRR) */}
      <FinancialKpis stats={stats} />

      {/* Activity KPI Cards Grid (Enrolled, Daily Active, Weekly Active, Inactive) */}
      <ActivityKpis stats={stats} />

      {/* Visual Charts Grid (Board Enrollments, Class Distribution, Role Breakdown) */}
      <DemographicsCharts stats={stats} mounted={mounted} />
    </div>
  );
}
