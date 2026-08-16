import type { DocumentFormData, GeneratedDocument, ClauseAnalysis, ValidationResult } from '../types';
import { LegalRAGEngine } from './ragEngine';
import { STAMP_DUTY_GUIDE } from '../data/stampDutyData';

const BACKEND_API_BASE = 'http://localhost:5000/api';

export class KanoonAIService {

  /**
   * Validates document inputs before generation
   */
  public static async validateInputs(formData: DocumentFormData): Promise<ValidationResult> {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/validate-inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_err) {
      // Fallback to client-side RAG validator if backend unreachable
    }
    return LegalRAGEngine.validateDocumentInputs(formData);
  }

  /**
   * Drafts an AI-powered legal document grounded in authentic Indian statutes
   */
  public static async generateDocument(
    formData: DocumentFormData,
    _apiKey?: string
  ): Promise<GeneratedDocument> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (_err) {
      console.warn('Backend API unreachable, utilizing client-side RAG engine');
    }

    // Client-side RAG Fallback
    const validation = LegalRAGEngine.validateDocumentInputs(formData);
    const citations = LegalRAGEngine.retrieveCitationsForDocument(formData);
    const stampInfo = STAMP_DUTY_GUIDE.find(
      s => s.state.toLowerCase() === formData.state.toLowerCase()
    ) || STAMP_DUTY_GUIDE[0];

    const partyAName = formData.partyA.name || 'First Party';
    const partyBName = formData.partyB.name || 'Second Party';
    const amountFormatted = formData.financialAmount > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.financialAmount)
      : 'Non-monetary Consideration';

    const depositFormatted = formData.securityDeposit && formData.securityDeposit > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.securityDeposit)
      : 'N/A';

    // Build specialized rider text section
    let customRiderSection = '';
    const selectedConfigs = formData.selectedClauseConfigs || [];
    if (selectedConfigs.length > 0) {
      customRiderSection = '\n\n5. SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES:\n' +
        selectedConfigs.map((c, i) => `5.${i + 1} [${c.category.toUpperCase()}] ${c.title.toUpperCase()}: ${c.clauseText}`).join('\n\n');
    } else if (formData.customClauses && formData.customClauses.length > 0) {
      customRiderSection = '\n\n5. CUSTOM AGREED TERMS:\n' +
        formData.customClauses.map((c, i) => `${i + 1}. ${c}`).join('\n');
    }

    let draftText = '';
    if (formData.templateId === 'rent_agreement') {
      draftText = `RESIDENTIAL LEAVE AND LICENSE AGREEMENT
(Drafted under Indian Contract Act 1872 & Transfer of Property Act 1882)

THIS LEAVE AND LICENSE AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("Licensor / Owner"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

AND:
${partyBName.toUpperCase()} ("Licensee / Tenant"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

1. GRANT OF LICENSE & TENURE:
The Licensor hereby permits the Licensee to occupy the residential premises situated at ${formData.city}, ${formData.state} for a period of ${formData.durationMonths} months starting ${formData.effectiveDate}.

2. MONTHLY LICENSE FEE & SECURITY DEPOSIT:
- Monthly Rent: ${amountFormatted} payable on or before the 5th day of every calendar month.
- Refundable Security Deposit: ${depositFormatted}. Refunded within 7 days of key handover, less legitimate utility arrears.

3. LOCK-IN PERIOD & TERMINATION:
- Lock-in Period: ${formData.lockInPeriodMonths || 6} months. Neither party can terminate during lock-in without paying remaining rent.
- Notice Period: Post lock-in, either party may terminate by giving ${formData.noticePeriodDays} days advance written notice.

4. STATUTORY CITATIONS & REGISTRATION COMPLIANCE:
Grounded in ${citations.map(c => `${c.actShortTitle} (${c.sectionNumber})`).join(', ')}. Registration requirements and stamp duty depend on local state law.${customRiderSection}

6. DISPUTE RESOLUTION & GOVERNING LAW:
Governed by laws of ${formData.governingLawState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
LICENSOR                                     LICENSEE`;
    } else {
      draftText = `${formData.documentTitle.toUpperCase()}
(Grounded in ${citations.map(c => c.actShortTitle).join(', ')})

THIS AGREEMENT is entered into at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

PARTIES:
1. ${partyAName.toUpperCase()}, Address: ${formData.partyA.address || 'Address A'}.
2. ${partyBName.toUpperCase()}, Address: ${formData.partyB.address || 'Address B'}.

1. CONSIDERATION & OBLIGATIONS:
Agreed consideration of ${amountFormatted} over a duration of ${formData.durationMonths} months.

2. TERMINATION & NOTICE:
Either party may terminate by giving ${formData.noticePeriodDays} days written notice.${customRiderSection}

3. GOVERNING LAW & DISPUTES:
Governed by laws of ${formData.governingLawState}, India. Disputes resolved via ${formData.disputeResolution}.

_____________________________                _____________________________
FIRST PARTY                                  SECOND PARTY`;
    }

    const plainSummary = `📌 PLAIN ENGLISH SUMMARY FOR SIGNING PARTIES:
- Rent/Consideration: ${amountFormatted}
- Deposit: ${depositFormatted}
- Lock-in Period: ${formData.lockInPeriodMonths || 0} months
- Termination Notice: ${formData.noticePeriodDays} days written notice
- Customized Riders Included: ${selectedConfigs.length} special clauses
- Registration Note: Stamp duty and registration requirements depend on applicable state laws.`;

    const clauses: ClauseAnalysis[] = [
      {
        id: 'cl_1',
        clauseTitle: 'Tenure & State Registration Compliance',
        legaleseText: 'Governed by Section 107 of Transfer of Property Act 1882...',
        plainLanguageText: `Agreed tenure of ${formData.durationMonths} months. Registration mandates depend on local state law.`,
        riskLevel: 'low',
        riskExplanation: 'Standard legal tenure clause.',
        recommendation: 'Attach e-Stamp paper as prescribed by local state rules.',
        saferAlternative: 'Keep tenure at 11 months with optional mutual renewal clause.',
        citation: citations[0],
        clauseSourceType: 'statutory'
      },
      {
        id: 'cl_2',
        clauseTitle: 'Lock-in Period Commitment',
        legaleseText: 'Neither party shall be entitled to determine the license prior to the expiry of lock-in period...',
        plainLanguageText: `If exited before ${formData.lockInPeriodMonths || 6} months, rent until lock-in ends remains payable.`,
        riskLevel: 'medium',
        riskExplanation: 'Creates financial commitment if job or personal situation changes.',
        recommendation: 'Negotiate a shorter lock-in period (e.g. 3 months).',
        saferAlternative: 'Either party may terminate during lock-in period upon 30 days notice in case of official job transfer.',
        citation: citations[1] || citations[0],
        clauseSourceType: 'statutory'
      }
    ];

    // Add selected/custom clause rider analyses
    selectedConfigs.forEach((cfg, idx) => {
      const matchedCitation = citations.find(c =>
        c.statuteText.toLowerCase().includes(cfg.category.toLowerCase()) ||
        c.actShortTitle.toLowerCase().includes(cfg.category.toLowerCase())
      ) || citations[idx % citations.length];

      clauses.push({
        id: `custom_rider_${idx + 1}`,
        clauseTitle: `${cfg.title} (${cfg.category})`,
        legaleseText: cfg.clauseText,
        plainLanguageText: `Customized Rider: ${cfg.clauseText}`,
        riskLevel: cfg.isCustom ? 'medium' : 'low',
        riskExplanation: cfg.isCustom
          ? 'User-customized clause rider added to contract.'
          : `Standard ${cfg.category} rider integrated with custom parameters.`,
        recommendation: 'Ensure both parties initial this clause on final physical execution.',
        saferAlternative: cfg.isCustom ? undefined : 'Parameters tuned according to selected options.',
        citation: matchedCitation,
        clauseSourceType: cfg.sourceType || (cfg.isCustom ? 'user_custom' : 'recommended')
      });
    });

    const dynamicRiskScore = LegalRAGEngine.calculateDynamicRiskScore(clauses);

    return {
      id: 'doc_' + Math.random().toString(36).substr(2, 9),
      title: formData.documentTitle,
      templateType: formData.templateId,
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      state: formData.state,
      draftText,
      plainSummaryText: plainSummary,
      clauses,
      riskScore: dynamicRiskScore,
      completenessScore: validation.score,
      stampDutyRequired: stampInfo.rentAgreementRate,
      notarizationRequired: false,
      registrationRequired: formData.durationMonths > 11 && formData.templateId === 'rent_agreement',
      legalActReferences: citations.map(c => `${c.actShortTitle} (${c.sectionNumber})`),
      citations,
      validationWarnings: validation.missingFields,
      disclaimer: 'DISCLAIMER: Kanoon AI is an automated legal documentation assistant. Documents generated are AI-assisted drafts for informational purposes under Indian law and do not constitute formal attorney-client legal advice.'
    };
  }

  /**
   * Clause Analysis, Risk Level & Safer Alternative Suggester
   */
  public static async simplifyLegalese(text: string, _apiKey?: string) {
    try {
      const res = await fetch(`${BACKEND_API_BASE}/analyze-clause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: text })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          plainEnglishText: `💡 IN PLAIN ENGLISH:\n${data.plainExplanation}`,
          keyTermsExplained: [
            { term: 'Legal Bindingness', explanation: 'Makes promises legally enforceable in Indian courts under Contract Act 1872.' },
            { term: 'Consideration', explanation: 'The payment, fee, or service exchanged between both parties.' }
          ],
          redFlagsFound: [
            {
              severity: data.riskLevel === 'high' || data.riskLevel === 'critical' ? 'high' : 'low',
              issue: data.riskExplanation,
              advice: data.saferAlternative ? `Safer Clause: "${data.saferAlternative}"` : 'Verify with legal counsel.'
            }
          ],
          simplificationScore: 95
        };
      }
    } catch (_err) {
      // Fallback
    }

    const citations = LegalRAGEngine.retrieveRelevantStatutes(text, undefined, 2);
    return {
      plainEnglishText: `💡 IN PLAIN ENGLISH:\nThis clause defines responsibilities between parties grounded in ${citations[0]?.actShortTitle || 'Indian Contract Act 1872'}.`,
      keyTermsExplained: [
        { term: 'Statutory Grounding', explanation: `Aligned with ${citations[0]?.sectionNumber || 'Section 10'}` }
      ],
      redFlagsFound: [
        { severity: 'low' as const, issue: 'Standard Legal Terms', advice: 'No immediate high-risk traps detected.' }
      ],
      simplificationScore: 90
    };
  }

  /**
   * PHASE 2 — EXISTING DOCUMENT REVIEW / LEGAL AUDIT
   * Ephemeral document parsing, clause segmentation, RAG evidence retrieval, and risk scoring.
   */
  public static async reviewDocument(
    params: { fileData?: string; fileName?: string; mimeType?: string; documentText?: string }
  ): Promise<import('../types').DocumentReviewReport> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/review-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (_err) {
      console.warn('Backend API unreachable for document review, executing client-side review engine');
    }

    // Client-side fallback
    const { extractDocumentContent } = await import('./documentExtractor');
    const { performFullDocumentReview } = await import('./documentReviewer');

    const filenameStr = params.fileName || 'Uploaded_Document.txt';
    let extractedDoc;

    if (params.documentText) {
      const textClean = params.documentText.trim();
      extractedDoc = {
        text: textClean,
        pageCount: Math.ceil(textClean.length / 3000),
        filename: filenameStr,
        mimeType: params.mimeType || 'text/plain',
        pages: [{ pageNumber: 1, text: textClean }]
      };
    } else if (params.fileData) {
      extractedDoc = await extractDocumentContent(params.fileData, filenameStr, params.mimeType);
    } else {
      throw new Error('No document content or file data provided for review.');
    }

    return await performFullDocumentReview(extractedDoc);
  }
}

