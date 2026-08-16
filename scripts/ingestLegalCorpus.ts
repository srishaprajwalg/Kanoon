import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { generateDenseEmbedding } from '../src/services/embeddingService.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export interface IngestedChunk {
  id: string;
  chunkId: string;
  actName: string;
  actShortTitle: string;
  actNumber: string;
  year: number;
  chapter?: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  pageNumbers: number[];
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  sourcePdfFilename: string;
  sourceDocument: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceType: 'PRIMARY_SOURCE_GOVERNMENT_PDF';
  sourceTier: 'Tier 1 (Official Government)';
  retrievalDate: string;
  sha256: string;
  pageCount: number;
  fileSizeBytes: number;
  keywords: string[];
  embeddingVector?: number[];
}

export interface IngestionReport {
  totalSourceDocuments: number;
  totalPagesExtracted: number;
  totalSectionsDetected: number;
  totalChunksGenerated: number;
  totalEmbeddingsGenerated: number;
  extractionFailures: string[];
  ingestionDurationMs: number;
  sourceDocuments: {
    filename: string;
    actShortTitle: string;
    jurisdiction: string;
    sourceUrl: string;
    sha256: string;
    fileSizeBytes: number;
    charCount: number;
    sectionsExtracted: number;
    pages: number;
  }[];
}

/**
 * Official Source Metadata Dictionary for authentic Indian Government statutory PDFs
 */
export const ACT_METADATA_MAP: Record<string, {
  actName: string;
  actShortTitle: string;
  actNumber: string;
  year: number;
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourceUrl: string;
  sourceDomain: string;
  category: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
}> = {
  'indian_contract_act_1872.pdf': {
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'general_contract'
  },
  'transfer_of_property_act_1882.pdf': {
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/14648',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'lease_tenancy'
  },
  'registration_act_1908.pdf': {
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2190',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'lease_tenancy'
  },
  'specific_relief_act_1963.pdf': {
    actName: 'The Specific Relief Act, 1963',
    actShortTitle: 'Specific Relief Act 1963',
    actNumber: 'Act No. 47 of 1963',
    year: 1963,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1583',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'general_contract'
  },
  'arbitration_and_conciliation_act_1996.pdf': {
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    actNumber: 'Act No. 26 of 1996',
    year: 1996,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21922',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'dispute_arbitration'
  },
  'information_technology_act_2000.pdf': {
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/13116',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'confidentiality_nda'
  },
  'consumer_protection_act_2019.pdf': {
    actName: 'The Consumer Protection Act, 2019',
    actShortTitle: 'Consumer Protection Act 2019',
    actNumber: 'Act No. 35 of 2019',
    year: 2019,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/16939',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'consumer_rights'
  },
  'commercial_courts_act_2015.pdf': {
    actName: 'The Commercial Courts Act, 2015',
    actShortTitle: 'Commercial Courts Act 2015',
    actNumber: 'Act No. 4 of 2016',
    year: 2015,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2156',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'dispute_arbitration'
  },
  'karnataka_rent_act_1999.pdf': {
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act 34 of 2001',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7810',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'lease_tenancy'
  },
  'karnataka_stamp_act_1957.pdf': {
    actName: 'The Karnataka Stamp Act, 1957',
    actShortTitle: 'Karnataka Stamp Act 1957',
    actNumber: 'Karnataka Act 34 of 1957',
    year: 1957,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7744',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'lease_tenancy'
  },
  'karnataka_shops_and_commercial_establishments_act_1961.pdf': {
    actName: 'The Karnataka Shops and Commercial Establishments Act, 1961',
    actShortTitle: 'Karnataka Shops Act 1961',
    actNumber: 'Karnataka Act 8 of 1962',
    year: 1961,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7609?view_type=browse',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'employment_service'
  },
  'karnataka_land_revenue_act_1964.pdf': {
    actName: 'The Karnataka Land Revenue Act, 1964',
    actShortTitle: 'Karnataka Land Revenue Act 1964',
    actNumber: 'Karnataka Act 12 of 1964',
    year: 1964,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2485',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'lease_tenancy'
  },
  'karnataka_transparency_in_public_procurements_act_1999.pdf': {
    actName: 'The Karnataka Transparency in Public Procurements Act, 1999',
    actShortTitle: 'Karnataka Procurement Act 1999',
    actNumber: 'Karnataka Act 14 of 2000',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7000?view_type=browse',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'general_contract'
  }
};

/**
 * Parses raw text extracted from an official statutory PDF document page-by-page
 */
export function parsePdfExtractedText(
  rawText: string,
  filename: string,
  pageCount: number,
  sha256: string,
  fileSizeBytes: number
): IngestedChunk[] {
  const meta = ACT_METADATA_MAP[filename] || {
    actName: filename,
    actShortTitle: filename,
    actNumber: 'Unknown Act',
    year: 2000,
    jurisdiction: filename.includes('karnataka') ? 'KARNATAKA' : 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in',
    sourceDomain: 'www.indiacode.nic.in',
    category: 'general_contract'
  };

  // Split by page markers
  const pageSegments = rawText.split(/\n\s*--\s*(\d+)\s*of\s*\d+\s*--\s*\n/i);
  
  const pages: { pageNum: number; lines: string[] }[] = [];
  if (pageSegments.length > 1) {
    for (let i = 0; i < pageSegments.length; i++) {
      const seg = pageSegments[i];
      if (/^\d+$/.test(seg.trim())) {
        const pageNum = parseInt(seg.trim(), 10);
        const textContent = pageSegments[i + 1] || '';
        pages.push({ pageNum, lines: textContent.split('\n') });
        i++;
      }
    }
  }

  if (pages.length === 0) {
    pages.push({ pageNum: 1, lines: rawText.split('\n') });
  }

  const chunks: IngestedChunk[] = [];
  let currentChapter = 'Preliminary';

  // Section Header Regex for official Indian Code and Karnataka Gazette PDF layouts:
  // Handles "10. What agreements...", "12A. Pre-Institution...", "Article 30.", "Sec. 10", "105. Lease defined", etc.
  const sectionHeaderRegex = /^(?:Section|SECTION|Sec\.|SEC\.|Article|ARTICLE)?\s*\[?([0-9]{1,3}[A-Z]?(?:\-[A-Z])?(?:\([0-9A-Za-z]+\))?)\]?\.\s*(.+)$/i;

  let isInsideArrangement = false;
  let currentSectionNumber = '';
  let currentSectionTitle = '';
  let currentPages: Set<number> = new Set();
  let currentTextLines: string[] = [];

  const flushCurrentChunk = () => {
    if (currentSectionNumber && currentTextLines.length > 0) {
      const statuteText = currentTextLines.join(' ').replace(/\s+/g, ' ').trim();
      if (statuteText.length > 15) {
        const cleanSec = currentSectionNumber.replace(/\W+/g, '_').toLowerCase();
        const cleanAct = meta.actShortTitle.replace(/\W+/g, '_').toLowerCase();
        const chunkId = `${cleanAct}_sec_${cleanSec}`;

        const pageNumbers = Array.from(currentPages).sort((a, b) => a - b);
        const keywords = Array.from(new Set([
          meta.actShortTitle.toLowerCase(),
          currentSectionNumber.toLowerCase(),
          ...currentSectionTitle.toLowerCase().split(/\W+/),
          ...statuteText.toLowerCase().split(/\W+/).filter(w => w.length > 4)
        ])).slice(0, 15);

        chunks.push({
          id: chunkId,
          chunkId,
          actName: meta.actName,
          actShortTitle: meta.actShortTitle,
          actNumber: meta.actNumber,
          year: meta.year,
          chapter: currentChapter,
          sectionNumber: currentSectionNumber.toLowerCase().includes('article') ? currentSectionNumber : (currentSectionNumber.startsWith('Section') ? currentSectionNumber : `Section ${currentSectionNumber}`),
          sectionTitle: currentSectionTitle || `Provision under ${currentSectionNumber}`,
          statuteText,
          pageNumbers: pageNumbers.length > 0 ? pageNumbers : [1],
          jurisdiction: meta.jurisdiction,
          applicabilityCategory: meta.category,
          sourcePdfFilename: filename,
          sourceDocument: `${meta.actShortTitle} - Official Gazette PDF`,
          sourceUrl: meta.sourceUrl,
          sourceDomain: meta.sourceDomain,
          sourceType: 'PRIMARY_SOURCE_GOVERNMENT_PDF',
          sourceTier: 'Tier 1 (Official Government)',
          retrievalDate: '2026-08-16',
          sha256,
          pageCount,
          fileSizeBytes,
          keywords
        });
      }
    }
  };

  for (const page of pages) {
    for (let l = 0; l < page.lines.length; l++) {
      const line = page.lines[l].trim();
      if (!line) continue;

      if (line.includes('ARRANGEMENT OF SECTIONS')) {
        isInsideArrangement = true;
        continue;
      }

      if (isInsideArrangement) {
        if (line.startsWith('BE it enacted') || line.startsWith('An Act to') || line.includes('PREAMBLE') || (line.includes('CHAPTER') && !line.includes('ARRANGEMENT'))) {
          isInsideArrangement = false;
        } else {
          continue;
        }
      }

      if (/^(CHAPTER|PART|SCHEDULE)\s+[I|V|X|L|C|D|M|0-9A-Za-z\-]+/i.test(line)) {
        currentChapter = line;
        continue;
      }

      const match = line.match(sectionHeaderRegex);
      if (match) {
        const secNum = match[1];
        const secTitleCandidate = match[2] ? match[2].trim() : '';

        // Contextual validation: filter out table of contents lines, page footers, or subclause numbering
        const isNumeric = /^\d+[A-Z]?$/.test(secNum);
        if (isNumeric && secTitleCandidate.length > 2 && secTitleCandidate.length < 160) {
          // Split title from dash separator if present
          let title = secTitleCandidate;
          let bodyRest = '';
          const dashIdx = secTitleCandidate.search(/—|--|–/);
          if (dashIdx > 0) {
            title = secTitleCandidate.slice(0, dashIdx).trim();
            bodyRest = secTitleCandidate.slice(dashIdx + 1).trim();
          }

          flushCurrentChunk();

          currentSectionNumber = line.toLowerCase().includes('article') ? `Article ${secNum}` : secNum;
          currentSectionTitle = title;
          currentPages = new Set([page.pageNum]);
          currentTextLines = bodyRest ? [bodyRest] : [];
          continue;
        }
      }

      if (currentSectionNumber) {
        currentTextLines.push(line);
        currentPages.add(page.pageNum);
      }
    }
  }

  flushCurrentChunk();

  return chunks;
}

/**
 * Main PDF Ingestion Pipeline Engine
 */
export async function executePDFIngestionPipeline(): Promise<{
  report: IngestionReport;
  chunks: IngestedChunk[];
}> {
  const startTime = Date.now();
  console.log('================================================================================');
  console.log('⚡ KANOON PHASE 4C — OFFICIAL GOVERNMENT PDF INGESTION & PROVENANCE PIPELINE');
  console.log('================================================================================\n');

  const rawDir = path.resolve(process.cwd(), 'corpus/raw');
  const processedDir = path.resolve(process.cwd(), 'corpus/processed');

  if (!fs.existsSync(rawDir)) {
    throw new Error(`Corpus directory ${rawDir} does not exist. Ensure official government PDFs are present in corpus/raw.`);
  }

  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  const pdfFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.pdf'));
  console.log(`📂 Scanning corpus/raw... Found ${pdfFiles.length} official statutory PDF documents.\n`);

  if (pdfFiles.length === 0) {
    console.error('❌ FATAL ERROR: No PDF files found in corpus/raw.');
    process.exit(1);
  }

  const report: IngestionReport = {
    totalSourceDocuments: pdfFiles.length,
    totalPagesExtracted: 0,
    totalSectionsDetected: 0,
    totalChunksGenerated: 0,
    totalEmbeddingsGenerated: 0,
    extractionFailures: [],
    ingestionDurationMs: 0,
    sourceDocuments: []
  };

  const allChunks: IngestedChunk[] = [];
  const failures: string[] = [];

  for (const filename of pdfFiles) {
    const filePath = path.join(rawDir, filename);
    const dataBuffer = fs.readFileSync(filePath);
    const fileSizeBytes = dataBuffer.length;

    const sha256 = crypto.createHash('sha256').update(dataBuffer).digest('hex');

    try {
      const pdfParser = new PDFParse({ data: dataBuffer });
      const pdfData = await pdfParser.getText();

      const numPages = pdfData.total || (pdfData.pages ? pdfData.pages.length : 1);
      const charCount = pdfData.text ? pdfData.text.length : 0;
      report.totalPagesExtracted += numPages;

      const pdfChunks = parsePdfExtractedText(pdfData.text, filename, numPages, sha256, fileSizeBytes);
      
      if (pdfChunks.length === 0) {
        const errorMsg = `PDF ${filename} produced 0 extracted sections (Pages: ${numPages}, Extracted Chars: ${charCount}). Check section regex formatting.`;
        console.error(`❌ INGESTION FAILURE: ${errorMsg}`);
        failures.push(errorMsg);
        report.extractionFailures.push(errorMsg);
        continue;
      }

      report.totalSectionsDetected += pdfChunks.length;

      const actMeta = ACT_METADATA_MAP[filename];
      console.log(`📄 Ingested PDF: ${filename}`);
      console.log(`   • Act: ${actMeta?.actShortTitle || filename}`);
      console.log(`   • Pages: ${numPages} | File Size: ${(fileSizeBytes / 1024).toFixed(1)} KB | Extracted Chars: ${charCount}`);
      console.log(`   • Sections Extracted: ${pdfChunks.length} | SHA-256: ${sha256.slice(0, 16)}...`);
      console.log(`   • Official URL: ${actMeta?.sourceUrl || 'N/A'}\n`);

      for (const chunk of pdfChunks) {
        const textToEmbed = `${chunk.actName} ${chunk.sectionNumber} ${chunk.sectionTitle} ${chunk.statuteText} ${chunk.keywords.join(' ')}`;
        const embRes = await generateDenseEmbedding(textToEmbed);
        chunk.embeddingVector = embRes.vector;
        report.totalEmbeddingsGenerated++;
        allChunks.push(chunk);
      }

      report.sourceDocuments.push({
        filename,
        actShortTitle: actMeta?.actShortTitle || filename,
        jurisdiction: actMeta?.jurisdiction || 'CENTRAL',
        sourceUrl: actMeta?.sourceUrl || 'https://www.indiacode.nic.in',
        sha256,
        fileSizeBytes,
        charCount,
        sectionsExtracted: pdfChunks.length,
        pages: numPages
      });

      report.totalChunksGenerated += pdfChunks.length;
    } catch (err: any) {
      const failMsg = `Failure reading PDF file ${filename}: ${err.message}`;
      console.error(`❌ CRITICAL FAILURE reading PDF file ${filename}:`, err.message);
      failures.push(failMsg);
      report.extractionFailures.push(failMsg);
    }
  }

  report.ingestionDurationMs = Date.now() - startTime;

  if (failures.length > 0) {
    console.error('\n================================================================================');
    console.error('❌ INGESTION PIPELINE FAILED WITH ERRORS');
    console.error('================================================================================');
    failures.forEach(f => console.error(` • ${f}`));
    console.error('================================================================================\n');
    process.exit(1);
  }

  const processedOutputPath = path.join(processedDir, 'ingestedCorpus.json');
  fs.writeFileSync(processedOutputPath, JSON.stringify(allChunks, null, 2));

  console.log('================================================================================');
  console.log('📊 OFFICIAL INGESTION SUMMARY REPORT');
  console.log('================================================================================');
  console.log(`• Total Official Source Documents (PDFs): ${report.totalSourceDocuments}`);
  console.log(`• Total PDF Pages Extracted: ${report.totalPagesExtracted}`);
  console.log(`• Total Legal Sections Detected: ${report.totalSectionsDetected}`);
  console.log(`• Total Section Chunks Generated: ${report.totalChunksGenerated}`);
  console.log(`• Total 384D ONNX Embeddings Generated: ${report.totalEmbeddingsGenerated}`);
  console.log(`• Extraction Failures: ${report.extractionFailures.length}`);
  console.log(`• Pipeline Ingestion Duration: ${report.ingestionDurationMs} ms`);
  console.log(`• Persisted Corpus Output: ${processedOutputPath}`);
  console.log('================================================================================\n');

  return { report, chunks: allChunks };
}

if (process.argv[1] && process.argv[1].endsWith('ingestLegalCorpus.ts')) {
  executePDFIngestionPipeline().catch(err => {
    console.error('Fatal Ingestion Pipeline Error:', err);
    process.exit(1);
  });
}
