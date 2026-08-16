import fs from 'fs';
import path from 'path';
import { generateDenseEmbedding } from '../src/services/embeddingService.js';

export interface RawStatutoryInput {
  rawText: string;
  actName: string;
  actShortTitle: string;
  actNumber: string;
  year: number;
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  sourceUrl: string;
  sourceDocument: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  keywords: string[];
}

export interface IngestedChunk {
  id: string;
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
  sourceUrl: string;
  sourceDocument: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  keywords: string[];
  embeddingVector?: number[];
}

/**
 * Robust Statutory Parser: Extracts sections, chapters, titles, and legal text from raw statutory documents
 */
export function parseStatutoryText(input: RawStatutoryInput): IngestedChunk[] {
  const chunks: IngestedChunk[] = [];
  const lines = input.rawText.split('\n');

  let currentChapter = 'General';
  let currentSectionNumber = '';
  let currentSectionTitle = '';
  let currentStatuteTextLines: string[] = [];

  const sectionRegex = /^(?:Section|Sec\.|Rule|Article)\s+([0-9]+[A-Z]?(?:\([0-9a-z]+\))?)\s*[\.\:\-]?\s*(.*)$/i;
  const chapterRegex = /^CHAPTER\s+([I|V|X|L|C|D|M|0-9]+)\s*[\.\:\-]?\s*(.*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect Chapter headings
    const chapterMatch = trimmed.match(chapterRegex);
    if (chapterMatch) {
      currentChapter = `Chapter ${chapterMatch[1]}${chapterMatch[2] ? ' - ' + chapterMatch[2] : ''}`;
      continue;
    }

    // Detect Section headings
    const sectionMatch = trimmed.match(sectionRegex);
    if (sectionMatch) {
      // Save previous section if present
      if (currentSectionNumber && currentStatuteTextLines.length > 0) {
        const chunkId = `${input.actShortTitle.toLowerCase().replace(/\W+/g, '_')}_sec_${currentSectionNumber.toLowerCase().replace(/\W+/g, '_')}`;
        chunks.push({
          id: chunkId,
          actName: input.actName,
          actShortTitle: input.actShortTitle,
          actNumber: input.actNumber,
          year: input.year,
          chapter: currentChapter,
          sectionNumber: `Section ${currentSectionNumber}`,
          sectionTitle: currentSectionTitle || `Provision under ${currentSectionNumber}`,
          statuteText: currentStatuteTextLines.join(' ').trim(),
          jurisdiction: input.jurisdiction,
          applicabilityCategory: input.applicabilityCategory,
          sourceUrl: input.sourceUrl,
          sourceDocument: input.sourceDocument,
          sourceTier: input.sourceTier,
          keywords: Array.from(new Set([...input.keywords, currentSectionNumber.toLowerCase(), ...currentSectionTitle.toLowerCase().split(/\W+/)]))
        });
      }

      currentSectionNumber = sectionMatch[1];
      currentSectionTitle = sectionMatch[2] || '';
      currentStatuteTextLines = [];
      continue;
    }

    if (currentSectionNumber) {
      currentStatuteTextLines.push(trimmed);
    }
  }

  // Push final section
  if (currentSectionNumber && currentStatuteTextLines.length > 0) {
    const chunkId = `${input.actShortTitle.toLowerCase().replace(/\W+/g, '_')}_sec_${currentSectionNumber.toLowerCase().replace(/\W+/g, '_')}`;
    chunks.push({
      id: chunkId,
      actName: input.actName,
      actShortTitle: input.actShortTitle,
      actNumber: input.actNumber,
      year: input.year,
      chapter: currentChapter,
      sectionNumber: `Section ${currentSectionNumber}`,
      sectionTitle: currentSectionTitle || `Provision under ${currentSectionNumber}`,
      statuteText: currentStatuteTextLines.join(' ').trim(),
      jurisdiction: input.jurisdiction,
      applicabilityCategory: input.applicabilityCategory,
      sourceUrl: input.sourceUrl,
      sourceDocument: input.sourceDocument,
      sourceTier: input.sourceTier,
      keywords: Array.from(new Set([...input.keywords, currentSectionNumber.toLowerCase(), ...currentSectionTitle.toLowerCase().split(/\W+/)]))
    });
  }

  return chunks;
}

/**
 * Main Execution Function for Ingestion & Vector Embedding Generation
 */
export async function runIngestionPipeline(inputs: RawStatutoryInput[]): Promise<{
  totalChunks: number;
  totalEmbeddings: number;
  ingestionDurationMs: number;
  chunks: IngestedChunk[];
}> {
  const startTime = Date.now();
  console.log('⚡ Starting Kanoon Phase 4A Legal Ingestion & 384D Embedding Pipeline...');

  const allChunks: IngestedChunk[] = [];
  let totalEmbeddings = 0;

  for (const input of inputs) {
    const parsedChunks = parseStatutoryText(input);
    console.log(`  📄 Processing Document: ${input.actShortTitle} (${input.jurisdiction}) -> ${parsedChunks.length} chunks extracted.`);

    for (const chunk of parsedChunks) {
      const textToEmbed = `${chunk.actName} ${chunk.sectionNumber} ${chunk.sectionTitle} ${chunk.statuteText} ${chunk.keywords.join(' ')}`;
      const embRes = await generateDenseEmbedding(textToEmbed);
      chunk.embeddingVector = embRes.vector;
      totalEmbeddings++;
      allChunks.push(chunk);
    }
  }

  const ingestionDurationMs = Date.now() - startTime;
  console.log(`✅ Pipeline Ingestion Complete: ${allChunks.length} total chunks ingested with ${totalEmbeddings} 384D ONNX vectors in ${ingestionDurationMs}ms.`);

  return {
    totalChunks: allChunks.length,
    totalEmbeddings,
    ingestionDurationMs,
    chunks: allChunks
  };
}
