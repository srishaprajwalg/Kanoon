import type { ExtractedDocument, ParsedClause } from '../types/index.js';

const COMMON_LEGAL_HEADINGS = [
  'definitions',
  'grant of license',
  'demised premises',
  'term',
  'tenure',
  'rent',
  'license fee',
  'consideration',
  'payment',
  'security deposit',
  'lock-in period',
  'lock in period',
  'termination',
  'notice period',
  'confidentiality',
  'non-disclosure',
  'intellectual property',
  'indemnity',
  'indemnification',
  'limitation of liability',
  'liability',
  'dispute resolution',
  'governing law',
  'jurisdiction',
  'severability',
  'force majeure',
  'non-compete',
  'non-solicitation',
  'covenants',
  'duties of licensee',
  'duties of tenant',
  'obligations',
  'miscellaneous'
];

/**
 * Segments an extracted document into structured logical clauses.
 */
export function segmentDocumentIntoClauses(extractedDoc: ExtractedDocument): ParsedClause[] {
  const clauses: ParsedClause[] = [];
  const text = extractedDoc.text;

  // Regex patterns for section headers:
  // 1. "ARTICLE I", "ARTICLE 1", "SECTION 1", "Clause 1"
  // 2. Numbered headings: "1.", "1.1", "2.0", "3.1.2"
  // 3. Roman numerals or uppercase title lines
  const clauseHeaderRegex = /^(?:(?:ARTICLE|SECTION|CLAUSE|PART)\s+[0-9A-ZIVX]+|(?:[0-9]{1,2}(?:\.[0-9]{1,2})?)\.?)\s*[-—:]?\s*(.*)$/i;

  const lines = text.split('\n');
  let currentHeader = '';
  let currentSectionNumber = '';
  let currentTextLines: string[] = [];
  let currentPageNumber = 1;

  const flushClause = () => {
    if (currentTextLines.length > 0) {
      const originalText = currentTextLines.join(' ').replace(/\s+/g, ' ').trim();
      if (originalText.length > 15) {
        const id = `cl_review_${clauses.length + 1}`;
        const heading = currentHeader || inferHeadingFromText(originalText, currentSectionNumber, clauses.length + 1);
        
        clauses.push({
          id,
          sectionNumber: currentSectionNumber || undefined,
          heading,
          originalText,
          pageNumber: currentPageNumber
        });
      }
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect page markers if any
    const pageMatch = line.match(/^--\s*(\d+)\s*of\s*\d+\s*--$/i);
    if (pageMatch) {
      currentPageNumber = parseInt(pageMatch[1], 10);
      continue;
    }

    const match = line.match(clauseHeaderRegex);
    const lineLower = line.toLowerCase();
    const isCommonHeading = COMMON_LEGAL_HEADINGS.some(h => lineLower.startsWith(h) || lineLower.endsWith(h));

    if (match || (isCommonHeading && line.length < 80)) {
      let secNum = '';
      let headingText = line;

      if (match) {
        const numPart = line.match(/^(?:ARTICLE|SECTION|CLAUSE|PART)?\s*([0-9A-ZIVX]+(?:\.[0-9]+)?)\.?:?\s*/i);
        if (numPart) {
          secNum = numPart[1];
        }
        headingText = match[1] ? match[1].trim() : line;
      }

      if (!headingText || headingText.length === 0) {
        headingText = `Clause ${secNum || clauses.length + 1}`;
      }

      flushClause();

      currentSectionNumber = secNum || `Clause ${clauses.length + 1}`;
      currentHeader = headingText;
      currentTextLines = [];
    } else {
      currentTextLines.push(line);
    }
  }

  flushClause();

  // Fallback: If no structured clauses detected via headings, fall back to paragraph blocks
  if (clauses.length <= 1) {
    return fallbackParagraphSegmentation(text);
  }

  return clauses;
}

/**
 * Infer a title if no explicit heading was found in regex
 */
function inferHeadingFromText(text: string, secNum: string, clauseIdx: number): string {
  const lower = text.toLowerCase();
  for (const h of COMMON_LEGAL_HEADINGS) {
    if (lower.includes(h)) {
      return h.charAt(0).toUpperCase() + h.slice(1);
    }
  }
  return secNum ? `Section ${secNum}` : `Clause ${clauseIdx}`;
}

/**
 * Paragraph-based fallback segmentation for unstructured contract text
 */
function fallbackParagraphSegmentation(text: string): ParsedClause[] {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
  
  if (paragraphs.length === 0) {
    return [{
      id: 'cl_review_1',
      sectionNumber: 'Clause 1',
      heading: 'General Terms & Conditions',
      originalText: text,
      pageNumber: 1
    }];
  }

  return paragraphs.map((para, idx) => {
    const lines = para.split('\n');
    const firstLine = lines[0].trim();
    let heading = `Clause ${idx + 1}`;
    let body = para;

    if (firstLine.length < 60 && !firstLine.endsWith('.')) {
      heading = firstLine;
      body = lines.slice(1).join(' ').trim() || firstLine;
    } else {
      heading = inferHeadingFromText(para, `Clause ${idx + 1}`, idx + 1);
    }

    return {
      id: `cl_review_${idx + 1}`,
      sectionNumber: `Clause ${idx + 1}`,
      heading,
      originalText: body,
      pageNumber: 1
    };
  });
}
