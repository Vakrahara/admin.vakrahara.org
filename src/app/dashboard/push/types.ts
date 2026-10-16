import { FormEvent } from 'react';

export type AudienceMode = 'quick' | 'saved' | 'custom';
export type PushTab = 'compose' | 'history' | 'templates' | 'segments' | 'health';

export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  notification_type: string;
  target_segment?: string;
  target?: string;
  image_url?: string;
  deep_link?: string;
  priority?: string;
  status: string;
  total_tokens?: number;
  sent_count?: number;
  error_count?: number;
  invalid_cleaned?: number;
  scheduled_at?: string;
  created: string;
}

export interface PushSegment {
  id: string;
  name: string;
  description: string;
  filter_string: string;
  estimated_reach?: number;
  rules_json?: any;
  use_count?: number;
}

export interface PushTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  image_url?: string;
  deep_link?: string;
  notification_type: string;
  target_segment?: string;
  use_count?: number;
}

export interface PushAudienceBuilderProps {
  audienceMode: AudienceMode;
  setAudienceMode: (m: AudienceMode) => void;
  targetType: string;
  setTargetType: (t: string) => void;
  specificUid: string;
  setSpecificUid: (u: string) => void;
  targetFilter: string;
  setTargetFilter: (f: string) => void;
  estimatedReach: number | null;
  savedSegments: PushSegment[];
  selectedSegmentId: string;
  setSelectedSegmentId: (id: string) => void;
  customRules: any[];
  setCustomRules: (rules: any[]) => void;
  updateReachForFilter: (filterStr: string) => void;
  onSaveSegment: (name: string, desc: string) => Promise<void>;
  showSaveSegmentForm: boolean;
  setShowSaveSegmentForm: (v: boolean) => void;
  newSegmentName: string;
  setNewSegmentName: (v: string) => void;
  newSegmentDesc: string;
  setNewSegmentDesc: (v: string) => void;
}

export interface PushComposeTabProps extends PushAudienceBuilderProps {
  title: string;
  setTitle: (t: string) => void;
  body: string;
  setBody: (b: string) => void;
  deepLink: string;
  setDeepLink: (d: string) => void;
  imageUrl: string;
  setImageUrl: (i: string) => void;
  notificationType: string;
  setNotificationType: (n: string) => void;
  priority: boolean;
  setPriority: (p: boolean) => void;
  scheduleForLater: boolean;
  setScheduleForLater: (s: boolean) => void;
  scheduledAt: string;
  setScheduledAt: (s: string) => void;
  statusMsg: { type: 'error' | 'success'; msg: string } | null;
  isSending: boolean;
  onSend: (e: FormEvent) => void;
  onSaveTemplate: (name: string) => Promise<void>;
  isSavingTemplate: boolean;
  saveTemplateName: string;
  setSaveTemplateName: (v: string) => void;
  showSaveTemplateForm: boolean;
  setShowSaveTemplateForm: (v: boolean) => void;
}
