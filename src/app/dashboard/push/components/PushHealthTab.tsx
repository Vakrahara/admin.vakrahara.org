import { Activity, RefreshCw, Zap, Users, AlertTriangle, Trash2 } from 'lucide-react';

interface PushHealthTabProps {
  totalTokens: number;
  totalUsers: number;
  tokenRate: string;
  isHealthLoading: boolean;
  onRefresh: () => void;
  onCleanStaleTokens: () => void;
}

export function PushHealthTab({
  totalTokens,
  totalUsers,
  tokenRate,
  isHealthLoading,
  onRefresh,
  onCleanStaleTokens,
}: PushHealthTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#d4af37]" /> Token Health Overview
          </h2>
          <p className="text-sm text-gray-400 mt-1">Monitor FCM token registration rates across your user base.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isHealthLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isHealthLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-16 h-16 text-[#d4af37]" /></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Tokens</p>
          <p className="text-4xl font-bold text-white font-mono">{isHealthLoading ? '-' : totalTokens.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-[#d4af37]" /></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Token Rate</p>
          <p className="text-4xl font-bold text-[#d4af37] font-mono">{isHealthLoading ? '-' : `${tokenRate}%`}</p>
        </div>
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-[#d4af37]" /></div>
          <p className="text-sm text-gray-400 font-medium mb-1">Total Users</p>
          <p className="text-4xl font-bold text-white font-mono">{isHealthLoading ? '-' : totalUsers.toLocaleString()}</p>
        </div>
      </div>

      {Number(tokenRate) < 80 && !isHealthLoading && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex gap-4 items-start shadow-lg">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-500 font-bold mb-1">Low Registration Rate Detected</h3>
            <p className="text-sm text-yellow-500/80 leading-relaxed">
              Less than 80% of your users have valid push notification tokens. Ensure that the mobile app is properly requesting notification permissions on launch and syncing tokens to PocketBase.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-lg mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Maintenance</h3>
        <p className="text-sm text-gray-400 mb-6">Remove expired or invalid tokens from the database to improve delivery rates and reduce sending errors.</p>
        <button 
          onClick={onCleanStaleTokens}
          className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-all font-medium flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" /> Clean Stale Tokens
        </button>
      </div>
    </div>
  );
}
