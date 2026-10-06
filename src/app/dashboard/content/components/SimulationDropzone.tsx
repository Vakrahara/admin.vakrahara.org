'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Upload, Folder, FileCode, AlertTriangle, AlertCircle } from 'lucide-react';
import { SimulationFileItem } from '../utils/simulationUploader';

export interface SimulationDropzoneProps {
  files: SimulationFileItem[];
  onFilesChange: (files: SimulationFileItem[]) => void;
  entryFile?: File;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function SimulationDropzone({ files, onFilesChange, entryFile }: SimulationDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);
  const isOversizedTotal = totalSize > 5 * 1024 * 1024;
  const isOversizedHtml = useMemo(
    () => files.some((f) => f.path.toLowerCase().endsWith('.html') && f.size > 200 * 1024),
    [files]
  );

  const processFileList = (fileList: FileList | File[]) => {
    const items: SimulationFileItem[] = Array.from(fileList).map((f) => {
      let relPath = f.name;
      const rel = (f as any).webkitRelativePath;
      if (rel) {
        const parts = rel.split('/');
        relPath = parts.length > 1 ? parts.slice(1).join('/') : f.name;
      }
      return { path: relPath, file: f, size: f.size };
    });
    onFilesChange(items);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer) return;
    const items = e.dataTransfer.items;
    if (items && items.length > 0 && (items[0] as any).webkitGetAsEntry) {
      const collected: SimulationFileItem[] = [];
      const traverse = async (entry: any, path: string) => {
        if (entry.isFile) {
          const file: File = await new Promise((res, rej) => entry.file(res, rej));
          collected.push({ path: path ? `${path}/${file.name}` : file.name, file, size: file.size });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          const readEntries = async (): Promise<any[]> => new Promise((res, rej) => reader.readEntries(res, rej));
          let batch: any[];
          do {
            batch = await readEntries();
            for (const child of batch) await traverse(child, path ? `${path}/${child.name}` : child.name);
          } while (batch.length > 0);
        }
      };

      (async () => {
        for (let i = 0; i < items.length; i++) {
          const entry = (items[i] as any).webkitGetAsEntry();
          if (entry) {
            if (entry.isDirectory) {
              const reader = entry.createReader();
              const readEntries = async (): Promise<any[]> => new Promise((res, rej) => reader.readEntries(res, rej));
              let batch: any[];
              do {
                batch = await readEntries();
                for (const child of batch) await traverse(child, child.name);
              } while (batch.length > 0);
            } else {
              await traverse(entry, '');
            }
          }
        }
        if (collected.length > 0) onFilesChange(collected);
      })();
      return;
    }
    if (e.dataTransfer.files?.length) processFileList(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors ${
          isDragging ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-[#05070D]/80 hover:border-slate-700'
        }`}
      >
        <Upload className="w-7 h-7 text-emerald-400/80 mb-2" />
        <span className="text-xs font-semibold text-slate-200">Drag & drop .html or folder package</span>
        <p className="text-[11px] text-slate-500 mt-1 mb-3">Accepts standalone HTML or full directory with assets</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Choose HTML
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-[#d4af37]" /> Choose Folder
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".html,text/html" className="hidden" onChange={(e) => e.target.files && processFileList(e.target.files)} />
        <input ref={folderInputRef} type="file" className="hidden" {...({ webkitdirectory: '', directory: '', multiple: true } as any)} onChange={(e) => e.target.files && processFileList(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="p-3 bg-[#080C14] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Package Contents:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {files.length} file{files.length > 1 ? 's' : ''} ({formatBytes(totalSize)})
            </span>
          </div>
          {isOversizedTotal && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Warning: Package exceeds 5MB limit.</span>
            </div>
          )}
          {isOversizedHtml && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Warning: HTML entrypoint exceeds 200KB.</span>
            </div>
          )}
          {!entryFile && (
            <div className="flex items-center gap-1.5 text-red-400 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>No index.html entrypoint detected in folder.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
