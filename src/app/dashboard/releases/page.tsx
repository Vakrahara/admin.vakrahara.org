'use client';

import { useState, useEffect, useRef } from 'react';
import { pb } from '@/lib/pocketbase';
import { uploadFileToR2, R2Config } from '@/lib/r2-upload';
import {
  Package,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Shield,
  Zap,
  Server,
  Loader2
} from 'lucide-react';

interface AppVersionRecord {
  id: string;
  version_code: number;
  version_name: string;
  release_notes: string;
  apk_url: string;
  apk_sha256: string;
  apk_size_bytes: number;
  is_force_update: boolean;
  min_supported_version: number;
  created: string;
  updated: string;
}

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<AppVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Emergency Controls State
  const [minSupportedInput, setMinSupportedInput] = useState('');
  
  // Create Release State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [versionName, setVersionName] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [minSupported, setMinSupported] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReleases = async () => {
    try {
      setRefreshing(true);
      const records = await pb.collection('app_versions').getFullList<AppVersionRecord>({
        sort: '-version_code',
      });
      setReleases(records);
      
      // Auto-fill version code for new release
      if (records.length > 0 && !versionCode) {
        setVersionCode((records[0].version_code + 1).toString());
        setMinSupported(records[0].min_supported_version.toString());
      }
    } catch (err) {
      console.error('Failed to fetch releases', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

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
      if (!savedConfig) throw new Error("R2 Configuration not found. Please set it in Curriculum CMS > Settings first.");
      const r2Config: R2Config = JSON.parse(savedConfig);

      const fileBuffer = await file.arrayBuffer();
      const fileName = `v1/apk/amritam-${Date.now()}.apk`;
      
      const uploadRes = await uploadFileToR2(fileName, fileBuffer, 'application/vnd.android.package-archive', r2Config);
      setUploadProgress(60);
      
      if (!uploadRes.url) {
        throw new Error('Upload failed');
      }

      setUploadProgress(80);
      
      await pb.collection('app_versions').create({
        version_code: parseInt(versionCode),
        version_name: versionName,
        release_notes: releaseNotes,
        apk_url: uploadRes.url,
        apk_sha256: uploadRes.sha256 || fileHash,
        apk_size_bytes: file.size,
        is_force_update: isForceUpdate,
        min_supported_version: parseInt(minSupported),
      }, { requestKey: null });

      setUploadProgress(100);
      setIsCreateOpen(false);
      setFile(null);
      setVersionName('');
      setReleaseNotes('');
      fetchReleases();
    } catch (err: any) {
      alert(`Error creating release: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleForceUpdate = async (id: string, currentVal: boolean) => {
    try {
      await pb.collection('app_versions').update(id, {
        is_force_update: !currentVal
      });
      fetchReleases();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('app_versions').delete(id);
      setDeleteConfirm(null);
      fetchReleases();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleEmergencyForceAll = async () => {
    if (!window.confirm("Are you sure you want to FORCE all users to update to the latest release immediately?")) return;
    if (releases.length === 0) return;
    
    const latest = releases[0];
    try {
      await pb.collection('app_versions').update(latest.id, { is_force_update: true });
      fetchReleases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyPauseForce = async () => {
    if (!window.confirm("Disable force updates across ALL releases?")) return;
    try {
      const activeForces = releases.filter(r => r.is_force_update);
      for (const r of activeForces) {
        await pb.collection('app_versions').update(r.id, { is_force_update: false });
      }
      fetchReleases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyBlock = async () => {
    const val = parseInt(minSupportedInput);
    if (isNaN(val)) return alert("Please enter a valid version code.");
    if (!window.confirm(`Block all app versions below code ${val}?`)) return;
    
    try {
      if (releases.length > 0) {
        await pb.collection('app_versions').update(releases[0].id, { min_supported_version: val });
        setMinSupportedInput('');
        fetchReleases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const latestRelease = releases.length > 0 ? releases[0] : null;
  const activeForcesCount = releases.filter(r => r.is_force_update).length;

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-[#d4af37]" /> App Release Manager
          </h1>
          <p className="text-gray-400 mt-2">Manage and publish Amritam Android updates</p>
        </div>
        <button 
          onClick={fetchReleases}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d0d15] border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="text-gray-500 text-sm font-medium mb-1">Total Releases</div>
          <div className="text-3xl font-bold text-white">{releases.length}</div>
        </div>
        <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="text-gray-500 text-sm font-medium mb-1">Latest Version</div>
          <div className="text-3xl font-bold text-white">{latestRelease?.version_name || 'N/A'} <span className="text-sm text-gray-500 ml-1">({latestRelease?.version_code || 0})</span></div>
        </div>
        <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="text-gray-500 text-sm font-medium mb-1">Force Updates Active</div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            {activeForcesCount} {activeForcesCount > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
          </div>
        </div>
        <div className="bg-[#0d0d15] border border-white/5 rounded-xl p-5 relative overflow-hidden">
          <div className="text-gray-500 text-sm font-medium mb-1">Min Supported</div>
          <div className="text-3xl font-bold text-white">{latestRelease?.min_supported_version || 0}</div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-[#0a0a0f] border border-red-900/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5" /> Emergency Controls
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-gray-300 font-medium">Critical Bug Fix</div>
            <button 
              onClick={handleEmergencyForceAll}
              className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Force Users to Update NOW
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-300 font-medium">Block Legacy Versions</div>
            <div className="flex gap-2">
              <input 
                type="number"
                placeholder="Code (e.g. 15)"
                value={minSupportedInput}
                onChange={(e) => setMinSupportedInput(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
              />
              <button 
                onClick={handleEmergencyBlock}
                className="px-4 bg-[#0d0d15] hover:bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold transition-all whitespace-nowrap"
              >
                Block
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-300 font-medium">Halt Force Updates</div>
            <button 
              onClick={handleEmergencyPauseForce}
              className="w-full py-2.5 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" /> Pause All Force Updates
            </button>
          </div>
        </div>
      </div>

      {/* Create New Release */}
      <div className="bg-[#0d0d15] border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-lg shadow-[#d4af37]/5">
        <button 
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#d4af37]/10 to-transparent text-white hover:bg-[#d4af37]/15 transition-all"
        >
          <div className="font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#d4af37]" /> 
            Publish New Release
          </div>
          {isCreateOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isCreateOpen && (
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
                      type="number" required value={versionCode} onChange={e => setVersionCode(e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Min Supported Version Code</label>
                    <input 
                      type="number" required value={minSupported} onChange={e => setMinSupported(e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all"
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
                  ></textarea>
                  <div className="text-right text-xs text-gray-600 mt-1">{releaseNotes.length} chars</div>
                </div>
              </div>

              {isUploading ? (
                <div className="w-full space-y-2">
                  <div className="h-2 bg-[#050508] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="text-center text-xs text-[#d4af37] font-bold tracking-widest uppercase animate-pulse">
                    Uploading Asset to CDN... {uploadProgress}%
                  </div>
                </div>
              ) : (
                <button 
                  type="submit" 
                  disabled={!file}
                  className="w-full py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  🚀 Publish Release
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Release History Table */}
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
                        {isLatest && <span className="px-2 py-0.5 bg-[#d4af37] text-[#050508] text-[10px] font-bold rounded uppercase tracking-wider">Active</span>}
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
                        onClick={() => toggleForceUpdate(release.id, release.is_force_update)}
                        className="p-1 rounded hover:bg-white/5 transition-colors inline-flex"
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
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Download APK"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        
                        {deleteConfirm === release.id ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDelete(release.id)}
                              className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-md font-bold transition-colors border border-red-500/30"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-gray-400 hover:text-white px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirm(release.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
    </div>
  );
}
