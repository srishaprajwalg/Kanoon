import ingestedCorpusData from '../../corpus/processed/ingestedCorpus.json';

export interface CorpusItem {
  id: string;
  chunkId?: string;
  actName: string;
  actShortTitle: string;
  actNumber?: string;
  year?: number;
  chapter?: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  pageNumbers?: number[];
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourcePdfFilename?: string;
  sourceUrl?: string;
  pdfUrl?: string;
  sourceDomain?: string;
  sourceDocument?: string;
  sourceType?: 'PRIMARY_SOURCE_GOVERNMENT_PDF';
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  retrievalDate?: string;
  effectiveDate?: string;
  sha256?: string;
  pageCount?: number;
  fileSizeBytes?: number;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  keywords: string[];
  embeddingVector?: number[];
}

/**
 * Authoritative Indian Legal Corpus loaded from Persisted Official Ingested Document JSON
 * Source of Truth: PDF Statutory Documents ingested via pdf-parse & section-aware parser
 */
export const INDIAN_LEGAL_CORPUS: CorpusItem[] = ingestedCorpusData as CorpusItem[];
