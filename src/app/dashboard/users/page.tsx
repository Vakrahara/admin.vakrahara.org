'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  RefreshCcw, 
  Loader2, 
  Check, 
  Info,
  Calendar,
  X,
  Users,
  GraduationCap,
  Award,
  Crown,
  Activity,
  Code2,
  Mail,
  UserCheck
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  created: string;
  discipline_stats?: Record<string, any> | string;
  isPremium?: boolean;
  premium_plan?: string;
  subscription_expiry?: string;
  trial_end_date?: string;
  ad_premium_end_date?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  // Selection/Detail Modal state
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [modalTab, setModalTab] = useState<'profile' | 'telemetry' | 'roles' | 'subscriptions'>('profile');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Current admin details
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');

  const handleGrantPremium = async (userId: string, plan: string, durationDays: number) => {
    setIsUpdatingUser(true);
    try {
      const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          target_user_id: userId,
          plan: plan,
          duration_days: durationDays
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, isPremium: true, premium_plan: plan, subscription_expiry: updatedUser.subscription_expiry } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, isPremium: true, premium_plan: plan, subscription_expiry: updatedUser.subscription_expiry });
        }
        triggerMessage('success', `Granted ${plan.toUpperCase()} Premium access (${durationDays} days)`);
      } else {
        triggerMessage('error', 'Failed to grant premium access.');
      }
    } catch (err: any) {
      triggerMessage('error', err?.message || 'Error granting premium.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleGiveTrial = async (userId: string, trialDays: number) => {
    setIsUpdatingUser(true);
    try {
      const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/give-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          target_user_id: userId,
          trial_days: trialDays
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, trial_end_date: updatedUser.trial_end_date } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, trial_end_date: updatedUser.trial_end_date });
        }
        triggerMessage('success', `Activated ${trialDays}-Day Free Trial for user.`);
      } else {
        triggerMessage('error', 'Failed to activate trial.');
      }
    } catch (err: any) {
      triggerMessage('error', err?.message || 'Error activating trial.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleRevokePremium = async (userId: string) => {
    setIsUpdatingUser(true);
    try {
      const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/revoke-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          target_user_id: userId
        })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isPremium: false, premium_plan: '', subscription_expiry: '', trial_end_date: '', ad_premium_end_date: '' } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, isPremium: false, premium_plan: '', subscription_expiry: '', trial_end_date: '', ad_premium_end_date: '' });
        }
        triggerMessage('success', 'Revoked premium access and reset user to Free Tier.');
      } else {
        triggerMessage('error', 'Failed to revoke premium.');
      }
    } catch (err: any) {
      triggerMessage('error', err?.message || 'Error revoking premium.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch('https://pb.vakrahara.org/api/amritam/admin/list-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          query: searchQuery,
          page: page,
          perPage: 10
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((data.items || []).map((u: any) => ({
          ...u,
          isPremium: u.is_premium || u.isPremium
        })));
        setTotalItems(data.totalItems || 0);
        setCurrentPage(page);
      } else {
        // Fallback to client SDK if custom route fails
        const result = await pb.collection('users').getList(page, 10, {
          sort: '-created',
        });
        setUsers(result.items as unknown as UserRecord[]);
        setTotalItems(result.totalItems);
        setCurrentPage(page);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentAdminId(pb.authStore.record?.id || '');
    setCurrentAdminEmail(pb.authStore.record?.email || '');
    fetchUsers(1);
  }, [searchQuery, roleFilter, boardFilter, classFilter]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const isAdmin = currentAdminEmail.toLowerCase() === 'vkarms.vk@gmail.com';
    if (!isAdmin) {
      triggerMessage('error', 'Action Blocked: Only Super Administrators can alter user roles.');
      return;
    }

    if (userId === currentAdminId) {
      triggerMessage('error', 'Security Block: You cannot modify your own administrative role.');
      return;
    }

    setIsUpdatingUser(true);
    try {
      const userToUpdate = users.find(u => u.id === userId);
      const statsObj = parseDisciplineStats(userToUpdate?.discipline_stats);
      statsObj.user_role = newRole;
      
      const updatedStatsJson = JSON.stringify(statsObj);
      await pb.collection('users').update(userId, { 
        discipline_stats: updatedStatsJson 
      });
      
      setUsers(users.map(u => u.id === userId ? { ...u, discipline_stats: updatedStatsJson } : u));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, discipline_stats: updatedStatsJson });
      }
      triggerMessage('success', 'User role authorization successfully updated.');
    } catch (err: any) {
      triggerMessage('error', err.message || 'Failed to update user role.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleResetProgress = async (userId: string) => {
    if (!confirm('Are you sure you want to reset all learning statistics and onboarding configuration for this user? This action cannot be undone.')) {
      return;
    }

    setIsUpdatingUser(true);
    try {
      await pb.collection('users').update(userId, {
        discipline_stats: JSON.stringify({}),
      });

      triggerMessage('success', 'User curriculum and progress logs successfully reset.');
      fetchUsers(currentPage);
    } catch (err: any) {
      triggerMessage('error', err.message || 'Failed to reset user statistics.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const triggerMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const parseDisciplineStats = (statsField: any) => {
    if (!statsField) return {};
    if (typeof statsField === 'object') return statsField;
    try {
      return JSON.parse(statsField);
    } catch {
      return {};
    }
  };

  const totalPages = Math.ceil(totalItems / 10);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
            <Users className="w-8 h-8 text-[#d4af37]" />
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Browse, search, and manage registered student accounts and credentials.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fadeIn
          ${actionMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }
        `}>
          {actionMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
          <span className="text-sm font-medium">{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Total Registered</span>
            <div className="text-3xl font-extrabold text-white mt-1">{totalItems}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Learners</span>
            <div className="text-3xl font-extrabold text-white mt-1">{totalItems}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Teachers</span>
            <div className="text-3xl font-extrabold text-white mt-1">1</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Super Admins</span>
            <div className="text-3xl font-extrabold text-[#d4af37] mt-1">1</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Crown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#0d0d15] border border-white/10 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
          >
            <option value="">All Roles</option>
            <option value="user">Learner</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Super Admin</option>
          </select>
        </div>

        {/* Board Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
          >
            <option value="">All Boards</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="Homeschool">Homeschool</option>
          </select>
        </div>

        {/* Class Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
          >
            <option value="">All Standards</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
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
                        <span className="font-mono text-xs text-gray-300 flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          {user.email || 'No Email'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isSuperAdmin ? (
                          <Badge variant="gold" icon={Crown}>Super Admin</Badge>
                        ) : userRole === 'teacher' ? (
                          <Badge variant="amber" icon={Award}>Teacher</Badge>
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
                            onClick={() => {
                              setSelectedUser(user);
                              setModalTab('subscriptions');
                            }}
                            className="px-2.5 py-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-xl text-xs font-bold text-[#f3e5ab] hover:bg-[#d4af37]/25 transition-all inline-flex items-center gap-1 shrink-0"
                          >
                            <Crown className="w-3 h-3 text-[#d4af37]" />
                            Grant Premium
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setModalTab('profile');
                            }}
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
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-white/10 bg-[#08080c] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-white/10 bg-[#08080c] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect User Modal Dialog with Tabbed Layout */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xl w-full bg-[#08080c] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 bg-[#0d0d15] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 to-[#d4af37] flex items-center justify-center font-bold text-white shadow-lg shadow-[#d4af37]/20">
                  {selectedUser.name ? selectedUser.name.substring(0, 2).toUpperCase() : selectedUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedUser.name || 'Anonymous User'}</h3>
                  <span className="text-xs text-gray-500 font-mono">ID: {selectedUser.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex border-b border-white/10 bg-[#08080c] px-6">
              <button
                onClick={() => setModalTab('profile')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  modalTab === 'profile'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Profile Overview
              </button>
              <button
                onClick={() => setModalTab('telemetry')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  modalTab === 'telemetry'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Somatic Telemetry
              </button>
              <button
                onClick={() => setModalTab('roles')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  modalTab === 'roles'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Role Authorization
              </button>
              <button
                onClick={() => setModalTab('subscriptions')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  modalTab === 'subscriptions'
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
                Subscription & Premium
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {modalTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0d0d15] border border-white/5 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Username</span>
                      <span className="text-sm font-semibold text-white mt-1 block">@{selectedUser.username}</span>
                    </div>
                    <div className="p-4 bg-[#0d0d15] border border-white/5 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm font-semibold text-white mt-1 block truncate">{selectedUser.email || 'None'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0d0d15] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-gray-400">Account Created Date</span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#d4af37]" />
                      {formatDate(selectedUser.created)}
                    </span>
                  </div>
                </div>
              )}

              {modalTab === 'telemetry' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#d4af37]" />
                      JSON Telemetry Payload
                    </span>
                  </div>
                  <div className="p-4 bg-black border border-white/10 rounded-xl font-mono text-xs text-[#d4af37] overflow-x-auto max-h-60">
                    <pre>{JSON.stringify(parseDisciplineStats(selectedUser.discipline_stats), null, 2)}</pre>
                  </div>
                </div>
              )}

              {modalTab === 'roles' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Update Access Level</span>
                  {currentAdminEmail.toLowerCase() === 'vkarms.vk@gmail.com' ? (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, 'learner')}
                        disabled={isUpdatingUser || (parseDisciplineStats(selectedUser.discipline_stats).user_role || 'learner') === 'learner'}
                        className="py-3 rounded-xl border border-white/10 bg-[#0d0d15] text-xs text-gray-300 font-semibold hover:bg-white/5 disabled:bg-[#d4af37]/20 disabled:border-[#d4af37]/40 disabled:text-[#d4af37] transition-all"
                      >
                        Set Learner
                      </button>
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, 'teacher')}
                        disabled={isUpdatingUser || parseDisciplineStats(selectedUser.discipline_stats).user_role === 'teacher'}
                        className="py-3 rounded-xl border border-white/10 bg-[#0d0d15] text-xs text-gray-300 font-semibold hover:bg-white/5 disabled:bg-[#d4af37]/20 disabled:border-[#d4af37]/40 disabled:text-[#d4af37] transition-all"
                      >
                        Set Teacher
                      </button>
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, 'parent')}
                        disabled={isUpdatingUser || parseDisciplineStats(selectedUser.discipline_stats).user_role === 'parent'}
                        className="py-3 rounded-xl border border-white/10 bg-[#0d0d15] text-xs text-gray-300 font-semibold hover:bg-white/5 disabled:bg-[#d4af37]/20 disabled:border-[#d4af37]/40 disabled:text-[#d4af37] transition-all"
                      >
                        Set Parent
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-950/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs flex gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      Role authorization modification is restricted to Super Administrators.
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'subscriptions' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block">Grant / Control Premium Access</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGrantPremium(selectedUser.id, 'monthly', 30)}
                      disabled={isUpdatingUser}
                      className="py-3 px-4 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-xs text-[#f3e5ab] font-bold hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
                    >
                      👑 1-Month Premium (30d)
                    </button>
                    <button
                      onClick={() => handleGrantPremium(selectedUser.id, 'yearly', 365)}
                      disabled={isUpdatingUser}
                      className="py-3 px-4 rounded-xl border border-[#d4af37] bg-gradient-to-r from-amber-600 to-[#d4af37] text-xs text-black font-extrabold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      👑 1-Year Premium (365d)
                    </button>
                    <button
                      onClick={() => handleGrantPremium(selectedUser.id, 'lifetime', 36500)}
                      disabled={isUpdatingUser}
                      className="py-3 px-4 rounded-xl border border-cyan-500/50 bg-cyan-950/40 text-xs text-cyan-300 font-extrabold hover:bg-cyan-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      ♾️ Lifetime Premium
                    </button>
                    <button
                      onClick={() => handleGiveTrial(selectedUser.id, 7)}
                      disabled={isUpdatingUser}
                      className="py-3 px-4 rounded-xl border border-purple-500/50 bg-purple-950/40 text-xs text-purple-300 font-bold hover:bg-purple-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      ⌛ Give 7-Day Trial
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleRevokePremium(selectedUser.id)}
                      disabled={isUpdatingUser}
                      className="w-full py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-xs text-rose-300 font-bold hover:bg-rose-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      ❌ Revoke Premium & Reset to Free Tier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-[#0d0d15] flex items-center justify-between">
              <button
                onClick={() => handleResetProgress(selectedUser.id)}
                disabled={isUpdatingUser}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/50 transition-colors disabled:opacity-40"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Reset Progress Logs
              </button>
              
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
