import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  InstitutionRequestRecord,
  MasterInstitutionRecord,
  InstitutionQueryOptions,
} from '@/types/institutions';
import {
  buildRequestFilter,
  buildMasterFilter,
  fetchPendingRequestsCount,
  approveInstitutionRequest,
  rejectInstitutionRequest,
  deleteInstitutionRequest,
  addDirectMasterInstitution,
  updateMasterInstitutionRecord,
  deleteMasterInstitutionRecord,
} from '@/lib/institutionsApi';

export type {
  InstitutionRequestRecord,
  MasterInstitutionRecord,
  InstitutionQueryOptions,
};

export function useInstitutions(options?: InstitutionQueryOptions) {
  const [requests, setRequests] = useState<InstitutionRequestRecord[]>([]);
  const [masterInstitutions, setMasterInstitutions] = useState<MasterInstitutionRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);

  const [masterPage, setMasterPage] = useState(1);
  const [masterTotal, setMasterTotal] = useState(0);
  const [masterTotalPages, setMasterTotalPages] = useState(1);

  const fetchRequests = useCallback(async (page: number, append = false) => {
    try {
      const filterStr = buildRequestFilter(options);
      const res = await pb.collection('institution_requests').getList(page, 20, {
        filter: filterStr,
        sort: '-created',
      });

      const items = res.items as unknown as InstitutionRequestRecord[];
      setRequests((prev) => (append ? [...prev, ...items] : items));
      setRequestsTotal(res.totalItems);
      setRequestsTotalPages(res.totalPages);
      setRequestsPage(res.page);
    } catch (err: any) {
      console.error('Fetch requests failed:', err);
      setError(err?.message || 'Failed to load institution requests.');
    }
  }, [options]);

  const fetchMaster = useCallback(async (page: number, append = false) => {
    try {
      const filterStr = buildMasterFilter(options);
      const res = await pb.collection('institutions').getList(page, 20, {
        filter: filterStr,
        sort: 'name',
      });

      const items = res.items as unknown as MasterInstitutionRecord[];
      setMasterInstitutions((prev) => (append ? [...prev, ...items] : items));
      setMasterTotal(res.totalItems);
      setMasterTotalPages(res.totalPages);
      setMasterPage(res.page);
    } catch (err: any) {
      console.error('Fetch master institutions failed:', err);
      setError(err?.message || 'Failed to load master directory.');
    }
  }, [options]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const count = await fetchPendingRequestsCount();
      setPendingCount(count);
    } catch {
      // Ignore count fetch errors
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRequests(1, false),
        fetchMaster(1, false),
        fetchPendingCount(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchRequests, fetchMaster, fetchPendingCount]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const loadMoreRequests = () => {
    if (requestsPage < requestsTotalPages && !loading) {
      fetchRequests(requestsPage + 1, true);
    }
  };

  const loadMoreMaster = () => {
    if (masterPage < masterTotalPages && !loading) {
      fetchMaster(masterPage + 1, true);
    }
  };

  const approveRequest = async (
    requestId: string,
    verifiedName: string,
    verifiedType: string,
    verifiedCity: string,
    verifiedState: string,
    customCode?: string
  ) => {
    try {
      await approveInstitutionRequest(
        requestId,
        verifiedName,
        verifiedType,
        verifiedCity,
        verifiedState,
        customCode
      );
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to approve institution request.');
    }
  };

  const rejectRequest = async (requestId: string, reason: string = '') => {
    try {
      await rejectInstitutionRequest(requestId, reason);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to reject institution request.');
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      await deleteInstitutionRequest(requestId);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to delete institution request.');
    }
  };

  const addDirectInstitution = async (
    name: string,
    type: string,
    city: string,
    state: string,
    code?: string
  ) => {
    try {
      await addDirectMasterInstitution(name, type, city, state, code);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to add custom institution.');
    }
  };

  const updateMasterInstitution = async (
    id: string,
    name: string,
    type: string,
    city: string,
    state: string
  ) => {
    try {
      await updateMasterInstitutionRecord(id, name, type, city, state);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Update master institution failed:', err);
      throw new Error(err?.message || 'Failed to update institution record.');
    }
  };

  const deleteMasterInstitution = async (id: string) => {
    try {
      await deleteMasterInstitutionRecord(id);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Delete master institution failed:', err);
      throw new Error(err?.message || 'Failed to delete institution record.');
    }
  };

  return {
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
    refresh: fetchAll,
    approveRequest,
    rejectRequest,
    deleteRequest,
    addDirectInstitution,
    updateMasterInstitution,
    deleteMasterInstitution,
  };
}
