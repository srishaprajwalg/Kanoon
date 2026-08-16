import { Buffer } from 'buffer';
import type { ExtractedDocument, ExtractedPage } from '../types/index.js';

let pdfParseModule: any = null;

async function getPdfParse() {
  if (pdfParseModule) return pdfParseModule;
  try {
    const pdfParse: any = await import('pdf-parse');
    pdfParseModule = pdfParse.PDFParse || pdfParse.default || pdfParse;
    return pdfParseModule;
  } catch (_e) {
    try {
      const req = (globalThis as any).require;
      if (req) {
        const parsed = req('pdf-parse');
        pdfParseModule = parsed.PDFParse || parsed.default || parsed;
        return pdfParseModule;
      }
    } catch (err) {
      console.warn('PDFParse module loading fallback:', err);
    }
    return null;
  }
}

/**
 * Extracts plain text from a DOCX buffer by parsing word/document.xml content
 */
function extractDocxText(buffer: Buffer): string {
  const str = buffer.toString('binary');
  // Extract text inside <w:t> tags from document.xml inside zip
  const matches = str.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (matches && matches.length > 0) {
    return matches.map((m: string) => m.replace(/<[^>]+>/g, '')).join(' ');
  }
  
  // Fallback: strip XML/binary tags and pull readable ASCII/UTF-8 strings
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ');
  return cleaned.trim();
}

/**
 * Extracts text and page structure from PDF, DOCX, or TXT buffer/string.
 */
export async function extractDocumentContent(
  fileBuffer: Buffer | string,
  filename: string,
  mimeType?: string
): Promise<ExtractedDocument> {
  const lowerName = filename.toLowerCase();
  let text = '';
  let pages: ExtractedPage[] = [];

  const buffer = typeof fileBuffer === 'string'
    ? Buffer.from(fileBuffer, 'base64')
    : fileBuffer;

  if (buffer.length === 0) {
    throw new Error(`File ${filename} is empty (0 bytes). Upload a valid legal document.`);
  }

  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    const PDFParse = await getPdfParse();
    if (PDFParse) {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        text = pdfData.text || '';

        // Split text page-by-page if page markers exist
        const pageSegments = text.split(/\n\s*--\s*(\d+)\s*of\s*\d+\s*--\s*\n/i);
        if (pageSegments.length > 1) {
          for (let i = 0; i < pageSegments.length; i++) {
            const seg = pageSegments[i];
            if (/^\d+$/.test(seg.trim())) {
              const pageNumber = parseInt(seg.trim(), 10);
              const textContent = pageSegments[i + 1] || '';
              pages.push({ pageNumber, text: textContent.trim() });
              i++;
            }
          }
        }

        if (pages.length === 0) {
          pages.push({ pageNumber: 1, text: text.trim() });
        }
      } catch (pdfErr: any) {
        throw new Error(`Failed to parse PDF document (${filename}): ${pdfErr.message || pdfErr}`);
      }
    } else {
      // Direct UTF-8 / string fallback if pdf-parse module fails
      text = buffer.toString('utf-8');
      pages.push({ pageNumber: 1, text: text.trim() });
    }
  } else if (lowerName.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = extractDocxText(buffer);
    pages.push({ pageNumber: 1, text: text.trim() });
  } else {
    // TXT or fallback
    text = buffer.toString('utf-8');
    // Simple page estimate split every ~3000 chars if long
    if (text.length > 4000) {
      const chunks = text.match(/[\s\S]{1,3500}(?=\s|$)/g) || [text];
      pages = chunks.map((chunk, idx) => ({ pageNumber: idx + 1, text: chunk.trim() }));
    } else {
      pages.push({ pageNumber: 1, text: text.trim() });
    }
  }

  const cleanText = text.replace(/\r\n/g, '\n').trim();

  if (!cleanText || cleanText.replace(/\s+/g, '').length < 15) {
    throw new Error(`Extracted text from ${filename} is empty or unreadable. Ensure the file is not password protected or corrupted.`);
  }

  return {
    text: cleanText,
    pageCount: pages.length || 1,
    filename,
    mimeType: mimeType || (lowerName.endsWith('.pdf') ? 'application/pdf' : lowerName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain'),
    pages
  };
}

