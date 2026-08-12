'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { 
  Users, 
  Activity, 
  Globe, 
  GraduationCap, 
  RefreshCw,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface UserStats {
  totalUsers: number;
  totalRevenue?: number;
  mrr?: number;
  activeSubscribers?: number;
  activeStats: {
    active24h: number;
    active7d: number;
    inactive: number;
  };
  demographics: {
    role: Record<string, number>;
    board: Record<string, number>;
    class: Record<string, number>;
  };
}

export default function AnalyticsSummaryPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchLiveStats();
  }, []);

  const parseDisciplineStats = (statsField: any) => {
    if (!statsField) return {};
    if (typeof statsField === 'object') return statsField;
    try {
      return JSON.parse(statsField);
    } catch {
      return {};
    }
  };

  const fetchLiveStats = async () => {
    try {
      // 1. Try server aggregation endpoint first
      try {
        const data = await pb.send('/api/amritam/admin/user-stats', { method: 'GET' });
        if (data && data.totalUsers > 0) {
          setStats({
            totalUsers: data.totalUsers,
            activeStats: {
              active24h: data.active24h || 0,
              active7d: data.active7d || 0,
              inactive: data.inactive30d || 0,
            },
            totalRevenue: data.totalRevenue || 0,
            mrr: data.mrr || 0,
            activeSubscribers: data.activeSubscribers || 0,
            demographics: {
              board: data.boards || {},
              class: data.classes || {},
              role: data.roles || {},
            }
          });
          setLoading(false);
          setRefreshing(false);
          return;
        }
      } catch (err) {
        console.log('Custom API endpoint unavailable, computing live client telemetry...');
      }

      // 2. Compute live stats directly from PocketBase `users` collection
      const userRecords = await pb.collection('users').getFullList({
        sort: '-created',
      });

      const totalUsers = userRecords.length;
      const now = Date.now();
      let active24h = 0;
      let active7d = 0;
      let inactive = 0;

      const boardMap: Record<string, number> = {};
      const classMap: Record<string, number> = {};
      const roleMap: Record<string, number> = {};

      userRecords.forEach((user: any) => {
        // Activity timing
        const updatedTime = new Date(user.updated || user.created).getTime();
        const diffHours = (now - updatedTime) / (1000 * 60 * 60);

        if (diffHours <= 24) active24h++;
        if (diffHours <= 168) active7d++;
        if (diffHours > 720) inactive++;

        // Parse discipline_stats JSON payload
        const statsObj = parseDisciplineStats(user.discipline_stats);
        
        // Board
        const board = (statsObj.cbse_board || statsObj.board || 'CBSE').toString().toUpperCase();
        boardMap[board] = (boardMap[board] || 0) + 1;

        // Class
        let cls = (statsObj.cbse_class || statsObj.class || statsObj.standard || '10').toString().trim();
        cls = cls.replace(/^class\s+/i, '').trim();
        classMap[cls] = (classMap[cls] || 0) + 1;

        // Role
        const isSuperAdmin = (user.email || '').toLowerCase() === 'vkarms.vk@gmail.com';
        const role = isSuperAdmin ? 'Super Admin' : (statsObj.user_role || 'learner');
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        roleMap[formattedRole] = (roleMap[formattedRole] || 0) + 1;
      });

      setStats({
        totalUsers,
        activeStats: {
          active24h,
          active7d,
          inactive,
        },
        demographics: {
          board: boardMap,
          class: classMap,
          role: roleMap,
        },
      });
    } catch (err: any) {
      console.error('Failed to compute live analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveStats();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-10 w-24 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white/5 border border-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 border border-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const active24h = stats?.activeStats?.active24h || 0;
  const active7d = stats?.activeStats?.active7d || 0;
  const inactive = stats?.activeStats?.inactive || 0;

  const boardData = Object.entries(stats?.demographics?.board || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }));

  const classAggregator: Record<string, number> = {};
  Object.entries(stats?.demographics?.class || {}).forEach(([name, value]) => {
    const cleanName = name.replace(/^(class\s*)+/ig, '').trim();
    const finalName = `Class ${cleanName}`;
    classAggregator[finalName] = (classAggregator[finalName] || 0) + (Number(value) || 0);
  });
  const classData = Object.entries(classAggregator).map(([name, value]) => ({ name, value }));

  const roleData = Object.entries(stats?.demographics?.role || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }));

  const COLORS = ['#d4af37', '#b8860b', '#800020', '#3b82f6', '#10b981', '#a855f7'];

  const activeRate = totalUsers > 0 
    ? Math.round(((active24h + active7d) / totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#d4af37]" />
            Dashboard Summary
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gurukulam telemetry and somatic progression analysis.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0d0d15] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-wider text-gray-300 disabled:opacity-40 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Live Aggregates
        </button>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between border-[#d4af37]/30">
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Total Revenue</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
            <div className="text-[10px] text-[#d4af37]/80 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              All-time processed volume
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-emerald-500/20">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Active Subscribers</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">{stats?.activeSubscribers || 0}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Currently premium
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-blue-500/20">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Estimated MRR</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">₹{stats?.mrr?.toLocaleString('en-IN') || 0}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              Monthly recurring revenue
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Activity KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Enrolled</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">{totalUsers}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
              Lifetime registrations
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Daily Active (24h)</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">{active24h}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Users sync'd today
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Weekly Active (7d)</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">{active7d}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              {activeRate}% activity index
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Inactive (&gt;30d)</span>
            <div className="text-3xl font-extrabold text-white mt-1.5">{inactive}</div>
            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              Drop-offs needing nudge
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-4 h-4 text-[#d4af37]" />
            <h3 className="font-semibold text-white text-base">Curriculum Board Enrollments</h3>
          </div>
          <div className="h-80 w-full">
            {mounted && boardData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0d15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No board demographics registered yet.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-4 h-4 text-[#d4af37]" />
            <h3 className="font-semibold text-white text-base">Standard / Class Distribution</h3>
          </div>
          <div className="h-80 flex flex-col sm:flex-row items-center justify-center gap-6">
            {mounted && classData.length > 0 ? (
              <>
                <div className="h-60 w-60 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0d15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {classData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2.5 text-gray-400">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {item.name}
                      </span>
                      <span className="font-semibold text-white">{item.value} users</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No standard demographic data recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Breakdown Distribution */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <h3 className="font-semibold text-white text-base">User Roles Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {roleData.map((role, idx) => {
            const pct = totalUsers > 0 ? Math.round((role.value / totalUsers) * 100) : 0;
            return (
              <div key={role.name} className="p-4 bg-[#08080c] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wide">
                  <span>{role.name}</span>
                  <span className="text-[#d4af37]">{pct}%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">{role.value}</div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] rounded-full" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
