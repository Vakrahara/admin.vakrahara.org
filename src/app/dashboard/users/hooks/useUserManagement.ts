'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { UserRecord } from '../components/UserTable';

export function useUserManagement() {
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

  return {
    users,
    loading,
    totalItems,
    currentPage,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    boardFilter,
    setBoardFilter,
    classFilter,
    setClassFilter,
    selectedUser,
    setSelectedUser,
    modalTab,
    setModalTab,
    isUpdatingUser,
    actionMessage,
    currentAdminEmail,
    parseDisciplineStats,
    fetchUsers,
    handleGrantPremium,
    handleGiveTrial,
    handleRevokePremium,
    handleUpdateRole,
    handleResetProgress,
  };
}
