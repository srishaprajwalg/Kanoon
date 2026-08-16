export type ActiveTab = 'drafter' | 'simplifier' | 'database' | 'experts' | 'presentation';

export interface LegalParty {
  name: string;
  type: 'individual' | 'business';
  address: string;
  contact: string;
  panOrGst?: string;
}

export interface DocumentFormData {
  templateId: string;
  documentTitle: string;
  partyA: LegalParty;
  partyB: LegalParty;
  effectiveDate: string;
  state: string;
  city: string;
  durationMonths: number;
  financialAmount: number;
  securityDeposit?: number;
  noticePeriodDays: number;
  lockInPeriodMonths?: number;
  governingLawState: string;
  disputeResolution: 'Arbitration' | 'Courts' | 'Mutual Conciliation';
  customClauses: string[];
  additionalNotes?: string;
  usePlainLanguage: boolean;
}

export interface MissingFieldWarning {
  fieldKey: string;
  fieldName: string;
  importance: 'critical' | 'recommended' | 'optional';
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  isComplete: boolean;
  score: number; // 0 to 100
  missingFields: MissingFieldWarning[];
  recommendations: string[];
  hasSufficientEvidence?: boolean;
  evidenceWarning?: string;
}

export interface LegalStatuteCitation {
  id: string;
  actName: string;
  actShortTitle: string;
  actNumber?: string;
  year?: number;
  chapter?: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  relevanceExplanation: string;
  applicabilityTag: string;
  jurisdiction?: string;
  sourceUrl?: string; // India Code Official URI
  effectiveDate?: string;
  confidenceScore?: number; // 0.0 to 1.0
  similarityScore?: number; // Cosine similarity score (e.g. 0.87)
  confidenceLevel?: 'High' | 'Medium' | 'Low';
  evidenceStrength?: 'Strong' | 'Moderate' | 'Weak';
  whyThisClause?: string; // Metadata-derived retrieval rationale
}

export interface ClauseAnalysis {
  id?: string;
  clauseTitle: string;
  legaleseText: string;
  plainLanguageText: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskExplanation: string;
  recommendation: string;
  saferAlternative?: string;
  citation?: LegalStatuteCitation;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  templateType: string;
  createdAt: string;
  state: string;
  draftText: string;
  plainSummaryText: string;
  clauses: ClauseAnalysis[];
  riskScore: number; // 0 to 100 (higher = safer)
  completenessScore: number;
  stampDutyRequired: string;
  notarizationRequired: boolean;
  registrationRequired: boolean;
  legalActReferences: string[];
  citations: LegalStatuteCitation[];
  validationWarnings: MissingFieldWarning[];
  disclaimer: string;
  hasSufficientEvidence?: boolean;
  evidenceWarning?: string;
}

export interface AdvocateProfile {
  id: string;
  name: string;
  title: string;
  experienceYears: number;
  city: string;
  state: string;
  specialization: string[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  avatarUrl: string;
  barCouncilNumber: string;
  isAvailable: boolean;
}

export interface LegalActInfo {
  id: string;
  title: string;
  shortTitle: string;
  year: number;
  category: string;
  summary: string;
  keySections: {
    section: string;
    title: string;
    explanation: string;
  }[];
  impactForSmallBiz: string;
}

export interface StampDutyInfo {
  state: string;
  rentAgreementRate: string;
  ndaRate: string;
  serviceAgreementRate: string;
  registrationMandatoryThreshold: string;
  notes: string;
}

export interface LegalTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  popularIn: string;
  iconName: string;
  estimatedTime: string;
  defaultFormData: Partial<DocumentFormData>;
}
