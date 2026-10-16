import { Users, Plus, XCircle, RefreshCw } from 'lucide-react';
import { AudienceMode, PushAudienceBuilderProps } from '../types';

export function PushAudienceBuilder({
  audienceMode,
  setAudienceMode,
  targetType,
  setTargetType,
  specificUid,
  setSpecificUid,
  targetFilter,
  setTargetFilter,
  estimatedReach,
  savedSegments,
  selectedSegmentId,
  setSelectedSegmentId,
  customRules,
  setCustomRules,
  updateReachForFilter,
  onSaveSegment,
  showSaveSegmentForm,
  setShowSaveSegmentForm,
  newSegmentName,
  setNewSegmentName,
  newSegmentDesc,
  setNewSegmentDesc,
}: PushAudienceBuilderProps) {
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <label className="text-sm font-medium text-gray-400">Target Audience</label>
        {estimatedReach !== null && (
          <span className="text-xs text-[#d4af37] flex items-center gap-1 bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">
            <Users className="w-3 h-3" /> ~{estimatedReach.toLocaleString()} users
          </span>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex border-b border-white/10 mb-4">
        {[
          { id: 'quick', label: 'Quick Select' },
          { id: 'saved', label: 'Saved Segments' },
          { id: 'custom', label: 'Custom Rules' },
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setAudienceMode(mode.id as AudienceMode)}
            className={`flex-1 pb-2 text-sm font-medium transition-all relative ${
              audienceMode === mode.id ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {mode.label}
            {audienceMode === mode.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4af37]" />}
          </button>
        ))}
      </div>

      {/* QUICK MODE */}
      {audienceMode === 'quick' && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {['all', 'premium', 'free', 'specific'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTargetType(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                targetType === t
                  ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]'
                  : 'bg-[#050508] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* SAVED SEGMENTS MODE */}
      {audienceMode === 'saved' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <select
            value={selectedSegmentId}
            onChange={(e) => {
              setSelectedSegmentId(e.target.value);
              const seg = savedSegments.find((s) => s.id === e.target.value);
              if (seg) setTargetFilter(seg.filter_string);
            }}
            className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all"
          >
            <option value="" disabled>
              Select a segment...
            </option>
            {savedSegments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name} - {seg.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CUSTOM RULES MODE */}
      {audienceMode === 'custom' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-[#050508] border border-white/10 rounded-lg p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              Has FCM Token
            </span>

            {!customRules.find((r) => r.type === 'is_premium' || r.type === 'is_free') && (
              <>
                <button
                  type="button"
                  onClick={() => setCustomRules([...customRules, { type: 'is_premium' }])}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Is Premium
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRules([...customRules, { type: 'is_free' }])}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-300 border border-gray-500/20 hover:bg-gray-500/20 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Is Free
                </button>
              </>
            )}
            {customRules.find((r) => r.type === 'is_premium') && (
              <button
                type="button"
                onClick={() => setCustomRules(customRules.filter((r) => r.type !== 'is_premium'))}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500 text-white flex items-center gap-1"
              >
                Is Premium <XCircle className="w-3 h-3" />
              </button>
            )}
            {customRules.find((r) => r.type === 'is_free') && (
              <button
                type="button"
                onClick={() => setCustomRules(customRules.filter((r) => r.type !== 'is_free'))}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-600 text-white flex items-center gap-1"
              >
                Is Free <XCircle className="w-3 h-3" />
              </button>
            )}

            {!customRules.find((r) => r.type === 'streak') ? (
              <button
                type="button"
                onClick={() => setCustomRules([...customRules, { type: 'streak', value: 3 }])}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Streak ≥ N
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <span className="text-xs">Streak ≥</span>
                <input
                  type="number"
                  value={customRules.find((r) => r.type === 'streak').value}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules.find((r) => r.type === 'streak').value = e.target.value;
                    setCustomRules(newRules);
                  }}
                  className="w-10 bg-transparent outline-none text-xs text-white border-b border-orange-500/50 text-center"
                />
                <button
                  type="button"
                  onClick={() => setCustomRules(customRules.filter((r) => r.type !== 'streak'))}
                >
                  <XCircle className="w-3 h-3 text-orange-400 hover:text-orange-300" />
                </button>
              </div>
            )}

            {!customRules.find((r) => r.type === 'inactive') ? (
              <button
                type="button"
                onClick={() => setCustomRules([...customRules, { type: 'inactive', value: 7 }])}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Inactive &gt; N days
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <span className="text-xs">Inactive &gt;</span>
                <input
                  type="number"
                  value={customRules.find((r) => r.type === 'inactive').value}
                  onChange={(e) => {
                    const newRules = [...customRules];
                    newRules.find((r) => r.type === 'inactive').value = e.target.value;
                    setCustomRules(newRules);
                  }}
                  className="w-10 bg-transparent outline-none text-xs text-white border-b border-purple-500/50 text-center"
                />
                <span className="text-xs">days</span>
                <button
                  type="button"
                  onClick={() => setCustomRules(customRules.filter((r) => r.type !== 'inactive'))}
                >
                  <XCircle className="w-3 h-3 text-purple-400 hover:text-purple-300" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-black/50 p-2 rounded border border-white/5 font-mono text-[10px] text-gray-500 overflow-x-auto whitespace-nowrap">
            {targetFilter}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => updateReachForFilter(targetFilter)}
              className="text-xs flex items-center gap-1 px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37]/20 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Estimate Reach
            </button>
            <button
              type="button"
              onClick={() => setShowSaveSegmentForm(!showSaveSegmentForm)}
              className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
              Save as Segment
            </button>
          </div>

          {showSaveSegmentForm && (
            <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
              <input
                type="text"
                placeholder="Segment Name"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]/50"
              />
              <input
                type="text"
                placeholder="Description"
                value={newSegmentDesc}
                onChange={(e) => setNewSegmentDesc(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveSegmentForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSaveSegment(newSegmentName, newSegmentDesc)}
                  className="text-xs px-3 py-1 bg-[#d4af37] text-black rounded font-medium hover:bg-[#b8860b]"
                >
                  Save Segment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {audienceMode === 'quick' && targetType === 'specific' && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            required
            value={specificUid}
            onChange={(e) => setSpecificUid(e.target.value)}
            className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all text-sm"
            placeholder="e.g. user_abc123"
          />
        </div>
      )}
    </div>
  );
}
