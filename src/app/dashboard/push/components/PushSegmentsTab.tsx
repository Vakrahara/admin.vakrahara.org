import { Filter, RefreshCw, Target, Trash2, Loader2 } from 'lucide-react';
import { PushSegment } from '../types';

interface PushSegmentsTabProps {
  savedSegments: PushSegment[];
  isSegmentsLoading: boolean;
  onRefresh: () => void;
  onRefreshReach: (seg: PushSegment) => void;
  onUseSegment: (seg: PushSegment) => void;
  onDeleteSegment: (id: string) => void;
}

export function PushSegmentsTab({
  savedSegments,
  isSegmentsLoading,
  onRefresh,
  onRefreshReach,
  onUseSegment,
  onDeleteSegment,
}: PushSegmentsTabProps) {
  return (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#d4af37]" /> Audience Segments
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            disabled={isSegmentsLoading}
            className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSegmentsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 px-4">Description</th>
              <th className="pb-3 px-4">Filter</th>
              <th className="pb-3 px-4 text-center">Est. Reach</th>
              <th className="pb-3 px-4 text-center">Uses</th>
              <th className="pb-3 pl-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {savedSegments.map((seg) => (
              <tr key={seg.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 pr-4 whitespace-nowrap text-sm">
                  <div className="font-bold text-gray-200">{seg.name}</div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {seg.description}
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-gray-500 bg-black/50 p-2 rounded border border-white/5 max-w-xs overflow-hidden text-ellipsis">
                    {seg.filter_string}
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-mono text-sm text-[#d4af37]">
                  {seg.estimated_reach !== null && seg.estimated_reach !== undefined ? seg.estimated_reach.toLocaleString() : '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-400">
                  {seg.use_count || 0}
                </td>
                <td className="py-4 pl-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onRefreshReach(seg)} 
                    className="text-gray-400 hover:text-[#d4af37] mr-3" 
                    title="Refresh Reach"
                  >
                    <RefreshCw className="w-4 h-4 inline"/>
                  </button>
                  
                  <button 
                    onClick={() => onUseSegment(seg)} 
                    className="text-gray-400 hover:text-white mr-3" 
                    title="Use Segment"
                  >
                    <Target className="w-4 h-4 inline"/>
                  </button>
                  
                  <button 
                    onClick={() => onDeleteSegment(seg.id)} 
                    className="text-gray-500 hover:text-red-400" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 inline"/>
                  </button>
                </td>
              </tr>
            ))}
            {isSegmentsLoading && savedSegments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading segments...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
