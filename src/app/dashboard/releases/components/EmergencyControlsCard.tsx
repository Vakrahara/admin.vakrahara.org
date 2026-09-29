'use client';

import React, { useState } from 'react';
import { Zap, AlertTriangle, Shield } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { AppVersionRecord } from '../types';

interface EmergencyControlsCardProps {
  releases: AppVersionRecord[];
  onRefresh: () => void;
}

export function EmergencyControlsCard({ releases, onRefresh }: EmergencyControlsCardProps) {
  const [minSupportedInput, setMinSupportedInput] = useState('');

  const handleEmergencyForceAll = async () => {
    if (!window.confirm('Are you sure you want to FORCE all users to update to the latest release immediately?')) return;
    if (releases.length === 0) return;
    
    const latest = releases[0];
    try {
      await pb.collection('app_versions').update(latest.id, { is_force_update: true });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyPauseForce = async () => {
    if (!window.confirm('Disable force updates across ALL releases?')) return;
    try {
      const activeForces = releases.filter(r => r.is_force_update);
      for (const r of activeForces) {
        await pb.collection('app_versions').update(r.id, { is_force_update: false });
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyBlock = async () => {
    const val = parseInt(minSupportedInput);
    if (isNaN(val)) return alert('Please enter a valid version code.');
    if (!window.confirm(`Block all app versions below code ${val}?`)) return;
    
    try {
      if (releases.length > 0) {
        await pb.collection('app_versions').update(releases[0].id, { min_supported_version: val });
        setMinSupportedInput('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-red-900/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.05)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5" /> Emergency Controls
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="text-sm text-gray-300 font-medium">Critical Bug Fix</div>
          <button 
            type="button"
            onClick={handleEmergencyForceAll}
            className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" /> Force Users to Update NOW
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-300 font-medium">Block Legacy Versions</div>
          <div className="flex gap-2">
            <input 
              type="number"
              placeholder="Code (e.g. 15)"
              value={minSupportedInput}
              onChange={(e) => setMinSupportedInput(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            />
            <button 
              type="button"
              onClick={handleEmergencyBlock}
              className="px-4 bg-[#0d0d15] hover:bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold transition-all whitespace-nowrap cursor-pointer"
            >
              Block
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-300 font-medium">Halt Force Updates</div>
          <button 
            type="button"
            onClick={handleEmergencyPauseForce}
            className="w-full py-2.5 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" /> Pause All Force Updates
          </button>
        </div>
      </div>
    </div>
  );
}
