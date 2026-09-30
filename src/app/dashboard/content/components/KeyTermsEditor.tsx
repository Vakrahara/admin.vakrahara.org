'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Plus, Trash2, Sparkles, Volume2, 
  Tag, Compass, Check, X 
} from 'lucide-react';
import { KeyTermsRecap, KeyTerm } from '@/types/curriculum';

interface KeyTermsEditorProps {
  keyTermsRecap?: KeyTermsRecap;
  moduleTitle: string;
  onChange: (updated: KeyTermsRecap) => void;
}

export function KeyTermsEditor({
  keyTermsRecap = { enabled: false, titleEn: 'Concept Lexicon', titleHi: 'पारिभाषिक शब्दावली', titleHng: 'Shabdakosha', terms: [] },
  moduleTitle,
  onChange
}: KeyTermsEditorProps) {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(
    keyTermsRecap.terms.length > 0 ? keyTermsRecap.terms[0].id : null
  );
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'hng'>('en');
  const [isExtracting, setIsExtracting] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleToggleEnabled = () => {
    onChange({ ...keyTermsRecap, enabled: !keyTermsRecap.enabled });
  };

  const handleAddTerm = () => {
    const newTerm: KeyTerm = {
      id: `kt_${Date.now()}`,
      termDeva: 'नवीनपदम्',
      termIast: 'Navīnapadam',
      termEn: 'New Term',
      termHng: 'Naya Pad',
      definitionEn: 'Enter English conceptual definition here.',
      definitionHi: 'यहाँ हिन्दी पारिभाषिक अर्थ लिखें।',
      definitionHng: 'Yahan Hinglish meaning likhein.',
      vyutpatti: {
        dhatu: '√भू (सत्तायाम्)',
        pratyaya: 'ल्युट्',
        etymologyTextEn: 'Derived from root √bhū meaning to exist or become.',
        etymologyTextHi: 'भू धातु से निष्पन्न, जिसका अर्थ होना या अस्तित्व है।',
        etymologyTextHng: 'Bhu dhatu se bana, jiska arth hona ya exist karna hai.'
      },
      tags: ['Core Concept']
    };
    const updatedTerms = [...keyTermsRecap.terms, newTerm];
    onChange({ ...keyTermsRecap, terms: updatedTerms });
    setSelectedTermId(newTerm.id);
  };

  const handleRemoveTerm = (id: string) => {
    const updatedTerms = keyTermsRecap.terms.filter(t => t.id !== id);
    onChange({ ...keyTermsRecap, terms: updatedTerms });
    if (selectedTermId === id) {
      setSelectedTermId(updatedTerms.length > 0 ? updatedTerms[0].id : null);
    }
  };

  const handleUpdateActiveTerm = (patch: Partial<KeyTerm>) => {
    if (!selectedTermId) return;
    const updatedTerms = keyTermsRecap.terms.map(t => 
      t.id === selectedTermId ? { ...t, ...patch } : t
    );
    onChange({ ...keyTermsRecap, terms: updatedTerms });
  };

  const activeTerm = keyTermsRecap.terms.find(t => t.id === selectedTermId);

  const handleAddTag = () => {
    if (!activeTerm || !newTagInput.trim()) return;
    const existingTags = activeTerm.tags || [];
    if (!existingTags.includes(newTagInput.trim())) {
      handleUpdateActiveTerm({ tags: [...existingTags, newTagInput.trim()] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeTerm || !activeTerm.tags) return;
    handleUpdateActiveTerm({ tags: activeTerm.tags.filter(t => t !== tagToRemove) });
  };

  const handleAiExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const extracted: KeyTerm = {
        id: `kt_ai_${Date.now()}`,
        termDeva: 'गुरुत्वकेन्द्रम्',
        termIast: 'Gurutvakendram',
        termEn: 'Center of Gravity',
        termHng: 'Gurutvakendra',
        definitionEn: 'The unique point in an object where the total torque due to gravitational forces equals zero.',
        definitionHi: 'पिण्ड का वह विशिष्ट बिन्दु जहाँ गुरुत्वाकर्षण के कारण कुल बल-आघूर्ण शून्य होता है।',
        definitionHng: 'Object ka wo specific point jahan total gravitational torque zero hota hai.',
        vyutpatti: {
          dhatu: '√गॄ (निगरणे/गौरवे) + केन्द्रम्',
          pratyaya: 'कर्मणि क्विप्',
          etymologyTextEn: 'From guru (weighty/heavy) + kendra (center point).',
          etymologyTextHi: 'गुरु (भारी) + केन्द्र (मध्य बिन्दु)।',
          etymologyTextHng: 'Guru (bhari) + kendra (center point) se bana.'
        },
        sutraReference: 'Vaiśeṣika Sūtra 5.1.7',
        tags: ['Physics', 'Gravitation']
      };
      onChange({
        ...keyTermsRecap,
        enabled: true,
        terms: [...keyTermsRecap.terms, extracted]
      });
      setSelectedTermId(extracted.id);
      setIsExtracting(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Shabdakosha Concept Lexicon Recap (शब्दकोश)
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                keyTermsRecap.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400'
              }`}>
                {keyTermsRecap.enabled ? 'Active' : 'Disabled'}
              </span>
            </h4>
            <p className="text-xs text-gray-400">Trilingual vocabulary cards with Sanskrit Vyutpatti etymological roots</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              keyTermsRecap.enabled 
                ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/20' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            {keyTermsRecap.enabled ? 'Deactivate Drawer' : 'Activate Drawer'}
          </button>

          <button
            type="button"
            onClick={handleAiExtract}
            disabled={isExtracting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isExtracting ? 'Analyzing...' : 'AI Auto-Extract'}</span>
          </button>
        </div>
      </div>

      {keyTermsRecap.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
          {/* Terms List */}
          <div className="md:col-span-4 space-y-2 border-r border-white/5 pr-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Mastered Terms ({keyTermsRecap.terms.length})
              </span>
              <button
                type="button"
                onClick={handleAddTerm}
                className="flex items-center gap-1 text-[11px] font-bold text-[#d4af37] hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Term
              </button>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {keyTermsRecap.terms.map((t) => {
                const isSelected = t.id === selectedTermId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTermId(t.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#d4af37]/10 border-[#d4af37]/40 text-white shadow-md'
                        : 'bg-[#08080c] border-white/5 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{t.termDeva}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{t.termEn} ({t.termIast})</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveTerm(t.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Term Detail Editor */}
          <div className="md:col-span-8 space-y-4">
            {activeTerm ? (
              <div className="space-y-4 bg-[#08080c] p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#d4af37]" />
                    Term ID: <span className="font-mono text-[#d4af37]">{activeTerm.id}</span>
                  </div>

                  <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10">
                    {(['en', 'hi', 'hng'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setActiveLang(l)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-all cursor-pointer ${
                          activeLang === l ? 'bg-[#d4af37] text-black shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Devanagari</label>
                    <input
                      type="text"
                      value={activeTerm.termDeva}
                      onChange={(e) => handleUpdateActiveTerm({ termDeva: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:border-[#d4af37]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">IAST Transliteration</label>
                    <input
                      type="text"
                      value={activeTerm.termIast}
                      onChange={(e) => handleUpdateActiveTerm({ termIast: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs font-mono focus:border-[#d4af37]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">English Equivalent</label>
                    <input
                      type="text"
                      value={activeTerm.termEn}
                      onChange={(e) => handleUpdateActiveTerm({ termEn: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:border-[#d4af37]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Hinglish Equivalent</label>
                    <input
                      type="text"
                      value={activeTerm.termHng}
                      onChange={(e) => handleUpdateActiveTerm({ termHng: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:border-[#d4af37]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Sūtra / Text Citation</label>
                    <input
                      type="text"
                      placeholder="e.g. Vaiśeṣika Sūtra 5.1.7"
                      value={activeTerm.sutraReference || ''}
                      onChange={(e) => handleUpdateActiveTerm({ sutraReference: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs font-mono focus:border-[#d4af37]/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Audio Pronunciation URL</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="https://amritam-cdn.vakrahara.org/audio/..."
                        value={activeTerm.audioPronunciationUrl || ''}
                        onChange={(e) => handleUpdateActiveTerm({ audioPronunciationUrl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs font-mono focus:border-[#d4af37]/60 focus:outline-none"
                      />
                      <Volume2 className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Vyutpatti */}
                <div className="p-3 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/[0.02] space-y-2">
                  <div className="text-[11px] font-bold text-[#d4af37] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Vyutpatti (व्युत्पत्ति - Sanskrit Root & Derivation)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase font-semibold block mb-0.5">Root (Dhātu)</label>
                      <input
                        type="text"
                        placeholder="e.g. √dhṛ (धृ)"
                        value={activeTerm.vyutpatti?.dhatu || ''}
                        onChange={(e) => handleUpdateActiveTerm({
                          vyutpatti: { ...activeTerm.vyutpatti, dhatu: e.target.value, etymologyTextEn: activeTerm.vyutpatti?.etymologyTextEn || '' }
                        })}
                        className="w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded-md text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase font-semibold block mb-0.5">Suffix (Pratyaya)</label>
                      <input
                        type="text"
                        placeholder="e.g. ghañ (घञ्)"
                        value={activeTerm.vyutpatti?.pratyaya || ''}
                        onChange={(e) => handleUpdateActiveTerm({
                          vyutpatti: { ...activeTerm.vyutpatti, pratyaya: e.target.value, etymologyTextEn: activeTerm.vyutpatti?.etymologyTextEn || '' }
                        })}
                        className="w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded-md text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase font-semibold block mb-0.5">
                      Etymology ({activeLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={activeLang === 'hi' ? activeTerm.vyutpatti?.etymologyTextHi || '' : activeLang === 'hng' ? activeTerm.vyutpatti?.etymologyTextHng || '' : activeTerm.vyutpatti?.etymologyTextEn || ''}
                      onChange={(e) => {
                        const vy = activeTerm.vyutpatti || { etymologyTextEn: '' };
                        if (activeLang === 'hi') handleUpdateActiveTerm({ vyutpatti: { ...vy, etymologyTextHi: e.target.value } });
                        else if (activeLang === 'hng') handleUpdateActiveTerm({ vyutpatti: { ...vy, etymologyTextHng: e.target.value } });
                        else handleUpdateActiveTerm({ vyutpatti: { ...vy, etymologyTextEn: e.target.value } });
                      }}
                      className="w-full px-2.5 py-1 bg-black/40 border border-white/10 rounded-md text-xs text-white"
                    />
                  </div>
                </div>

                {/* Definition */}
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    {activeLang === 'en' ? 'Definition (English)' : activeLang === 'hi' ? 'Definition (हिन्दी)' : 'Definition (Hinglish)'}
                  </label>
                  <textarea
                    rows={2}
                    value={activeLang === 'en' ? activeTerm.definitionEn : activeLang === 'hi' ? activeTerm.definitionHi : activeTerm.definitionHng}
                    onChange={(e) => {
                      if (activeLang === 'en') handleUpdateActiveTerm({ definitionEn: e.target.value });
                      else if (activeLang === 'hi') handleUpdateActiveTerm({ definitionHi: e.target.value });
                      else handleUpdateActiveTerm({ definitionHng: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-xs leading-relaxed focus:border-[#d4af37]/60 focus:outline-none"
                  />
                </div>

                {/* Tags Management */}
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Category Tags</label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(activeTerm.tags || []).map((tg) => (
                      <span key={tg} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[10px]">
                        {tg}
                        <button type="button" onClick={() => handleRemoveTag(tg)} className="hover:text-rose-400 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="+ tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        className="w-16 px-1.5 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-white"
                      />
                      <button type="button" onClick={handleAddTag} className="text-[#d4af37] hover:text-white cursor-pointer">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 text-xs border border-dashed border-white/5 rounded-xl">
                No key term selected. Click &quot;Add Term&quot; to begin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
