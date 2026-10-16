import { pb } from '@/lib/pocketbase';
import {
  InstitutionRequestRecord,
  MasterInstitutionRecord,
  InstitutionQueryOptions,
} from '@/types/institutions';

export function buildRequestFilter(options?: InstitutionQueryOptions): string {
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
    tokens.forEach((token) => {
      const sq = token.replace(/'/g, "\\'");
      filters.push(`(requested_name ~ '${sq}' || city ~ '${sq}' || state ~ '${sq}')`);
    });
  }

  if (options?.statusFilter && options.statusFilter !== 'all') {
    filters.push(`status = '${options.statusFilter}'`);
  }

  if (options?.typeFilter && options.typeFilter !== 'all') {
    filters.push(`type = '${options.typeFilter}'`);
  }

  return filters.join(' && ');
}

export function buildMasterFilter(options?: InstitutionQueryOptions): string {
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
    tokens.forEach((token) => {
      const sq = token.replace(/'/g, "\\'");
      filters.push(`(name ~ '${sq}' || code ~ '${sq}' || city ~ '${sq}' || state ~ '${sq}')`);
    });
  }

  if (options?.typeFilter && options.typeFilter !== 'all') {
    filters.push(`type = '${options.typeFilter}'`);
  }

  return filters.join(' && ');
}

export async function fetchPendingRequestsCount(): Promise<number> {
  const res = await pb.collection('institution_requests').getList(1, 1, {
    filter: "status = 'pending'",
  });
  return res.totalItems;
}

export async function approveInstitutionRequest(
  requestId: string,
  verifiedName: string,
  verifiedType: string,
  verifiedCity: string,
  verifiedState: string,
  customCode?: string
) {
  let masterRecordId: string | null = null;
  try {
    const newMaster = await pb.collection('institutions').create({
      name: verifiedName.trim(),
      type: verifiedType || 'school',
      city: verifiedCity.trim(),
      state: verifiedState.trim(),
      code: customCode?.trim() || null,
      is_active: true,
      verified: true,
    });
    masterRecordId = newMaster.id;
  } catch (createErr: any) {
    console.error('Failed to create master institution record:', createErr);
    throw new Error(createErr?.message || 'Failed to create verified institution master record.');
  }

  try {
    await pb.collection('institution_requests').update(requestId, {
      status: 'approved',
      rejection_reason: '',
      reviewed_by: pb.authStore.record?.id || null,
      reviewed_at: new Date().toISOString(),
    });
  } catch (updateErr: any) {
    if (masterRecordId) {
      await pb.collection('institutions').delete(masterRecordId).catch(() => {});
    }
    throw new Error(updateErr?.message || 'Failed to update request status after creation.');
  }
}

export async function rejectInstitutionRequest(requestId: string, reason: string = '') {
  await pb.collection('institution_requests').update(requestId, {
    status: 'rejected',
    rejection_reason: reason.trim(),
    reviewed_by: pb.authStore.record?.id || null,
    reviewed_at: new Date().toISOString(),
  });
}

export async function deleteInstitutionRequest(requestId: string) {
  await pb.collection('institution_requests').delete(requestId);
}

export async function addDirectMasterInstitution(
  name: string,
  type: string,
  city: string,
  state: string,
  code?: string
) {
  return await pb.collection('institutions').create({
    name: name.trim(),
    type: type || 'school',
    city: city.trim(),
    state: state.trim(),
    code: code?.trim() || null,
    is_active: true,
    verified: true,
  });
}

export async function updateMasterInstitutionRecord(
  id: string,
  name: string,
  type: string,
  city: string,
  state: string
) {
  return await pb.collection('institutions').update(id, {
    name: name.trim(),
    type: type || 'school',
    city: city.trim(),
    state: state.trim(),
  });
}

export async function deleteMasterInstitutionRecord(id: string) {
  return await pb.collection('institutions').delete(id);
}
