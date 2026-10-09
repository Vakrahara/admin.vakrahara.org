'use client';

import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { UserStats } from '../types';

function parseDisciplineStats(statsField: any): Record<string, any> {
  if (!statsField) return {};
  if (typeof statsField === 'object') return statsField;
  try {
    return JSON.parse(statsField);
  } catch {
    return {};
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveStats = useCallback(async () => {
    setError(null);

    // Ensure authStore is hydrated from cookies if necessary
    if (typeof window !== 'undefined' && !pb.authStore.isValid && document.cookie.includes('pb_auth=')) {
      pb.authStore.loadFromCookie(document.cookie);
    }

    const token = pb.authStore.token;

    // 1. Primary Strategy: Direct fetch with explicit Bearer Authorization header
    if (token) {
      try {
        const res = await fetch(`${pb.baseUrl}/api/amritam/admin/user-stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalUsers === 'number') {
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
              },
            });
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Direct fetch to /user-stats failed, trying SDK pb.send:', err);
      }
    }

    // 2. Secondary Strategy: PocketBase SDK pb.send
    try {
      const data = await pb.send('/api/amritam/admin/user-stats', { method: 'GET' });
      if (data && typeof data.totalUsers === 'number') {
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
          },
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
    } catch (err) {
      console.warn('[Dashboard] Custom API endpoint unavailable, computing live client telemetry fallback...', err);
    }

    // 3. Resilient Client Fallback: Compute directly from users and orders collections
    try {
      const [userRecords, paidOrders] = await Promise.all([
        pb.collection('users').getFullList({ sort: '-created' }),
        pb.collection('orders').getFullList({
          filter: 'status = "paid"',
          fields: 'amount_paise,invoice_type',
        }).catch(() => []),
      ]);

      const totalUsers = userRecords.length;
      const now = Date.now();
      let active24h = 0;
      let active7d = 0;
      let inactive = 0;
      let activeSubscribers = 0;
      let mrr = 0;

      const boardMap: Record<string, number> = {};
      const classMap: Record<string, number> = {};
      const roleMap: Record<string, number> = {};

      userRecords.forEach((user: any) => {
        const updatedTime = new Date(user.updated || user.created).getTime();
        const diffHours = (now - updatedTime) / (1000 * 60 * 60);

        if (diffHours <= 24) active24h++;
        if (diffHours <= 168) active7d++;
        if (diffHours > 720) inactive++;

        if (user.is_premium === true || user.is_premium === 1) {
          activeSubscribers++;
          if (!user.is_sponsored) {
            const plan = String(user.premium_plan || '');
            if (plan === 'monthly') mrr += 149;
            else if (plan === 'yearly') mrr += Math.round(999 / 12);
            else if (plan === 'lifetime') mrr += Math.round(2499 / 120);
          }
        }

        const statsObj = parseDisciplineStats(user.discipline_stats);
        const board = (statsObj.cbse_board || statsObj.board || 'CBSE').toString().toUpperCase();
        boardMap[board] = (boardMap[board] || 0) + 1;

        let cls = (statsObj.cbse_class || statsObj.class || statsObj.standard || '10').toString().trim();
        cls = cls.replace(/^class\s+/i, '').trim();
        classMap[cls] = (classMap[cls] || 0) + 1;

        const isSuperAdmin = (user.email || '').toLowerCase() === 'vkarms.vk@gmail.com';
        const role = isSuperAdmin ? 'Super Admin' : (statsObj.user_role || 'learner');
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        roleMap[formattedRole] = (roleMap[formattedRole] || 0) + 1;
      });

      let totalRevenue = 0;
      paidOrders.forEach((order: any) => {
        if (order.invoice_type !== 'bill_of_supply') {
          totalRevenue += (order.amount_paise || 0) / 100;
        }
      });

      setStats({
        totalUsers,
        totalRevenue,
        mrr,
        activeSubscribers,
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
      console.error('[Dashboard] Failed to compute live analytics from database:', err);
      setError(err?.message || 'Failed to synchronize live analytics telemetry from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveStats();
  }, [fetchLiveStats]);

  useEffect(() => {
    fetchLiveStats();
  }, [fetchLiveStats]);

  return {
    stats,
    loading,
    refreshing,
    error,
    handleRefresh,
  };
}
