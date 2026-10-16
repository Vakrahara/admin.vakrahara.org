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
