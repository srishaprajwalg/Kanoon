export type ActiveTab = 'drafter' | 'review' | 'simplifier' | 'database' | 'experts' | 'presentation';

export interface LegalParty {
  name: string;
  type: 'individual' | 'business';
  address: string;
  contact: string;
  panOrGst?: string;
}

export interface ParameterOption {
  key: string;
  label: string;
  type: 'select' | 'number' | 'text';
  defaultValue: string | number;
  options?: { label: string; value: string | number }[];
}

export interface ClauseLibraryItem {
  id: string;
  name: string;
  category: 'Confidentiality' | 'IP' | 'Liability' | 'Dispute' | 'Termination' | 'Payment' | 'General';
  shortDescription: string;
  plainEnglishExplanation: string;
  whyItMatters: string;
  applicableDocumentTypes: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  defaultClauseText: string;
  parameters?: ParameterOption[];
  relatedStatuteKeywords?: string[];
}

export interface CustomUserClause {
  id: string;
  title: string;
  category: string;
  clauseText: string;
}

export interface SelectedClauseConfig {
  clauseId: string;
  isCustom: boolean;
  title: string;
  category: string;
  clauseText: string;
  paramValues?: Record<string, string | number>;
  sourceType: 'statutory' | 'recommended' | 'user_custom';
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
  selectedClauseConfigs?: SelectedClauseConfig[];
  customUserClauses?: CustomUserClause[];
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
  sourceUrl?: string; // India Code Official Webpage URI
  pdfUrl?: string; // Direct Official Statutory PDF Download URL
  sourcePdfFilename?: string; // Official Raw PDF Filename in Corpus
  effectiveDate?: string;
  confidenceScore?: number; // 0.0 to 1.0
  similarityScore?: number; // Cosine similarity score (e.g. 0.87)
  confidenceLevel?: 'High' | 'Medium' | 'Low';
  evidenceStrength?: 'Strong' | 'Moderate' | 'Weak';
  whyThisClause?: string; // Metadata-derived retrieval rationale
  sourceTier?: string; // e.g. Tier 1 (Official Government), Tier 2 (Official Gazette)
  sourceDocument?: string;
  pageNumbers?: number[];
  sha256?: string;
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
  clauseSourceType?: 'statutory' | 'recommended' | 'user_custom';
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
  recommendations?: string[];
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
  isSupported?: boolean;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  filename: string;
  mimeType: string;
  pages: ExtractedPage[];
}

export interface ParsedClause {
  id: string;
  sectionNumber?: string;
  heading: string;
  originalText: string;
  pageNumber: number;
}

export interface ReviewedClauseAnalysis extends ParsedClause {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  plainExplanation: string;
  riskExplanation: string;
  saferAlternative?: string;
  citations: LegalStatuteCitation[];
  hasSufficientEvidence: boolean;
  evidenceWarning?: string;
}

export interface DocumentReviewIssue {
  id: string;
  title: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  clauseId?: string;
  recommendation: string;
}

export interface MissingClauseInfo {
  clauseType: string;
  importance: 'critical' | 'recommended' | 'standard';
  explanation: string;
  suggestedTemplate: string;
}

export interface DocumentInconsistencyInfo {
  issueTitle: string;
  explanation: string;
  conflictingClauses: string[];
}

export interface DocumentTypeResult {
  documentType: string;
  label: string;
  confidence: number;
}

export interface DocumentReviewReport {
  documentType: string;
  documentTypeLabel: string;
  documentTypeConfidence: number;
  pageCount: number;
  clauseCount: number;
  overallRiskScore: number; // 0-100 (100 = completely safe, lower = higher risk)
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executiveSummary: string;
  criticalIssues: DocumentReviewIssue[];
  highRiskIssues: DocumentReviewIssue[];
  mediumRiskIssues: DocumentReviewIssue[];
  missingClauses: MissingClauseInfo[];
  inconsistencies: DocumentInconsistencyInfo[];
  clauses: ReviewedClauseAnalysis[];
  complianceGuidance: string[];
  citations: LegalStatuteCitation[];
  hasSufficientEvidence?: boolean;
}

export interface LegalRiskBriefIssueItem {
  id: string;
  clauseTitle?: string;
  clauseNumber?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  plainEnglishExplanation: string;
  recommendedAction: string;
  saferAlternative?: string;
  citations: LegalStatuteCitation[];
}

export interface LegalRiskBriefMissingItem {
  clauseType: string;
  importance: 'critical' | 'recommended' | 'standard';
  whyItMatters: string;
  recommendedAction: string;
}

export interface LegalRiskBriefInconsistencyItem {
  issueTitle: string;
  explanation: string;
  recommendedAction: string;
  conflictingClauses: string[];
}

export interface LegalRiskBrief {
  id: string;
  createdAt: string;
  sourceType: 'drafted' | 'uploaded';
  documentTitle: string;
  documentType: string;
  jurisdiction: string;
  parties?: {
    partyA?: string;
    partyB?: string;
  };
  executiveSummary: {
    summaryText: string;
    overallRiskScore: number; // 0 - 100
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  criticalIssues: LegalRiskBriefIssueItem[];
  missingProvisions: LegalRiskBriefMissingItem[];
  inconsistencies: LegalRiskBriefInconsistencyItem[];
  citations: LegalStatuteCitation[];
  hasSufficientEvidence: boolean;
  evidenceWarning?: string;
  recommendedQuestions: string[];
  userNotes?: string;
  selectedAdvocate?: AdvocateProfile;
  handoffStatus: 'ai_completed' | 'professional_review_recommended' | 'advocate_assigned';
  disclaimer: string;
}


