import { Search } from 'lucide-react';

interface AuditFilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  actionFilter: string;
  onActionChange: (val: string) => void;
  severityFilter: string;
  onSeverityChange: (val: string) => void;
}

export function AuditFilterToolbar({
  search,
  onSearchChange,
  actionFilter,
  onActionChange,
  severityFilter,
  onSeverityChange,
}: AuditFilterToolbarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search email, target ID, or action..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#0d0d15] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
        />
      </div>

      <select
        value={actionFilter}
        onChange={(e) => onActionChange(e.target.value)}
        className="bg-[#0d0d15] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/50"
      >
        <option value="">All Action Types</option>
        <option value="USER_PREMIUM_GRANTED">USER_PREMIUM_GRANTED</option>
        <option value="USER_PREMIUM_REVOKED">USER_PREMIUM_REVOKED</option>
        <option value="USER_TRIAL_GRANTED">USER_TRIAL_GRANTED</option>
        <option value="FEEDBACK_REPORT_RESOLVED">FEEDBACK_REPORT_RESOLVED</option>
        <option value="MODERATION_REPORT_RESOLVED">MODERATION_REPORT_RESOLVED</option>
      </select>

      <select
        value={severityFilter}
        onChange={(e) => onSeverityChange(e.target.value)}
        className="bg-[#0d0d15] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#d4af37]/50"
      >
        <option value="">All Severities</option>
        <option value="INFO">INFO</option>
        <option value="WARNING">WARNING</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
    </div>
  );
}
