'use client';

import { GraduationCap, ShieldCheck } from 'lucide-react';
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
import { UserStats } from '../types';

interface DemographicsChartsProps {
  stats: UserStats | null;
  mounted: boolean;
}

const COLORS = ['#d4af37', '#b8860b', '#800020', '#3b82f6', '#10b981', '#a855f7'];

export function DemographicsCharts({ stats, mounted }: DemographicsChartsProps) {
  const totalUsers = stats?.totalUsers || 0;

  const boardData = Object.entries(stats?.demographics?.board || {})
    .filter(([_, value]) => Number(value) > 0)
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0,
    }));

  const classAggregator: Record<string, number> = {};
  Object.entries(stats?.demographics?.class || {}).forEach(([name, value]) => {
    const cleanName = name.replace(/^(class\s*)+/gi, '').trim();
    const finalName = `Class ${cleanName}`;
    classAggregator[finalName] = (classAggregator[finalName] || 0) + (Number(value) || 0);
  });
  const classData = Object.entries(classAggregator)
    .filter(([_, value]) => Number(value) > 0)
    .map(([name, value]) => ({ name, value }));

  const roleData = Object.entries(stats?.demographics?.role || {})
    .filter(([_, value]) => Number(value) > 0)
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0,
    }));

  return (
    <div className="space-y-8">
      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Board Enrollments */}
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
                    contentStyle={{
                      backgroundColor: '#0d0d15',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
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

        {/* Class Distribution */}
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
                        {classData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0d0d15',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {classData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2.5 text-gray-400">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
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
          {roleData.length > 0 ? (
            roleData.map((role) => {
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
            })
          ) : (
            <div className="col-span-3 text-center py-6 text-gray-500 text-sm">
              No role breakdown available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
