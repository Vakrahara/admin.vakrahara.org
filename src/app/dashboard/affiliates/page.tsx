'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { Plus, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { AffiliatePartner } from './types';
import { AffiliateKpiCards } from './components/AffiliateKpiCards';
import { AffiliatePartnerTable } from './components/AffiliatePartnerTable';
import { OnboardSchoolModal } from './components/OnboardSchoolModal';

export default function AffiliatePartnersPage() {
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formUdise, setFormUdise] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCommission, setFormCommission] = useState(20);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('affiliate_partners').getList(1, 50, {
        sort: '-created',
      });
      setPartners(res.items as unknown as AffiliatePartner[]);
    } catch (err) {
      console.error('Failed to fetch affiliate partners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    try {
      await pb.collection('affiliate_partners').create({
        institution_name: formName.trim(),
        udise_code: formUdise.trim(),
        contact_person: formContact.trim(),
        contact_email: formEmail.trim(),
        referral_code: formCode.trim().toUpperCase(),
        commission_percentage: formCommission,
        status: 'active',
        total_students_referred: 0,
        total_earnings_paise: 0,
      });
      setIsCreating(false);
      setFormName('');
      setFormUdise('');
      setFormContact('');
      setFormEmail('');
      setFormCode('');
      fetchPartners();
    } catch (err) {
      console.error('Failed to onboard partner:', err);
    }
  };

  const handleExport = () => {
    const data = partners.map(p => ({
      SchoolName: p.institution_name || 'N/A',
      UDISECode: p.udise_code || 'N/A',
      ContactPerson: p.contact_person || '—',
      Email: p.contact_email || '—',
      ReferralCode: p.referral_code || '—',
      CommissionPercent: p.commission_percentage,
      StudentsEnrolled: p.total_students_referred || 0,
      TotalEarningsINR: (p.total_earnings_paise || 0) / 100,
      Status: p.status,
      CreatedDate: (p.created || '').slice(0, 10),
    }));
    exportToCsv(data, `affiliate_partners_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">UDISE School Affiliates</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              B2B Institutional Partner Desk
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            School affiliate attribution, revenue-share ledger, and bulk student onboarding tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={partners.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard School</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <AffiliateKpiCards partners={partners} />

      {/* Partner Table */}
      <AffiliatePartnerTable
        partners={partners}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Onboard School Modal */}
      <OnboardSchoolModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreatePartner}
        formName={formName}
        setFormName={setFormName}
        formUdise={formUdise}
        setFormUdise={setFormUdise}
        formContact={formContact}
        setFormContact={setFormContact}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formCode={formCode}
        setFormCode={setFormCode}
        formCommission={formCommission}
        setFormCommission={setFormCommission}
      />
    </div>
  );
}
