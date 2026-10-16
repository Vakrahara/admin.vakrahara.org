'use client';

import { useState, useEffect } from 'react';
import { useInstitutions } from '@/hooks/useInstitutions';
import { Building2, Plus, Globe, RefreshCw } from 'lucide-react';
import { InstitutionKpiCards } from './components/InstitutionKpiCards';
import { InstitutionFilterBar } from './components/InstitutionFilterBar';
import { InstitutionRequestsTab } from './components/InstitutionRequestsTab';
import { MasterDirectoryTab } from './components/MasterDirectoryTab';
import { ReviewRequestDrawer } from './components/ReviewRequestDrawer';
import { EditMasterInstitutionDrawer } from './components/EditMasterInstitutionDrawer';
import { DirectAddInstitutionModal } from './components/DirectAddInstitutionModal';
import { useInstitutionDrawers } from './hooks/useInstitutionDrawers';

export default function InstitutionRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [cityQuery, setCityQuery] = useState('');
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Debounce search query & city query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCityQuery(cityQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [cityQuery]);

  const { 
    requests, 
    masterInstitutions,
    pendingCount,
    requestsTotal,
    masterTotal,
    requestsPage,
    requestsTotalPages,
    masterPage,
    masterTotalPages,
    loadMoreRequests,
    loadMoreMaster,
    loading, 
    refresh, 
    approveRequest, 
    rejectRequest, 
    deleteRequest,
    addDirectInstitution,
    updateMasterInstitution,
    deleteMasterInstitution
  } = useInstitutions({
    searchQuery: debouncedQuery,
    stateFilter,
    cityFilter: debouncedCityQuery,
    statusFilter,
    typeFilter
  });

  const [activeTab, setActiveTab] = useState<'requests' | 'master'>('requests');

  const {
    selectedRequest,
    setSelectedRequest,
    selectedMaster,
    setSelectedMaster,
    isProcessing,
    actionSuccess,
    actionError,
    editName,
    setEditName,
    editType,
    setEditType,
    editCity,
    setEditCity,
    editState,
    setEditState,
    showAddModal,
    setShowAddModal,
    newInstName,
    setNewInstName,
    newInstType,
    setNewInstType,
    newInstCity,
    setNewInstCity,
    newInstState,
    setNewInstState,
    openReviewDrawer,
    openMasterEditDrawer,
    handleApprove,
    handleReject,
    handleDeleteRequest,
    handleUpdateMaster,
    handleDeleteMaster,
    handleDirectAddSubmit,
  } = useInstitutionDrawers({
    approveRequest,
    rejectRequest,
    deleteRequest,
    updateMasterInstitution,
    deleteMasterInstitution,
    addDirectInstitution,
    refresh,
  });

  const totalCount = requestsTotal;
  const approvedCount = Math.max(0, requestsTotal - pendingCount);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#d4af37]" />
            Institutions & Requests Console
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Search, edit, review, and publish school data across global master directory and user submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2.5 bg-[#0d0d15] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Institution
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <InstitutionKpiCards
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        masterTotal={masterTotal}
      />

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'requests' 
              ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#d4af37]" />
          User Submissions ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'master' 
              ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          Master Directory ({masterTotal === -1 ? '1.5M+' : masterTotal})
        </button>
      </div>

      {/* Filter Bar */}
      <InstitutionFilterBar
        stateFilter={stateFilter}
        onStateFilterChange={setStateFilter}
        cityQuery={cityQuery}
        onCityQueryChange={setCityQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeTab={activeTab}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* Main Table Content */}
      {activeTab === 'requests' ? (
        <InstitutionRequestsTab
          loading={loading}
          requests={requests}
          requestsPage={requestsPage}
          requestsTotalPages={requestsTotalPages}
          onLoadMore={loadMoreRequests}
          onReview={openReviewDrawer}
          onDelete={handleDeleteRequest}
        />
      ) : (
        <MasterDirectoryTab
          loading={loading}
          masterInstitutions={masterInstitutions}
          masterPage={masterPage}
          masterTotalPages={masterTotalPages}
          onLoadMore={loadMoreMaster}
          onEdit={openMasterEditDrawer}
          onDelete={handleDeleteMaster}
        />
      )}

      {/* Review Drawer for Requests */}
      <ReviewRequestDrawer
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        actionSuccess={actionSuccess}
        actionError={actionError}
        editName={editName}
        setEditName={setEditName}
        editType={editType}
        setEditType={setEditType}
        editCity={editCity}
        setEditCity={setEditCity}
        editState={editState}
        setEditState={setEditState}
        isProcessing={isProcessing}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDeleteRequest}
      />

      {/* Edit Drawer for Master Institutions */}
      <EditMasterInstitutionDrawer
        selectedMaster={selectedMaster}
        onClose={() => setSelectedMaster(null)}
        actionSuccess={actionSuccess}
        actionError={actionError}
        editName={editName}
        setEditName={setEditName}
        editType={editType}
        setEditType={setEditType}
        editCity={editCity}
        setEditCity={setEditCity}
        editState={editState}
        setEditState={setEditState}
        isProcessing={isProcessing}
        onUpdate={handleUpdateMaster}
        onDelete={handleDeleteMaster}
      />

      {/* Direct Add Modal */}
      <DirectAddInstitutionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleDirectAddSubmit}
        name={newInstName}
        setName={setNewInstName}
        type={newInstType}
        setType={setNewInstType}
        city={newInstCity}
        setCity={setNewInstCity}
        state={newInstState}
        setState={setNewInstState}
        isProcessing={isProcessing}
      />
    </div>
  );
}
