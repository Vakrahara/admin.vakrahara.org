'use client';

import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import {
  School, Users, IndianRupee, Plus, RefreshCw, Download,
  CheckCircle2, AlertTriangle, Search, Filter, Percent, ArrowUpRight
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface AffiliatePartner {
  id: string;
  institution_name: string;
  udise_code: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  referral_code: string;
  commission_percentage: number;
  total_students_referred: number;
  total_earnings_paise: number;
  payout_upi_id: string;
  status: string;
  created: string;
}

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
      SchoolName: p.institution_name,
      UDISECode: p.udise_code,
      ContactPerson: p.contact_person,
      Email: p.contact_email,
      ReferralCode: p.referral_code,
      CommissionPercent: p.commission_percentage,
      StudentsEnrolled: p.total_students_referred,
      TotalEarningsINR: (p.total_earnings_paise || 0) / 100,
      Status: p.status,
      CreatedDate: p.created.slice(0,10),
    }));
    exportToCsv(data, `affiliate_partners_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const filteredPartners = partners.filter(p =>
    p.institution_name.toLowerCase().includes(search.toLowerCase()) ||
    p.referral_code.toLowerCase().includes(search.toLowerCase()) ||
    p.udise_code.includes(search)
  );

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Partner Schools</span>
            <School className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{partners.length} Institutions</div>
          <div className="text-xs text-gray-500 mt-1">Verified UDISE partners</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Students Enrolled</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {partners.reduce((acc, p) => acc + (p.total_students_referred || 0), 0)} Students
          </div>
          <div className="text-xs text-gray-500 mt-1">Via school referral codes</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Commission Accrued</span>
            <IndianRupee className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-[#d4af37]">
            ₹{partners.reduce((acc, p) => acc + ((p.total_earnings_paise || 0) / 100), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Direct institutional payouts</div>
        </div>

        <div className="bg-[#0d0d15] border border-white/8 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Avg Commission</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">20% Share</div>
          <div className="text-xs text-gray-500 mt-1">Standard institutional revshare</div>
        </div>
      </div>

      {/* Partner Table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl space-y-4">
        <div className="p-4 border-b border-white/8">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search school name, code, or UDISE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">School / UDISE</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Commission %</th>
                <th className="py-3.5 px-4">Students</th>
                <th className="py-3.5 px-4 text-right">Accrued ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
                    <span>Loading affiliate ledger...</span>
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <School className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span>No school partners onboarded yet.</span>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{p.institution_name}</div>
                      <div className="text-xs text-gray-500 font-mono">UDISE: {p.udise_code || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                        {p.referral_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <div className="text-gray-300">{p.contact_person || '—'}</div>
                      <div className="text-gray-500">{p.contact_email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-purple-400">
                      {p.commission_percentage}%
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-bold text-white">
                      {p.total_students_referred || 0}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono font-bold text-emerald-400 text-right">
                      ₹{((p.total_earnings_paise || 0) / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard School Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0d0d15] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Onboard School Partner</h2>
            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-semibold uppercase tracking-wider">School / Institution Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Public School, R.K. Puram"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider">UDISE Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 07010100101"
                    value={formUdise}
                    onChange={(e) => setFormUdise(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider">Referral Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DPSRKP20"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Principal / Coordinator"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold uppercase tracking-wider">Commission %</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formCommission}
                    onChange={(e) => setFormCommission(Number(e.target.value))}
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  placeholder="admin@school.edu.in"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-black font-bold transition"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
