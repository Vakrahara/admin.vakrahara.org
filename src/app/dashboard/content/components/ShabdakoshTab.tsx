'use client';

import React from 'react';
import { Layers, UploadCloud } from 'lucide-react';

export function ShabdakoshTab() {
  return (
    <div className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="w-5 h-5 text-[#d4af37]" />
        <h3 className="font-semibold text-white text-lg">Shabdakosh (Dictionary FTS5)</h3>
      </div>
      <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
        The active vocabulary index contains 45,210 words optimized for fast Harvard-Kyoto (HK) transliteration lookups. To upload new dictionary CSVs or update search tags, drag your files below.
      </p>

      <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-[#d4af37]/30 transition-colors cursor-pointer bg-white/[0.01]">
        <UploadCloud className="w-10 h-10 text-gray-500 mb-4" />
        <span className="text-sm font-semibold text-white">Upload dictionary CSV / JSON</span>
        <span className="text-xs text-gray-500 mt-1">Accepts schemas containing word_devanagari, word_hk, and definition</span>
      </div>
    </div>
  );
}
