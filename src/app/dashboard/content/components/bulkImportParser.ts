import { AnveshanaQuestion } from '@/types/curriculum';

/**
 * Strips markdown code blocks: ```json ... ``` or ``` ... ```
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/^```(?:json|csv|markdown|text)?\s*([\s\S]*?)\s*```$/i);
  return codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;
}

/**
 * Parses a CSV line handling quoted values with embedded commas or quotes.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/^["']|["']$/g, '').trim());
}

/**
 * Multi-format parser for incremental question pool importing (§10).
 * Supports:
 * 1. JSON (array or { questions: [...] }) with optional code fences
 * 2. CSV / TSV (with or without headers, quoted cells, module column or direct)
 * 3. AI Markdown (Q1:, 1., **A)**, (A), - A), **Answer:** A, Explanation:)
 */
export function parseBulkQuestions(rawText: string): AnveshanaQuestion[] {
  const cleaned = stripCodeFences(rawText);
  if (!cleaned) {
    throw new Error('Please paste JSON, CSV, or Markdown question data.');
  }

  // 1. JSON Parser
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleaned);
      const list: any[] = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
      const questions: AnveshanaQuestion[] = list.map((item, idx) => ({
        id: `imp_json_${Date.now()}_${idx}`,
        questionEn: item.questionEn || item.question || '',
        options: Array.isArray(item.options) ? item.options : ['A', 'B', 'C', 'D'],
        correctOptionIndex: typeof item.correctOptionIndex === 'number' ? item.correctOptionIndex : 0,
        explanationEn: item.explanationEn || item.explanation || ''
      }));
      if (questions.length > 0) return questions;
    } catch {
      // Fall through to CSV / Markdown
    }
  }

  // 2. CSV / TSV Parser
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const delimiter = lines.some((l) => l.includes('\t')) ? '\t' : ',';
  const isDelimited = lines.some((l) => l.includes(delimiter));

  if (isDelimited && lines.length >= 1) {
    const questions: AnveshanaQuestion[] = [];
    for (let i = 0; i < lines.length; i++) {
      const parts = parseCsvLine(lines[i], delimiter);
      // Check if header row
      const isHeader = parts.some((p) => /^(module|question|prompt|q_text|option|opt[1-4]|answer|correct|explanation)/i.test(p));
      if (isHeader) continue;

      if (parts.length >= 5) {
        const hasModuleCol = /^\d+$/.test(parts[0]);
        const offset = hasModuleCol ? 1 : 0;
        const qText = parts[offset] || '';
        const opts = [parts[offset + 1], parts[offset + 2], parts[offset + 3], parts[offset + 4]].filter(Boolean);
        const correctStr = (parts[offset + 5] || 'A').toUpperCase();
        let correctIdx = 0;
        if (/^[A-D]$/.test(correctStr)) {
          correctIdx = correctStr.charCodeAt(0) - 65;
        } else if (/^[1-4]$/.test(correctStr)) {
          correctIdx = parseInt(correctStr, 10) - 1;
        } else {
          correctIdx = parseInt(correctStr, 10) || 0;
        }
        const explanation = parts[offset + 6] || '';

        if (qText && opts.length >= 2) {
          questions.push({
            id: `imp_csv_${Date.now()}_${i}`,
            questionEn: qText,
            options: opts,
            correctOptionIndex: correctIdx,
            explanationEn: explanation
          });
        }
      }
    }
    if (questions.length > 0) return questions;
  }

  // 3. AI Markdown Parser
  const questions: AnveshanaQuestion[] = [];
  let currentQ: Partial<AnveshanaQuestion> | null = null;
  const currentOpts: string[] = [];

  const flush = () => {
    if (currentQ && currentQ.questionEn && currentOpts.length >= 2) {
      questions.push({
        id: `imp_md_${Date.now()}_${questions.length}`,
        questionEn: currentQ.questionEn,
        options: [...currentOpts],
        correctOptionIndex: currentQ.correctOptionIndex ?? 0,
        explanationEn: currentQ.explanationEn || ''
      });
    }
  };

  for (const line of lines) {
    const qMatch = line.match(/^(?:#{1,4}\s*)?(\*{0,2}(?:\d+[\.\)]|Question\s*\d*[\.:]?|Q\d*[\.:]?)\*{0,2})\s*(.*)/i);
    if (qMatch && !line.match(/^[-*]?\s*(?:\*{0,2}\(?([A-Da-d]|[1-4])\)?[\.\):]?\*{0,2})\s+/)) {
      flush();
      currentQ = { questionEn: qMatch[2] || line };
      currentOpts.length = 0;
      continue;
    }

    const optMatch = line.match(/^[-*]?\s*(?:\*{0,2}\(?([A-Da-d]|[1-4])\)?[\.\):]?\*{0,2})\s+(.*)/);
    if (optMatch && currentQ) {
      currentOpts.push(optMatch[2].replace(/^\*{1,2}|\*{1,2}$/g, '').trim());
      continue;
    }

    const ansMatch = line.match(/(?:\*{0,2}(?:Answer|Correct Answer|Ans|Correct Option|Correct):?\*{0,2})\s*(?:Option\s*)?\(?\*{0,2}([A-Da-d]|[1-4])\*{0,2}\)?/i);
    if (ansMatch && currentQ) {
      const char = ansMatch[1].toUpperCase();
      if (/^[A-D]$/.test(char)) {
        currentQ.correctOptionIndex = char.charCodeAt(0) - 65;
      } else if (/^[1-4]$/.test(char)) {
        currentQ.correctOptionIndex = parseInt(char, 10) - 1;
      } else {
        currentQ.correctOptionIndex = parseInt(char, 10) || 0;
      }
      continue;
    }

    const expMatch = line.match(/(?:\*{0,2}(?:Explanation|Exp|Rationale):?\*{0,2})\s*(.*)/i);
    if (expMatch && currentQ) {
      currentQ.explanationEn = expMatch[1].trim();
    }
  }
  flush();

  if (questions.length > 0) return questions;
  throw new Error('Could not parse questions. Please provide JSON, CSV, or formatted Markdown.');
}
