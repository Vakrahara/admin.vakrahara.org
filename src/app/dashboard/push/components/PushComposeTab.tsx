import {
  Send, Zap, Image as ImageIcon,
  Clock, ShieldAlert, CheckCircle, Loader2
} from 'lucide-react';
import { PushDevicePreview } from './PushDevicePreview';
import { PushAudienceBuilder } from './PushAudienceBuilder';
import { AudienceMode, PushSegment } from '../types';

interface PushComposeTabProps {
  audienceMode: AudienceMode;
  setAudienceMode: (m: AudienceMode) => void;
  targetType: string;
  setTargetType: (t: string) => void;
  specificUid: string;
  setSpecificUid: (u: string) => void;
  targetFilter: string;
  setTargetFilter: (f: string) => void;
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
  estimatedReach: number | null;
  savedSegments: PushSegment[];
  selectedSegmentId: string;
  setSelectedSegmentId: (id: string) => void;
  customRules: any[];
  setCustomRules: (rules: any[]) => void;
  updateReachForFilter: (filterStr: string) => void;
  onSend: (e: React.FormEvent) => void;
  onSaveSegment: (name: string, desc: string) => Promise<void>;
  onSaveTemplate: (name: string) => Promise<void>;
  isSavingTemplate: boolean;
  saveTemplateName: string;
  setSaveTemplateName: (v: string) => void;
  showSaveTemplateForm: boolean;
  setShowSaveTemplateForm: (v: boolean) => void;
  showSaveSegmentForm: boolean;
  setShowSaveSegmentForm: (v: boolean) => void;
  newSegmentName: string;
  setNewSegmentName: (v: string) => void;
  newSegmentDesc: string;
  setNewSegmentDesc: (v: string) => void;
}

export function PushComposeTab({
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
  selectedSegmentId,
  setSelectedSegmentId,
  customRules,
  setCustomRules,
  updateReachForFilter,
  onSend,
  onSaveSegment,
  onSaveTemplate,
  isSavingTemplate,
  saveTemplateName,
  setSaveTemplateName,
  showSaveTemplateForm,
  setShowSaveTemplateForm,
  showSaveSegmentForm,
  setShowSaveSegmentForm,
  newSegmentName,
  setNewSegmentName,
  newSegmentDesc,
  setNewSegmentDesc,
}: PushComposeTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Editor */}
      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <form onSubmit={onSend} className="space-y-5 relative z-10">
          <PushAudienceBuilder
            audienceMode={audienceMode}
            setAudienceMode={setAudienceMode}
            targetType={targetType}
            setTargetType={setTargetType}
            specificUid={specificUid}
            setSpecificUid={setSpecificUid}
            targetFilter={targetFilter}
            setTargetFilter={setTargetFilter}
            estimatedReach={estimatedReach}
            savedSegments={savedSegments}
            selectedSegmentId={selectedSegmentId}
            setSelectedSegmentId={setSelectedSegmentId}
            customRules={customRules}
            setCustomRules={setCustomRules}
            updateReachForFilter={updateReachForFilter}
            onSaveSegment={onSaveSegment}
            showSaveSegmentForm={showSaveSegmentForm}
            setShowSaveSegmentForm={setShowSaveSegmentForm}
            newSegmentName={newSegmentName}
            setNewSegmentName={setNewSegmentName}
            newSegmentDesc={newSegmentDesc}
            setNewSegmentDesc={setNewSegmentDesc}
          />

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
              className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all"
              placeholder="e.g. Daily Sādhana Awaits"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Body</label>
            <textarea 
              required rows={3} value={body} onChange={e => setBody(e.target.value)} maxLength={240}
              className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all resize-none"
              placeholder="Keep the flame of knowledge alive. Continue your streak today."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Deep Link (Optional)</label>
              <input 
                type="text" value={deepLink} onChange={e => setDeepLink(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all text-xs"
                placeholder="amritam://curriculum/ch3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Optional)</label>
              <div className="relative">
                <input 
                  type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all text-xs"
                  placeholder="https://.../banner.png"
                />
                <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className="bg-[#050508] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm font-medium text-gray-300">Schedule Delivery</span>
              </div>
              <input 
                type="checkbox" checked={scheduleForLater} onChange={e => setScheduleForLater(e.target.checked)}
                className="rounded border-white/20 bg-transparent text-[#d4af37] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
              />
            </div>
            {scheduleForLater && (
              <div className="pt-2 border-t border-white/5">
                <input 
                  type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required={scheduleForLater}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex gap-3">
            <button
              type="submit" disabled={isSending}
              className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-semibold py-3 px-6 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{scheduleForLater ? 'Schedule Broadcast' : 'Dispatch Now'}</span>
                </>
              )}
            </button>
            <button
              type="button" onClick={() => setShowSaveTemplateForm(!showSaveTemplateForm)}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Save as Template
            </button>
          </div>

          {showSaveTemplateForm && (
            <div className="bg-[#050508] border border-white/10 rounded-xl p-3 flex gap-2">
              <input
                type="text" placeholder="Template Name (e.g. Sādhana Daily)"
                value={saveTemplateName} onChange={e => setSaveTemplateName(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]/50"
              />
              <button
                type="button" disabled={isSavingTemplate} onClick={() => onSaveTemplate(saveTemplateName)}
                className="px-3 py-1 bg-[#d4af37] text-black text-xs font-semibold rounded hover:bg-[#b8860b] disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}

          {statusMsg && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              {statusMsg.type === 'error' ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm">{statusMsg.msg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Real-time Preview Panel */}
      <div className="flex flex-col items-center justify-start">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4 self-start">
          Sovereign Hardware Preview
        </h3>
        <PushDevicePreview 
          title={title} 
          body={body} 
          imageUrl={imageUrl} 
          notificationType={notificationType} 
          priority={priority}
        />
      </div>
    </div>
  );
}
