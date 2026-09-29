'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { Package, RefreshCw, Loader2 } from 'lucide-react';
import { AppVersionRecord } from './types';
import { ReleaseStatsCards } from './components/ReleaseStatsCards';
import { EmergencyControlsCard } from './components/EmergencyControlsCard';
import { PublishReleaseCard } from './components/PublishReleaseCard';
import { ReleaseHistoryTable } from './components/ReleaseHistoryTable';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<AppVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [defaultVersionCode, setDefaultVersionCode] = useState('');
  const [defaultMinSupported, setDefaultMinSupported] = useState('1');

  const fetchReleases = async () => {
    try {
      setRefreshing(true);
      const records = await pb.collection('app_versions').getFullList<AppVersionRecord>({
        sort: '-version_code',
      });
      setReleases(records);
      
      if (records.length > 0) {
        setDefaultVersionCode((records[0].version_code + 1).toString());
        setDefaultMinSupported(records[0].min_supported_version.toString());
      }
    } catch (err) {
      console.error('Failed to fetch releases', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#d4af37]" /> App Release Manager
          </h1>
          <p className="text-gray-400 mt-2">Manage and publish Amrtam Android updates</p>
        </div>
        <button 
          type="button"
          onClick={fetchReleases}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d0d15] border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <ReleaseStatsCards releases={releases} />

      {/* Emergency Controls */}
      <EmergencyControlsCard releases={releases} onRefresh={fetchReleases} />

      {/* Create New Release Form Card */}
      <PublishReleaseCard
        defaultVersionCode={defaultVersionCode}
        defaultMinSupported={defaultMinSupported}
        onPublished={fetchReleases}
      />

      {/* Release History Table */}
      <ReleaseHistoryTable releases={releases} onRefresh={fetchReleases} />
    </div>
  );
}
