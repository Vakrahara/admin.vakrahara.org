import { AnveshanaQuestion, QuestionType } from '@/types/curriculum';

/**
 * Strips markdown code blocks: ```json ... ``` or ``` ... ```
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/^```(?:json|csv|tsv|markdown|text)?\s*([\s\S]*?)\s*```$/i);
  return codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;
}

/**
 * Parses full CSV text respecting quoted fields containing newlines, escaped quotes, and commas.
 */
function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      if (text[i + 1] === quoteChar) {
        currentCell += quoteChar;
        i++; // skip escaped quote
      } else {
        inQuotes = false;
        quoteChar = '';
      }
    } else if (!inQuotes && char === delimiter) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows.map((r) => r.map((c) => c.replace(/^["']|["']$/g, '').trim()));
}

/**
 * Multi-format parser for incremental question pool importing (§10).
 * Supports:
 * 1. JSON (array or { questions: [...] }) with full 3-locale preservation
 * 2. CSV / TSV (dynamic options 2-4 without column drift, supports quoted multi-line questions)
 * 3. AI Markdown (supports multi-line Assertion-Reason and Statement I/II)
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
      const questions: AnveshanaQuestion[] = list.map((item, idx) => {
        let qType: QuestionType = item.questionType || 'mcq';
        const qEn = item.questionEn || item.question || item.prompt || '';
        if (/assertion|reason/i.test(qEn)) qType = 'assertion_reason';
        else if (/statement\s*i/i.test(qEn)) qType = 'statement_1_2';

        return {
          id: item.id || `imp_json_${Date.now()}_${idx}`,
          questionType: qType,
          bloomsLevel: item.bloomsLevel || 'understand',
          questionEn: qEn,
          questionHi: item.questionHi || undefined,
          questionHng: item.questionHng || undefined,
          options: Array.isArray(item.options) ? item.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          optionsHi: Array.isArray(item.optionsHi) ? item.optionsHi : undefined,
          optionsHng: Array.isArray(item.optionsHng) ? item.optionsHng : undefined,
          correctOptionIndex: typeof item.correctOptionIndex === 'number' ? item.correctOptionIndex : 0,
          correctOptionHash: item.correctOptionHash || undefined,
          explanationEn: item.explanationEn || item.explanation || '',
          explanationHi: item.explanationHi || undefined,
          explanationHng: item.explanationHng || undefined,
          hints: Array.isArray(item.hints) ? item.hints : undefined,
          hintsHi: Array.isArray(item.hintsHi) ? item.hintsHi : undefined,
          hintsHng: Array.isArray(item.hintsHng) ? item.hintsHng : undefined
        };
      });
      if (questions.length > 0 && questions.some((q) => q.questionEn)) return questions;
    } catch {
      // Fall through to CSV / Markdown
    }
  }

  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

  // Check if input has explicit multi-line markdown markers (e.g. options A) / B) on new lines or Answer: prefix)
  const hasMarkdownMarkers = lines.some((l) =>
    /^(?:[-*]?\s*(?:\([A-Da-d1-4]\)|\[[A-Da-d1-4]\]|[A-Da-d1-4][\.\):])\s+|(?:Answer|Ans|Correct|Explanation|Exp|Rationale):)/i.test(l)
  );

  // Helper: Markdown parser
  const parseMarkdown = (): AnveshanaQuestion[] => {
    const questions: AnveshanaQuestion[] = [];
    let currentQ: Partial<AnveshanaQuestion> | null = null;
    const currentOpts: string[] = [];
    let inExplanation = false;

    const flush = () => {
      if (currentQ && currentQ.questionEn && currentOpts.length >= 2) {
        const qEn = currentQ.questionEn.trim();
        let qType: QuestionType = 'mcq';
        if (/assertion|reason/i.test(qEn)) qType = 'assertion_reason';
        else if (/statement\s*i/i.test(qEn)) qType = 'statement_1_2';

        questions.push({
          id: `imp_md_${Date.now()}_${questions.length}`,
          questionType: qType,
          bloomsLevel: 'understand',
          questionEn: qEn,
          options: [...currentOpts],
          correctOptionIndex: currentQ.correctOptionIndex ?? 0,
          explanationEn: (currentQ.explanationEn || '').trim()
        });
      }
    };

    for (const line of lines) {
      // Question start match: "1. ", "1) ", "Q1: ", "Question 1: ", "### 1. "
      const qMatch = line.match(/^(?:#{1,4}\s*)?(?:\*{0,2}(?:(?:Q(?:uestion)?\s*\d*[\.:]?|\d+[\.\)])\*{0,2}))\s*(.*)/i);
      if (qMatch) {
        flush();
        currentQ = { questionEn: qMatch[1] || line };
        currentOpts.length = 0;
        inExplanation = false;
        continue;
      }

      // Option match (A, B, C, D or parenthesized (1), (2), [1], [2])
      const optMatch = line.match(/^[-*]?\s*\*{0,2}(?:(?:\(([A-Da-d1-4])\)|\[([A-Da-d1-4])\]|([A-Da-d1-4])[\.\):]))\*{0,2}\s+(.*)/i);
      if (optMatch && currentQ) {
        const optText = (optMatch[4] || '').replace(/^\*{1,2}|\*{1,2}$/g, '').trim();
        currentOpts.push(optText);
        inExplanation = false;
        continue;
      }

      // Answer match
      const ansMatch = line.match(/^[-*]?\s*(?:\*{0,2}(?:Answer|Correct Answer|Ans|Correct Option|Correct):?\*{0,2})\s*(?:Option\s*)?\(?\*{0,2}([A-Da-d]|[1-4])\*{0,2}\)?/i);
      if (ansMatch && currentQ) {
        const char = ansMatch[1].toUpperCase();
        if (/^[A-D]$/.test(char)) {
          currentQ.correctOptionIndex = char.charCodeAt(0) - 65;
        } else if (/^[1-4]$/.test(char)) {
          currentQ.correctOptionIndex = parseInt(char, 10) - 1;
        } else {
          currentQ.correctOptionIndex = parseInt(char, 10) || 0;
        }
        inExplanation = false;
        continue;
      }

      // Explanation match
      const expMatch = line.match(/^[-*]?\s*(?:\*{0,2}(?:Explanation|Exp|Rationale):?\*{0,2})\s*(.*)/i);
      if (expMatch && currentQ) {
        currentQ.explanationEn = expMatch[1].trim();
        inExplanation = true;
        continue;
      }

      // Multi-line explanation continuation
      if (currentQ && inExplanation && line.length > 0) {
        currentQ.explanationEn = (currentQ.explanationEn || '') + ' ' + line;
        continue;
      }

      // Multi-line question continuation (e.g. Assertion / Reason or multi-paragraph question)
      if (currentQ && currentOpts.length === 0 && line.length > 0) {
        currentQ.questionEn = (currentQ.questionEn || '') + '\n' + line;
      }
    }
    flush();
    return questions;
  };

  // Helper: CSV / TSV Parser with dynamic option column detection
  const parseCsv = (): AnveshanaQuestion[] => {
    const delimiter = cleaned.includes('\t') ? '\t' : ',';
    const rows = parseCsvRows(cleaned, delimiter);
    if (rows.length < 1) return [];

    const questions: AnveshanaQuestion[] = [];
    for (let i = 0; i < rows.length; i++) {
      const parts = rows[i];
      // Skip header row
      const isHeader = parts.some((p) => /^(module|question|prompt|q_text|option|opt[1-4]|answer|correct|explanation)/i.test(p));
      if (isHeader) continue;

      if (parts.length >= 3) {
        const hasModuleCol = /^\d+$/.test(parts[0]) && parts.length >= 4;
        const offset = hasModuleCol ? 1 : 0;
        const qText = parts[offset] || '';

        // Find the answer column index (looking for 'A', 'B', 'C', 'D', '1', '2', '3', '4' or 'Option A')
        let ansColIdx = -1;
        for (let c = offset + 2; c < parts.length; c++) {
          if (/^(?:option\s*)?([A-Da-d]|[1-4])$/i.test(parts[c])) {
            ansColIdx = c;
            break;
          }
        }

        let opts: string[] = [];
        let correctIdx = 0;
        let explanation = '';

        if (ansColIdx !== -1) {
          opts = parts.slice(offset + 1, ansColIdx).filter(Boolean);
          const ansMatch = parts[ansColIdx].match(/([A-Da-d]|[1-4])/);
          if (ansMatch) {
            const char = ansMatch[1].toUpperCase();
            correctIdx = /^[A-D]$/.test(char) ? char.charCodeAt(0) - 65 : parseInt(char, 10) - 1;
          }
          explanation = parts.slice(ansColIdx + 1).join(' ').trim();
        } else if (parts.length >= offset + 5) {
          // Standard 4-option assumption with explicit answer in column 5
          const correctStr = (parts[offset + 5] || '').toUpperCase();
          if (/^[A-D1-4]$/.test(correctStr)) {
            opts = [parts[offset + 1], parts[offset + 2], parts[offset + 3], parts[offset + 4]].filter(Boolean);
            correctIdx = /^[A-D]$/.test(correctStr) ? correctStr.charCodeAt(0) - 65 : parseInt(correctStr, 10) - 1;
            explanation = parts[offset + 6] || '';
          }
        }

        if (qText && opts.length >= 2) {
          let qType: QuestionType = 'mcq';
          if (/assertion|reason/i.test(qText)) qType = 'assertion_reason';
          else if (/statement\s*i/i.test(qText)) qType = 'statement_1_2';

          questions.push({
            id: `imp_csv_${Date.now()}_${i}`,
            questionType: qType,
            questionEn: qText,
            options: opts,
            correctOptionIndex: Math.max(0, Math.min(correctIdx, opts.length - 1)),
            explanationEn: explanation
          });
        }
      }
    }
    return questions;
  };

  // If marked as Markdown, parse Markdown first; otherwise parse CSV first
  if (hasMarkdownMarkers) {
    const mdQuestions = parseMarkdown();
    if (mdQuestions.length > 0) return mdQuestions;
    const csvQuestions = parseCsv();
    if (csvQuestions.length > 0) return csvQuestions;
  } else {
    const csvQuestions = parseCsv();
    if (csvQuestions.length > 0) return csvQuestions;
    const mdQuestions = parseMarkdown();
    if (mdQuestions.length > 0) return mdQuestions;
  }

  throw new Error('Could not parse questions. Please provide JSON, CSV, or formatted Markdown.');
}
