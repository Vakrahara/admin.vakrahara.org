'use client';

import React, { useState } from 'react';
import { History, Eye, RotateCcw, X, ShieldAlert, Check } from 'lucide-react';
import { DiffViewerModal } from '@/components/ui/DiffViewerModal';

export interface ChangelogRecord {
  id: string;
  timestamp: string;
  adminEmail: string;
  operation: string;
  previousSnapshotUrl?: string;
  summary: string;
  beforeData?: any;
  afterData?: any;
}

interface CurriculumVersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRollback?: (version: ChangelogRecord) => void;
}

export function CurriculumVersionHistory({
  isOpen,
  onClose,
  onRollback
}: CurriculumVersionHistoryProps) {
  const [selectedRecordForDiff, setSelectedRecordForDiff] = useState<ChangelogRecord | null>(null);

  // Mock baseline history for demonstration when collection is empty
  const mockChangelogs: ChangelogRecord[] = [
    {
      id: 'rev_003',
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      adminEmail: 'vkarms.vk@gmail.com',
      operation: 'PUBLISH',
      summary: 'Added 42 Anveshana question pools to Chapter 9 Light modules',
      beforeData: { chapter: 'Light', modules: 42, poolsConfigured: 38 },
      afterData: { chapter: 'Light', modules: 42, poolsConfigured: 42 }
    },
    {
      id: 'rev_002',
      timestamp: new Date(Date.now() - 86400000).toLocaleString(),
      adminEmail: 'vkarms.vk@gmail.com',
      operation: 'PUBLISH',
      summary: 'Configured video streaming URLs and Hindi transcripts for Chapter 9',
      beforeData: { chapter: 'Light', videoEnabled: false },
      afterData: { chapter: 'Light', videoEnabled: true }
    },
    {
      id: 'rev_001',
      timestamp: new Date(Date.now() - 172800000).toLocaleString(),
      adminEmail: 'vakrahara@gmail.com',
      operation: 'BASELINE_IMPORT',
      summary: 'Initial baseline curriculum import from CBSE Science v1',
      beforeData: {},
      afterData: { chapters: 2, totalModules: 47 }
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-3xl bg-[#080C14] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Curriculum Version History &amp; Changelog (§5, SEC-04)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Audit trail of curriculum releases, diffs, and rollback snapshots
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
            {mockChangelogs.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-800/80 bg-[#0B0F19] hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      {item.operation}
                    </span>
                    <span className="text-slate-300 font-medium">{item.summary}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span>Author: <span className="font-mono text-slate-300">{item.adminEmail}</span></span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRecordForDiff(item)}
                      className="px-2.5 py-1 rounded-md bg-[#03050B] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>View Diff</span>
                    </button>

                    {onRollback && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to rollback to revision ${item.id}? This will restore the curriculum state to that snapshot.`)) {
                            onRollback(item);
                            onClose();
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 flex items-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-[#03050B] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedRecordForDiff && (
        <DiffViewerModal
          isOpen={true}
          onClose={() => setSelectedRecordForDiff(null)}
          title={`Revision Diff: ${selectedRecordForDiff.id}`}
          actionName={selectedRecordForDiff.operation}
          beforeState={selectedRecordForDiff.beforeData}
          afterState={selectedRecordForDiff.afterData}
        />
      )}
    </>
  );
}
