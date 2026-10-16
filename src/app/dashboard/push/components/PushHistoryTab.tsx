import React from 'react';
import {
  History, RefreshCw, Clock, Loader2, CheckCircle, XCircle, ChevronUp, ChevronDown
} from 'lucide-react';
import { timeAgo } from '../utils';
import { PushCampaign } from '../types';

interface PushHistoryTabProps {
  campaigns: PushCampaign[];
  isHistoryLoading: boolean;
  onRefresh: () => void;
  expandedCampId: string | null;
  setExpandedCampId: (id: string | null) => void;
  campaignStats: Record<string, { opened: number }>;
}

export function PushHistoryTab({
  campaigns,
  isHistoryLoading,
  onRefresh,
  expandedCampId,
  setExpandedCampId,
  campaignStats,
}: PushHistoryTabProps) {
  return (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[#d4af37]" /> Campaign History
        </h2>
        <button 
          onClick={onRefresh}
          disabled={isHistoryLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isHistoryLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {campaigns.length === 0 && !isHistoryLoading ? (
        <div className="text-center py-16 bg-[#050508]/50 rounded-xl border border-white/5 border-dashed">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No campaigns yet. Send your first notification above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 px-4">Title</th>
                <th className="pb-3 px-4">Target</th>
                <th className="pb-3 px-4 text-center">Sent</th>
                <th className="pb-3 px-4 text-center">Open Rate</th>
                <th className="pb-3 px-4 text-center">Errors</th>
                <th className="pb-3 pl-4">Status</th>
                <th className="pb-3 pl-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((camp) => {
                const opened = campaignStats[camp.id]?.opened || 0;
                const sent = camp.sent_count || 0;
                const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
                
                return (
                  <React.Fragment key={camp.id}>
                    <tr onClick={() => setExpandedCampId(expandedCampId === camp.id ? null : camp.id)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="py-4 pr-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="font-medium text-gray-300">{timeAgo(camp.created)}</div>
                        <div className="text-xs">{new Date(camp.created).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-200 line-clamp-1">{camp.title}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400 capitalize">
                        {camp.target_segment || camp.target || 'all'}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-sm text-green-400">
                        {sent}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-sm text-blue-400">
                        {openRate}%
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-sm text-red-400">
                        {camp.error_count || 0}
                      </td>
                      <td className="py-4 pl-4 whitespace-nowrap">
                        {camp.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock className="w-3 h-3" /> Pending</span>}
                        {camp.status === 'sending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> Sending</span>}
                        {camp.status === 'done' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3" /> Done</span>}
                        {camp.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20"><XCircle className="w-3 h-3" /> Cancelled</span>}
                        {!['pending','sending','done','cancelled'].includes(camp.status) && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 capitalize">{camp.status || 'unknown'}</span>}
                      </td>
                      <td className="py-4 pl-4 text-gray-500">
                        {expandedCampId === camp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {expandedCampId === camp.id && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan={8} className="p-6 text-sm text-gray-300">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                              <div className="text-gray-500 mb-1">Body</div>
                              <div className="font-medium text-white">{camp.body}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 mb-1">Deep Link</div>
                              <div className="font-medium font-mono text-white">{camp.deep_link || '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 mb-1">Total Opens</div>
                              <div className="font-medium text-white text-xl">{opened}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 mb-1">CTR / Open Rate</div>
                              <div className="font-medium text-blue-400 text-xl">{openRate}%</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {isHistoryLoading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
