'use client';

import { useState } from 'react';
import { Copy, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivationKey, PLAN_STYLES, getKeyStatus } from './types';

interface ActivationKeysTableProps {
  keys: ActivationKey[];
  loading: boolean;
  totalItems: number;
  page: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded text-gray-600 hover:text-gray-300 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function ActivationKeysTable({
  keys,
  loading,
  totalItems,
  page,
  perPage,
  onPageChange,
  onDelete,
  deletingId,
}: ActivationKeysTableProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const totalPages = Math.ceil(totalItems / perPage);
  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');

  return (
    <div className="bg-[#0d0d15] border border-white/8 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {['Key', 'Plan', 'Duration', 'Status', 'Valid Until', 'Campaign', 'Used By', 'Used At', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-600">
                  Loading keys...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-600">
                  No activation keys found
                </td>
              </tr>
            ) : (
              keys.map((k) => {
                const st = getKeyStatus(k);
                return (
                  <tr key={k.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#d4af37] font-semibold tracking-wider">{k.key}</span>
                        <CopyButton text={k.key} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                          PLAN_STYLES[k.plan] || 'text-gray-400 bg-white/5 border-white/10'
                        }`}
                      >
                        {k.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 whitespace-nowrap">{k.duration_days}d</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(k.valid_until)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{k.campaign || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {k.used_by ? (
                        <>
                          {k.used_by.slice(0, 10)}…<CopyButton text={k.used_by} />
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(k.used_at)}</td>
                    <td className="px-5 py-3.5">
                      {!k.used_by &&
                        (confirmDelete === k.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onDelete(k.id);
                                setConfirmDelete(null);
                              }}
                              disabled={deletingId === k.id}
                              className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              {deletingId === k.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(k.id)}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
          <span className="text-xs text-gray-500">
            {totalItems} keys · Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
