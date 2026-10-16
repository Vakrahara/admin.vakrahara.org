import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { AudienceMode, PushTab } from '../types';
import {
  fetchFilterReach,
  sendPushNotification,
  createSegment,
  createTemplate,
} from '../api';
import { usePushTabResources } from './usePushTabResources';

export function usePushNotifications() {
  const [activeTab, setActiveTab] = useState<PushTab>('compose');
  const tabResources = usePushTabResources(activeTab);

  // --- COMPOSE STATE ---
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('quick');
  const [targetType, setTargetType] = useState('all');
  const [specificUid, setSpecificUid] = useState('');
  const [targetFilter, setTargetFilter] = useState("fcm_token != ''");

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notificationType, setNotificationType] = useState('announcement');
  const [priority, setPriority] = useState(true);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);

  // --- SEGMENTS STATE ---
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [showSaveSegmentForm, setShowSaveSegmentForm] = useState(false);

  // --- TEMPLATES STATE ---
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);

  useEffect(() => {
    if (audienceMode === 'custom') {
      const parts = ["fcm_token != ''"];
      customRules.forEach((r) => {
        if (r.type === 'is_premium') parts.push('is_premium = true');
        if (r.type === 'is_free') parts.push('is_premium = false');
        if (r.type === 'streak') parts.push(`current_streak >= ${r.value}`);
        if (r.type === 'inactive') {
          const d = new Date();
          d.setDate(d.getDate() - parseInt(r.value));
          parts.push(`last_active < '${d.toISOString().split('T')[0]}'`);
        }
      });
      setTargetFilter(parts.join(' && '));
    }
  }, [customRules, audienceMode]);

  const updateReachForFilter = async (filterString: string) => {
    try {
      const reach = await fetchFilterReach(filterString);
      setEstimatedReach(reach);
    } catch {
      setEstimatedReach(null);
    }
  };

  useEffect(() => {
    let filter = "fcm_token != ''";
    if (audienceMode === 'quick') {
      if (targetType === 'premium') filter = "fcm_token != '' && is_premium = true";
      if (targetType === 'free') filter = "fcm_token != '' && is_premium = false";
      if (targetType === 'specific') filter = '';
      setTargetFilter(filter);
    }

    if (audienceMode === 'quick' && targetType === 'specific') {
      setEstimatedReach(1);
    } else {
      updateReachForFilter(targetFilter);
    }
  }, [targetType, audienceMode, targetFilter]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return alert('Title and body are required');
    if (scheduleForLater && !scheduledAt) return alert('Please select a date and time for scheduling');

    setIsSending(true);
    setStatusMsg(null);

    const target = audienceMode === 'quick' && targetType === 'specific' ? `user:${specificUid}` : 'segment';
    const finalFilter = audienceMode === 'quick' && targetType === 'specific' ? '' : targetFilter;

    try {
      const payload = {
        target,
        target_filter: finalFilter,
        title,
        body,
        deep_link: deepLink,
        image_url: imageUrl,
        notification_type: notificationType,
        priority: priority ? 'high' : 'normal',
        scheduled_at: scheduleForLater ? new Date(scheduledAt).toISOString() : null,
      };

      const data = await sendPushNotification(payload);
      const sentCount = data.sentCount || data.sent || 0;
      const errorCount = data.errorCount || data.errors || 0;

      setStatusMsg({
        type: 'success',
        msg: scheduleForLater
          ? `Notification scheduled successfully.`
          : `Dispatched successfully. Sent: ${sentCount}, Errors: ${errorCount}`,
      });

      setTitle('');
      setBody('');
      setDeepLink('');
      setImageUrl('');
      setScheduleForLater(false);
      setScheduledAt('');
      if (targetType === 'specific') setSpecificUid('');

      if (audienceMode === 'saved' && selectedSegmentId) {
        pb.collection('notification_segments').update(selectedSegmentId, { 'use_count+': 1 }).catch(() => null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'Network error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSegment = async (name: string, desc: string) => {
    if (!name) return;
    try {
      await createSegment({
        name,
        description: desc,
        filter_string: targetFilter,
        estimated_reach: estimatedReach,
        rules_json: customRules,
        use_count: 0,
      });
      alert('Segment saved');
      setShowSaveSegmentForm(false);
      setNewSegmentName('');
      setNewSegmentDesc('');
      tabResources.fetchSegments();
    } catch {
      alert('Failed to save segment');
    }
  };

  const handleSaveTemplate = async (name: string) => {
    if (!title || !body) return alert('Title and body required for template');
    setIsSavingTemplate(true);
    try {
      await createTemplate({
        name,
        title,
        body,
        image_url: imageUrl,
        deep_link: deepLink,
        notification_type: notificationType,
        target_segment: 'custom',
      });
      setStatusMsg({ type: 'success', msg: 'Template saved!' });
      setShowSaveTemplateForm(false);
      setSaveTemplateName('');
    } catch (e: any) {
      alert('Failed to save template: ' + e.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    audienceMode,
    setAudienceMode,
    targetType,
    setTargetType,
    specificUid,
    setSpecificUid,
    targetFilter,
    setTargetFilter,
    title,
    setTitle,
    body,
    setBody,
    deepLink,
    setDeepLink,
    imageUrl,
    setImageUrl,
    notificationType,
    setNotificationType,
    priority,
    setPriority,
    scheduleForLater,
    setScheduleForLater,
    scheduledAt,
    setScheduledAt,
    statusMsg,
    isSending,
    estimatedReach,
    selectedSegmentId,
    setSelectedSegmentId,
    customRules,
    setCustomRules,
    newSegmentName,
    setNewSegmentName,
    newSegmentDesc,
    setNewSegmentDesc,
    showSaveSegmentForm,
    setShowSaveSegmentForm,
    saveTemplateName,
    setSaveTemplateName,
    isSavingTemplate,
    showSaveTemplateForm,
    setShowSaveTemplateForm,
    updateReachForFilter,
    handleSend,
    handleSaveSegment,
    handleSaveTemplate,
    ...tabResources,
  };
}
