'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Bell, Send, Smartphone, ShieldAlert, Loader2 } from 'lucide-react';

export default function PushNotificationsPage() {
  const [targetType, setTargetType] = useState('all');
  const [specificUid, setSpecificUid] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [statusMsg, setStatusMsg] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return alert("Title and body are required");

    setIsSending(true);
    setStatusMsg(null);

    const target = targetType === 'specific' ? specificUid : targetType;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/amritam/admin/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          target,
          title,
          body,
          deep_link: deepLink
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send notification');

      setStatusMsg({ type: 'success', msg: `Notification successfully dispatched.` });
      
      // Reset form
      setTitle('');
      setBody('');
      setDeepLink('');
      if (targetType === 'specific') setSpecificUid('');
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'Network error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#d4af37]" /> Push Notifications
        </h1>
        <p className="text-gray-400 mt-2">Send instant alerts to user devices via Firebase Cloud Messaging</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Form Editor */}
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <form onSubmit={handleSend} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
              <div className="flex gap-2">
                {['all', 'premium', 'specific'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetType(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${targetType === t ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]' : 'bg-[#050508] border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {targetType === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                <input 
                  type="text" required value={specificUid} onChange={e => setSpecificUid(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
                  placeholder="e.g. user_abc123"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notification Title</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)} maxLength={65}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
                placeholder="New Content Available!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Notification Body</label>
              <textarea 
                rows={3} required value={body} onChange={e => setBody(e.target.value)} maxLength={240}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
                placeholder="Tap here to explore the latest chapter..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Deep Link (Optional)</label>
              <input 
                type="text" value={deepLink} onChange={e => setDeepLink(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono text-sm"
                placeholder="e.g. arena, chat, curriculum/light"
              />
            </div>

            {statusMsg && (
              <div className={`p-4 rounded-lg flex gap-3 text-sm font-medium ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {statusMsg.type === 'error' ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <Bell className="w-5 h-5 flex-shrink-0" />}
                {statusMsg.msg}
              </div>
            )}

            <button 
              type="submit" disabled={isSending}
              className="w-full py-3.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSending ? 'Dispatching...' : 'Dispatch Notification'}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Android Device Preview</div>
          
          <div className="w-[320px] h-[600px] mx-auto bg-black rounded-[40px] border-[8px] border-zinc-800 p-4 relative shadow-2xl flex flex-col justify-start">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl"></div>
            
            {/* Time / Status bar mock */}
            <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 pt-2 mb-8 font-medium">
              <span>9:41</span>
              <div className="flex gap-1.5">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Notification Bubble */}
            <div className={`w-full bg-[#1a1a24] border border-white/5 rounded-2xl p-4 shadow-xl transition-all duration-500 transform ${title || body ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#b8860b] to-[#d4af37] flex items-center justify-center">
                  <ShieldAlert className="w-3 h-3 text-[#050508]" />
                </div>
                <span className="text-[11px] font-medium text-gray-400">Amritam • now</span>
              </div>
              <div className="text-sm font-bold text-white leading-tight mb-1">
                {title || 'Notification Title'}
              </div>
              <div className="text-xs text-gray-300 leading-snug line-clamp-2">
                {body || 'Notification body text will appear here. Keep it concise and engaging.'}
              </div>
            </div>
            
            {/* Ambient aesthetic */}
            <div className="mt-auto pb-8 text-center text-gray-800 flex flex-col items-center gap-4">
              <Smartphone className="w-12 h-12 text-zinc-800/50" />
              <div className="w-20 h-1 rounded-full bg-zinc-800/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
