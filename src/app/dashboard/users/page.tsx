'use client';

import { Users, Check, Info, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { UserTable } from './components/UserTable';
import { UserKpiCards } from './components/UserKpiCards';
import { UserFilterToolbar } from './components/UserFilterToolbar';
import { UserDetailModal } from './components/UserDetailModal';
import { useUserManagement } from './hooks/useUserManagement';

export default function UserManagementPage() {
  const {
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
    handleVerifyManually,
    handleResendVerification,
    handleResetProgress,
  } = useUserManagement();

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const exportData = users.map(u => ({
                ID: u.id,
                Name: u.name,
                Username: u.username,
                Email: u.email,
                Role: u.role,
                IsPremium: u.isPremium ? 'YES' : 'NO',
                Plan: u.premium_plan || 'none',
                SubscriptionExpiry: u.subscription_expiry || '',
                TrialEndDate: u.trial_end_date || '',
                Created: u.created,
              }));
              exportToCsv(exportData, `users_export_${new Date().toISOString().slice(0,10)}.csv`);
            }}
            disabled={users.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
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
      <UserKpiCards totalItems={totalItems} />

      {/* Filter Toolbar */}
      <UserFilterToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        boardFilter={boardFilter}
        setBoardFilter={setBoardFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
      />

      {/* Directory Table */}
      <UserTable
        loading={loading}
        users={users}
        onSelectUser={(user, tab) => {
          setSelectedUser(user);
          setModalTab(tab);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={fetchUsers}
        parseDisciplineStats={parseDisciplineStats}
      />

      {/* Inspect User Modal Dialog */}
      {selectedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          modalTab={modalTab}
          setModalTab={setModalTab}
          isUpdatingUser={isUpdatingUser}
          handleGrantPremium={handleGrantPremium}
          handleGiveTrial={handleGiveTrial}
          handleRevokePremium={handleRevokePremium}
          handleUpdateRole={handleUpdateRole}
          handleVerifyManually={handleVerifyManually}
          handleResendVerification={handleResendVerification}
          handleResetProgress={handleResetProgress}
          currentAdminEmail={currentAdminEmail}
          parseDisciplineStats={parseDisciplineStats}
        />
      )}
    </div>
  );
}
