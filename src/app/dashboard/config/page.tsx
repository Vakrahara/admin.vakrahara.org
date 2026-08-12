'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Settings2, Save, RefreshCw, AlertTriangle, IndianRupee, Clock, Smartphone, Tag, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

interface AppConfig {
  id: string;
  monthly_price_paise: number;
  yearly_price_paise: number;
  lifetime_price_paise: number;
  monthly_discount_price: number;
  yearly_discount_price: number;
  lifetime_discount_price: number;
  coupon_hint_text: string;
  trial_duration_days: number;
  is_maintenance: boolean;
  maintenance_message: string;
  min_app_version_code: number;
  updated: string;
}

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-white/8">
      <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#d4af37]" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
      {note && <p className="text-xs text-gray-600 mt-1.5">{note}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, prefix }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
      <input
        type="number" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full ${prefix ? 'pl-8' : 'pl-4'} pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]/40 focus:bg-white/8 transition-all`}
      />
    </div>
  );
}

export default function RemoteConfigPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [recordId, setRecordId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  // Form state (mirrors AppConfig)
  const [monthlyRs, setMonthlyRs] = useState(79);
  const [yearlyRs, setYearlyRs] = useState(999);
  const [lifetimeRs, setLifetimeRs] = useState(1999);
  const [monthlyPaise, setMonthlyPaise] = useState(7900);
  const [yearlyPaise, setYearlyPaise] = useState(99900);
  const [lifetimePaise, setLifetimePaise] = useState(199900);
  const [couponHint, setCouponHint] = useState('');
  const [trialDays, setTrialDays] = useState(2);
  const [minAppVersion, setMinAppVersion] = useState(0);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await pb.collection('app_config').getList<AppConfig>(1, 1, { sort: '-created' });
      if (res.items.length > 0) {
        const c = res.items[0];
        setConfig(c);
        setRecordId(c.id);
        setMonthlyRs(c.monthly_discount_price || 79);
        setYearlyRs(c.yearly_discount_price || 999);
        setLifetimeRs(c.lifetime_discount_price || 1999);
        setMonthlyPaise(c.monthly_price_paise || 7900);
        setYearlyPaise(c.yearly_price_paise || 99900);
        setLifetimePaise(c.lifetime_price_paise || 199900);
        setCouponHint(c.coupon_hint_text || '');
        setTrialDays(c.trial_duration_days || 2);
        setMinAppVersion(c.min_app_version_code || 0);
        setIsMaintenance(c.is_maintenance || false);
        setMaintenanceMsg(c.maintenance_message || '');
      }
    } catch (e) {
      console.error('Failed to load app_config', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const syncPaiseFromRs = () => {
    setMonthlyPaise(Math.round(monthlyRs * 100));
    setYearlyPaise(Math.round(yearlyRs * 100));
    setLifetimePaise(Math.round(lifetimeRs * 100));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const data = {
        monthly_discount_price: monthlyRs,
        yearly_discount_price: yearlyRs,
        lifetime_discount_price: lifetimeRs,
        monthly_price_paise: monthlyPaise,
        yearly_price_paise: yearlyPaise,
        lifetime_price_paise: lifetimePaise,
        coupon_hint_text: couponHint,
        trial_duration_days: trialDays,
        min_app_version_code: minAppVersion,
        is_maintenance: isMaintenance,
        maintenance_message: maintenanceMsg,
      };
      if (recordId) {
        await pb.collection('app_config').update(recordId, data);
      } else {
        const rec = await pb.collection('app_config').create(data);
        setRecordId(rec.id);
      }
      setSaveStatus('success');
      setSaveMsg('Settings saved successfully!');
      await load();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      setSaveStatus('error');
      setSaveMsg('Error saving: ' + (e.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#d4af37] mx-auto" />
          <p className="text-sm text-gray-500">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Remote Config</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control app pricing, behavior, and maintenance mode globally.
            {config?.updated && <span className="ml-2 text-gray-600">Last updated: {new Date(config.updated).toLocaleString('en-IN')}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> {saveMsg}
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4" /> {saveMsg}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20 disabled:opacity-50">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Price change warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-400">
          <strong>Price changes take effect immediately for all new purchases.</strong> Existing active subscriptions are unaffected.
          Always sync the Paise values after changing ₹ prices.
        </p>
      </div>

      {/* Maintenance mode warning */}
      {isMaintenance && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400">⚠️ Maintenance Mode is ON</p>
            <p className="text-xs text-red-400/70 mt-1">All users will see the maintenance message. Turn this off when done.</p>
          </div>
        </div>
      )}

      {/* Section 1: Pricing (₹) */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <SectionHeader icon={IndianRupee} title="Pricing (₹)" description="Display prices shown to users in the app and on the website" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Monthly Price (₹)">
            <NumberInput value={monthlyRs} onChange={setMonthlyRs} min={1} prefix="₹" />
          </Field>
          <Field label="Yearly Price (₹)">
            <NumberInput value={yearlyRs} onChange={setYearlyRs} min={1} prefix="₹" />
          </Field>
          <Field label="Lifetime Price (₹)">
            <NumberInput value={lifetimeRs} onChange={setLifetimeRs} min={1} prefix="₹" />
          </Field>
        </div>
      </div>

      {/* Section 2: Pricing (Paise for Cashfree) */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <SectionHeader icon={IndianRupee} title="Pricing (Paise — Cashfree API)" description="These values are sent to Cashfree. Must be ₹ price × 100." />
          <button onClick={syncPaiseFromRs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all mt-1 shrink-0">
            <RefreshCw className="w-3 h-3" /> Sync from ₹
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Monthly (paise)" note={`= ₹${(monthlyPaise / 100).toFixed(2)}`}>
            <NumberInput value={monthlyPaise} onChange={setMonthlyPaise} min={100} />
          </Field>
          <Field label="Yearly (paise)" note={`= ₹${(yearlyPaise / 100).toFixed(2)}`}>
            <NumberInput value={yearlyPaise} onChange={setYearlyPaise} min={100} />
          </Field>
          <Field label="Lifetime (paise)" note={`= ₹${(lifetimePaise / 100).toFixed(2)}`}>
            <NumberInput value={lifetimePaise} onChange={setLifetimePaise} min={100} />
          </Field>
        </div>
      </div>

      {/* Section 3: App Behavior */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <SectionHeader icon={Smartphone} title="App Behavior" description="Control trial duration, force-update, and coupon UX" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trial Duration (days)" note="How long the free trial lasts when a user taps 'Start Trial'">
            <NumberInput value={trialDays} onChange={setTrialDays} min={1} max={30} />
          </Field>
          <Field label="Min App Version Code" note="Users below this version code will see a force-update screen (0 = disabled)">
            <NumberInput value={minAppVersion} onChange={setMinAppVersion} min={0} />
          </Field>
        </div>
        <Field label="Coupon Hint Text" note="Shown in the coupon input field placeholder in the app">
          <input type="text" value={couponHint} onChange={e => setCouponHint(e.target.value)}
            placeholder="e.g. Have a promo code? Enter here"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40 transition-all" />
        </Field>
      </div>

      {/* Section 4: Maintenance Mode */}
      <div className={`bg-[#0d0d15] border rounded-2xl p-6 space-y-5 ${isMaintenance ? 'border-red-500/30' : 'border-white/8'}`}>
        <SectionHeader icon={AlertTriangle} title="Maintenance Mode" description="When enabled, all app users see the maintenance screen" />
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMaintenance(m => !m)}>
            {isMaintenance
              ? <ToggleRight className="w-10 h-10 text-red-400" />
              : <ToggleLeft className="w-10 h-10 text-gray-600" />}
          </button>
          <div>
            <span className={`text-sm font-semibold ${isMaintenance ? 'text-red-400' : 'text-gray-400'}`}>
              Maintenance Mode is {isMaintenance ? 'ON' : 'OFF'}
            </span>
            <p className="text-xs text-gray-600 mt-0.5">{isMaintenance ? 'App is unavailable to users.' : 'App is live and accessible.'}</p>
          </div>
        </div>
        <Field label="Maintenance Message" note="This message is shown to users when maintenance mode is active">
          <textarea
            value={maintenanceMsg}
            onChange={e => setMaintenanceMsg(e.target.value)}
            rows={3}
            placeholder="e.g. We're performing scheduled maintenance. We'll be back in a few hours!"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40 transition-all resize-none"
          />
        </Field>
      </div>

      {/* Save button (bottom) */}
      <div className="flex items-center justify-end gap-4 pb-4">
        {saveStatus === 'success' && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> {saveMsg}
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-400">{saveMsg}</span>
        )}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#d4af37]/20 disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
