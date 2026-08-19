'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  Code, Send, Terminal, RefreshCw, CheckCircle2, AlertTriangle,
  Play, Radio, Bell, KeyRound
} from 'lucide-react';

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState<'fcm' | 'webhook'>('fcm');
  
  // FCM State
  const [fcmToken, setFcmToken] = useState('');
  const [fcmTitle, setFcmTitle] = useState('✨ Buddhi Arena Duel Alert');
  const [fcmBody, setFcmBody] = useState('A rival has challenged you in the Arena!');
  const [fcmType, setFcmType] = useState('challenge');
  const [fcmPayload, setFcmPayload] = useState('{\n  "custom_key": "custom_value"\n}');
  const [fcmResult, setFcmResult] = useState<string | null>(null);
  const [fcmSending, setFcmSending] = useState(false);

  // Webhook State
  const [webhookEvent, setWebhookEvent] = useState('PAYMENT_SUCCESS_WEBHOOK');
  const [webhookOrderId, setWebhookOrderId] = useState('order_demo_123');
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [webhookSending, setWebhookSending] = useState(false);

  const handleSendFCM = async (e: React.FormEvent) => {
    e.preventDefault();
    setFcmSending(true);
    setFcmResult(null);

    try {
      const res = await pb.collection('notification_campaigns').create({
        title: fcmTitle,
        body: fcmBody,
        target_topic: fcmToken ? undefined : 'all_users',
        target_token: fcmToken || undefined,
        deep_link: `/arena?type=${fcmType}`,
        status: 'dispatched',
      });
      setFcmResult(`HTTP 200 OK: Notification Campaign ${res.id} queued and dispatched to FCM broker.`);
    } catch (err: any) {
      setFcmResult(`ERROR: ${err.message}`);
    } finally {
      setFcmSending(false);
    }
  };

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSending(true);
    setWebhookResult(null);

    try {
      const res = await pb.send('/api/amritam/cashfree/webhook', {
        method: 'POST',
        body: {
          event: webhookEvent,
          data: {
            order: {
              order_id: webhookOrderId,
              order_amount: 79.00,
              order_currency: 'INR',
            },
            payment: {
              payment_status: 'SUCCESS',
              cf_payment_id: 'cf_sim_test_9999',
            },
          },
        },
      });
      setWebhookResult(`HTTP 200 OK: ${JSON.stringify(res, null, 2)}`);
    } catch (err: any) {
      setWebhookResult(`HTTP ${err.status || '500'}: ${err.message}`);
    } finally {
      setWebhookSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Developer Tools & Webhook Sandbox</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              API Sandbox
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Simulate Cashfree webhook events, test raw FCM device pushes, and inspect API response envelopes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0d0d15] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('fcm')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'fcm'
                ? 'bg-[#d4af37] text-black font-semibold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            FCM Simulator
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'webhook'
                ? 'bg-[#d4af37] text-black font-semibold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cashfree Webhook
          </button>
        </div>
      </div>

      {/* Main Tool Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Controls */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          {activeTab === 'fcm' ? (
            <form onSubmit={handleSendFCM} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <Bell className="w-5 h-5 text-[#d4af37]" />
                <h2 className="text-base font-bold text-white">Direct Push Dispatch</h2>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Target FCM Device Token (Leave blank for all users)</label>
                <input
                  type="text"
                  placeholder="e.g. eQ4z8... or leave empty to broadcast"
                  value={fcmToken}
                  onChange={(e) => setFcmToken(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={fcmTitle}
                    onChange={(e) => setFcmTitle(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payload Type</label>
                  <select
                    value={fcmType}
                    onChange={(e) => setFcmType(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="challenge">Arena Challenge</option>
                    <option value="chat">Chat Message</option>
                    <option value="friend_request">Friend Request</option>
                    <option value="campaign">General Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Body Message</label>
                <textarea
                  required
                  value={fcmBody}
                  onChange={(e) => setFcmBody(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 h-20"
                />
              </div>

              <button
                type="submit"
                disabled={fcmSending}
                className="w-full py-3 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {fcmSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send FCM Payload</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleTriggerWebhook} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <Radio className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Cashfree PG Event Dispatcher</h2>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Webhook Event Type</label>
                <select
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"
                >
                  <option value="PAYMENT_SUCCESS_WEBHOOK">PAYMENT_SUCCESS_WEBHOOK (Order Paid)</option>
                  <option value="PAYMENT_FAILED_WEBHOOK">PAYMENT_FAILED_WEBHOOK (Payment Dropped)</option>
                  <option value="REFUND_PROCESSED_WEBHOOK">REFUND_PROCESSED_WEBHOOK (Refund Done)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Mock Order ID</label>
                <input
                  type="text"
                  required
                  value={webhookOrderId}
                  onChange={(e) => setWebhookOrderId(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>

              <button
                type="submit"
                disabled={webhookSending}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {webhookSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Trigger Webhook Event</span>
              </button>
            </form>
          )}
        </div>

        {/* Live Execution Console */}
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Execution Console & HTTP Log</h2>
          </div>

          <div className="flex-1 min-h-64 p-4 bg-black/80 border border-white/10 rounded-xl font-mono text-xs text-gray-300 overflow-x-auto">
            {activeTab === 'fcm' ? (
              fcmResult ? (
                <div className="text-emerald-400 whitespace-pre-wrap">{fcmResult}</div>
              ) : (
                <div className="text-gray-600">// Output from FCM broker will appear here...</div>
              )
            ) : (
              webhookResult ? (
                <div className="text-blue-300 whitespace-pre-wrap">{webhookResult}</div>
              ) : (
                <div className="text-gray-600">// Webhook handler response payload will appear here...</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
