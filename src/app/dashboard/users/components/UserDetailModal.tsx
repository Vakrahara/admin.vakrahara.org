'use client';

import React from 'react';
import { 
  X, 
  UserCheck, 
  Activity, 
  Shield, 
  Crown, 
  Calendar, 
  Code2, 
  Info, 
  RefreshCcw 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserRecord } from './UserTable';
import { UserSubscriptionTab } from './UserSubscriptionTab';

interface UserDetailModalProps {
  selectedUser: UserRecord;
  onClose: () => void;
  modalTab: 'profile' | 'telemetry' | 'roles' | 'subscriptions';
  setModalTab: (tab: 'profile' | 'telemetry' | 'roles' | 'subscriptions') => void;
  isUpdatingUser: boolean;
  handleGrantPremium: (userId: string, plan: string, durationDays: number) => Promise<void>;
  handleGiveTrial: (userId: string, trialDays: number) => Promise<void>;
  handleRevokePremium: (userId: string) => Promise<void>;
  handleUpdateRole: (userId: string, newRole: string) => Promise<void>;
  handleResetProgress: (userId: string) => Promise<void>;
  currentAdminEmail: string;
  parseDisciplineStats: (stats: any) => any;
}

export function UserDetailModal({
  selectedUser,
  onClose,
  modalTab,
  setModalTab,
  isUpdatingUser,
  handleGrantPremium,
  handleGiveTrial,
  handleRevokePremium,
  handleUpdateRole,
  handleResetProgress,
  currentAdminEmail,
  parseDisciplineStats,
}: UserDetailModalProps) {
  return (
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
            onClick={onClose}
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
            <UserSubscriptionTab
              user={selectedUser}
              isUpdatingUser={isUpdatingUser}
              onGrantPremium={handleGrantPremium}
              onGiveTrial={handleGiveTrial}
              onRevokePremium={handleRevokePremium}
            />
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
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
