import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';

export interface InstitutionRequestRecord {
  id: string;
  requested_name: string;
  type: string;
  city?: string;
  state?: string;
  requested_by?: string;
  supporters?: string[];
  status: 'pending' | 'approved' | 'rejected';
  google_place_id?: string;
  created: string;
  updated: string;
  expand?: {
    requested_by?: {
      name?: string;
      email?: string;
      username?: string;
    };
  };
}

export interface MasterInstitutionRecord {
  id: string;
  name: string;
  type?: string;
  city?: string;
  state?: string;
  source_type?: string;
  code?: string;
  created: string;
  updated: string;
}

export interface InstitutionQueryOptions {
  searchQuery?: string;
  stateFilter?: string;
  cityFilter?: string;
  statusFilter?: string;
  typeFilter?: string;
}

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
      let filterStr = '';
      const filters: string[] = [];
      
      if (options?.stateFilter && options.stateFilter !== 'all') {
        const sf = options.stateFilter.replace(/'/g, "\\'");
        filters.push(`state ~ '${sf}'`);
      }

      if (options?.cityFilter && options.cityFilter.trim()) {
        const cf = options.cityFilter.trim().replace(/'/g, "\\'");
        filters.push(`city ~ '${cf}'`);
      }

      if (options?.searchQuery && options.searchQuery.trim()) {
        const tokens = options.searchQuery.trim().split(/\s+/).filter(Boolean);
        tokens.forEach(token => {
          const sq = token.replace(/'/g, "\\'");
          filters.push(`(requested_name ~ '${sq}' || city ~ '${sq}' || state ~ '${sq}' || code ~ '${sq}')`);
        });
      }

      if (options?.statusFilter && options.statusFilter !== 'all') {
        filters.push(`status = '${options.statusFilter}'`);
      }
      
      if (options?.typeFilter && options.typeFilter !== 'all') {
        filters.push(`type = '${options.typeFilter}'`);
      }

      if (filters.length > 0) {
        filterStr = filters.join(' && ');
      }

      const result = await pb.collection('institution_requests').getList<InstitutionRequestRecord>(page, 50, {
        sort: '-created',
        expand: 'requested_by',
        filter: filterStr
      });

      if (append) {
        setRequests(prev => [...prev, ...result.items]);
      } else {
        setRequests(result.items);
      }
      
      setRequestsTotal(result.totalItems);
      setRequestsTotalPages(result.totalPages);
      setRequestsPage(page);

      // Always update global pending count for the badge
      const pendingRes = await pb.collection('institution_requests').getList(1, 1, {
        filter: "status = 'pending'",
        fields: "id"
      });
      setPendingCount(pendingRes.totalItems);

    } catch (err: any) {
      console.error('Fetch requests error:', err);
    }
  }, [options?.searchQuery, options?.stateFilter, options?.cityFilter, options?.statusFilter, options?.typeFilter]);

  const fetchMaster = useCallback(async (page: number, append = false) => {
    try {
      let filterStr = "name != ''";
      const filters: string[] = ["name != ''"];
      
      if (options?.stateFilter && options.stateFilter !== 'all') {
        const sf = options.stateFilter.replace(/'/g, "\\'");
        filters.push(`state = '${sf}'`);
      }

      if (options?.cityFilter && options.cityFilter.trim()) {
        const cf = options.cityFilter.trim().replace(/'/g, "\\'");
        filters.push(`city = '${cf}'`);
      }

      if (options?.searchQuery && options.searchQuery.trim()) {
        const tokens = options.searchQuery.trim().split(/\s+/).filter(Boolean);
        tokens.forEach(token => {
          const sq = token.replace(/'/g, "\\'");
          filters.push(`(name ~ '${sq}' || city ~ '${sq}' || state ~ '${sq}' || code ~ '${sq}')`);
        });
      }
      
      if (options?.typeFilter && options.typeFilter !== 'all') {
        filters.push(`type = '${options.typeFilter}'`);
      }

      if (filters.length > 0) {
        filterStr = filters.join(' && ');
      }

      const result = await pb.collection('institutions').getList<MasterInstitutionRecord>(page, 50, {
        filter: filterStr,
        skipTotal: true
      });

      if (append) {
        setMasterInstitutions(prev => [...prev, ...result.items]);
      } else {
        setMasterInstitutions(result.items);
      }
      
      setMasterTotal(-1);
      setMasterTotalPages(page + (result.items.length === 50 ? 1 : 0));
      setMasterPage(page);
    } catch (err: any) {
      console.error('Fetch master error:', err);
    }
  }, [options?.searchQuery, options?.stateFilter, options?.cityFilter, options?.typeFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRequests(1, false),
        fetchMaster(1, false)
      ]);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }, [fetchRequests, fetchMaster]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const loadMoreRequests = () => {
    if (requestsPage < requestsTotalPages) fetchRequests(requestsPage + 1, true);
  };

  const loadMoreMaster = () => {
    if (masterPage < masterTotalPages) fetchMaster(masterPage + 1, true);
  };

  const approveRequest = async (
    requestId: string,
    finalName: string,
    type: string,
    city?: string,
    state?: string
  ) => {
    try {
      await pb.collection('institutions').create({
        name: finalName.trim(),
        type: type || 'school',
        city: city?.trim() || '',
        state: state?.trim() || '',
        source_type: 'MANUAL',
        code: `MANUAL-${Date.now().toString().slice(-6)}`,
      });

      await pb.collection('institution_requests').update(requestId, {
        requested_name: finalName.trim(),
        type: type || 'school',
        city: city?.trim() || '',
        state: state?.trim() || '',
        status: 'approved',
      });

      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Approval failed:', err);
      throw new Error(err?.message || 'Failed to approve institution request.');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await pb.collection('institution_requests').update(requestId, {
        status: 'rejected',
      });
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Rejection failed:', err);
      throw new Error(err?.message || 'Failed to reject request.');
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      await pb.collection('institution_requests').delete(requestId);
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Delete failed:', err);
      throw new Error(err?.message || 'Failed to delete request.');
    }
  };

  const addDirectInstitution = async (name: string, type: string, city: string, state: string) => {
    try {
      await pb.collection('institutions').create({
        name: name.trim(),
        type: type || 'school',
        city: city.trim(),
        state: state.trim(),
        source_type: 'MANUAL',
        code: `MANUAL-${Date.now().toString().slice(-6)}`,
      });
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
      await pb.collection('institutions').update(id, {
        name: name.trim(),
        type: type || 'school',
        city: city.trim(),
        state: state.trim(),
      });
      await fetchAll();
      return { success: true };
    } catch (err: any) {
      console.error('Update master institution failed:', err);
      throw new Error(err?.message || 'Failed to update institution record.');
    }
  };

  const deleteMasterInstitution = async (id: string) => {
    try {
      await pb.collection('institutions').delete(id);
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
