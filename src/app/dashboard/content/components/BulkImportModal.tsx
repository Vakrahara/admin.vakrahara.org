'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { AnveshanaQuestion } from '@/types/curriculum';
import { parseBulkQuestions } from './bulkImportParser';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedQuestions: AnveshanaQuestion[]) => void;
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<AnveshanaQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    setParseError(null);
    try {
      const questions = parseBulkQuestions(rawText);
      setParsedPreview(questions);
    } catch (err: any) {
      setParseError(err.message);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        try {
          const questions = parseBulkQuestions(text);
          setParsedPreview(questions);
          setParseError(null);
        } catch (err: any) {
          setParseError(err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onImport(parsedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#080C14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Incremental Question Pool Importer
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Drag & Drop File Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-slate-700/80 rounded-xl p-3.5 bg-[#03050B]/60 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-500/50 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.csv,.tsv,.txt,.md"
              className="hidden"
            />
            <FileText className="w-5 h-5 text-emerald-400" />
            <p className="text-xs text-slate-300">
              Drag & drop CSV / JSON file here, or <span className="text-emerald-400 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-500">Supports JSON, CSV (module, question, options...), or LLM Markdown</p>
          </div>

          <div className="relative">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Paste JSON, CSV, or Markdown:\n\nJSON: [{"questionEn": "...", "options": [...], "correctOptionIndex": 0}]\nCSV: module_num, question, optA, optB, optC, optD, correct, explanation\nMarkdown: 1. Question\nA) Option\nAnswer: A`}
              rows={6}
              className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-emerald-400 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleParse}
              className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white border border-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              Parse & Validate
            </button>

            {parsedPreview.length > 0 && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{parsedPreview.length} Questions Ready</span>
              </span>
            )}
          </div>

          {parseError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#03050B] text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Question</th>
                    <th className="p-2 w-20">Options</th>
                    <th className="p-2 w-16">Answer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0B0F19]">
                  {parsedPreview.map((q, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2 font-mono text-slate-500">{i + 1}</td>
                      <td className="p-2 text-slate-200 line-clamp-1">{q.questionEn}</td>
                      <td className="p-2 text-slate-400">{q.options.length}</td>
                      <td className="p-2 text-emerald-400 font-bold">{String.fromCharCode(65 + (q.correctOptionIndex || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-slate-800 bg-[#03050B]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            disabled={parsedPreview.length === 0}
            onClick={handleConfirm}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all"
          >
            Import {parsedPreview.length} Questions
          </button>
        </div>
      </div>
    </div>
  );
}
