import { useState } from 'react';
import { InstitutionRequestRecord, MasterInstitutionRecord } from '@/types/institutions';

interface UseInstitutionDrawersProps {
  approveRequest: (id: string, name: string, type: string, city: string, state: string) => Promise<any>;
  rejectRequest: (id: string, reason?: string) => Promise<any>;
  deleteRequest: (id: string) => Promise<any>;
  updateMasterInstitution: (id: string, name: string, type: string, city: string, state: string) => Promise<any>;
  deleteMasterInstitution: (id: string) => Promise<any>;
  addDirectInstitution: (name: string, type: string, city: string, state: string) => Promise<any>;
  refresh: () => void;
}

export function useInstitutionDrawers({
  approveRequest,
  rejectRequest,
  deleteRequest,
  updateMasterInstitution,
  deleteMasterInstitution,
  addDirectInstitution,
  refresh,
}: UseInstitutionDrawersProps) {
  const [selectedRequest, setSelectedRequest] = useState<InstitutionRequestRecord | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterInstitutionRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('school');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');

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
      await approveRequest(selectedRequest.id, editName, editType, editCity, editState);
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

  return {
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
  };
}
