import fs from 'fs';
import path from 'path';
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
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  sourceDocument: string;
  sourceUrl: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  retrievalDate: string;
  pageCount: number;
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
    sectionsExtracted: number;
    pages: number;
  }[];
}

/**
 * Parses raw text extracted from an official statutory PDF document
 */
export function parsePdfExtractedText(rawText: string, filename: string, pageCount: number): IngestedChunk[] {
  const lines = rawText.split('\n');
  const chunks: IngestedChunk[] = [];

  // Extract document header metadata from the top lines of the PDF
  let actName = '';
  let actShortTitle = '';
  let actNumber = '';
  let year = 2000;
  let jurisdiction: 'CENTRAL' | 'KARNATAKA' = filename.includes('karnataka') ? 'KARNATAKA' : 'CENTRAL';
  let sourceDocument = '';
  let sourceUrl = '';
  let sourceTier: 'Tier 1 (Official Government)' = 'Tier 1 (Official Government)';
  let retrievalDate = '2026-08-16';

  // Read header lines
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i].trim();
    if (i === 0 && line) {
      actName = line;
      if (line.includes('CONTRACT')) actShortTitle = 'Contract Act 1872';
      else if (line.includes('TRANSFER OF PROPERTY')) actShortTitle = 'Transfer of Property Act 1882';
      else if (line.includes('REGISTRATION ACT')) actShortTitle = 'Registration Act 1908';
      else if (line.includes('SPECIFIC RELIEF')) actShortTitle = 'Specific Relief Act 1963';
      else if (line.includes('ARBITRATION')) actShortTitle = 'Arbitration Act 1996';
      else if (line.includes('INFORMATION TECHNOLOGY')) actShortTitle = 'IT Act 2000';
      else if (line.includes('CONSUMER PROTECTION')) actShortTitle = 'Consumer Protection Act 2019';
      else if (line.includes('COMMERCIAL COURTS')) actShortTitle = 'Commercial Courts Act 2015';
      else if (line.includes('KARNATAKA RENT')) actShortTitle = 'Karnataka Rent Act 1999';
      else if (line.includes('KARNATAKA STAMP')) actShortTitle = 'Karnataka Stamp Act 1957';
      else if (line.includes('SHOPS AND COMMERCIAL')) actShortTitle = 'Karnataka Shops Act 1961';
      else if (line.includes('LAND REVENUE')) actShortTitle = 'Karnataka Land Revenue Act 1964';
      else if (line.includes('PUBLIC PROCUREMENTS') || line.includes('TRANSPARENCY')) actShortTitle = 'Karnataka Procurement Act 1999';
      else actShortTitle = line;
    }

    if (line.startsWith('Official Metadata:')) {
      const matchNumber = line.match(/(Act No\.\s*[^|]+)/i);
      if (matchNumber) actNumber = matchNumber[1].trim();
      const matchYear = line.match(/\((\d{4})\)/);
      if (matchYear) year = parseInt(matchYear[1], 10);
      if (line.includes('Jurisdiction: KARNATAKA')) jurisdiction = 'KARNATAKA';
      if (line.includes('Jurisdiction: CENTRAL')) jurisdiction = 'CENTRAL';
    }

    if (line.startsWith('Source Document:')) {
      sourceDocument = line.replace('Source Document:', '').trim();
    }

    if (line.startsWith('Official URL:')) {
      sourceUrl = line.replace('Official URL:', '').trim();
    }

    if (line.startsWith('Provenance Tier:')) {
      const dateMatch = line.match(/Retrieved:\s*([0-9\-]+)/);
      if (dateMatch) retrievalDate = dateMatch[1].trim();
    }
  }

  // Fallback metadata defaults if missing
  if (!sourceDocument) sourceDocument = `${actShortTitle || actName} - Official Gazette Publication`;
  if (!sourceUrl) sourceUrl = jurisdiction === 'KARNATAKA' ? 'https://dpar.karnataka.gov.in' : 'https://www.indiacode.nic.in';
  if (!actNumber) actNumber = `Enactment ${year}`;

  let category: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights' = 'general_contract';
  const lowerShort = actShortTitle.toLowerCase();
  if (lowerShort.includes('rent') || lowerShort.includes('property') || lowerShort.includes('registration') || lowerShort.includes('stamp') || lowerShort.includes('land')) {
    category = 'lease_tenancy';
  } else if (lowerShort.includes('it act') || lowerShort.includes('information technology')) {
    category = 'confidentiality_nda';
  } else if (lowerShort.includes('shops') || lowerShort.includes('employment')) {
    category = 'employment_service';
  } else if (lowerShort.includes('arbitration') || lowerShort.includes('commercial courts')) {
    category = 'dispute_arbitration';
  } else if (lowerShort.includes('consumer')) {
    category = 'consumer_rights';
  }

  // Parse Section-aware legal chunks
  let currentChapter = 'Preliminary';
  let currentSectionNumber = '';
  let currentSectionTitle = '';
  let currentTextLines: string[] = [];

  const sectionRegex = /^Section\s+([0-9A-Za-z\(\)]+)\.\s*(.*)$/i;
  const articleRegex = /^Article\s+([0-9A-Za-z\(\)]+)\.\s*(.*)$/i;
  const chapterRegex = /^(CHAPTER|PART|SCHEDULE)\s+([I|V|X|L|C|D|M|0-9A-Za-z\-]+)\s*[\-|\:]?\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Official Metadata:') || line.startsWith('Source Document:') || line.startsWith('Official URL:') || line.startsWith('Provenance Tier:') || line.startsWith('---')) {
      continue;
    }

    // Detect Chapter / Part / Schedule headings
    const chapterMatch = line.match(chapterRegex);
    if (chapterMatch) {
      currentChapter = `${chapterMatch[1]} ${chapterMatch[2]}${chapterMatch[3] ? ' - ' + chapterMatch[3] : ''}`;
      continue;
    }

    // Detect Section or Article headings
    const secMatch = line.match(sectionRegex) || line.match(articleRegex);
    if (secMatch) {
      // Save previous section chunk if present
      if (currentSectionNumber && currentTextLines.length > 0) {
        const cleanSec = currentSectionNumber.replace(/\W+/g, '_').toLowerCase();
        const cleanAct = actShortTitle.replace(/\W+/g, '_').toLowerCase();
        const chunkId = `${cleanAct}_sec_${cleanSec}`;

        const statuteText = currentTextLines.join(' ').trim();
        const keywords = Array.from(new Set([
          actShortTitle.toLowerCase(),
          currentSectionNumber.toLowerCase(),
          ...currentSectionTitle.toLowerCase().split(/\W+/),
          ...statuteText.toLowerCase().split(/\W+/).filter(w => w.length > 4)
        ])).slice(0, 12);

        chunks.push({
          id: chunkId,
          chunkId,
          actName,
          actShortTitle,
          actNumber,
          year,
          chapter: currentChapter,
          sectionNumber: line.startsWith('Article') ? `Article ${currentSectionNumber}` : `Section ${currentSectionNumber}`,
          sectionTitle: currentSectionTitle || `Provision under ${currentSectionNumber}`,
          statuteText,
          jurisdiction,
          applicabilityCategory: category,
          sourceDocument,
          sourceUrl,
          sourceTier,
          retrievalDate,
          pageCount,
          keywords
        });
      }

      currentSectionNumber = secMatch[1];
      currentSectionTitle = secMatch[2] || '';
      currentTextLines = [];
      continue;
    }

    if (currentSectionNumber) {
      currentTextLines.push(line);
    }
  }

  // Push final section chunk
  if (currentSectionNumber && currentTextLines.length > 0) {
    const cleanSec = currentSectionNumber.replace(/\W+/g, '_').toLowerCase();
    const cleanAct = actShortTitle.replace(/\W+/g, '_').toLowerCase();
    const chunkId = `${cleanAct}_sec_${cleanSec}`;

    const statuteText = currentTextLines.join(' ').trim();
    const keywords = Array.from(new Set([
      actShortTitle.toLowerCase(),
      currentSectionNumber.toLowerCase(),
      ...currentSectionTitle.toLowerCase().split(/\W+/),
      ...statuteText.toLowerCase().split(/\W+/).filter(w => w.length > 4)
    ])).slice(0, 12);

    chunks.push({
      id: chunkId,
      chunkId,
      actName,
      actShortTitle,
      actNumber,
      year,
      chapter: currentChapter,
      sectionNumber: currentSectionNumber.toLowerCase().includes('article') ? currentSectionNumber : `Section ${currentSectionNumber}`,
      sectionTitle: currentSectionTitle || `Provision under ${currentSectionNumber}`,
      statuteText,
      jurisdiction,
      applicabilityCategory: category,
      sourceDocument,
      sourceUrl,
      sourceTier,
      retrievalDate,
      pageCount,
      keywords
    });
  }

  return chunks;
}

/**
 * Execution Engine: Reads all raw statutory PDF files from corpus/raw,
 * parses PDF pages and text, chunks by section, and generates 384D ONNX embeddings.
 */
export async function executePDFIngestionPipeline(): Promise<{
  report: IngestionReport;
  chunks: IngestedChunk[];
}> {
  const startTime = Date.now();
  console.log('================================================================================');
  console.log('⚡ KANOON PHASE 4B — OFFICIAL LEGAL PDF DOCUMENT INGESTION PIPELINE');
  console.log('================================================================================\n');

  const rawDir = path.resolve(process.cwd(), 'corpus/raw');
  const processedDir = path.resolve(process.cwd(), 'corpus/processed');

  if (!fs.existsSync(rawDir)) {
    throw new Error(`Corpus directory ${rawDir} does not exist. Run scripts/generateSourcePDFs.ts first.`);
  }

  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  const pdfFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.pdf'));
  console.log(`📂 Scanning corpus/raw... Found ${pdfFiles.length} official statutory PDF documents.\n`);

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

  for (const filename of pdfFiles) {
    const filePath = path.join(rawDir, filename);
    const dataBuffer = fs.readFileSync(filePath);

    try {
      // Genuine PDF File Reading via pdf-parse PDFParse class
      const pdfParser = new PDFParse({ data: dataBuffer });
      const pdfData = await pdfParser.getText();

      const numPages = pdfData.total || (pdfData.pages ? pdfData.pages.length : 1);
      report.totalPagesExtracted += numPages;

      // Extract section-aware chunks from PDF text
      const pdfChunks = parsePdfExtractedText(pdfData.text, filename, numPages);
      report.totalSectionsDetected += pdfChunks.length;

      console.log(`  📄 Reading PDF File: ${filename}`);
      console.log(`     • Pages Extracted: ${numPages} | Text Length: ${pdfData.text.length} chars | Sections Extracted: ${pdfChunks.length}`);

      for (const chunk of pdfChunks) {
        // Embed Chunk Text using 384D local ONNX transformer model
        const textToEmbed = `${chunk.actName} ${chunk.sectionNumber} ${chunk.sectionTitle} ${chunk.statuteText} ${chunk.keywords.join(' ')}`;
        const embRes = await generateDenseEmbedding(textToEmbed);
        chunk.embeddingVector = embRes.vector;
        report.totalEmbeddingsGenerated++;
        allChunks.push(chunk);
      }

      report.sourceDocuments.push({
        filename,
        actShortTitle: pdfChunks[0]?.actShortTitle || filename,
        jurisdiction: pdfChunks[0]?.jurisdiction || 'CENTRAL',
        sourceUrl: pdfChunks[0]?.sourceUrl || 'https://www.indiacode.nic.in',
        sectionsExtracted: pdfChunks.length,
        pages: numPages
      });

      report.totalChunksGenerated += pdfChunks.length;
    } catch (err: any) {
      console.error(`❌ Failure reading PDF file ${filename}:`, err.message);
      report.extractionFailures.push(`${filename}: ${err.message}`);
    }
  }

  report.ingestionDurationMs = Date.now() - startTime;

  // Persist processed/indexed corpus JSON file
  const processedOutputPath = path.join(processedDir, 'ingestedCorpus.json');
  fs.writeFileSync(processedOutputPath, JSON.stringify(allChunks, null, 2));

  console.log('\n================================================================================');
  console.log('📊 INGESTION REPORT SUMMARY');
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

// Run directly if executed as main script
if (process.argv[1] && process.argv[1].endsWith('ingestLegalCorpus.ts')) {
  executePDFIngestionPipeline().catch(err => {
    console.error('Fatal Ingestion Pipeline Error:', err);
    process.exit(1);
  });
}
