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
  additionalNotes: string;
  usePlainLanguage: boolean;
}

export interface ClauseAnalysis {
  clauseTitle: string;
  legaleseText: string;
  plainLanguageText: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskExplanation: string;
  recommendation: string;
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
  riskScore: number; // 0 to 100 (100 = very safe)
  stampDutyRequired: string;
  notarizationRequired: boolean;
  registrationRequired: boolean;
  legalActReferences: string[];
}

export interface LegalTemplate {
  id: string;
  name: string;
  category: 'Property & Rent' | 'Business & Startup' | 'Employment & Work' | 'Notices & Disputes';
  description: string;
  popularIn: string;
  iconName: string;
  estimatedTime: string;
  defaultFormData: Partial<DocumentFormData>;
}

export interface LegalActInfo {
  id: string;
  title: string;
  shortTitle: string;
  year: number;
  category: string;
  summary: string;
  keySections: { section: string; title: string; explanation: string }[];
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

export interface PresentationSlide {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}
