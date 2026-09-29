'use client';

import React, { useState } from 'react';
import { BookOpen, Search, Volume2, Play } from 'lucide-react';

export interface SutraItem {
  id: string;
  sutra: string;
  padaccheda: string[];
  meaning: string;
  audio: string;
}

const mockSutras: SutraItem[] = [
  { id: '1.1.1', sutra: 'वृद्धिरादैच्', padaccheda: ['वृद्धिः', 'आत्', 'ऐच्'], meaning: 'Growth is denoted by the letters āt (ā) and aic (ai, au).', audio: '1_1_1.mp3' },
  { id: '1.1.2', sutra: 'अदेङ्गुणः', padaccheda: ['अत्', 'एङ्', 'गुणः'], meaning: 'The letters at (a) and eṅ (e, o) are called guṇa.', audio: '1_1_2.mp3' },
  { id: '6.1.77', sutra: 'इको यणचि', padaccheda: ['इको', 'यण्', 'अचि'], meaning: 'The letters ik (i, u, ṛ, ḷ) are replaced by yaṇ (y, v, r, l) before a vowel (ac).', audio: '6_1_77.mp3' },
  { id: '8.4.40', sutra: 'स्तोः श्चुना श्चुः', padaccheda: ['स्तोः', 'श्चुना', 'श्चुः'], meaning: 'S and dental consonants are replaced by ś and palatal consonants when in contact with ś or palatal consonants.', audio: '8_4_40.mp3' }
];

export function PaninianSutraVaultTab() {
  const [sutraSearch, setSutraSearch] = useState('');

  const handleAudioPlayback = (audioFile: string) => {
    try {
      const audio = new Audio(`https://cdn.vakrahara.org/audio/sutras/${audioFile}`);
      audio.play().catch(e => {
        console.warn('Audio playback error:', e);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSutras = mockSutras.filter(
    s => s.sutra.includes(sutraSearch) || s.id.includes(sutraSearch) || s.meaning.toLowerCase().includes(sutraSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d0d15] border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={sutraSearch}
            onChange={(e) => setSutraSearch(e.target.value)}
            placeholder="Search Paninian sutras by ID, text, or definition..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSutras.map((sutra) => (
          <div key={sutra.id} className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4 hover:border-[#d4af37]/20 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[10px] font-bold text-[#d4af37] rounded-md border border-[#d4af37]/20">
                  Aṣṭādhyāyī {sutra.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-serif">{sutra.sutra}</h3>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Padaccheda</span>
              <div className="flex flex-wrap gap-1.5">
                {sutra.padaccheda.map((pada, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 border border-white/5 text-gray-300 text-xs rounded-lg font-mono">
                    {pada}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Meaning (Artha)</span>
              <p className="text-xs text-gray-400 leading-relaxed">{sutra.meaning}</p>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                {sutra.audio}
              </span>
              
              <button
                type="button"
                onClick={() => handleAudioPlayback(sutra.audio)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-[#d4af37] transition-all cursor-pointer"
                title="Play Audio Pronunciation"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
