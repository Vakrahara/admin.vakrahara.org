import { RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { PushTemplate } from '../types';

interface PushTemplatesTabProps {
  templates: PushTemplate[];
  isTemplatesLoading: boolean;
  onRefresh: () => void;
  onUseTemplate: (t: PushTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export function PushTemplatesTab({
  templates,
  isTemplatesLoading,
  onRefresh,
  onUseTemplate,
  onDeleteTemplate,
}: PushTemplatesTabProps) {
  return (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📋</span> Push Notification Templates
        </h2>
        <button 
          onClick={onRefresh}
          disabled={isTemplatesLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isTemplatesLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isTemplatesLoading && templates.length === 0 ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-[#050508]/50 rounded-xl border border-white/5 border-dashed">
          <p className="text-gray-400">No templates found. Save one from the compose tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-[#050508] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all flex flex-col group relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors">{t.name}</h3>
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.notification_type === 'announcement' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    t.notification_type === 'feature' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    t.notification_type === 'promotion' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' :
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {t.notification_type}
                  </span>
                  <button onClick={() => onDeleteTemplate(t.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-white font-medium text-sm mb-1">{t.title}</p>
              <p className="text-gray-400 text-xs mb-4 line-clamp-2">{t.body}</p>
              <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Target: {t.target_segment || 'all'}</span>
                <button 
                  onClick={() => onUseTemplate(t)}
                  className="px-4 py-1.5 bg-[#0d0d15] hover:bg-[#d4af37]/10 border border-white/10 hover:border-[#d4af37]/50 text-gray-300 hover:text-[#d4af37] rounded-lg text-xs font-medium transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
