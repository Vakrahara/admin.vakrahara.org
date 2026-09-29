'use client';

import React, { useState } from 'react';
import { Server, Download, Trash2, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { AppVersionRecord, formatBytes, timeAgo } from '../types';

interface ReleaseHistoryTableProps {
  releases: AppVersionRecord[];
  onRefresh: () => void;
}

export function ReleaseHistoryTable({ releases, onRefresh }: ReleaseHistoryTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleForceUpdate = async (id: string, currentVal: boolean) => {
    try {
      await pb.collection('app_versions').update(id, {
        is_force_update: !currentVal
      });
      onRefresh();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('app_versions').delete(id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="bg-[#0d0d15] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
        <Server className="w-4 h-4 text-gray-400" />
        <h3 className="font-semibold text-white">Release History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050508]/50 text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Version</th>
              <th className="px-6 py-4 font-medium">Published</th>
              <th className="px-6 py-4 font-medium">Size</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-center">Force</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {releases.map((release, idx) => {
              const isLatest = idx === 0;
              return (
                <tr key={release.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">v{release.version_name}</span>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-[#d4af37] text-[#050508] text-[10px] font-bold rounded uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">code: {release.version_code}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {timeAgo(release.created)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {formatBytes(release.apk_size_bytes)}
                  </td>
                  <td className="px-6 py-4">
                    {release.is_force_update ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" /> Force Update
                      </span>
                    ) : isLatest ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                        <CheckCircle className="w-3 h-3" /> Current
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-medium border border-gray-500/20">
                        <XCircle className="w-3 h-3" /> Archived
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      type="button"
                      onClick={() => toggleForceUpdate(release.id, release.is_force_update)}
                      className="p-1 rounded hover:bg-white/5 transition-colors inline-flex cursor-pointer"
                      title="Toggle Force Update"
                    >
                      {release.is_force_update ? (
                        <ToggleRight className="w-6 h-6 text-red-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={release.apk_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors inline-flex"
                        title="Download APK"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      
                      {deleteConfirm === release.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleDelete(release.id)}
                            className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-md font-bold transition-colors border border-red-500/30 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs text-gray-400 hover:text-white px-2 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirm(release.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Release"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {releases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No releases found. Publish your first app update above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
