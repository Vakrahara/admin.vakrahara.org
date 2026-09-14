'use client';

import { useState } from 'react';
import { Key } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { generateSecureKey } from './types';

interface ActivationKeyGenerationModalProps {
  onSuccess: (msg: string) => void;
  onClose: () => void;
}

export function ActivationKeyGenerationModal({ onSuccess, onClose }: ActivationKeyGenerationModalProps) {
  const [genPlan, setGenPlan] = useState('yearly');
  const [genDuration, setGenDuration] = useState(365);
  const [genQty, setGenQty] = useState(1);
  const [genCampaign, setGenCampaign] = useState('');
  const [genValidUntil, setGenValidUntil] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      for (let i = 0; i < genQty; i++) {
        const keyStr = generateSecureKey();
        await pb.collection('activation_keys').create({
          key: keyStr,
          plan: genPlan,
          duration_days: genDuration,
          campaign: genCampaign,
          valid_until: genValidUntil || null,
          note: '',
          used_by: '',
          used_at: null,
        });
      }
      onSuccess(`✅ ${genQty} key${genQty > 1 ? 's' : ''} generated successfully!`);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to generate keys');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl p-6 space-y-5">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        <Key className="w-4 h-4 text-[#d4af37]" /> Generate New Keys
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Plan</label>
          <select
            value={genPlan}
            onChange={(e) => setGenPlan(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Duration (days)</label>
          <input
            type="number"
            min={1}
            max={36500}
            value={genDuration}
            onChange={(e) => setGenDuration(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Quantity</label>
          <input
            type="number"
            min={1}
            max={100}
            value={genQty}
            onChange={(e) => setGenQty(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Campaign / Label</label>
          <input
            type="text"
            placeholder="e.g. Diwali2025"
            value={genCampaign}
            onChange={(e) => setGenCampaign(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Valid Until (optional)</label>
          <input
            type="date"
            value={genValidUntil}
            onChange={(e) => setGenValidUntil(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
        >
          {generating ? 'Generating...' : `Generate ${genQty} Key${genQty > 1 ? 's' : ''}`}
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-all"
        >
          Cancel
        </button>
        {error && <span className="text-sm text-red-400">❌ {error}</span>}
      </div>
    </div>
  );
}
