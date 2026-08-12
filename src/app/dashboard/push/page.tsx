'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { 
  Bell, Send, Smartphone, ShieldAlert, Loader2, 
  History, Activity, Image as ImageIcon, Clock, Zap, 
  Users, CheckCircle, XCircle, RefreshCw, AlertTriangle, Trash2, ChevronDown, ChevronUp, Filter, Target, Plus
} from 'lucide-react';
import React from 'react';

function timeAgo(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " seconds ago";
}

export default function PushNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'templates' | 'segments' | 'health'>('compose');

  // --- COMPOSE STATE ---
  const [audienceMode, setAudienceMode] = useState<'quick' | 'saved' | 'custom'>('quick');
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
  const [statusMsg, setStatusMsg] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);

  // --- SEGMENTS STATE ---
  const [savedSegments, setSavedSegments] = useState<any[]>([]);
  const [isSegmentsLoading, setIsSegmentsLoading] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [showSaveSegmentForm, setShowSaveSegmentForm] = useState(false);

  // --- HISTORY STATE ---
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [expandedCampId, setExpandedCampId] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<Record<string, { opened: number }>>({});

  // --- HEALTH STATE ---
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  // --- TEMPLATES STATE ---
  const [templates, setTemplates] = useState<any[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);

  // Re-generate filter string whenever customRules change
  useEffect(() => {
    if (audienceMode === 'custom') {
      const parts = ["fcm_token != ''"];
      customRules.forEach(r => {
        if (r.type === 'is_premium') parts.push("is_premium = true");
        if (r.type === 'is_free') parts.push("is_premium = false");
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
      if (!filterString) return;
      const res = await pb.collection('users').getList(1, 1, { filter: filterString });
      setEstimatedReach(res.totalItems);
    } catch (err) {
      console.error("Failed to fetch reach", err);
      setEstimatedReach(null);
    }
  };

  useEffect(() => {
    let filter = "fcm_token != ''";
    if (audienceMode === 'quick') {
      if (targetType === 'premium') filter = "fcm_token != '' && is_premium = true";
      if (targetType === 'free') filter = "fcm_token != '' && is_premium = false";
      if (targetType === 'specific') filter = ""; // No estimate for specific
      setTargetFilter(filter);
    }
    
    if (audienceMode === 'quick' && targetType === 'specific') {
      setEstimatedReach(1);
    } else {
      updateReachForFilter(targetFilter);
    }
  }, [targetType, audienceMode, targetFilter]);

  const fetchSegments = async () => {
    setIsSegmentsLoading(true);
    try {
      const res = await pb.collection('notification_segments').getList(1, 50, { sort: 'name' });
      setSavedSegments(res.items);
    } catch (err) {
      console.error("Failed to fetch segments", err);
    } finally {
      setIsSegmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  // Fetch History
  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await pb.collection('notification_campaigns').getList(1, 50, { sort: '-created' });
      const items = res.items;
      
      const stats: Record<string, { opened: number }> = {};
      await Promise.all(items.map(async (camp) => {
        try {
           const nRes = await pb.collection('notifications').getList(1, 1, {
              filter: `campaign_id = '${camp.id}' && opened_at != ''`
           });
           stats[camp.id] = { opened: nRes.totalItems };
        } catch (e) {
           stats[camp.id] = { opened: 0 };
        }
      }));
      setCampaignStats(stats);
      setCampaigns(items);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch Health
  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const tokensReq = await pb.collection('users').getList(1, 1, { filter: "fcm_token != ''" });
      const usersReq = await pb.collection('users').getList(1, 1);
      
      try {
        const multiDeviceReq = await pb.collection('user_fcm_tokens').getList(1, 1, { filter: "is_active = true" });
        setTotalTokens(tokensReq.totalItems + multiDeviceReq.totalItems);
      } catch (e) {
        setTotalTokens(tokensReq.totalItems);
      }
      setTotalUsers(usersReq.totalItems);
    } catch (err) {
      console.error("Failed to fetch token health", err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const res = await pb.collection('notification_templates').getList(1, 50, { sort: '-use_count' });
      setTemplates(res.items);
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'health') fetchHealth();
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'segments') fetchSegments();
  }, [activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return alert("Title and body are required");
    if (scheduleForLater && !scheduledAt) return alert("Please select a date and time for scheduling");

    setIsSending(true);
    setStatusMsg(null);

    const target = (audienceMode === 'quick' && targetType === 'specific') ? `user:${specificUid}` : 'segment';
    const finalFilter = (audienceMode === 'quick' && targetType === 'specific') ? '' : targetFilter;

    try {
      const payload = {
        target: target,
        target_filter: finalFilter,
        title,
        body,
        deep_link: deepLink,
        image_url: imageUrl,
        notification_type: notificationType,
        priority: priority ? 'high' : 'normal',
        scheduled_at: scheduleForLater ? new Date(scheduledAt).toISOString() : null
      };

      const response = await fetch(`${pb.baseUrl}/api/amritam/admin/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to send notification');

      const sentCount = data.sentCount || data.sent || 0;
      const errorCount = data.errorCount || data.errors || 0;

      setStatusMsg({ type: 'success', msg: scheduleForLater 
        ? `Notification scheduled successfully.` 
        : `Dispatched successfully. Sent: ${sentCount}, Errors: ${errorCount}` });
      
      // Reset form
      setTitle('');
      setBody('');
      setDeepLink('');
      setImageUrl('');
      setScheduleForLater(false);
      setScheduledAt('');
      if (targetType === 'specific') setSpecificUid('');

      // if saved segment used, increment count
      if (audienceMode === 'saved' && selectedSegmentId) {
         pb.collection('notification_segments').update(selectedSegmentId, {
            'use_count+': 1
         }).catch(()=>null);
      }
      
    } catch (err: any) {
      setStatusMsg({ type: 'error', msg: err.message || 'Network error' });
    } finally {
      setIsSending(false);
    }
  };

  const tokenRate = totalUsers > 0 ? ((totalTokens / totalUsers) * 100).toFixed(1) : '0.0';

  const renderTabCompose = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Editor */}
      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <form onSubmit={handleSend} className="space-y-5 relative z-10">
          
          {/* Target Audience Builder */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-sm font-medium text-gray-400">Target Audience</label>
              {estimatedReach !== null && (
                <span className="text-xs text-[#d4af37] flex items-center gap-1 bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">
                  <Users className="w-3 h-3" /> ~{estimatedReach.toLocaleString()} users
                </span>
              )}
            </div>
            
            {/* Mode Switcher */}
            <div className="flex border-b border-white/10 mb-4">
              {[
                { id: 'quick', label: 'Quick Select' },
                { id: 'saved', label: 'Saved Segments' },
                { id: 'custom', label: 'Custom Rules' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAudienceMode(mode.id as any)}
                  className={`flex-1 pb-2 text-sm font-medium transition-all relative ${
                    audienceMode === mode.id ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {mode.label}
                  {audienceMode === mode.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4af37]" />
                  )}
                </button>
              ))}
            </div>

            {/* QUICK MODE */}
            {audienceMode === 'quick' && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {['all', 'premium', 'free', 'specific'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetType(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${targetType === t ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]' : 'bg-[#050508] border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* SAVED SEGMENTS MODE */}
            {audienceMode === 'saved' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <select 
                  value={selectedSegmentId} 
                  onChange={(e) => {
                    setSelectedSegmentId(e.target.value);
                    const seg = savedSegments.find(s => s.id === e.target.value);
                    if (seg) setTargetFilter(seg.filter_string);
                  }}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all"
                >
                  <option value="" disabled>Select a segment...</option>
                  {savedSegments.map(seg => (
                    <option key={seg.id} value={seg.id}>{seg.name} - {seg.description}</option>
                  ))}
                </select>
              </div>
            )}

            {/* CUSTOM RULES MODE */}
            {audienceMode === 'custom' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-[#050508] border border-white/10 rounded-lg p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-400 border border-gray-700">Has FCM Token</span>
                  
                  {/* Premium Rules */}
                  {!customRules.find(r => r.type === 'is_premium' || r.type === 'is_free') && (
                    <>
                      <button type="button" onClick={() => setCustomRules([...customRules, {type: 'is_premium'}])} className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center gap-1"><Plus className="w-3 h-3"/> Is Premium</button>
                      <button type="button" onClick={() => setCustomRules([...customRules, {type: 'is_free'}])} className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-300 border border-gray-500/20 hover:bg-gray-500/20 flex items-center gap-1"><Plus className="w-3 h-3"/> Is Free</button>
                    </>
                  )}
                  {customRules.find(r => r.type === 'is_premium') && (
                    <button type="button" onClick={() => setCustomRules(customRules.filter(r => r.type !== 'is_premium'))} className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500 text-white flex items-center gap-1">Is Premium <XCircle className="w-3 h-3"/></button>
                  )}
                  {customRules.find(r => r.type === 'is_free') && (
                    <button type="button" onClick={() => setCustomRules(customRules.filter(r => r.type !== 'is_free'))} className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-600 text-white flex items-center gap-1">Is Free <XCircle className="w-3 h-3"/></button>
                  )}

                  {/* Streak Rule */}
                  {!customRules.find(r => r.type === 'streak') ? (
                     <button type="button" onClick={() => setCustomRules([...customRules, {type: 'streak', value: 3}])} className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 flex items-center gap-1"><Plus className="w-3 h-3"/> Streak ≥ N</button>
                  ) : (
                     <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        <span className="text-xs">Streak ≥</span>
                        <input type="number" value={customRules.find(r => r.type === 'streak').value} onChange={(e) => {
                           const newRules = [...customRules];
                           newRules.find(r => r.type === 'streak').value = e.target.value;
                           setCustomRules(newRules);
                        }} className="w-10 bg-transparent outline-none text-xs text-white border-b border-orange-500/50 text-center" />
                        <button type="button" onClick={() => setCustomRules(customRules.filter(r => r.type !== 'streak'))}><XCircle className="w-3 h-3 text-orange-400 hover:text-orange-300"/></button>
                     </div>
                  )}

                  {/* Inactive Rule */}
                  {!customRules.find(r => r.type === 'inactive') ? (
                     <button type="button" onClick={() => setCustomRules([...customRules, {type: 'inactive', value: 7}])} className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 flex items-center gap-1"><Plus className="w-3 h-3"/> Inactive &gt; N days</button>
                  ) : (
                     <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <span className="text-xs">Inactive &gt;</span>
                        <input type="number" value={customRules.find(r => r.type === 'inactive').value} onChange={(e) => {
                           const newRules = [...customRules];
                           newRules.find(r => r.type === 'inactive').value = e.target.value;
                           setCustomRules(newRules);
                        }} className="w-10 bg-transparent outline-none text-xs text-white border-b border-purple-500/50 text-center" />
                        <span className="text-xs">days</span>
                        <button type="button" onClick={() => setCustomRules(customRules.filter(r => r.type !== 'inactive'))}><XCircle className="w-3 h-3 text-purple-400 hover:text-purple-300"/></button>
                     </div>
                  )}
                </div>

                <div className="bg-black/50 p-2 rounded border border-white/5 font-mono text-[10px] text-gray-500 overflow-x-auto whitespace-nowrap">
                   {targetFilter}
                </div>

                <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => updateReachForFilter(targetFilter)} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37]/20 rounded transition-colors">
                      <RefreshCw className="w-3 h-3" /> Estimate Reach
                   </button>
                   <button type="button" onClick={() => setShowSaveSegmentForm(!showSaveSegmentForm)} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors">
                      Save as Segment
                   </button>
                </div>

                {showSaveSegmentForm && (
                   <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
                      <input type="text" placeholder="Segment Name" value={newSegmentName} onChange={e=>setNewSegmentName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]/50" />
                      <input type="text" placeholder="Description" value={newSegmentDesc} onChange={e=>setNewSegmentDesc(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]/50" />
                      <div className="flex justify-end gap-2">
                         <button type="button" onClick={() => setShowSaveSegmentForm(false)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
                         <button type="button" onClick={async () => {
                            if (!newSegmentName) return;
                            try {
                               await pb.collection('notification_segments').create({
                                  name: newSegmentName,
                                  description: newSegmentDesc,
                                  filter_string: targetFilter,
                                  estimated_reach: estimatedReach,
                                  rules_json: customRules,
                                  use_count: 0
                               });
                               alert("Segment saved");
                               setShowSaveSegmentForm(false);
                               setNewSegmentName('');
                               setNewSegmentDesc('');
                               fetchSegments();
                            } catch(e) { alert("Failed to save segment"); }
                         }} className="text-xs px-3 py-1 bg-[#d4af37] text-black rounded font-medium hover:bg-[#b8860b]">Save Segment</button>
                      </div>
                   </div>
                )}
              </div>
            )}

            {audienceMode === 'quick' && targetType === 'specific' && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" required value={specificUid} onChange={e => setSpecificUid(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all text-sm"
                  placeholder="e.g. user_abc123"
                />
              </div>
            )}
          </div>

          {/* Type & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select 
                value={notificationType} onChange={(e) => setNotificationType(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all appearance-none"
              >
                <option value="announcement">Announcement</option>
                <option value="feature">Feature Update</option>
                <option value="system">System Alert</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
              <button
                type="button"
                onClick={() => setPriority(!priority)}
                className={`w-full py-2.5 px-4 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${priority ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#050508] border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Zap className={`w-4 h-4 ${priority ? 'fill-red-400' : ''}`} />
                {priority ? 'High' : 'Normal'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)} maxLength={65}
              className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
              placeholder="New Content Available!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Body</label>
            <textarea 
              rows={3} required value={body} onChange={e => setBody(e.target.value)} maxLength={240}
              className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all resize-none"
              placeholder="Tap here to explore the latest chapter..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Deep Link (Optional)</label>
              <input 
                type="text" value={deepLink} onChange={e => setDeepLink(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono text-sm"
                placeholder="e.g. arena, chat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Optional)</label>
              <div className="relative">
                <input 
                  type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2 pl-9 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all text-sm"
                  placeholder="https://..."
                />
                <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Schedule for later
              </label>
              <button
                type="button"
                onClick={() => setScheduleForLater(!scheduleForLater)}
                className={`w-12 h-6 rounded-full transition-colors relative ${scheduleForLater ? 'bg-[#d4af37]' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${scheduleForLater ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            {scheduleForLater && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all"
                />
              </div>
            )}
          </div>

          {statusMsg && (
            <div className={`p-4 rounded-lg flex gap-3 text-sm font-medium ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {statusMsg.type === 'error' ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {statusMsg.msg}
            </div>
          )}

          <button 
            type="submit" disabled={isSending}
            className="w-full py-3.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : (scheduleForLater ? <Clock className="w-5 h-5" /> : <Send className="w-5 h-5" />)}
            {isSending ? 'Processing...' : (scheduleForLater ? 'Schedule Notification' : 'Dispatch Notification')}
          </button>
          
          <div className="pt-4 flex flex-col items-center">
            {!showSaveTemplateForm ? (
                <button type="button" onClick={() => setShowSaveTemplateForm(true)} className="text-sm text-gray-400 hover:text-[#d4af37] flex items-center gap-1 transition-colors">
                  <span className="text-lg">💾</span> Save as Template
                </button>
            ) : (
                <div className="w-full animate-in fade-in slide-in-from-top-2 flex gap-2">
                    <input 
                        type="text" value={saveTemplateName} onChange={e => setSaveTemplateName(e.target.value)}
                        className="flex-1 bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 text-sm"
                        placeholder="Template Name..."
                    />
                    <button 
                        type="button" 
                        disabled={isSavingTemplate || !saveTemplateName}
                        onClick={async () => {
                            if (!title || !body) return alert("Title and body required for template");
                            setIsSavingTemplate(true);
                            try {
                                await pb.collection('notification_templates').create({
                                    name: saveTemplateName, title, body, image_url: imageUrl, deep_link: deepLink, notification_type: notificationType, target_segment: 'custom'
                                });
                                setStatusMsg({ type: 'success', msg: "Template saved!" });
                                setShowSaveTemplateForm(false);
                                setSaveTemplateName('');
                            } catch (e: any) {
                                alert("Failed to save template: " + e.message);
                            } finally {
                                setIsSavingTemplate(false);
                            }
                        }}
                        className="bg-[#d4af37]/10 text-[#d4af37] px-4 rounded-lg font-medium text-sm hover:bg-[#d4af37]/20 border border-[#d4af37]/50 disabled:opacity-50"
                    >
                        {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                    <button type="button" onClick={() => setShowSaveTemplateForm(false)} className="text-gray-400 hover:text-white px-2 text-sm">Cancel</button>
                </div>
            )}
          </div>
        </form>
      </div>

      {/* Live Preview */}
      <div className="space-y-6">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2 text-center lg:text-left">Android Device Preview</div>
        
        <div className="w-[320px] h-[650px] mx-auto bg-black rounded-[40px] border-[8px] border-zinc-800 p-4 relative shadow-2xl flex flex-col justify-start">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20"></div>
          
          {/* Time / Status bar mock */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 pt-2 mb-8 font-medium relative z-20">
            <span>9:41</span>
            <div className="flex gap-1.5">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Wallpaper background mock */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d15] to-[#050508] rounded-[32px] overflow-hidden pointer-events-none opacity-50">
             <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#d4af37]/20 blur-3xl rounded-full"></div>
          </div>

          {/* Notification Bubble */}
          <div className={`relative z-10 w-full bg-[#1a1a24] border border-white/5 rounded-2xl p-4 shadow-2xl transition-all duration-500 transform ${title || body || imageUrl ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#b8860b] to-[#d4af37] flex items-center justify-center shadow-lg">
                <Bell className="w-3 h-3 text-[#050508]" />
              </div>
              <span className="text-[11px] font-medium text-gray-300 tracking-wide uppercase">Amritam • now</span>
              {priority && <Zap className="w-3 h-3 text-red-400 ml-auto" />}
            </div>
            
            <div className="text-[15px] font-bold text-white leading-tight mb-1.5">
              {title || 'Notification Title'}
            </div>
            
            <div className="text-[13px] text-gray-300 leading-snug line-clamp-3 mb-3">
              {body || 'Notification body text will appear here. Keep it concise and engaging.'}
            </div>

            {imageUrl && (
              <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden border border-white/5 mt-2">
                <img src={imageUrl} alt="Push attachment" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            
            {notificationType !== 'announcement' && (
              <div className="mt-3 inline-flex bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-400 font-medium uppercase tracking-wider border border-white/5">
                {notificationType}
              </div>
            )}
          </div>
          
          {/* Ambient aesthetic */}
          <div className="mt-auto pb-8 text-center text-gray-800 flex flex-col items-center gap-4 relative z-10">
            <Smartphone className="w-12 h-12 text-zinc-800/50" />
            <div className="w-20 h-1 rounded-full bg-zinc-800/50"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabHistory = () => (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[#d4af37]" /> Campaign History
        </h2>
        <button 
          onClick={fetchHistory}
          disabled={isHistoryLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isHistoryLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {campaigns.length === 0 && !isHistoryLoading ? (
        <div className="text-center py-16 bg-[#050508]/50 rounded-xl border border-white/5 border-dashed">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No campaigns yet. Send your first notification above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 px-4">Title</th>
                <th className="pb-3 px-4">Target</th>
                <th className="pb-3 px-4 text-center">Sent</th>
                <th className="pb-3 px-4 text-center">Open Rate</th>
                <th className="pb-3 px-4 text-center">Errors</th>
                <th className="pb-3 pl-4">Status</th>
                <th className="pb-3 pl-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((camp) => {
                const opened = campaignStats[camp.id]?.opened || 0;
                const sent = camp.sent_count || 0;
                const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
                
                return (
                <React.Fragment key={camp.id}>
                  <tr onClick={() => setExpandedCampId(expandedCampId === camp.id ? null : camp.id)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="py-4 pr-4 whitespace-nowrap text-sm text-gray-400">
                      <div className="font-medium text-gray-300">{timeAgo(camp.created)}</div>
                      <div className="text-xs">{new Date(camp.created).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-200 line-clamp-1">{camp.title}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400 capitalize">
                      {camp.target_segment || camp.target || 'all'}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-sm text-green-400">
                      {sent}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-sm text-blue-400">
                      {openRate}%
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-sm text-red-400">
                      {camp.error_count || 0}
                    </td>
                    <td className="py-4 pl-4 whitespace-nowrap">
                      {camp.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock className="w-3 h-3" /> Pending</span>}
                      {camp.status === 'sending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> Sending</span>}
                      {camp.status === 'done' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3" /> Done</span>}
                      {camp.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20"><XCircle className="w-3 h-3" /> Cancelled</span>}
                      {!['pending','sending','done','cancelled'].includes(camp.status) && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 capitalize">{camp.status || 'unknown'}</span>}
                    </td>
                    <td className="py-4 pl-4 text-gray-500">
                       {expandedCampId === camp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>
                  {expandedCampId === camp.id && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={8} className="p-6 text-sm text-gray-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           <div>
                              <div className="text-gray-500 mb-1">Body</div>
                              <div className="font-medium text-white">{camp.body}</div>
                           </div>
                           <div>
                              <div className="text-gray-500 mb-1">Deep Link</div>
                              <div className="font-medium font-mono text-white">{camp.deep_link || '-'}</div>
                           </div>
                           <div>
                              <div className="text-gray-500 mb-1">Total Opens</div>
                              <div className="font-medium text-white text-xl">{opened}</div>
                           </div>
                           <div>
                              <div className="text-gray-500 mb-1">CTR / Open Rate</div>
                              <div className="font-medium text-blue-400 text-xl">{openRate}%</div>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )})}
              {isHistoryLoading && campaigns.length === 0 && (
                 <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                       <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                       Loading history...
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTabTemplates = () => (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-[#d4af37] text-2xl">📋</span> Notification Templates
        </h2>
        <button 
          onClick={fetchTemplates}
          disabled={isTemplatesLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isTemplatesLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isTemplatesLoading && templates.length === 0 ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-[#050508]/50 rounded-xl border border-white/5 border-dashed">
          <p className="text-gray-400">No templates found. Save one from the compose tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-[#050508] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all flex flex-col group relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors">{t.name}</h3>
                <div className="flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.notification_type === 'announcement' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        t.notification_type === 'feature' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        t.notification_type === 'promotion' ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                    {t.notification_type}
                    </span>
                    <button onClick={async () => {
                        if (confirm('Delete this template?')) {
                            try {
                                await pb.collection('notification_templates').delete(t.id);
                                fetchTemplates();
                            } catch (e) { alert('Failed to delete'); }
                        }
                    }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              <p className="text-white font-medium text-sm mb-1">{t.title}</p>
              <p className="text-gray-400 text-xs mb-4 line-clamp-2">{t.body}</p>
              <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Target: {t.target_segment || 'all'}</span>
                <button 
                  onClick={() => {
                    setTitle(t.title);
                    setBody(t.body);
                    setImageUrl(t.image_url || '');
                    setDeepLink(t.deep_link || '');
                    setNotificationType(t.notification_type || 'announcement');
                    setActiveTab('compose');
                    // increment use_count asynchronously
                    pb.collection('notification_templates').update(t.id, { use_count: (t.use_count || 0) + 1 }).catch(() => {});
                  }}
                  className="px-4 py-1.5 bg-[#0d0d15] hover:bg-[#d4af37]/10 border border-white/10 hover:border-[#d4af37]/50 text-gray-300 hover:text-[#d4af37] rounded-lg text-xs font-medium transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabSegments = () => (
    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#d4af37]" /> Audience Segments
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSegments}
            disabled={isSegmentsLoading}
            className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSegmentsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 px-4">Description</th>
              <th className="pb-3 px-4">Filter</th>
              <th className="pb-3 px-4 text-center">Est. Reach</th>
              <th className="pb-3 px-4 text-center">Uses</th>
              <th className="pb-3 pl-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {savedSegments.map((seg) => (
              <tr key={seg.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 pr-4 whitespace-nowrap text-sm">
                  <div className="font-bold text-gray-200">{seg.name}</div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {seg.description}
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-[10px] text-gray-500 bg-black/50 p-2 rounded border border-white/5 max-w-xs overflow-hidden text-ellipsis">
                    {seg.filter_string}
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-mono text-sm text-[#d4af37]">
                  {seg.estimated_reach !== null && seg.estimated_reach !== undefined ? seg.estimated_reach.toLocaleString() : '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-400">
                  {seg.use_count || 0}
                </td>
                <td className="py-4 pl-4 whitespace-nowrap text-right">
                  <button onClick={async () => {
                     try {
                        const r = await pb.collection('users').getList(1, 1, { filter: seg.filter_string });
                        await pb.collection('notification_segments').update(seg.id, { estimated_reach: r.totalItems });
                        fetchSegments();
                     } catch(e) {}
                  }} className="text-gray-400 hover:text-[#d4af37] mr-3" title="Refresh Reach"><RefreshCw className="w-4 h-4 inline"/></button>
                  
                  <button onClick={() => {
                     setAudienceMode('saved');
                     setSelectedSegmentId(seg.id);
                     setTargetFilter(seg.filter_string);
                     setActiveTab('compose');
                  }} className="text-gray-400 hover:text-white mr-3" title="Use Segment"><Target className="w-4 h-4 inline"/></button>
                  
                  <button onClick={async () => {
                     if (confirm("Delete segment?")) {
                        await pb.collection('notification_segments').delete(seg.id);
                        fetchSegments();
                     }
                  }} className="text-gray-500 hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4 inline"/></button>
                </td>
              </tr>
            ))}
            {isSegmentsLoading && savedSegments.length === 0 && (
               <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                     <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                     Loading segments...
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabHealth = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#d4af37]" /> Token Health Overview
          </h2>
          <p className="text-sm text-gray-400 mt-1">Monitor FCM token registration rates across your user base.</p>
        </div>
        <button 
          onClick={fetchHealth}
          disabled={isHealthLoading}
          className="p-2 text-gray-400 hover:text-white bg-[#050508] border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isHealthLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-16 h-16 text-[#d4af37]" /></div>
           <p className="text-sm text-gray-400 font-medium mb-1">Total Tokens</p>
           <p className="text-4xl font-bold text-white font-mono">{isHealthLoading ? '-' : totalTokens.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-[#d4af37]" /></div>
           <p className="text-sm text-gray-400 font-medium mb-1">Token Rate</p>
           <p className="text-4xl font-bold text-[#d4af37] font-mono">{isHealthLoading ? '-' : `${tokenRate}%`}</p>
        </div>
        <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-[#d4af37]" /></div>
           <p className="text-sm text-gray-400 font-medium mb-1">Total Users</p>
           <p className="text-4xl font-bold text-white font-mono">{isHealthLoading ? '-' : totalUsers.toLocaleString()}</p>
        </div>
      </div>

      {Number(tokenRate) < 80 && !isHealthLoading && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex gap-4 items-start shadow-lg">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-500 font-bold mb-1">Low Registration Rate Detected</h3>
            <p className="text-sm text-yellow-500/80 leading-relaxed">
              Less than 80% of your users have valid push notification tokens. Ensure that the mobile app is properly requesting notification permissions on launch and syncing tokens to PocketBase.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-lg mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Maintenance</h3>
        <p className="text-sm text-gray-400 mb-6">Remove expired or invalid tokens from the database to improve delivery rates and reduce sending errors.</p>
        <button 
          onClick={() => console.log('Clean stale tokens initiated')}
          className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-all font-medium flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" /> Clean Stale Tokens
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header & Tabs */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-[#d4af37]" /> Notification Command Center
        </h1>
        
        <div className="flex bg-[#0d0d15] border border-white/10 rounded-xl p-1 w-full shadow-lg">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'compose' ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Send className="w-4 h-4" /> Compose
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <History className="w-4 h-4" /> History
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'templates' ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="text-lg leading-none">📋</span> Templates
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'segments' ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Filter className="w-4 h-4" /> Segments
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'health' ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Activity className="w-4 h-4" /> Health
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'compose' && renderTabCompose()}
        {activeTab === 'history' && renderTabHistory()}
        {activeTab === 'templates' && renderTabTemplates()}
        {activeTab === 'segments' && renderTabSegments()}
        {activeTab === 'health' && renderTabHealth()}
      </div>
    </div>
  );
}
