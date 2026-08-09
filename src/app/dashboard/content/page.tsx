'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  Play, 
  Layers, 
  Database, 
  ShieldAlert, 
  Check, 
  Loader2,
  FileText,
  Volume2,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  FileCode,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Link,
  BookOpenCheck,
  Edit3
} from 'lucide-react';
import { uploadToR2, R2Config } from '@/lib/r2-upload';
import { ConcurrencyLockBadge } from './components/ConcurrencyLockBadge';
import { DigitalTwinPreview } from './components/DigitalTwinPreview';

// TS interfaces for CBSE Science curriculum models
interface Step {
  type: 'concept' | 'simulation' | 'predict_quiz' | 'heritage_connection';
  id: string;
  textDeva?: string;
  textEng?: string;
  simulationId?: string;
  params?: Record<string, any>;
  questionText?: string;
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  hints?: string[];
  targetModuleId?: string;
  title?: string;
  sutra?: string;
  translation?: string;
  significance?: string;
}

interface Module {
  id: string;
  title: string;
  steps: Step[];
}

interface Pyq {
  id: string;
  year: string;
  marks: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  sampleAnswer: string;
  markingScheme: string;
  relatedModuleIds: string[];
}

interface Chapter {
  id: string;
  title: string;
  branchId: string;
  modules: Module[];
  pyqs: Pyq[];
}

interface SutraItem {
  id: string;
  sutra: string;
  padaccheda: string[];
  meaning: string;
  audio: string;
}

export default function ContentCMSPage() {
  const [activeTab, setActiveTab] = useState<'sutras' | 'dict' | 'vault' | 'cbse'>('cbse');
  const [sutraSearch, setSutraSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // CBSE State
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingPyqId, setEditingPyqId] = useState<string | null>(null);
  const [activeEditStepId, setActiveEditStepId] = useState<string | null>(null);
  const [isLoadingCbse, setIsLoadingCbse] = useState(false);
  const [cbseLoadError, setCbseLoadError] = useState<string | null>(null);
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [r2Config, setR2Config] = useState<R2Config>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakrahara_r2_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse R2 config from localStorage', e);
        }
      }
    }
    return {
      accountId: '',
      bucketName: '',
      accessKeyId: '',
      secretAccessKey: '',
      region: 'auto',
      customDomain: 'https://cdn.vakrahara.org/v1'
    };
  });

  // Save/Publish State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publishErrorMessage, setPublishErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sutra Vault Mock Data
  const mockSutras: SutraItem[] = [
    { id: '1.1.1', sutra: 'वृद्धिरादैच्', padaccheda: ['वृद्धिः', 'आत्', 'ऐच्'], meaning: 'Growth is denoted by the letters āt (ā) and aic (ai, au).', audio: '1_1_1.mp3' },
    { id: '1.1.2', sutra: 'अदेङ्गुणः', padaccheda: ['अत्', 'एङ्', 'गुणः'], meaning: 'The letters at (a) and eṅ (e, o) are called guṇa.', audio: '1_1_2.mp3' },
    { id: '6.1.77', sutra: 'इको यणचि', padaccheda: ['इको', 'यण्', 'अचि'], meaning: 'The letters ik (i, u, ṛ, ḷ) are replaced by yaṇ (y, v, r, l) before a vowel (ac).', audio: '6_1_77.mp3' },
    { id: '8.4.40', sutra: 'स्तोः श्चुना श्चुः', padaccheda: ['स्तोः', 'श्चुना', 'श्चुः'], meaning: 'S and dental consonants are replaced by ś and palatal consonants when in contact with ś or palatal consonants.', audio: '8_4_40.mp3' }
  ];

  // Fetch CBSE chapters JSON on mount
  useEffect(() => {
    if (activeTab === 'cbse' && chapters === null) {
      loadCbseData();
    }
  }, [activeTab]);

  // Load CBSE data from PocketBase API, CDN, or local fallback
  const loadCbseData = async (source: 'pb' | 'cdn' | 'local' = 'pb') => {
    setIsLoadingCbse(true);
    setCbseLoadError(null);
    const pbUrl = 'https://pb.vakrahara.org/api/amritam/curriculum';
    const cdnUrl = source === 'cdn' && r2Config.customDomain
      ? `${r2Config.customDomain.replace(/\/$/, '')}/cbse/chapters_data.json`
      : 'https://cdn.vakrahara.org/v1/cbse/chapters_data.json';

    try {
      const targetUrl = source === 'pb' ? pbUrl : cdnUrl;
      const response = await fetch(targetUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setChapters(data);
      if (data.length > 0) {
        setSelectedChapterId(data[0].id);
      }
    } catch (e: any) {
      console.error(`Failed to fetch chapters:`, e);
      if (source === 'pb') {
        console.log('Attempting CDN fallback loading...');
        loadCbseData('cdn');
        return;
      }
      setCbseLoadError(e.message || 'Failed to load curriculum data.');
    } finally {
      setIsLoadingCbse(false);
    }
  };

  // Save configuration to localStorage
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vakrahara_r2_config', JSON.stringify(r2Config));
    }
    setIsSettingsOpen(false);
    // Reload data if domain changed
    loadCbseData('cdn');
  };

  // Validate the CBSE curriculum JSON structure
  const validateCurriculum = (curriculum: Chapter[]): string[] => {
    const errors: string[] = [];
    const chapterIds = new Set<string>();
    const moduleIds = new Set<string>();
    const stepIds = new Set<string>();

    if (curriculum.length === 0) {
      errors.push('At least one chapter is required.');
    }

    curriculum.forEach((chapter, cIndex) => {
      const chName = chapter.title || chapter.id || `Chapter ${cIndex + 1}`;
      if (!chapter.id || chapter.id.trim() === '') {
        errors.push(`Chapter ${cIndex + 1} has no ID.`);
      } else if (chapterIds.has(chapter.id)) {
        errors.push(`Duplicate Chapter ID: "${chapter.id}".`);
      } else {
        chapterIds.add(chapter.id);
      }

      if (!chapter.title || chapter.title.trim() === '') {
        errors.push(`Chapter ID "${chapter.id}" has no Title.`);
      }

      if (!chapter.branchId || chapter.branchId.trim() === '') {
        errors.push(`Chapter "${chName}" has no Branch ID (e.g. physics).`);
      }

      chapter.modules.forEach((mod, mIndex) => {
        const modName = mod.title || mod.id || `Module ${mIndex + 1}`;
        if (!mod.id || mod.id.trim() === '') {
          errors.push(`Module ${mIndex + 1} in chapter "${chName}" has no ID.`);
        } else if (moduleIds.has(mod.id)) {
          errors.push(`Duplicate Module ID: "${mod.id}" in chapter "${chName}".`);
        } else {
          moduleIds.add(mod.id);
        }

        if (!mod.title || mod.title.trim() === '') {
          errors.push(`Module ID "${mod.id}" in chapter "${chName}" has no Title.`);
        }

        mod.steps.forEach((step, sIndex) => {
          const stepName = step.id || `Step ${sIndex + 1}`;
          if (!step.id || step.id.trim() === '') {
            errors.push(`Step ${sIndex + 1} in module "${modName}" (Chapter "${chName}") has no ID.`);
          } else if (stepIds.has(step.id)) {
            errors.push(`Duplicate Step ID: "${step.id}" in module "${modName}".`);
          } else {
            stepIds.add(step.id);
          }

          if (step.type === 'predict_quiz') {
            if (!step.question || step.question.trim() === '') {
              errors.push(`Quiz step "${stepName}" has no question.`);
            }
            if (!step.options || step.options.length < 2) {
              errors.push(`Quiz step "${stepName}" must have at least 2 options.`);
            }
            if (step.correctOptionIndex === undefined || step.correctOptionIndex < 0 || (step.options && step.correctOptionIndex >= step.options.length)) {
              errors.push(`Quiz step "${stepName}" has an invalid correctOptionIndex (${step.correctOptionIndex}).`);
            }
          } else if (step.type === 'simulation') {
            if (!step.simulationId || step.simulationId.trim() === '') {
              errors.push(`Simulation step "${stepName}" has no simulationId.`);
            }
          }
        });
      });
    });

    return errors;
  };

  // Compile and upload the JSON curriculum to R2
  const handlePublishCbse = async () => {
    if (!chapters) return;

    // Check credentials first
    if (!r2Config.accountId || !r2Config.bucketName || !r2Config.accessKeyId || !r2Config.secretAccessKey) {
      setPublishStatus('error');
      setPublishErrorMessage('Please configure Cloudflare R2 credentials in CDN Settings first.');
      setIsSettingsOpen(true);
      return;
    }

    setIsPublishing(true);
    setPublishStatus('idle');
    setPublishErrorMessage('');
    
    // Clear prerequisites to match the dynamic predecessor lock rule approved in the plan
    const sanitizedChapters = chapters.map(ch => ({
      ...ch,
      modules: ch.modules.map(mod => {
        // Strip out legacy 'prerequisites' key if present to enforce pure positional lock rules
        const { ...sanitizedMod } = mod as any;
        delete sanitizedMod.prerequisites;
        return sanitizedMod as Module;
      })
    }));

    const errors = validateCurriculum(sanitizedChapters);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setPublishStatus('error');
      setPublishErrorMessage('Validation failed. Please correct the curriculum errors before publishing.');
      setIsPublishing(false);
      return;
    }

    setValidationErrors([]);

    try {
      const payload = JSON.stringify(sanitizedChapters, null, 4);
      await uploadToR2('v1/cbse/chapters_data.json', payload, 'application/json', r2Config);
      
      setPublishStatus('success');
      // Save local memory state to match published
      setChapters(sanitizedChapters);
      setTimeout(() => setPublishStatus('idle'), 5000);
    } catch (e: any) {
      console.error(e);
      setPublishStatus('error');
      setPublishErrorMessage(e.message || 'Failed to publish chapters_data.json to Cloudflare R2.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Reorder chapters helper
  const moveChapter = (index: number, direction: 'up' | 'down') => {
    if (!chapters) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;
    setChapters(newChapters);
  };

  // Reorder modules helper
  const moveModule = (chapterId: string, index: number, direction: 'up' | 'down') => {
    if (!chapters) return;
    const chIndex = chapters.findIndex(c => c.id === chapterId);
    if (chIndex === -1) return;

    const modules = chapters[chIndex].modules;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const newModules = [...modules];
    const temp = newModules[index];
    newModules[index] = newModules[targetIndex];
    newModules[targetIndex] = temp;

    const newChapters = [...chapters];
    newChapters[chIndex] = { ...newChapters[chIndex], modules: newModules };
    setChapters(newChapters);
  };

  // Reorder steps helper
  const moveStep = (chapterId: string, moduleId: string, index: number, direction: 'up' | 'down') => {
    if (!chapters) return;
    const chIndex = chapters.findIndex(c => c.id === chapterId);
    if (chIndex === -1) return;

    const modIndex = chapters[chIndex].modules.findIndex(m => m.id === moduleId);
    if (modIndex === -1) return;

    const steps = chapters[chIndex].modules[modIndex].steps;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    const newChapters = [...chapters];
    newChapters[chIndex].modules[modIndex] = { 
      ...newChapters[chIndex].modules[modIndex], 
      steps: newSteps 
    };
    setChapters(newChapters);
  };

  const handleAudioPlayback = (audioFile: string) => {
    alert(`Playing pronunciation test: https://cdn.vakrahara.org/audio/sutras/${audioFile}`);
  };

  const handleVaultUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }, 3000);
  };

  const filteredSutras = mockSutras.filter(
    s => s.sutra.includes(sutraSearch) || s.id.includes(sutraSearch) || s.meaning.toLowerCase().includes(sutraSearch.toLowerCase())
  );

  // Active Chapter, Module & PYQ context helpers
  const activeChapter = chapters?.find(c => c.id === selectedChapterId) || null;
  const activeModule = activeChapter?.modules.find(m => m.id === selectedModuleId) || null;

  // Helper to update active module's top-level fields
  const updateActiveModule = (fields: Partial<Module>) => {
    if (!chapters || !activeChapter || !activeModule) return;
    const updatedModules = activeChapter.modules.map(m => 
      m.id === activeModule.id ? { ...m, ...fields } : m
    );
    setChapters(chapters.map(ch => 
      ch.id === activeChapter.id ? { ...ch, modules: updatedModules } : ch
    ));
  };

  // Helper to update active module's steps
  const updateActiveModuleSteps = (updatedSteps: Step[]) => {
    if (!chapters || !activeChapter || !activeModule) return;
    const updatedModules = activeChapter.modules.map(m => 
      m.id === activeModule.id ? { ...m, steps: updatedSteps } : m
    );
    setChapters(chapters.map(ch => 
      ch.id === activeChapter.id ? { ...ch, modules: updatedModules } : ch
    ));
  };

  return (
    <div className="space-y-8 animate-fadeIn text-white pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold serif-text text-white tracking-wide">
            Curriculum CMS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage static academic resources, dictionary FTS databases, and CBSE learning modules.
          </p>
        </div>
        {activeTab === 'cbse' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
            >
              <Settings className="w-4 h-4" />
              CDN Settings
            </button>
            <button
              onClick={() => loadCbseData('cdn')}
              disabled={isLoadingCbse}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
            >
              <Loader2 className={`w-4 h-4 ${isLoadingCbse ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 space-x-6 text-sm overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('cbse')}
          className={`pb-4 font-semibold transition-all relative ${activeTab === 'cbse' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          {activeTab === 'cbse' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
          CBSE Curriculum
        </button>
        <button
          onClick={() => setActiveTab('sutras')}
          className={`pb-4 font-semibold transition-all relative ${activeTab === 'sutras' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          {activeTab === 'sutras' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
          Paninian Sutra Vault
        </button>
        <button
          onClick={() => setActiveTab('dict')}
          className={`pb-4 font-semibold transition-all relative ${activeTab === 'dict' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          {activeTab === 'dict' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
          Shabdakosh (Dictionary)
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`pb-4 font-semibold transition-all relative ${activeTab === 'vault' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          {activeTab === 'vault' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]" />}
          Vault Database (R2 Publish)
        </button>
      </div>

      {/* Tab Panel: CBSE Curriculum */}
      {activeTab === 'cbse' && (
        <div className="space-y-6">
          {cbseLoadError && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/20 text-amber-300 text-sm rounded-2xl flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                {cbseLoadError}
              </span>
              <button 
                onClick={() => loadCbseData('local')}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
              >
                Force Local Fallback
              </button>
            </div>
          )}

          {isLoadingCbse && !chapters ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
              <span className="text-gray-400 text-sm">Downloading dynamic chapters payload from CDN...</span>
            </div>
          ) : !chapters ? (
            <div className="glass-panel border border-white/5 bg-black/40 p-10 rounded-2xl text-center space-y-4">
              <FileCode className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-lg font-bold">No Curriculum Data Loaded</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Unable to automatically download data from R2 or local servers. Click below to load the template bundle.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => loadCbseData('local')}
                  className="px-5 py-2.5 bg-[#d4af37] text-[#050508] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Load Local Fallback Assets
                </button>
                <button
                  onClick={() => {
                    setChapters([]);
                    setSelectedChapterId(null);
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Create Blank Curriculum
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Col 1: Chapters Sidebar (3 cols) */}
              <div className="xl:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Chapters</h3>
                  <button
                    onClick={() => {
                      const newId = `chapter_${Date.now()}`;
                      const newCh: Chapter = {
                        id: newId,
                        title: 'New Chapter Title',
                        branchId: 'physics',
                        modules: [],
                        pyqs: []
                      };
                      setChapters([...chapters, newCh]);
                      setSelectedChapterId(newId);
                      setSelectedModuleId(null);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-lg border border-white/5 transition-all"
                    title="Add New Chapter"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {chapters.map((ch, index) => {
                    const isSelected = ch.id === selectedChapterId;
                    return (
                      <div
                        key={ch.id}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-white'
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                        onClick={() => {
                          setSelectedChapterId(ch.id);
                          setSelectedModuleId(ch.modules[0]?.id || null);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold font-mono tracking-wider opacity-60 uppercase block">
                              {ch.branchId} • {ch.modules.length} modules
                            </span>
                            <span className="font-semibold text-sm line-clamp-2 mt-1 block">
                              {ch.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveChapter(index, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveChapter(index, 'down');
                              }}
                              disabled={index === chapters.length - 1}
                              className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this chapter?')) {
                                  const updated = chapters.filter(c => c.id !== ch.id);
                                  setChapters(updated);
                                  if (selectedChapterId === ch.id) {
                                    setSelectedChapterId(updated[0]?.id || null);
                                    setSelectedModuleId(null);
                                  }
                                }
                              }}
                              className="p-1 text-gray-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Col 2: Chapter Details & Modules List (4 cols) */}
              <div className="xl:col-span-4 space-y-6">
                {activeChapter ? (
                  <>
                    {/* Chapter Metadata Editor */}
                    <div className="glass-panel border border-white/5 bg-black/40 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4" />
                          Chapter Settings
                        </h4>
                        <ConcurrencyLockBadge
                          lockedBy={(activeChapter as any).lockedBy || null}
                          currentUser="admin@vakrahara.org"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Chapter ID</label>
                          <input
                            type="text"
                            value={activeChapter.id}
                            onChange={(e) => {
                              const updated = chapters.map(ch => {
                                if (ch.id === activeChapter.id) {
                                  return { ...ch, id: e.target.value };
                                }
                                return ch;
                              });
                              setChapters(updated);
                              setSelectedChapterId(e.target.value);
                            }}
                            className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Chapter Title</label>
                          <input
                            type="text"
                            value={activeChapter.title}
                            onChange={(e) => {
                              setChapters(chapters.map(ch => {
                                if (ch.id === activeChapter.id) {
                                  return { ...ch, title: e.target.value };
                                }
                                return ch;
                              }));
                            }}
                            className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Branch ID</label>
                            <input
                              type="text"
                              value={activeChapter.branchId}
                              onChange={(e) => {
                                setChapters(chapters.map(ch => {
                                  if (ch.id === activeChapter.id) {
                                    return { ...ch, branchId: e.target.value };
                                  }
                                  return ch;
                                }));
                              }}
                              placeholder="e.g. physics"
                              className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => setEditingPyqId(editingPyqId === 'pyq_list' ? null : 'pyq_list')}
                              className={`w-full py-2 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                editingPyqId === 'pyq_list'
                                  ? 'bg-[#d4af37] text-black border-transparent'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Manage PYQs ({activeChapter.pyqs?.length || 0})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Chapter Modules</h3>
                        <button
                          onClick={() => {
                            const newModId = `module_${Date.now()}`;
                            const newMod: Module = {
                              id: newModId,
                              title: 'New Module Title',
                              steps: []
                            };
                            const updated = chapters.map(ch => {
                              if (ch.id === activeChapter.id) {
                                return { ...ch, modules: [...ch.modules, newMod] };
                              }
                              return ch;
                            });
                            setChapters(updated);
                            setSelectedModuleId(newModId);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-[#d4af37] rounded-lg border border-white/5 transition-all"
                          title="Add New Module"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {activeChapter.modules.map((mod, mIndex) => {
                          const isSelected = mod.id === selectedModuleId;
                          return (
                            <div
                              key={mod.id}
                              className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[90px] ${
                                isSelected
                                  ? 'bg-[#d4af37]/5 border-[#d4af37]/30 text-white'
                                  : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.03]'
                              }`}
                              onClick={() => {
                                setSelectedModuleId(mod.id);
                                setEditingPyqId(null);
                              }}
                            >
                              {/* Decal watermark background number */}
                              <div className="absolute right-4 bottom-2 text-6xl font-black font-mono text-white/5 pointer-events-none select-none">
                                M{(mIndex + 1).toString().padStart(2, '0')}
                              </div>

                              <div className="flex items-start justify-between gap-3 relative z-10">
                                <div className="flex-1 min-w-0">
                                  <span className="text-[9px] font-bold font-mono tracking-wider opacity-60 uppercase block">
                                    Module {(mIndex + 1).toString().padStart(2, '0')} • {mod.steps.length} steps
                                  </span>
                                  <span className="font-semibold text-sm line-clamp-2 mt-1 block">
                                    {mod.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveModule(activeChapter.id, mIndex, 'up');
                                    }}
                                    disabled={mIndex === 0}
                                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveModule(activeChapter.id, mIndex, 'down');
                                    }}
                                    disabled={mIndex === activeChapter.modules.length - 1}
                                    className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this module?')) {
                                        const updated = chapters.map(ch => {
                                          if (ch.id === activeChapter.id) {
                                            return {
                                              ...ch,
                                              modules: ch.modules.filter(m => m.id !== mod.id)
                                            };
                                          }
                                          return ch;
                                        });
                                        setChapters(updated);
                                        if (selectedModuleId === mod.id) {
                                          setSelectedModuleId(null);
                                        }
                                      }
                                    }}
                                    className="p-1 text-gray-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {activeChapter.modules.length === 0 && (
                          <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                            No modules in this chapter. Click '+' to add.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass-panel border border-white/5 bg-black/40 p-8 rounded-2xl text-center text-gray-500 text-xs">
                    Select a chapter to manage modules.
                  </div>
                )}
              </div>

              {/* Col 3: Module Steps / PYQ Detail Editor (5 cols) */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Mode 1: PYQ Editor Panel */}
                {activeChapter && editingPyqId === 'pyq_list' && (
                  <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Previous Year Questions (PYQs)
                      </h4>
                      <button
                        onClick={() => {
                          const newPyq: Pyq = {
                            id: `pyq_${Date.now()}`,
                            year: 'CBSE 2026',
                            marks: '3 Marks',
                            question: 'Write question here...',
                            sampleAnswer: 'Write sample answer here...',
                            markingScheme: 'Describe marking points...',
                            relatedModuleIds: []
                          };
                          setChapters(chapters.map(ch => {
                            if (ch.id === activeChapter.id) {
                              return { ...ch, pyqs: [...(ch.pyqs || []), newPyq] };
                            }
                            return ch;
                          }));
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/20 text-[#d4af37] rounded-lg text-xs font-semibold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add PYQ
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                      {(activeChapter.pyqs || []).map((pyq, pIndex) => (
                        <div key={pyq.id} className="p-4 bg-[#08080c] border border-white/5 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => {
                              const updatedPyqs = (activeChapter.pyqs || []).filter(p => p.id !== pyq.id);
                              setChapters(chapters.map(ch => {
                                if (ch.id === activeChapter.id) {
                                  return { ...ch, pyqs: updatedPyqs };
                                }
                                return ch;
                              }));
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete PYQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Year</label>
                              <input
                                type="text"
                                value={pyq.year}
                                onChange={(e) => {
                                  const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, year: e.target.value } : p);
                                  setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                                }}
                                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Marks weightage</label>
                              <input
                                type="text"
                                value={pyq.marks}
                                onChange={(e) => {
                                  const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, marks: e.target.value } : p);
                                  setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                                }}
                                className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Question text</label>
                            <textarea
                              value={pyq.question}
                              rows={2}
                              onChange={(e) => {
                                const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, question: e.target.value } : p);
                                  setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                              }}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Sample Answer</label>
                            <textarea
                              value={pyq.sampleAnswer}
                              rows={3}
                              onChange={(e) => {
                                const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, sampleAnswer: e.target.value } : p);
                                  setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                              }}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Marking Scheme Rubric</label>
                            <textarea
                              value={pyq.markingScheme}
                              rows={2}
                              onChange={(e) => {
                                const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, markingScheme: e.target.value } : p);
                                  setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                              }}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Related Module IDs (comma separated)</label>
                            <input
                              type="text"
                              value={pyq.relatedModuleIds?.join(', ') || ''}
                              onChange={(e) => {
                                const ids = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                                const updatedPyqs = activeChapter.pyqs.map(p => p.id === pyq.id ? { ...p, relatedModuleIds: ids } : p);
                                setChapters(chapters.map(ch => ch.id === activeChapter.id ? { ...ch, pyqs: updatedPyqs } : ch));
                              }}
                              className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                            />
                          </div>
                        </div>
                      ))}

                      {(!activeChapter.pyqs || activeChapter.pyqs.length === 0) && (
                        <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                          No PYQs added. Click "Add PYQ" above.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode 2: Steps Detail Editor Panel */}
                {activeModule && !editingPyqId && (
                  <div className="glass-panel border border-white/5 bg-black/40 p-6 rounded-2xl space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Module Editor
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Module ID</label>
                          <input
                            type="text"
                            value={activeModule.id}
                            onChange={(e) => {
                              updateActiveModule({ id: e.target.value });
                              setSelectedModuleId(e.target.value);
                            }}
                            className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Module Title</label>
                          <input
                            type="text"
                            value={activeModule.title}
                            onChange={(e) => {
                              updateActiveModule({ title: e.target.value });
                            }}
                            className="w-full px-3 py-1.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Module Steps</h4>
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value === '') return;
                              const type = e.target.value as Step['type'];
                              const newStep: Step = {
                                type,
                                id: `${activeModule.id}_step_${activeModule.steps.length + 1}`,
                                ...(type === 'concept' ? { textDeva: '', textEng: '' } : {}),
                                ...(type === 'simulation' ? { simulationId: 'what_is_a_wave', questionText: '' } : {}),
                                ...(type === 'predict_quiz' ? { question: '', options: ['', ''], correctOptionIndex: 0, explanation: '', hints: [''] } : {}),
                                ...(type === 'heritage_connection' ? { title: '', sutra: '', translation: '', significance: '' } : {})
                              };
                              updateActiveModuleSteps([...activeModule.steps, newStep]);
                              setActiveEditStepId(newStep.id);
                              e.target.value = '';
                            }}
                            className="px-2 py-1 bg-[#08080c] border border-white/5 rounded-lg text-xs font-semibold text-[#d4af37] focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
                          >
                            <option value="">+ Add Step...</option>
                            <option value="concept">Concept Description</option>
                            <option value="simulation">Interactive Lab</option>
                            <option value="predict_quiz">Predictive Quiz</option>
                            <option value="heritage_connection">Vedic Heritage</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {activeModule.steps.map((step, sIndex) => {
                          const isEditingStep = step.id === activeEditStepId;
                          return (
                            <div key={step.id} className="p-4 bg-[#08080c] border border-white/5 rounded-xl space-y-4 relative group">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 bg-[#d4af37]/5 border border-[#d4af37]/20 text-[9px] font-bold text-[#d4af37] rounded-md uppercase tracking-wider">
                                  {step.type.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => moveStep(activeChapter!.id, activeModule!.id, sIndex, 'up')}
                                    disabled={sIndex === 0}
                                    className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => moveStep(activeChapter!.id, activeModule!.id, sIndex, 'down')}
                                    disabled={sIndex === activeModule.steps.length - 1}
                                    className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setActiveEditStepId(isEditingStep ? null : step.id)}
                                    className="p-0.5 text-gray-500 hover:text-[#d4af37]"
                                    title="Edit Step Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this step?')) {
                                        updateActiveModuleSteps(activeModule.steps.filter(s => s.id !== step.id));
                                      }
                                    }}
                                    className="p-0.5 text-gray-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Step ID</label>
                                <input
                                  type="text"
                                  value={step.id}
                                  onChange={(e) => {
                                    const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, id: e.target.value } : s);
                                    updateActiveModuleSteps(updatedSteps);
                                    setActiveEditStepId(e.target.value);
                                  }}
                                  className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                                />
                              </div>

                              {/* Collapsible details depending on step.type */}
                              {isEditingStep && (
                                <div className="space-y-3 border-t border-white/5 pt-3 animate-fadeIn">
                                  {/* Concept Editor */}
                                  {step.type === 'concept' && (
                                    <>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Devanagari Title (Deva)</label>
                                        <input
                                          type="text"
                                          value={step.textDeva || ''}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, textDeva: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">English Explanation (Eng - supports markdown)</label>
                                        <textarea
                                          value={step.textEng || ''}
                                          rows={5}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, textEng: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {/* Simulation Editor */}
                                  {step.type === 'simulation' && (
                                    <>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Simulation ID</label>
                                        <select
                                          value={step.simulationId || ''}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, simulationId: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        >
                                          <option value="what_is_a_wave">Wave Motion Simulation</option>
                                          <option value="wave_intro">Wave Oscillation Lab</option>
                                          <option value="ray_optics">Ray Optics Reflection Lab</option>
                                          <option value="refraction_slab">Refraction Prism Lab</option>
                                          <option value="total_internal_reflection">TIR Reflection Lab</option>
                                          <option value="prism_dispersion">Prism Dispersion Lab</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Params Configuration (JSON)</label>
                                        <textarea
                                          value={JSON.stringify(step.params || {}, null, 2)}
                                          rows={3}
                                          onChange={(e) => {
                                            try {
                                              const obj = JSON.parse(e.target.value);
                                              const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, params: obj } : s);
                                              updateActiveModuleSteps(updatedSteps);
                                            } catch (err) {
                                              // Allow typing broken JSON temporarily
                                            }
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Guided Lab Instructions (English)</label>
                                        <textarea
                                          value={step.questionText || ''}
                                          rows={2}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, questionText: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {/* Quiz Editor */}
                                  {step.type === 'predict_quiz' && (
                                    <>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Quiz Question</label>
                                        <textarea
                                          value={step.question || ''}
                                          rows={2}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, question: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Options</label>
                                        {(step.options || []).map((opt, oIdx) => (
                                          <div key={oIdx} className="flex gap-2 items-center">
                                            <span className="text-[10px] text-gray-500 font-mono w-4">{oIdx}.</span>
                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => {
                                                const opts = [...(step.options || [])];
                                                opts[oIdx] = e.target.value;
                                                const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, options: opts } : s);
                                                updateActiveModuleSteps(updatedSteps);
                                              }}
                                              className="flex-1 px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                            />
                                            <button
                                              onClick={() => {
                                                const opts = (step.options || []).filter((_, idx) => idx !== oIdx);
                                                const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, options: opts } : s);
                                                updateActiveModuleSteps(updatedSteps);
                                              }}
                                              className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => {
                                            const opts = [...(step.options || []), ''];
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, options: opts } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="text-xs text-[#d4af37] flex items-center gap-1 font-semibold hover:underline"
                                        >
                                          + Add Option
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Correct Option Index</label>
                                          <select
                                            value={step.correctOptionIndex || 0}
                                            onChange={(e) => {
                                              const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, correctOptionIndex: parseInt(e.target.value) } : s);
                                              updateActiveModuleSteps(updatedSteps);
                                            }}
                                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                          >
                                            {(step.options || []).map((_, idx) => (
                                              <option key={idx} value={idx}>{idx}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Target Module ID</label>
                                          <input
                                            type="text"
                                            value={step.targetModuleId || ''}
                                            onChange={(e) => {
                                              const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, targetModuleId: e.target.value } : s);
                                              updateActiveModuleSteps(updatedSteps);
                                            }}
                                            placeholder="e.g. c10_physics_light_m2"
                                            className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Quiz Explanation</label>
                                        <textarea
                                          value={step.explanation || ''}
                                          rows={2}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, explanation: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Hints</label>
                                        {(step.hints || []).map((hint, hIdx) => (
                                          <div key={hIdx} className="flex gap-2 items-center">
                                            <input
                                              type="text"
                                              value={hint}
                                              onChange={(e) => {
                                                const hints = [...(step.hints || [])];
                                                hints[hIdx] = e.target.value;
                                                const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, hints } : s);
                                                updateActiveModuleSteps(updatedSteps);
                                              }}
                                              className="flex-1 px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                            />
                                            <button
                                              onClick={() => {
                                                const hints = (step.hints || []).filter((_, idx) => idx !== hIdx);
                                                const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, hints } : s);
                                                updateActiveModuleSteps(updatedSteps);
                                              }}
                                              className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => {
                                            const hints = [...(step.hints || []), ''];
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, hints } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="text-xs text-[#d4af37] flex items-center gap-1 font-semibold hover:underline"
                                        >
                                          + Add Hint
                                        </button>
                                      </div>
                                    </>
                                  )}

                                  {/* Heritage Editor */}
                                  {step.type === 'heritage_connection' && (
                                    <>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Heritage Card Title</label>
                                        <input
                                          type="text"
                                          value={step.title || ''}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Sanskrit Sutra / Verse</label>
                                        <input
                                          type="text"
                                          value={step.sutra || ''}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, sutra: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Sutra Translation</label>
                                        <input
                                          type="text"
                                          value={step.translation || ''}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, translation: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Scientific Heritage Significance</label>
                                        <textarea
                                          value={step.significance || ''}
                                          rows={4}
                                          onChange={(e) => {
                                            const updatedSteps = activeModule.steps.map(s => s.id === step.id ? { ...s, significance: e.target.value } : s);
                                            updateActiveModuleSteps(updatedSteps);
                                          }}
                                          className="w-full px-2 py-1 bg-[#0d0d15] border border-white/5 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]/60"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {activeModule.steps.length === 0 && (
                          <div className="p-8 border border-dashed border-white/5 rounded-xl text-center text-gray-500 text-xs">
                            No steps inside this module. Select from the dropdown to add.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Twin Live Preview Panel */}
                <div className="h-[480px]">
                  <DigitalTwinPreview
                    step={activeModule && activeModule.steps && activeModule.steps.length > 0 ? activeModule.steps[0] : null}
                    moduleTitle={activeModule?.title}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Floating Sticky Publish Bar at bottom */}
          {chapters && (
            <div className="fixed bottom-6 left-6 right-6 xl:left-72 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
                <div className="text-xs">
                  <span className="font-bold text-white block">CDN Deploy Pipeline Ready</span>
                  <span className="text-gray-400">Directly sync edited CBSE Chapter modules to Cloudflare R2 bucket.</span>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="max-h-[80px] overflow-y-auto max-w-md bg-red-950/20 border border-red-500/20 rounded-lg p-2 text-[10px] text-red-400 font-mono">
                  {validationErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 shrink-0">
                {publishStatus === 'success' && (
                  <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
                    <Check className="w-4 h-4" /> Published!
                  </span>
                )}
                {publishStatus === 'error' && (
                  <span className="text-xs text-red-400 font-semibold max-w-[200px] truncate block" title={publishErrorMessage}>
                    Error: {publishErrorMessage}
                  </span>
                )}
                <button
                  onClick={handlePublishCbse}
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing to CDN...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Publish to CDN
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: Sutra Vault */}
      {activeTab === 'sutras' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d0d15] border border-white/5 p-4 rounded-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={sutraSearch}
                onChange={(e) => setSutraSearch(e.target.value)}
                placeholder="Search sutras by ID (e.g. 6.1.77), Devanagari, or meaning..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <button className="px-5 py-2.5 bg-[#d4af37] text-[#050508] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shrink-0 w-full sm:w-auto">
              Add New Sutra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSutras.map((sutra) => (
              <div key={sutra.id} className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between relative">
                <div className="absolute top-4 right-4 text-[10px] font-bold font-mono text-gray-600 border border-white/5 px-2 py-0.5 rounded">
                  {sutra.id}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white serif-text tracking-wide mb-3">{sutra.sutra}</h3>
                  
                  {/* Padaccheda splits */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sutra.padaccheda.map((word, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#d4af37]/5 border border-[#d4af37]/10 text-xs font-semibold text-[#d4af37] rounded-md">
                        {word}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {sutra.meaning}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    {sutra.audio}
                  </span>
                  
                  <button
                    onClick={() => handleAudioPlayback(sutra.audio)}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-[#d4af37] transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel: Dictionary */}
      {activeTab === 'dict' && (
        <div className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-semibold text-white text-lg">Shabdakosh (Dictionary FTS5)</h3>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
            The active vocabulary index contains 45,210 words optimized for fast Harvard-Kyoto (HK) transliteration lookups. To upload new dictionary CSVs or update search tags, drag your files below.
          </p>

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-[#d4af37]/30 transition-colors cursor-pointer bg-white/[0.01]">
            <UploadCloud className="w-10 h-10 text-gray-500 mb-4" />
            <span className="text-sm font-semibold text-white">Upload dictionary CSV / JSON</span>
            <span className="text-xs text-gray-500 mt-1">Accepts schemas containing word_devanagari, word_hk, and definition</span>
          </div>
        </div>
      )}

      {/* Tab Panel: Vault Database SQLite Export */}
      {activeTab === 'vault' && (
        <div className="glass-panel border border-white/5 bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-semibold text-white text-lg">Vakrahara Vault Sync Pipeline</h3>
          </div>

          <div className="p-4 bg-[#0d0d15] border border-white/5 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-bold text-white mb-1">Warning: Production Database Compiling</h4>
              <p className="text-gray-400 leading-relaxed">
                Pulsing a database rebuild compiles raw curriculum content, dictionaries, and Paninian rules into the read-only SQLite database **`amritam_vault.db`**, then deploys it directly to Cloudflare R2 CDN buckets. Client Android apps will download this file automatically upon next startup check.
              </p>
            </div>
          </div>

          <form onSubmit={handleVaultUpload} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#08080c] border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Target CDN Endpoint</span>
                <span className="text-sm font-semibold text-[#d4af37] mt-1 block font-mono">cdn.vakrahara.org/vaults/</span>
              </div>
              <div className="p-4 bg-[#08080c] border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Current Vault Build</span>
                <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  amritam_vault_v1.0.4.db (32.4 MB)
                </span>
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4" />
                <span>Success: Vault compiled and synced to Cloudflare R2 CDN bucket.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#050508] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling & Uploading SQLite Vault...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Trigger Vault Rebuild & CDN Deploy
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* R2 Credentials Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white serif-text tracking-wide mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#d4af37]" />
              Cloudflare R2 Credentials
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              These S3 keys are used directly by your browser for AWS SigV4 signed requests. They are stored locally in your browser and are never uploaded to our servers.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">R2 Account ID</label>
                <input
                  type="text"
                  required
                  value={r2Config.accountId}
                  onChange={(e) => setR2Config({ ...r2Config, accountId: e.target.value })}
                  placeholder="e.g. 5ab6...ef21"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">R2 Bucket Name</label>
                <input
                  type="text"
                  required
                  value={r2Config.bucketName}
                  onChange={(e) => setR2Config({ ...r2Config, bucketName: e.target.value })}
                  placeholder="e.g. vakrahara-cdn"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Access Key ID</label>
                <input
                  type="text"
                  required
                  value={r2Config.accessKeyId}
                  onChange={(e) => setR2Config({ ...r2Config, accessKeyId: e.target.value })}
                  placeholder="e.g. A213...43B2"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Secret Access Key</label>
                <input
                  type="password"
                  required
                  value={r2Config.secretAccessKey}
                  onChange={(e) => setR2Config({ ...r2Config, secretAccessKey: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Bucket Region (S3 compatibility)</label>
                <input
                  type="text"
                  value={r2Config.region}
                  onChange={(e) => setR2Config({ ...r2Config, region: e.target.value })}
                  placeholder="auto"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Public CDN Domain URL</label>
                <input
                  type="url"
                  value={r2Config.customDomain}
                  onChange={(e) => setR2Config({ ...r2Config, customDomain: e.target.value })}
                  placeholder="https://cdn.vakrahara.org/v1"
                  className="w-full px-3 py-2 bg-[#08080c] border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#d4af37] text-black hover:brightness-110 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
