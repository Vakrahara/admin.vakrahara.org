'use client';

import { pb } from '@/lib/pocketbase';
import { Bell, Send, History, Activity, Filter } from 'lucide-react';
import { PushComposeTab } from './components/PushComposeTab';
import { PushHistoryTab } from './components/PushHistoryTab';
import { PushTemplatesTab } from './components/PushTemplatesTab';
import { PushSegmentsTab } from './components/PushSegmentsTab';
import { PushHealthTab } from './components/PushHealthTab';
import { usePushNotifications } from './hooks/usePushNotifications';

export default function PushNotificationsPage() {
  const {
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
    savedSegments,
    isSegmentsLoading,
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
    campaigns,
    isHistoryLoading,
    expandedCampId,
    setExpandedCampId,
    campaignStats,
    totalTokens,
    totalUsers,
    tokenRate,
    isHealthLoading,
    templates,
    isTemplatesLoading,
    saveTemplateName,
    setSaveTemplateName,
    isSavingTemplate,
    showSaveTemplateForm,
    setShowSaveTemplateForm,
    updateReachForFilter,
    fetchHistory,
    fetchHealth,
    fetchTemplates,
    fetchSegments,
    handleSend,
    handleSaveSegment,
    handleSaveTemplate,
  } = usePushNotifications();

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
        {activeTab === 'compose' && (
          <PushComposeTab
            audienceMode={audienceMode}
            setAudienceMode={setAudienceMode}
            targetType={targetType}
            setTargetType={setTargetType}
            specificUid={specificUid}
            setSpecificUid={setSpecificUid}
            targetFilter={targetFilter}
            setTargetFilter={setTargetFilter}
            title={title}
            setTitle={setTitle}
            body={body}
            setBody={setBody}
            deepLink={deepLink}
            setDeepLink={setDeepLink}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            notificationType={notificationType}
            setNotificationType={setNotificationType}
            priority={priority}
            setPriority={setPriority}
            scheduleForLater={scheduleForLater}
            setScheduleForLater={setScheduleForLater}
            scheduledAt={scheduledAt}
            setScheduledAt={setScheduledAt}
            statusMsg={statusMsg}
            isSending={isSending}
            estimatedReach={estimatedReach}
            savedSegments={savedSegments}
            selectedSegmentId={selectedSegmentId}
            setSelectedSegmentId={setSelectedSegmentId}
            customRules={customRules}
            setCustomRules={setCustomRules}
            updateReachForFilter={updateReachForFilter}
            onSend={handleSend}
            onSaveSegment={handleSaveSegment}
            onSaveTemplate={handleSaveTemplate}
            isSavingTemplate={isSavingTemplate}
            saveTemplateName={saveTemplateName}
            setSaveTemplateName={setSaveTemplateName}
            showSaveTemplateForm={showSaveTemplateForm}
            setShowSaveTemplateForm={setShowSaveTemplateForm}
            showSaveSegmentForm={showSaveSegmentForm}
            setShowSaveSegmentForm={setShowSaveSegmentForm}
            newSegmentName={newSegmentName}
            setNewSegmentName={setNewSegmentName}
            newSegmentDesc={newSegmentDesc}
            setNewSegmentDesc={setNewSegmentDesc}
          />
        )}
        {activeTab === 'history' && (
          <PushHistoryTab
            campaigns={campaigns}
            isHistoryLoading={isHistoryLoading}
            onRefresh={fetchHistory}
            expandedCampId={expandedCampId}
            setExpandedCampId={setExpandedCampId}
            campaignStats={campaignStats}
          />
        )}
        {activeTab === 'templates' && (
          <PushTemplatesTab
            templates={templates}
            isTemplatesLoading={isTemplatesLoading}
            onRefresh={fetchTemplates}
            onUseTemplate={(t) => {
              setTitle(t.title);
              setBody(t.body);
              setImageUrl(t.image_url || '');
              setDeepLink(t.deep_link || '');
              setNotificationType(t.notification_type || 'announcement');
              setActiveTab('compose');
              pb.collection('notification_templates').update(t.id, { use_count: (t.use_count || 0) + 1 }).catch(() => {});
            }}
            onDeleteTemplate={async (id) => {
              if (confirm('Delete this template?')) {
                try {
                  await pb.collection('notification_templates').delete(id);
                  fetchTemplates();
                } catch {
                  alert('Failed to delete');
                }
              }
            }}
          />
        )}
        {activeTab === 'segments' && (
          <PushSegmentsTab
            savedSegments={savedSegments}
            isSegmentsLoading={isSegmentsLoading}
            onRefresh={fetchSegments}
            onRefreshReach={async (seg) => {
              try {
                const r = await pb.collection('users').getList(1, 1, { filter: seg.filter_string });
                await pb.collection('notification_segments').update(seg.id, { estimated_reach: r.totalItems });
                fetchSegments();
              } catch {}
            }}
            onUseSegment={(seg) => {
              setAudienceMode('saved');
              setSelectedSegmentId(seg.id);
              setTargetFilter(seg.filter_string);
              setActiveTab('compose');
            }}
            onDeleteSegment={async (id) => {
              if (confirm("Delete segment?")) {
                await pb.collection('notification_segments').delete(id);
                fetchSegments();
              }
            }}
          />
        )}
        {activeTab === 'health' && (
          <PushHealthTab
            totalTokens={totalTokens}
            totalUsers={totalUsers}
            tokenRate={tokenRate}
            isHealthLoading={isHealthLoading}
            onRefresh={fetchHealth}
            onCleanStaleTokens={() => console.log('Clean stale tokens initiated')}
          />
        )}
      </div>
    </div>
  );
}
