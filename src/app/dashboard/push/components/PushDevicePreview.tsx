import { Bell, Zap, Smartphone } from 'lucide-react';

interface PushDevicePreviewProps {
  title: string;
  body: string;
  imageUrl: string;
  notificationType: string;
  priority: boolean;
}

export function PushDevicePreview({
  title,
  body,
  imageUrl,
  notificationType,
  priority,
}: PushDevicePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2 text-center lg:text-left">
        Android Device Preview
      </div>
      
      <div className="w-[320px] h-[650px] mx-auto bg-black rounded-[40px] border-[8px] border-zinc-800 p-4 relative shadow-2xl flex flex-col justify-start">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20"></div>
        
        {/* Time / Status bar mock */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 pt-2 mb-8 font-medium relative z-20">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Wallpaper background mock */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d15] to-[#050508] rounded-[32px] overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#d4af37]/20 blur-3xl rounded-full"></div>
        </div>

        {/* Notification Bubble */}
        <div className={`relative z-10 w-full bg-[#1a1a24] border border-white/5 rounded-2xl p-4 shadow-2xl transition-all duration-500 transform ${title || body || imageUrl ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#b8860b] to-[#d4af37] flex items-center justify-center shadow-lg">
              <Bell className="w-3 h-3 text-[#050508]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 tracking-wide uppercase">Amrtam • now</span>
            {priority && <Zap className="w-3 h-3 text-red-400 ml-auto" />}
          </div>
          
          <div className="text-[15px] font-bold text-white leading-tight mb-1.5">
            {title || 'Notification Title'}
          </div>
          
          <div className="text-[13px] text-gray-300 leading-snug line-clamp-3 mb-3">
            {body || 'Notification body text will appear here. Keep it concise and engaging.'}
          </div>

          {imageUrl && (
            <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden border border-white/5 mt-2">
              <img src={imageUrl} alt="Push attachment" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          
          {notificationType !== 'announcement' && (
            <div className="mt-3 inline-flex bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-400 font-medium uppercase tracking-wider border border-white/5">
              {notificationType}
            </div>
          )}
        </div>
        
        {/* Ambient aesthetic */}
        <div className="mt-auto pb-8 text-center text-gray-800 flex flex-col items-center gap-4 relative z-10">
          <Smartphone className="w-12 h-12 text-zinc-800/50" />
          <div className="w-20 h-1 rounded-full bg-zinc-800/50"></div>
        </div>
      </div>
    </div>
  );
}
