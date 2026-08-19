'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Activity, Bell, ShoppingBag, UserPlus, Swords, ShieldAlert, X } from 'lucide-react';

interface PulseEvent {
  id: string;
  type: 'user' | 'order' | 'duel' | 'report';
  title: string;
  detail: string;
  time: string;
}

export function LivePulseStream() {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Subscribe to PocketBase realtime collections
    const subUsers = async () => {
      try {
        await pb.collection('users').subscribe('*', (e) => {
          if (e.action === 'create') {
            addEvent({
              id: Math.random().toString(),
              type: 'user',
              title: 'New Student Signup',
              detail: `${e.record.name || e.record.username || 'Student'} joined Amritam`,
              time: new Date().toLocaleTimeString(),
            });
          }
        });

        await pb.collection('orders').subscribe('*', (e) => {
          if (e.action === 'create' || (e.action === 'update' && e.record.status === 'paid')) {
            addEvent({
              id: Math.random().toString(),
              type: 'order',
              title: 'Order Paid & Settled',
              detail: `₹${e.record.amount_paise / 100} for ${e.record.plan} subscription`,
              time: new Date().toLocaleTimeString(),
            });
          }
        });

        await pb.collection('arena_challenges').subscribe('*', (e) => {
          if (e.action === 'create') {
            addEvent({
              id: Math.random().toString(),
              type: 'duel',
              title: 'Buddhi Arena Duel Initiated',
              detail: `Match started between students`,
              time: new Date().toLocaleTimeString(),
            });
          }
        });
      } catch (err) {
        console.error('Pulse stream subscription error:', err);
      }
    };

    subUsers();

    return () => {
      pb.collection('users').unsubscribe('*');
      pb.collection('orders').unsubscribe('*');
      pb.collection('arena_challenges').unsubscribe('*');
    };
  }, []);

  const addEvent = (ev: PulseEvent) => {
    setEvents((prev) => [ev, ...prev].slice(0, 50));
  };

  const getIcon = (type: PulseEvent['type']) => {
    switch (type) {
      case 'user': return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
      case 'order': return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'duel': return <Swords className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-[#d4af37]" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0d0d15]/90 border border-white/10 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl hover:border-[#d4af37]/50 transition group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Live Pulse Stream</span>
        {events.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#d4af37] text-black text-[10px] font-bold">
            {events.length}
          </span>
        )}
      </button>

      {/* Floating Panel Popup */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-[#0d0d15] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3 animate-fade-in backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Real-time Activity</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Listening for live events from PocketBase...
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-2.5 bg-white/2 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      {getIcon(ev.type)}
                      <span>{ev.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{ev.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 pl-5">{ev.detail}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
