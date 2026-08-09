'use client';

import { useState, useEffect } from 'react';
import { useInstitutions, InstitutionRequestRecord, MasterInstitutionRecord } from '@/hooks/useInstitutions';
import { Badge } from '@/components/ui/Badge';
import { SlideOver } from '@/components/ui/SlideOver';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Building2, 
  Search, 
  Filter, 
  Check, 
  X, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  MapPin, 
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Trash2,
  Edit3,
  Globe
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

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
    error, 
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

  // Active View Tab: 'requests' | 'master'
  const [activeTab, setActiveTab] = useState<'requests' | 'master'>('requests');

  // Search & Filter state is now managed above to pass to the hook

  // Review Drawer for Requests
  const [selectedRequest, setSelectedRequest] = useState<InstitutionRequestRecord | null>(null);

  // Edit Drawer for Master Institutions
  const [selectedMaster, setSelectedMaster] = useState<MasterInstitutionRecord | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Editable fields in drawers
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('school');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');

  // Direct Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState('school');
  const [newInstCity, setNewInstCity] = useState('');
  const [newInstState, setNewInstState] = useState('');

  const openReviewDrawer = (req: InstitutionRequestRecord) => {
    setSelectedRequest(req);
    setSelectedMaster(null);
    setEditName(req.requested_name);
    setEditType(req.type || 'school');
    setEditCity(req.city || '');
    setEditState(req.state || '');
    setActionSuccess(null);
    setActionError(null);
  };

  const openMasterEditDrawer = (inst: MasterInstitutionRecord) => {
    setSelectedMaster(inst);
    setSelectedRequest(null);
    setEditName(inst.name);
    setEditType(inst.type || 'school');
    setEditCity(inst.city || '');
    setEditState(inst.state || '');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await approveRequest(
        selectedRequest.id,
        editName,
        editType,
        editCity,
        editState
      );
      setActionSuccess(`Successfully approved and published "${editName}" to global directory!`);
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess(null);
      }, 1200);
    } catch (err: any) {
      setActionError(err?.message || 'Approval failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await rejectRequest(selectedRequest.id);
      setActionSuccess('Request rejected.');
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess(null);
      }, 1200);
    } catch (err: any) {
      setActionError(err?.message || 'Rejection failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRequest = async (reqId: string) => {
    if (!confirm('Are you sure you want to permanently delete this request record?')) return;
    setIsProcessing(true);
    try {
      await deleteRequest(reqId);
      if (selectedRequest?.id === reqId) setSelectedRequest(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateMaster = async () => {
    if (!selectedMaster) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await updateMasterInstitution(selectedMaster.id, editName, editType, editCity, editState);
      setActionSuccess(`Saved updates to "${editName}"!`);
      setTimeout(() => {
        setSelectedMaster(null);
        setActionSuccess(null);
      }, 1200);
    } catch (err: any) {
      setActionError(err?.message || 'Master record update failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMaster = async (masterId: string) => {
    if (!confirm('Are you sure you want to permanently delete this school from the global master directory?')) return;
    setIsProcessing(true);
    try {
      await deleteMasterInstitution(masterId);
      if (selectedMaster?.id === masterId) setSelectedMaster(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete master institution.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await addDirectInstitution(newInstName, newInstType, newInstCity, newInstState);
      setActionSuccess(`Added "${newInstName}" directly to directory!`);
      setNewInstName('');
      setNewInstCity('');
      setNewInstState('');
      setShowAddModal(false);
      refresh();
    } catch (err: any) {
      setActionError(err?.message || 'Direct add failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter requests (No longer needed client-side, using server-side results)
  const filteredRequests = requests;

  // Filter master institutions (No longer needed client-side, using server-side results)
  const filteredMaster = masterInstitutions;

  // Calculate metrics (Now using server returned totals)
  const totalCount = requestsTotal;
  const approvedCount = requestsTotal - pendingCount; // Approx, just for display


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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Total User Requests</span>
            <div className="text-3xl font-extrabold text-white mt-1">{totalCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel-gold p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest block">Pending Submissions</span>
            <div className="text-3xl font-extrabold text-[#d4af37] mt-1">{pendingCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Approved Requests</span>
            <div className="text-3xl font-extrabold text-white mt-1">{approvedCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">Master Live Directory</span>
            <div className="text-3xl font-extrabold text-white mt-1">{masterTotal === -1 ? '1.5M+' : masterTotal}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`
            px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all
            ${activeTab === 'requests' 
              ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }
          `}
        >
          <Building2 className="w-4 h-4 text-[#d4af37]" />
          User Submissions ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`
            px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all
            ${activeTab === 'master' 
              ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }
          `}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          Master Directory ({masterTotal === -1 ? '1.5M+' : masterTotal})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0d0d15] border border-white/10 p-4 rounded-2xl">
        {/* State Dropdown Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
          >
            <option value="all">📍 All States / UTs</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* City / District Input Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Filter by City / District (e.g. Bokaro)..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400/60"
          />
        </div>

        {/* Institution Name / Code Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name or code..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
          />
        </div>

        {/* Type / Status Filter */}
        {activeTab === 'requests' ? (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses (Pending, Approved, Rejected)</option>
              <option value="pending">Pending Review Only</option>
              <option value="approved">Approved Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
        ) : (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none cursor-pointer"
            >
              <option value="all">All Types (Schools, Colleges, Companies)</option>
              <option value="school">Schools Only</option>
              <option value="college">Colleges Only</option>
              <option value="company">Companies / Organizations</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      {activeTab === 'requests' ? (
        /* Requests Table */
        <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0d0d15] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Requested Institution</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Supporters</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Submitted Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white block">{req.requested_name || 'Unnamed Institution'}</span>
                        {req.expand?.requested_by && (
                          <span className="text-xs text-gray-500">
                            By: {req.expand.requested_by.name || req.expand.requested_by.username}
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5 text-xs text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                          {req.city || 'N/A'}{req.state ? `, ${req.state}` : ''}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-6">
                        <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                          {req.type || 'school'}
                        </span>
                      </td>

                      {/* Supporters */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Users className="w-3 h-3" />
                          {req.supporters?.length || 1}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {req.status === 'pending' && (
                          <Badge variant="gold" icon={Clock}>Pending Review</Badge>
                        )}
                        {req.status === 'approved' && (
                          <Badge variant="green" icon={CheckCircle2}>Approved</Badge>
                        )}
                        {req.status === 'rejected' && (
                          <Badge variant="red" icon={XCircle}>Rejected</Badge>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-gray-400">
                        {formatDate(req.created)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReviewDrawer(req)}
                            className="px-3.5 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded-xl text-xs font-semibold transition-colors"
                          >
                            Review & Edit
                          </button>

                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl transition-colors"
                            title="Delete Request Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 text-sm space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p>No user institution requests match your search query.</p>
            </div>
          )}
          
          {/* Load More Requests */}
          {requestsPage < requestsTotalPages && (
            <div className="p-4 border-t border-white/10 flex justify-center">
              <button 
                onClick={loadMoreRequests}
                disabled={loading}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Load More Results
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Master Directory Table */
        <div className="glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMaster.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0d0d15] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Published School Name</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Code / Source</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {filteredMaster.map((inst) => (
                    <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white block">{inst.name || 'Unnamed'}</span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5 text-xs text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          {inst.city || 'N/A'}{inst.state ? `, ${inst.state}` : ''}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-6">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border ${
                          inst.type === 'college' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : inst.type === 'company'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          {inst.type || 'school'}
                        </span>
                      </td>

                      {/* Source Code */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono text-xs text-gray-400">{inst.code || 'N/A'}</span>
                          {inst.source_type === 'MANUAL' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20" title="Added or approved manually by an admin">
                              <CheckCircle2 className="w-3 h-3" />
                              User Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10" title="Sourced from official databases (AISHE, UDISE, etc)">
                              <Globe className="w-3 h-3" />
                              Pre-Feed Data
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-gray-400">
                        {formatDate(inst.created)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openMasterEditDrawer(inst)}
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit School
                          </button>

                          <button
                            onClick={() => handleDeleteMaster(inst.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl transition-colors"
                            title="Delete School from Directory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 text-sm space-y-2">
              <Globe className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p>No master published schools match your search query.</p>
            </div>
          )}

          {/* Load More Master */}
          {masterPage < masterTotalPages && (
            <div className="p-4 border-t border-white/10 flex justify-center">
              <button 
                onClick={loadMoreMaster}
                disabled={loading}
                className="px-6 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sm font-semibold text-sky-400 transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Load More Schools
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Drawer for Requests */}
      <SlideOver
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Review Institution Request"
        subtitle={`Request ID: ${selectedRequest?.id}`}
      >
        {selectedRequest && (
          <div className="space-y-6">
            {actionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Edit & Standardize Details
              </h3>

              {/* Edit Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Institution Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Edit Type */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Category</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="school">School (K-12)</option>
                  <option value="college">College / University</option>
                  <option value="company">Company / Organization / EdTech</option>
                </select>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">City / District</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Bokaro"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Jharkhand"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={handleApprove}
                disabled={isProcessing || !editName.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:opacity-95 disabled:opacity-40 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve & Publish Globally
              </button>

              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Reject Submission
              </button>

              <button
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                disabled={isProcessing}
                className="w-full py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all mt-4"
              >
                <Trash2 className="w-4 h-4" />
                Delete Request Permanently
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Edit Drawer for Master Institutions */}
      <SlideOver
        isOpen={!!selectedMaster}
        onClose={() => setSelectedMaster(null)}
        title="Edit Master Institution Record"
        subtitle={`School ID: ${selectedMaster?.id}`}
      >
        {selectedMaster && (
          <div className="space-y-6">
            {actionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Edit Master Directory School
              </h3>

              {/* Edit Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">School / Institution Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Edit Type */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Category</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                >
                  <option value="school">School (K-12)</option>
                  <option value="college">College / University</option>
                  <option value="company">Company / Organization / EdTech</option>
                </select>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">City / District</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Bokaro"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Jharkhand"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={handleUpdateMaster}
                disabled={isProcessing || !editName.trim()}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 hover:opacity-95 disabled:opacity-40 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes to Master Directory
              </button>

              <button
                onClick={() => handleDeleteMaster(selectedMaster.id)}
                disabled={isProcessing}
                className="w-full py-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all mt-4"
              >
                <Trash2 className="w-4 h-4" />
                Delete School from Directory
              </button>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Direct Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-[#08080c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d4af37]" />
                Add Institution Manually
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  placeholder="e.g. MGM Public School"
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Category</label>
                <select
                  value={newInstType}
                  onChange={(e) => setNewInstType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="school">School (K-12)</option>
                  <option value="college">College / University</option>
                  <option value="company">Company / Organization / EdTech</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">City</label>
                  <input
                    type="text"
                    value={newInstCity}
                    onChange={(e) => setNewInstCity(e.target.value)}
                    placeholder="e.g. Bokaro"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">State</label>
                  <input
                    type="text"
                    value={newInstState}
                    onChange={(e) => setNewInstState(e.target.value)}
                    placeholder="e.g. Jharkhand"
                    className="w-full px-4 py-2.5 bg-[#0d0d15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !newInstName.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#d4af37]/20 hover:opacity-95 disabled:opacity-40"
                >
                  {isProcessing ? 'Adding...' : 'Add Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
