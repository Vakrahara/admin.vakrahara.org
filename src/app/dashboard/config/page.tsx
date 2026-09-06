'use client';

import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Settings2, Save, RefreshCw, AlertTriangle, IndianRupee, Clock, Smartphone, Tag, ToggleLeft, ToggleRight, CheckCircle2, Info } from 'lucide-react';

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

  // Form state (Default: ₹99 / ₹799 / ₹1,999 for Web Cashfree passes)
  const [monthlyRs, setMonthlyRs] = useState(99);
  const [yearlyRs, setYearlyRs] = useState(799);
  const [lifetimeRs, setLifetimeRs] = useState(1999);
  const [monthlyPaise, setMonthlyPaise] = useState(9900);
  const [yearlyPaise, setYearlyPaise] = useState(79900);
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
        setMonthlyRs(c.monthly_discount_price || 99);
        setYearlyRs(c.yearly_discount_price || 799);
        setLifetimeRs(c.lifetime_discount_price || 1999);
        setMonthlyPaise(c.monthly_price_paise || 9900);
        setYearlyPaise(c.yearly_price_paise || 79900);
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
      setSaveMsg('Config saved successfully');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      setSaveStatus('error');
      setSaveMsg(e?.message || 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">App Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Global pricing and maintenance controls.
            {config?.updated && <span className="ml-2 text-gray-600">Updated: {new Date(config.updated).toLocaleDateString('en-IN')}</span>}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a227] text-[#050508] font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Dual Platform Pricing Callout */}
      <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-300 space-y-1">
          <p className="font-semibold">Domestic Dual-Platform Pricing Protocol:</p>
          <p>• <strong>Web Portal (Cashfree UPI):</strong> ₹99 (30d Pass), ₹799 (365d Pass), ₹1,999 (Lifetime Pass).</p>
          <p>• <strong>Android Mobile App:</strong> Fixed Google Play SKUs: ₹149/mo, ₹999/yr (Save 44%), ₹2,499 (Lifetime).</p>
        </div>
      </div>

      {/* Maintenance alert */}
      {isMaintenance && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400">⚠️ Maintenance Mode is ON</p>
            <p className="text-xs text-red-400/70 mt-0.5">All mobile and web users are seeing the maintenance screen.</p>
          </div>
        </div>
      )}

      {/* Section 1: Pricing (₹) */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <SectionHeader icon={IndianRupee} title="Web Cashfree Pricing (₹)" description="Prepaid pass rates displayed on gurukulam.vakrahara.org" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Monthly Pass (₹)"><NumberInput value={monthlyRs} onChange={setMonthlyRs} min={1} prefix="₹" /></Field>
          <Field label="Yearly Pass (₹)"><NumberInput value={yearlyRs} onChange={setYearlyRs} min={1} prefix="₹" /></Field>
          <Field label="Lifetime Pass (₹)"><NumberInput value={lifetimeRs} onChange={setLifetimeRs} min={1} prefix="₹" /></Field>
        </div>
      </div>

      {/* Section 2: Pricing (Paise for Cashfree API) */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <SectionHeader icon={IndianRupee} title="Pricing (Paise — Cashfree API)" description="Must equal ₹ price × 100 for Cashfree orders" />
          <button onClick={syncPaiseFromRs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition-all mt-1">
            <RefreshCw className="w-3 h-3" /> Sync from ₹
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Monthly (paise)" note={`= ₹${(monthlyPaise / 100).toFixed(2)}`}><NumberInput value={monthlyPaise} onChange={setMonthlyPaise} min={100} /></Field>
          <Field label="Yearly (paise)" note={`= ₹${(yearlyPaise / 100).toFixed(2)}`}><NumberInput value={yearlyPaise} onChange={setYearlyPaise} min={100} /></Field>
          <Field label="Lifetime (paise)" note={`= ₹${(lifetimePaise / 100).toFixed(2)}`}><NumberInput value={lifetimePaise} onChange={setLifetimePaise} min={100} /></Field>
        </div>
      </div>

      {/* Section 3: App Behavior & Maintenance */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-6 space-y-5">
        <SectionHeader icon={Smartphone} title="App Behavior & Maintenance" description="Control trial duration, version gates, and maintenance" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trial Duration (days)" note="Length of initial free trial"><NumberInput value={trialDays} onChange={setTrialDays} min={1} max={30} /></Field>
          <Field label="Min App Version Code" note="Version enforcement cutoff (0 = disabled)"><NumberInput value={minAppVersion} onChange={setMinAppVersion} min={0} /></Field>
        </div>
        <Field label="Coupon Hint Text" note="Placeholder in coupon input box">
          <input type="text" value={couponHint} onChange={e => setCouponHint(e.target.value)}
            placeholder="e.g. Have an access code? Enter here"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40" />
        </Field>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-white">Emergency Maintenance Mode</span>
            <p className="text-xs text-gray-500">Block learner traffic during major migrations</p>
          </div>
          <button onClick={() => setIsMaintenance(m => !m)}>
            {isMaintenance ? <ToggleRight className="w-10 h-10 text-red-400" /> : <ToggleLeft className="w-10 h-10 text-gray-600" />}
          </button>
        </div>
        {isMaintenance && (
          <Field label="Maintenance Message">
            <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40 resize-none" />
          </Field>
        )}
      </div>
    </div>
  );
}
