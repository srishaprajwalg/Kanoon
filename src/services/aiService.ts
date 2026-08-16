import type { DocumentFormData, GeneratedDocument, ClauseAnalysis, ValidationResult } from '../types';
import { LegalRAGEngine } from './ragEngine';
import { STAMP_DUTY_GUIDE } from '../data/stampDutyData';

const BACKEND_API_BASE = 'http://localhost:5000/api';

function buildTemplateDraftText(formData: DocumentFormData, citations: any[]): string {
  const partyAName = formData.partyA.name || 'FIRST PARTY';
  const partyBName = formData.partyB.name || 'SECOND PARTY';
  const amountFormatted = formData.financialAmount > 0 ? `₹${formData.financialAmount.toLocaleString('en-IN')}` : 'Non-monetary Consideration';
  const depositFormatted = (formData.securityDeposit && formData.securityDeposit > 0) ? `₹${formData.securityDeposit.toLocaleString('en-IN')}` : 'N/A';

  const customRiderSection = (formData.selectedClauseConfigs && formData.selectedClauseConfigs.length > 0)
    ? `\n\n5. SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES:\n` +
      formData.selectedClauseConfigs.map((c, i) => `  ${i + 1}. [${c.title.toUpperCase()}]: ${c.clauseText}`).join('\n')
    : (formData.customClauses && formData.customClauses.length > 0)
    ? `\n\n5. SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES:\n` +
      formData.customClauses.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
    : '';

  const citationsText = citations.length > 0
    ? citations.map(c => `${c.actShortTitle} (${c.sectionNumber})`).join(', ')
    : 'Indian Contract Act 1872';

  const governingState = formData.governingLawState || formData.state || 'Karnataka';

  switch (formData.templateId) {
    case 'rent_agreement':
      return `${formData.documentTitle.toUpperCase()}
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
Grounded in ${citationsText}. Registration requirements and stamp duty depend on local state law for ${formData.state}.${customRiderSection}

5. DISPUTE RESOLUTION & GOVERNING LAW:
Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
LICENSOR / OWNER                             LICENSEE / TENANT`;

    case 'nda_agreement':
      return `${formData.documentTitle.toUpperCase()}
(Drafted under Indian Contract Act 1872 & Information Technology Act 2000)

THIS MUTUAL NON-DISCLOSURE AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("Disclosing / First Party"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

AND:
${partyBName.toUpperCase()} ("Receiving / Second Party"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

1. SCOPE OF CONFIDENTIAL INFORMATION:
Confidential Information includes all proprietary technical data, business plans, trade secrets, algorithms, and financial projections disclosed by either party during discussions at ${formData.city}, ${formData.state}.

2. NON-DISCLOSURE & OBLIGATIONS:
The Receiving Party shall maintain strict confidentiality over disclosed information for a duration of ${formData.durationMonths} months from the effective date. Disclosure is restricted strictly to authorized representatives with a need-to-know basis.

3. EXCEPTIONS & SURVIVAL:
Obligations do not apply to information publicly known through no breach, independently developed without access to confidential data, or required to be disclosed under valid legal subpoena.

4. RETURN OF ASSETS & NOTICE:
Upon termination or written request, all physical and digital copies of confidential assets shall be returned or destroyed within ${formData.noticePeriodDays} days.${customRiderSection}

5. STATUTORY GROUNDING & DISPUTE RESOLUTION:
Grounded in ${citationsText}. Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
DISCLOSING / FIRST PARTY                     RECEIVING / SECOND PARTY`;

    case 'freelance_service':
    case 'freelance_contract':
    case 'service_agreement':
      return `${formData.documentTitle.toUpperCase()}
(Drafted under Indian Contract Act 1872 & Information Technology Act 2000)

THIS MASTER SERVICE AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("Service Provider / Contractor"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

AND:
${partyBName.toUpperCase()} ("Client / Principal"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

1. SCOPE OF SERVICES & PROJECT TENURE:
The Service Provider agrees to deliver agreed professional services for a tenure of ${formData.durationMonths} months starting ${formData.effectiveDate}.

2. COMMERCIAL CONSIDERATION & PAYMENT TERMS:
- Total Service Fee / Contract Value: ${amountFormatted} payable per agreed invoice milestones.
- Advance Retainer (if applicable): ${depositFormatted}.

3. INTELLECTUAL PROPERTY & DELIVERABLE OWNERSHIP:
Upon receipt of 100% full payment settlement, all custom work product, software code, and deliverables created hereunder shall vest exclusively with the Client.

4. TERMINATION & NOTICE PERIOD:
Either party may terminate this agreement prior to completion by providing ${formData.noticePeriodDays} days advance written notice.${customRiderSection}

5. STATUTORY GROUNDING & GOVERNING LAW:
Grounded in ${citationsText}. Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
SERVICE PROVIDER                             CLIENT`;

    case 'employment_contract':
      return `${formData.documentTitle.toUpperCase()}
(Drafted under Indian Contract Act 1872 & State Shops and Commercial Establishments Framework)

THIS EMPLOYMENT TERMS AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("Employer / Company"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

AND:
${partyBName.toUpperCase()} ("Employee"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

1. APPOINTMENT & REMUNERATION:
The Employer engages the Employee on full-time employment with an agreed total annual compensation (CTC) of ${amountFormatted} payable in monthly installments.

2. PROBATION & LOCK-IN PERIOD:
- Evaluation Probation Period: ${formData.lockInPeriodMonths || 3} months from effective date during which performance is reviewed.
- Initial Contract Tenure: ${formData.durationMonths} months.

3. NOTICE PERIOD & RESIGNATION:
Either party may terminate employment during or post probation by serving ${formData.noticePeriodDays} days advance written notice or equivalent salary in lieu thereof.

4. CONFIDENTIALITY & COMPANY PROPERTY:
Employee agrees to preserve all company trade secrets and surrender all laptops, access cards, and assets upon exit.${customRiderSection}

5. STATUTORY GROUNDING & GOVERNING LAW:
Grounded in ${citationsText}. Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
EMPLOYER / COMPANY                           EMPLOYEE`;

    case 'partnership_deed':
      return `${formData.documentTitle.toUpperCase()}
(Drafted under Indian Partnership Act 1932)

THIS PARTNERSHIP DEED is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("First Partner"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

AND:
${partyBName.toUpperCase()} ("Second Partner"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

1. FIRM NAME & BUSINESS PURPOSE:
The Partners agree to carry on joint business operations under the agreed Partnership Firm at ${formData.city}, ${formData.state} for an initial duration of ${formData.durationMonths} months.

2. CAPITAL CONTRIBUTION & PROFIT SHARING:
- Total Initial Capital Contribution: ${amountFormatted} contributed jointly by Partners.
- Profits and losses shall be shared equally (50% - 50%) unless otherwise specified by mutual written consent.

3. MANAGEMENT POWERS & BANK OPERATION:
All major policy decisions, credit lines, and contracts above ₹1,00,000 require joint signatures of both partners.

4. RETIREMENT & DISSOLUTION NOTICE:
Any partner wishing to retire from the partnership shall provide ${formData.noticePeriodDays} days advance written notice to the other partner.${customRiderSection}

5. STATUTORY GROUNDING & GOVERNING LAW:
Grounded in ${citationsText}. Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
FIRST PARTNER                                SECOND PARTNER`;

    case 'consumer_legal_notice':
    case 'legal_notice':
      return `${formData.documentTitle.toUpperCase()}
(Issued under Consumer Protection Act 2019 / Section 138 Negotiable Instruments Act / Indian Contract Act 1872)

ISSUED AT: ${formData.city}, ${formData.state}
DATE: ${formData.effectiveDate}

TO:
${partyBName.toUpperCase()} ("Opposing Party / Recipient"), Address: ${formData.partyB.address || 'Address B'}, Contact: ${formData.partyB.contact || 'N/A'}.

FROM:
${partyAName.toUpperCase()} ("Complainant / Sender"), Address: ${formData.partyA.address || 'Address A'}, Contact: ${formData.partyA.contact || 'N/A'}.

SUBJECT: FORMAL DEMAND NOTICE FOR SETTLEMENT OF UNPAID DUES / DEFECTIVE SERVICE IN THE AMOUNT OF ${amountFormatted}.

SIR / MADAM,
Under instructions from my client, you are hereby served with this formal legal demand notice:

1. STATEMENT OF FACTS:
You entered into a binding transaction with my client at ${formData.city}, ${formData.state}. Despite repeated follow-ups, you have failed to satisfy your legal obligations, resulting in total outstanding dues/damages of ${amountFormatted}.

2. DEMAND FOR REMEDY:
You are hereby called upon to remedy the breach and pay the sum of ${amountFormatted} to my client within ${formData.noticePeriodDays} days of receipt of this notice.

3. NOTICE OF INTENDED LEGAL PROCEEDINGS:
Take notice that if you fail to comply within ${formData.noticePeriodDays} days, my client will initiate civil, criminal, or consumer litigation before appropriate courts in ${formData.city}, ${formData.state} at your risk and cost.${customRiderSection}

4. STATUTORY GROUNDING:
Grounded in ${citationsText}. Governed by the laws of ${governingState}, India.

_____________________________
ADVOCATE / AUTHORIZED SENDER`;

    default:
      return `${formData.documentTitle.toUpperCase()}
(Grounded in ${citationsText})

THIS LEGAL AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

PARTIES:
1. ${partyAName.toUpperCase()}, Address: ${formData.partyA.address || 'Address A'}.
2. ${partyBName.toUpperCase()}, Address: ${formData.partyB.address || 'Address B'}.

1. CONSIDERATION & OBLIGATIONS:
Agreed consideration of ${amountFormatted} over a duration of ${formData.durationMonths} months.

2. TERMINATION & NOTICE:
Either party may terminate by giving ${formData.noticePeriodDays} days written notice.${customRiderSection}

3. GOVERNING LAW & DISPUTES:
Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
FIRST PARTY                                  SECOND PARTY`;
  }
}

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

    const amountFormatted = formData.financialAmount > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.financialAmount)
      : 'Non-monetary Consideration';

    const depositFormatted = formData.securityDeposit && formData.securityDeposit > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.securityDeposit)
      : 'N/A';

    const selectedConfigs = formData.selectedClauseConfigs || [];

    let draftText = buildTemplateDraftText(formData, citations);

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

