import { Search, RefreshCw, AlertTriangle } from 'lucide-react';

interface StudentShadowLookupProps {
  search: string;
  onSearchChange: (val: string) => void;
  onSearch: (val: string) => void;
  loading: boolean;
  error: string;
}

export function StudentShadowLookup({
  search,
  onSearchChange,
  onSearch,
  loading,
  error,
}: StudentShadowLookupProps) {
  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Lookup Student Profile
      </label>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Enter student Email (e.g. user@gmail.com) or Record ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(search)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
          />
        </div>
        <button
          onClick={() => onSearch(search)}
          disabled={loading || !search.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black font-semibold text-sm transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>Inspect Student</span>
        </button>
      </div>
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
