'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { AnveshanaQuestion } from '@/types/curriculum';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedQuestions: AnveshanaQuestion[]) => void;
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<AnveshanaQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    setParseError(null);
    if (!rawText.trim()) {
      setParseError('Please paste JSON or tabular question data.');
      return;
    }

    try {
      // 1. Try parsing JSON directly
      const parsed = JSON.parse(rawText);
      const list: any[] = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];

      const questions: AnveshanaQuestion[] = list.map((item, idx) => ({
        id: `imp_${Date.now()}_${idx}`,
        questionEn: item.questionEn || item.question || '',
        options: Array.isArray(item.options) ? item.options : ['A', 'B', 'C', 'D'],
        correctOptionIndex: typeof item.correctOptionIndex === 'number' ? item.correctOptionIndex : 0,
        explanationEn: item.explanationEn || item.explanation || ''
      }));

      if (questions.length === 0) {
        setParseError('No valid questions found in payload.');
        return;
      }

      setParsedPreview(questions);
    } catch {
      // 2. Simple line-by-line fallback parser for AI markdown format
      try {
        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
        const questions: AnveshanaQuestion[] = [];
        let currentQ: Partial<AnveshanaQuestion> | null = null;
        const currentOpts: string[] = [];

        for (const line of lines) {
          if (line.match(/^(\d+\.|Q:)/i)) {
            if (currentQ && currentQ.questionEn && currentOpts.length >= 2) {
              questions.push({
                id: `imp_${Date.now()}_${questions.length}`,
                questionEn: currentQ.questionEn,
                options: [...currentOpts],
                correctOptionIndex: currentQ.correctOptionIndex ?? 0,
                explanationEn: currentQ.explanationEn || ''
              });
            }
            currentQ = { questionEn: line.replace(/^(\d+\.|Q:)\s*/i, '') };
            currentOpts.length = 0;
          } else if (line.match(/^[A-D]\)/i)) {
            currentOpts.push(line.replace(/^[A-D]\)\s*/i, ''));
          } else if (line.match(/^Answer:\s*([A-D])/i)) {
            const char = line.match(/^Answer:\s*([A-D])/i)?.[1].toUpperCase();
            if (char && currentQ) {
              currentQ.correctOptionIndex = char.charCodeAt(0) - 65;
            }
          }
        }

        if (currentQ && currentQ.questionEn && currentOpts.length >= 2) {
          questions.push({
            id: `imp_${Date.now()}_${questions.length}`,
            questionEn: currentQ.questionEn,
            options: [...currentOpts],
            correctOptionIndex: currentQ.correctOptionIndex ?? 0,
            explanationEn: currentQ.explanationEn || ''
          });
        }

        if (questions.length > 0) {
          setParsedPreview(questions);
        } else {
          setParseError('Could not parse text format. Please paste JSON with { question, options, correctOptionIndex }.');
        }
      } catch (err: any) {
        setParseError(`Parse failed: ${err.message}`);
      }
    }
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
          <p className="text-xs text-slate-400">
            Paste raw JSON from LLM or structured Markdown. Supports batch ingestion of 30+ questions.
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`[\n  {\n    "questionEn": "What is reflection of light?",\n    "options": ["Bouncing back", "Bending", "Absorption", "Scattering"],\n    "correctOptionIndex": 0,\n    "explanationEn": "Light bounces back into the same medium."\n  }\n]`}
            rows={7}
            className="w-full text-xs font-mono bg-[#03050B] border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-emerald-400 outline-none resize-none"
          />

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
