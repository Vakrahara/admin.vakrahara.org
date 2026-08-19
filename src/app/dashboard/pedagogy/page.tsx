'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  GraduationCap, BookOpen, TrendingDown, Target, BarChart3,
  Clock, CheckCircle2, RefreshCw, Layers, Award
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

const DEMO_FUNNEL = [
  { step: 'Module Open', students: 100, dropoff: '0%' },
  { step: 'Step 1 (Phenomenon)', students: 88, dropoff: '12%' },
  { step: 'Step 2 (Simulation)', students: 74, dropoff: '16%' },
  { step: 'Step 3 (Saraswati Tab)', students: 62, dropoff: '16%' },
  { step: 'Step 4 (Final Quiz)', students: 54, dropoff: '13%' },
  { step: 'Module Complete', students: 51, dropoff: '6%' },
];

const CLASS_COMPLETION = [
  { class: 'Class 6', completionRate: 68, activeStudents: 210 },
  { class: 'Class 7', completionRate: 62, activeStudents: 185 },
  { class: 'Class 8', completionRate: 59, activeStudents: 160 },
  { class: 'Class 9', completionRate: 74, activeStudents: 290 },
  { class: 'Class 10', completionRate: 81, activeStudents: 420 },
  { class: 'Class 11', completionRate: 48, activeStudents: 95 },
  { class: 'Class 12', completionRate: 52, activeStudents: 110 },
];

export default function PedagogyAnalyticsPage() {
  const [chaptersCount, setChaptersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await pb.collection('cbse_chapters').getList(1, 1);
        setChaptersCount(res.totalItems);
      } catch (e) {}
      finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Pedagogy & Curriculum Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              CBSE Sanskrit Engine
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Drop-off funnel metrics, concept step friction analysis, and completion rate heatmaps.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Chapters</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{chaptersCount || 36} Chapters</div>
          <div className="text-xs text-gray-500 mt-1">Class 6 to Class 12 Syllabus</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Avg Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">63.4%</div>
          <div className="text-xs text-gray-500 mt-1">From intro step to final quiz</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Biggest Friction Step</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">Saraswati Tab</div>
          <div className="text-xs text-gray-500 mt-1">16% drop-off at definition builder</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Avg Time Per Module</span>
            <Clock className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">6m 45s</div>
          <div className="text-xs text-gray-500 mt-1">High student somatic engagement</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop-Off Funnel Chart */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Module Progression & Drop-Off Funnel</h2>
            <p className="text-xs text-gray-400">Student retention across interactive simulation stages</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_FUNNEL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="step" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d15', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="students" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#goldFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class-wise Completion Rate */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Class-wise Syllabus Completion Rate</h2>
            <p className="text-xs text-gray-400">Completion % comparison from Class 6 to 12</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLASS_COMPLETION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="class" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d0d15', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="completionRate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
