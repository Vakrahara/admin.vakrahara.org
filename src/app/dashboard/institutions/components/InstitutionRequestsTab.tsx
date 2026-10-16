import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { InstitutionRequestRecord } from '@/types/institutions';

interface InstitutionRequestsTabProps {
  loading: boolean;
  requests: InstitutionRequestRecord[];
  requestsPage: number;
  requestsTotalPages: number;
  onLoadMore: () => void;
  onReview: (req: InstitutionRequestRecord) => void;
  onDelete: (id: string) => void;
}

export function InstitutionRequestsTab({
  loading,
  requests,
  requestsPage,
  requestsTotalPages,
  onLoadMore,
  onReview,
  onDelete,
}: InstitutionRequestsTabProps) {
  return (
    <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d0d15] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">Requested Institution</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Supporters</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-white block">{req.requested_name || 'Unnamed Institution'}</span>
                    {req.expand?.requested_by && (
                      <span className="text-xs text-gray-500">
                        By: {req.expand.requested_by.name || req.expand.requested_by.username}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-xs text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      {req.city || 'N/A'}{req.state ? `, ${req.state}` : ''}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                      {req.type || 'school'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Users className="w-3 h-3" />
                      {req.supporters?.length || 1}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {req.status === 'pending' && (
                      <Badge variant="gold" icon={Clock}>Pending Review</Badge>
                    )}
                    {req.status === 'approved' && (
                      <Badge variant="green" icon={CheckCircle2}>Approved</Badge>
                    )}
                    {req.status === 'rejected' && (
                      <Badge variant="red" icon={XCircle}>Rejected</Badge>
                    )}
                  </td>

                  <td className="py-4 px-6 text-xs text-gray-400">
                    {formatDate(req.created)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onReview(req)}
                        className="px-3.5 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded-xl text-xs font-semibold transition-colors"
                      >
                        Review & Edit
                      </button>

                      <button
                        onClick={() => onDelete(req.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl transition-colors"
                        title="Delete Request Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 text-sm space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-gray-600 mb-2" />
          <p>No user institution requests match your search query.</p>
        </div>
      )}

      {requestsPage < requestsTotalPages && (
        <div className="p-4 border-t border-white/10 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}
