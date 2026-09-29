'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppVersionRecord } from '../types';

interface ReleaseStatsCardsProps {
  releases: AppVersionRecord[];
}

export function ReleaseStatsCards({ releases }: ReleaseStatsCardsProps) {
  const latestRelease = releases.length > 0 ? releases[0] : null;
  const activeForcesCount = releases.filter(r => r.is_force_update).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="text-gray-500 text-sm font-medium mb-1">Total Releases</div>
        <div className="text-3xl font-bold text-white">{releases.length}</div>
      </div>
      <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
        <div className="text-gray-500 text-sm font-medium mb-1">Latest Version</div>
        <div className="text-3xl font-bold text-white">
          {latestRelease?.version_name || 'N/A'}{' '}
          <span className="text-sm text-gray-500 ml-1">({latestRelease?.version_code || 0})</span>
        </div>
      </div>
      <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
        <div className="text-gray-500 text-sm font-medium mb-1">Force Updates Active</div>
        <div className="text-3xl font-bold text-white flex items-center gap-2">
          {activeForcesCount} {activeForcesCount > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </div>
      </div>
      <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
        <div className="text-gray-500 text-sm font-medium mb-1">Min Supported</div>
        <div className="text-3xl font-bold text-white">{latestRelease?.min_supported_version || 0}</div>
      </div>
    </div>
  );
}
