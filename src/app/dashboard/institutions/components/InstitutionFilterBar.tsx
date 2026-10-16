import { MapPin, Search, Filter } from 'lucide-react';
import { INDIAN_STATES } from '../constants';

interface InstitutionFilterBarProps {
  stateFilter: string;
  onStateFilterChange: (v: string) => void;
  cityQuery: string;
  onCityQueryChange: (v: string) => void;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  activeTab: 'requests' | 'master';
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
}

export function InstitutionFilterBar({
  stateFilter,
  onStateFilterChange,
  cityQuery,
  onCityQueryChange,
  searchQuery,
  onSearchQueryChange,
  activeTab,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: InstitutionFilterBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0d0d15] border border-white/10 p-4 rounded-2xl">
      {/* State Dropdown Filter */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
        <select
          value={stateFilter}
          onChange={(e) => onStateFilterChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
        >
          <option value="all">📍 All States / UTs</option>
          {INDIAN_STATES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* City / District Input Filter */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => onCityQueryChange(e.target.value)}
          placeholder="Filter by City / District (e.g. Bokaro)..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400/60"
        />
      </div>

      {/* Institution Name / Code Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search school name or code..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
        />
      </div>

      {/* Type / Status Filter */}
      {activeTab === 'requests' ? (
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses (Pending, Approved, Rejected)</option>
            <option value="pending">Pending Review Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      ) : (
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
          >
            <option value="all">All Types (Schools, Colleges, Companies)</option>
            <option value="school">Schools Only</option>
            <option value="college">Colleges Only</option>
            <option value="company">Companies / Organizations</option>
          </select>
        </div>
      )}
    </div>
  );
}
