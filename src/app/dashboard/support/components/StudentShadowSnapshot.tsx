import { BookOpen, Swords } from 'lucide-react';
import { ShadowData } from '../types';

interface StudentShadowSnapshotProps {
  shadowData: ShadowData;
}

export function StudentShadowSnapshot({ shadowData }: StudentShadowSnapshotProps) {
  const planLabel = (shadowData.user.premium_plan || 'pro').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Account Summary Banner */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Student Identity</span>
          <div className="text-lg font-bold text-white mt-1">{shadowData.user.name || 'Anonymous'}</div>
          <div className="text-xs text-gray-400 font-mono">{shadowData.user.email}</div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {shadowData.user.id}</div>
        </div>

        <div>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Subscription State</span>
          <div className="mt-1">
            {shadowData.user.is_premium ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                PREMIUM ({planLabel})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30">
                FREE TIER
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Expiry: {shadowData.user.subscription_expiry ? new Date(shadowData.user.subscription_expiry).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Registered Devices</span>
          <div className="text-lg font-bold text-white mt-1">{shadowData.devices.length} Devices</div>
          <div className="text-xs text-gray-400 mt-0.5">Multi-device FCM active</div>
        </div>

        <div>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Account Age</span>
          <div className="text-sm font-medium text-white mt-1">
            {new Date(shadowData.user.created).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">Last active: {new Date(shadowData.user.updated).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Multi-Section Tabs: Devices, Orders, Syllabus, Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Syllabus / Yatra Progress */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Yatra & Syllabus Progress</h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {shadowData.yatraProgress.length === 0 ? (
              <div className="text-xs text-gray-500 py-6 text-center">No syllabus progress recorded yet.</div>
            ) : (
              shadowData.yatraProgress.map((yp) => (
                <div key={yp.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-white">{yp.chapter_id || 'Chapter'}</div>
                    <div className="text-gray-500">Step: {yp.current_step || '1'}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                    {yp.is_completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Buddhi Arena Match History */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Buddhi Arena Challenges</h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {shadowData.arenaMatches.length === 0 ? (
              <div className="text-xs text-gray-500 py-6 text-center">No multiplayer duel records.</div>
            ) : (
              shadowData.arenaMatches.map((m) => (
                <div key={m.id} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-white">{m.is_rated ? 'Ranked Match' : 'Friendly Duel'}</div>
                    <div className="text-gray-500">Status: {m.status}</div>
                  </div>
                  <span className="text-gray-400 font-mono">{new Date(m.created).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
