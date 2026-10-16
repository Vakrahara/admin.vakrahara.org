import { pb } from '@/lib/pocketbase';
import { PushCampaign, PushSegment, PushTemplate } from './types';

export async function fetchFilterReach(filterString: string): Promise<number | null> {
  if (!filterString) return null;
  const res = await pb.collection('users').getList(1, 1, { filter: filterString });
  return res.totalItems;
}

export async function fetchSegmentsList(): Promise<PushSegment[]> {
  const res = await pb.collection('notification_segments').getList(1, 50, { sort: 'name' });
  return res.items as unknown as PushSegment[];
}

export async function fetchCampaignsWithStats(): Promise<{
  campaigns: PushCampaign[];
  stats: Record<string, { opened: number }>;
}> {
  const res = await pb.collection('notification_campaigns').getList(1, 50, { sort: '-created' });
  const items = res.items as unknown as PushCampaign[];
  const stats: Record<string, { opened: number }> = {};

  await Promise.all(
    items.map(async (camp) => {
      try {
        const nRes = await pb.collection('notifications').getList(1, 1, {
          filter: `campaign_id = '${camp.id}' && opened_at != ''`,
        });
        stats[camp.id] = { opened: nRes.totalItems };
      } catch {
        stats[camp.id] = { opened: 0 };
      }
    })
  );

  return { campaigns: items, stats };
}

export async function fetchTokenHealth(): Promise<{ totalTokens: number; totalUsers: number }> {
  const tokensReq = await pb.collection('users').getList(1, 1, { filter: "fcm_token != ''" });
  const usersReq = await pb.collection('users').getList(1, 1);

  let extraTokens = 0;
  try {
    const multiDeviceReq = await pb.collection('user_fcm_tokens').getList(1, 1, { filter: 'is_active = true' });
    extraTokens = multiDeviceReq.totalItems;
  } catch {
    // collection might not exist or be accessible
  }

  return {
    totalTokens: tokensReq.totalItems + extraTokens,
    totalUsers: usersReq.totalItems,
  };
}

export async function fetchTemplatesList(): Promise<PushTemplate[]> {
  const res = await pb.collection('notification_templates').getList(1, 50, { sort: '-use_count' });
  return res.items as unknown as PushTemplate[];
}

export async function sendPushNotification(payload: any) {
  const response = await fetch(`${pb.baseUrl}/api/amritam/admin/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pb.authStore.token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to send notification');
  }
  return data;
}

export async function createSegment(data: {
  name: string;
  description: string;
  filter_string: string;
  estimated_reach: number | null;
  rules_json: any[];
  use_count: number;
}) {
  return await pb.collection('notification_segments').create(data);
}

export async function createTemplate(data: {
  name: string;
  title: string;
  body: string;
  image_url: string;
  deep_link: string;
  notification_type: string;
  target_segment: string;
}) {
  return await pb.collection('notification_templates').create(data);
}
