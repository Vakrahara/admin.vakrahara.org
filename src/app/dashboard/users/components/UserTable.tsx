'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Crown, 
  Award, 
  GraduationCap,
  ShieldCheck,
  Clock,
  UserCheck
} from 'lucide-react';
import type { UserRecord } from '../types';

export type { UserRecord };

interface UserTableProps {
  loading: boolean;
  users: UserRecord[];
  onSelectUser: (user: UserRecord, tab: 'profile' | 'telemetry' | 'roles' | 'subscriptions') => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  parseDisciplineStats: (statsField: any) => any;
}

export function UserTable({
  loading,
  users,
  onSelectUser,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  parseDisciplineStats,
}: UserTableProps) {
  return (
    <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d0d15] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-3.5 px-3.5 min-w-[150px] whitespace-nowrap">User Profile</th>
                <th className="py-3.5 px-3.5 min-w-[210px] whitespace-nowrap">Contact Credentials</th>
                <th className="py-3.5 px-3.5 min-w-[120px] whitespace-nowrap">Verification</th>
                <th className="py-3.5 px-3.5 min-w-[110px] whitespace-nowrap">Role</th>
                <th className="py-3.5 px-3.5 min-w-[100px] whitespace-nowrap">Premium</th>
                <th className="py-3.5 px-3.5 min-w-[120px] whitespace-nowrap">Curriculum</th>
                <th className="py-3.5 px-3.5 text-right min-w-[210px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {users.map((user) => {
                const statsObj = parseDisciplineStats(user.discipline_stats);
                const isCurriculumSetup = statsObj.cbse_class || statsObj.cbse_board;
                const userRole = statsObj.user_role || 'learner';
                const isSuperAdmin = (user.email || '').toLowerCase() === 'vkarms.vk@gmail.com';
                const isPremiumNow = user.isPremium && user.premium_plan;
                const isTrialNow = user.trial_end_date && new Date(user.trial_end_date) > new Date();

                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-white text-xs block truncate">{user.name || 'Anonymous Learner'}</span>
                          <span className="text-[11px] text-gray-500 block truncate">@{user.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-3.5">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs text-gray-300 flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          {user.email || 'No Email'}
                        </span>
                        {user.canonical_email && user.canonical_email !== user.email && (
                          <span className="text-[10px] font-mono text-gray-500 block truncate">
                            canon: {user.canonical_email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {isSuperAdmin ? (
                        <Badge variant="gold" icon={Crown}>Super Admin</Badge>
                      ) : userRole === 'teacher' ? (
                        <Badge variant="amber" icon={Award}>Teacher</Badge>
                      ) : userRole === 'parent' ? (
                        <Badge variant="green" icon={UserCheck}>Parent</Badge>
                      ) : (
                        <Badge variant="gray" icon={GraduationCap}>Learner</Badge>
                      )}
                    </td>

                    {/* Premium Status */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {isPremiumNow ? (
                        <Badge variant="gold" icon={Crown}>{user.premium_plan?.toUpperCase()} 👑</Badge>
                      ) : isTrialNow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-950/50 border border-cyan-500/40 text-cyan-300">
                          ⌛ Trial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400">
                          Free
                        </span>
                      )}
                    </td>

                    {/* Curriculum details */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {isCurriculumSetup ? (
                        <div className="text-xs space-y-0.5">
                          <div className="text-gray-300">Board: <span className="font-semibold text-white">{statsObj.cbse_board || 'N/A'}</span></div>
                          <div className="text-gray-400">Class: <span className="font-semibold text-gray-200">{statsObj.cbse_class || 'N/A'}</span></div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Not configured</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectUser(user, 'subscriptions')}
                          className="px-2.5 py-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-xl text-xs font-bold text-[#f3e5ab] hover:bg-[#d4af37]/25 transition-all inline-flex items-center gap-1 shrink-0"
                        >
                          <Crown className="w-3 h-3 text-[#d4af37]" />
                          Grant Premium
                        </button>

                        <button
                          onClick={() => onSelectUser(user, 'profile')}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                        >
                          Inspect Log
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 text-sm">
          No registered users matched your search criteria.
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-[#0d0d15] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Showing page {currentPage} of {totalPages} ({totalItems} total users)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-white/10 bg-[#08080c] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-white/10 bg-[#08080c] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
