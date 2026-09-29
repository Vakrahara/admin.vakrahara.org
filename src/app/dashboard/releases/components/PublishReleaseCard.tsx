'use client';

import React, { useState, useRef } from 'react';
import { Upload, ChevronUp, ChevronDown, Server, ToggleLeft, ToggleRight } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { uploadFileToR2, R2Config } from '@/lib/r2-upload';
import { computeSHA256, formatBytes } from '../types';

interface PublishReleaseCardProps {
  defaultVersionCode: string;
  defaultMinSupported: string;
  onPublished: () => void;
}

export function PublishReleaseCard({
  defaultVersionCode,
  defaultMinSupported,
  onPublished
}: PublishReleaseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [versionCode, setVersionCode] = useState(defaultVersionCode);
  const [versionName, setVersionName] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [minSupported, setMinSupported] = useState(defaultMinSupported);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileHash('Calculating...');
      const hash = await computeSHA256(selectedFile);
      setFileHash(hash);
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select an APK file.');

    setIsUploading(true);
    setUploadProgress(20);
    
    try {
      const savedConfig = localStorage.getItem('vakrahara_r2_config');
      if (!savedConfig) throw new Error('R2 Configuration not found. Please set it in Curriculum CMS > Settings first.');
      const r2Config: R2Config = JSON.parse(savedConfig);

      const fileBuffer = await file.arrayBuffer();
      // Canonical app name invariant: strictly amrtam
      const fileName = `v1/apk/amrtam-${Date.now()}.apk`;
      
      const uploadRes = await uploadFileToR2(fileName, fileBuffer, 'application/vnd.android.package-archive', r2Config);
      setUploadProgress(60);
      
      if (!uploadRes.url) throw new Error('Upload failed');
      setUploadProgress(80);
      
      await pb.collection('app_versions').create({
        version_code: parseInt(versionCode || defaultVersionCode),
        version_name: versionName,
        release_notes: releaseNotes,
        apk_url: uploadRes.url,
        apk_sha256: uploadRes.sha256 || fileHash,
        apk_size_bytes: file.size,
        is_force_update: isForceUpdate,
        min_supported_version: parseInt(minSupported || defaultMinSupported || '1'),
      }, { requestKey: null });

      setUploadProgress(100);
      setIsOpen(false);
      setFile(null);
      setVersionName('');
      setReleaseNotes('');
      onPublished();
    } catch (err: any) {
      alert(`Error creating release: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-lg shadow-[#d4af37]/5">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#d4af37]/10 to-transparent text-white hover:bg-[#d4af37]/15 transition-all cursor-pointer"
      >
        <div className="font-bold flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#d4af37]" /> 
          Publish New Release
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-white/5">
          <form onSubmit={handleCreateRelease} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload Zone */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">APK File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed ${file ? 'border-[#d4af37]/50 bg-[#d4af37]/5' : 'border-white/10 bg-[#050508] hover:border-white/30'} rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center`}
                >
                  <input 
                    type="file" 
                    accept=".apk" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <>
                      <Server className="w-8 h-8 text-[#d4af37] mb-3" />
                      <div className="text-white font-medium">{file.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{formatBytes(file.size)}</div>
                      <div className="text-[#d4af37]/70 font-mono text-xs mt-3 truncate max-w-full">
                        SHA256: {fileHash}
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-600 mb-3" />
                      <div className="text-gray-400 font-medium">Click to select APK file</div>
                      <div className="text-gray-600 text-xs mt-1">.apk up to 100MB</div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Version Code</label>
                  <input 
                    type="number" required value={versionCode || defaultVersionCode} onChange={e => setVersionCode(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Min Supported Version Code</label>
                  <input 
                    type="number" required value={minSupported || defaultMinSupported} onChange={e => setMinSupported(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Version Name</label>
                  <input 
                    type="text" required placeholder="e.g. 1.2.0" value={versionName} onChange={e => setVersionName(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Force Update</label>
                  <div 
                    onClick={() => setIsForceUpdate(!isForceUpdate)}
                    className={`w-full flex items-center justify-between cursor-pointer border rounded-lg px-4 py-2.5 transition-all select-none ${isForceUpdate ? 'bg-red-500/10 border-red-500/30' : 'bg-[#050508] border-white/10'}`}
                  >
                    <span className={isForceUpdate ? 'text-red-400 font-medium text-sm' : 'text-gray-400 text-sm'}>
                      {isForceUpdate ? 'Yes, force users to update' : 'No, optional update'}
                    </span>
                    {isForceUpdate ? <ToggleRight className="w-6 h-6 text-red-500" /> : <ToggleLeft className="w-6 h-6 text-gray-600" />}
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Release Notes (Markdown support)</label>
                <textarea 
                  rows={4} value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono text-sm"
                  placeholder="- Added new features&#10;- Fixed bugs..."
                />
                <div className="text-right text-xs text-gray-600 mt-1">{releaseNotes.length} chars</div>
              </div>
            </div>

            {isUploading ? (
              <div className="w-full space-y-2">
                <div className="h-2 bg-[#050508] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="text-center text-xs text-[#d4af37] font-bold tracking-widest uppercase animate-pulse">
                  Uploading Asset to CDN... {uploadProgress}%
                </div>
              </div>
            ) : (
              <button 
                type="submit" 
                disabled={!file}
                className="w-full py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                🚀 Publish Release
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
