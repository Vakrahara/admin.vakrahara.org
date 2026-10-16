import { School, RefreshCw, Search } from 'lucide-react';
import { AffiliatePartner } from '../types';

interface AffiliatePartnerTableProps {
  partners: AffiliatePartner[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
}

export function AffiliatePartnerTable({
  partners,
  loading,
  search,
  onSearchChange,
}: AffiliatePartnerTableProps) {
  const filteredPartners = partners.filter(p =>
    (p.institution_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.referral_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.udise_code || '').includes(search)
  );

  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl space-y-4">
      <div className="p-4 border-b border-white/8">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search school name, code, or UDISE..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
  );
}
