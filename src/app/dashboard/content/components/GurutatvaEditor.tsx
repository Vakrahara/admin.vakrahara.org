'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Gurutatva } from '@/types/curriculum';

interface GurutatvaEditorProps {
  gurutatva?: Gurutatva;
  onChange: (updated: Gurutatva) => void;
}

export function GurutatvaEditor({ gurutatva, onChange }: GurutatvaEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [langTab, setLangTab] = useState<'EN' | 'HI' | 'HNG'>('EN');

  const data: Gurutatva = gurutatva || {
    titleEn: '',
    titleHi: '',
    titleHng: '',
    bodyEn: '',
    bodyHi: '',
    bodyHng: '',
    sutra: '',
    sutraTranslation: ''
  };

  const update = (patch: Partial<Gurutatva>) => {
    onChange({ ...data, ...patch });
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-[#0B0F19] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Gurutatva IKS Insight Card (§10)
            </h5>
            <p className="text-[10px] text-slate-400">
              Indian Knowledge Systems (IKS) scientific heritage connection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.titleEn && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              Configured
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-slate-800 space-y-3">
          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>Translation Locale</span>
            </div>
            <div className="flex items-center p-0.5 rounded bg-[#03050B] border border-slate-800">
              {(['EN', 'HI', 'HNG'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLangTab(tab)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    langTab === tab
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Insight Title ({langTab})
            </label>
            {langTab === 'EN' && (
              <input
                type="text"
                value={data.titleEn}
                onChange={(e) => update({ titleEn: e.target.value })}
                placeholder="e.g. Kaṇāda on Wave Propagation (तरंग सञ्चार)"
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
              />
            )}
            {langTab === 'HI' && (
              <input
                type="text"
                value={data.titleHi || ''}
                onChange={(e) => update({ titleHi: e.target.value })}
                placeholder="e.g. कणाद तरंग सञ्चार सिद्धान्त"
                className="w-full text-xs font-serif bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
              />
            )}
            {langTab === 'HNG' && (
              <input
                type="text"
                value={data.titleHng || ''}
                onChange={(e) => update({ titleHng: e.target.value })}
                placeholder="e.g. Kaṇāda on Wave Propagation"
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none"
              />
            )}
          </div>

          {/* Body */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Insight Body ({langTab})
            </label>
            {langTab === 'EN' && (
              <textarea
                value={data.bodyEn}
                onChange={(e) => update({ bodyEn: e.target.value })}
                rows={2}
                placeholder="e.g. In the Vaiśeṣika Sūtra, Maharṣi Kaṇāda explains that propagation occurs through successive adjacent disturbances..."
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none resize-none"
              />
            )}
            {langTab === 'HI' && (
              <textarea
                value={data.bodyHi || ''}
                onChange={(e) => update({ bodyHi: e.target.value })}
                rows={2}
                placeholder="e.g. वैशेषिक सूत्र में महर्षि कणाद बताते हैं कि तरंग सञ्चार..."
                className="w-full text-xs font-serif bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none resize-none"
              />
            )}
            {langTab === 'HNG' && (
              <textarea
                value={data.bodyHng || ''}
                onChange={(e) => update({ bodyHng: e.target.value })}
                rows={2}
                placeholder="e.g. Vaiśeṣika Sūtra me Maharṣi Kaṇāda batate hain..."
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-amber-400 outline-none resize-none"
              />
            )}
          </div>

          {/* Sanskrit Sutra & Translation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] text-amber-300 block mb-1 font-serif">
                Sanskrit Sūtra (Devanagari)
              </label>
              <input
                type="text"
                value={data.sutra || ''}
                onChange={(e) => update({ sutra: e.target.value })}
                placeholder="वीचीतरङ्गन्यायेन तदुत्पत्तिस्तु कीर्तिता ॥"
                className="w-full text-xs font-serif bg-[#03050B] border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Sūtra Translation
              </label>
              <input
                type="text"
                value={data.sutraTranslation || ''}
                onChange={(e) => update({ sutraTranslation: e.target.value })}
                placeholder="Sound and waves propagate in all directions like ripples..."
                className="w-full text-xs bg-[#03050B] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
