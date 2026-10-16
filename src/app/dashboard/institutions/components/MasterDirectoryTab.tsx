import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import {
  Globe,
  MapPin,
  CheckCircle2,
  Edit3,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { MasterInstitutionRecord } from '@/types/institutions';

interface MasterDirectoryTabProps {
  loading: boolean;
  masterInstitutions: MasterInstitutionRecord[];
  masterPage: number;
  masterTotalPages: number;
  onLoadMore: () => void;
  onEdit: (inst: MasterInstitutionRecord) => void;
  onDelete: (id: string) => void;
}

export function MasterDirectoryTab({
  loading,
  masterInstitutions,
  masterPage,
  masterTotalPages,
  onLoadMore,
  onEdit,
  onDelete,
}: MasterDirectoryTabProps) {
  return (
    <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : masterInstitutions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d0d15] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">Published School Name</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Code / Source</th>
                <th className="py-4 px-6">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {masterInstitutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-white block">{inst.name || 'Unnamed'}</span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-xs text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      {inst.city || 'N/A'}{inst.state ? `, ${inst.state}` : ''}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border ${
                      inst.type === 'college' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : inst.type === 'company'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      {inst.type || 'school'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="font-mono text-xs text-gray-400">{inst.code || 'N/A'}</span>
                      {inst.source_type === 'MANUAL' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20" title="Added or approved manually by an admin">
                          <CheckCircle2 className="w-3 h-3" />
                          User Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10" title="Sourced from official databases (AISHE, UDISE, etc)">
                          <Globe className="w-3 h-3" />
                          Pre-Feed Data
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-gray-400">
                    {formatDate(inst.created)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(inst)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit School
                      </button>

                      <button
                        onClick={() => onDelete(inst.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl transition-colors"
                        title="Delete School from Directory"
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
          <Globe className="w-8 h-8 mx-auto text-gray-600 mb-2" />
          <p>No master published schools match your search query.</p>
        </div>
      )}

      {masterPage < masterTotalPages && (
        <div className="p-4 border-t border-white/10 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sm font-semibold text-sky-400 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Load More Schools
          </button>
        </div>
      )}
    </div>
  );
}
