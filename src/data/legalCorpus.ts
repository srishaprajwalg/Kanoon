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
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourceUrl?: string; // India Code / Karnataka Govt Official URI
  sourceDocument?: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  retrievalDate?: string;
  effectiveDate?: string;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  keywords: string[];
  embeddingVector?: number[]; // Pre-calculated normalized 384D dense embedding weights
}

/**
 * Authoritative Indian Legal Corpus loaded from Persisted Official Ingested Document JSON
 * Source of Truth: PDF Statutory Documents ingested via pdf-parse & section-aware parser
 */
export const INDIAN_LEGAL_CORPUS: CorpusItem[] = ingestedCorpusData as CorpusItem[];
