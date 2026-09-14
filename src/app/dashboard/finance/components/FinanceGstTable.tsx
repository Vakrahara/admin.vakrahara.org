'use client';

import { GSTBreakdown } from './types';

interface FinanceGstTableProps {
  gstBreakdowns: GSTBreakdown[];
}

export function FinanceGstTable({ gstBreakdowns }: FinanceGstTableProps) {
  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden shadow-xl mt-6">
      <div className="px-5 py-4 border-b border-white/8">
        <h2 className="text-lg font-semibold text-white">GST Breakdown by Category</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/3 border-b border-white/8 text-xs uppercase tracking-wider text-gray-400 font-semibold">
            <tr>
              <th className="py-3.5 px-4">HSN / SAC Code</th>
              <th className="py-3.5 px-4">Rate (%)</th>
              <th className="py-3.5 px-4">Taxable Value ₹</th>
              <th className="py-3.5 px-4">IGST ₹</th>
              <th className="py-3.5 px-4">CGST ₹</th>
              <th className="py-3.5 px-4">SGST ₹</th>
              <th className="py-3.5 px-4">Total Tax ₹</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {gstBreakdowns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No GST breakdown data available.
                </td>
              </tr>
            ) : (
              gstBreakdowns.map((b, i) => (
                <tr key={i} className="hover:bg-white/2 transition">
                  <td className="py-3.5 px-4 font-mono text-white">{b.hsn_sac_code}</td>
                  <td className="py-3.5 px-4 font-mono text-[#d4af37]">{b.rate}%</td>
                  <td className="py-3.5 px-4 font-mono">
                    ₹{b.taxable_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-400">
                    ₹{(b.igst || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    ₹{b.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    ₹{b.sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                    ₹{(b.igst + b.cgst + b.sgst).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
