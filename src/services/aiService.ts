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
    const amountFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(formData.financialAmount);

    const depositFormatted = formData.securityDeposit
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(formData.securityDeposit)
      : 'N/A';

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

4. STATUTORY CITATIONS:
Grounded in Indian Contract Act 1872 (Section 10 & 73) and Transfer of Property Act 1882 (Section 107).

5. CUSTOM AGREED TERMS:
${formData.customClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}

6. DISPUTE RESOLUTION & GOVERNING LAW:
Governed by laws of ${formData.governingLawState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
LICENSOR                                     LICENSEE`;
    } else {
      draftText = `${formData.documentTitle.toUpperCase()}
(Grounded in Indian Contract Act 1872 & IT Act 2000)

THIS AGREEMENT is entered into at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

PARTIES:
1. ${partyAName.toUpperCase()}, Address: ${formData.partyA.address || 'Address A'}.
2. ${partyBName.toUpperCase()}, Address: ${formData.partyB.address || 'Address B'}.

1. CONSIDERATION & OBLIGATIONS:
Agreed consideration of ${amountFormatted} over a duration of ${formData.durationMonths} months.

2. TERMINATION & NOTICE:
Either party may terminate by giving ${formData.noticePeriodDays} days written notice.

3. CUSTOM TERMS:
${formData.customClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}

4. GOVERNING LAW:
Governed by laws of ${formData.governingLawState}, India.

_____________________________                _____________________________
FIRST PARTY                                  SECOND PARTY`;
    }

    const plainSummary = `📌 PLAIN ENGLISH SUMMARY FOR SIGNING PARTIES:
- Rent/Consideration: ${amountFormatted}/month
- Deposit: ${depositFormatted}
- Lock-in Period: ${formData.lockInPeriodMonths || 0} months
- Termination Notice: ${formData.noticePeriodDays} days written notice
- Registration Status: ${formData.durationMonths > 11 ? 'Sub-Registrar Registration Required (>11 Mos)' : '11-Month Registration Exemption Applicable'}`;

    const clauses: ClauseAnalysis[] = [
      {
        id: 'cl_1',
        clauseTitle: '11-Month Tenure Exemption',
        legaleseText: 'Whereas under Section 107 of the Transfer of Property Act 1882...',
        plainLanguageText: 'Keeping agreement at 11 months saves mandatory registration costs under Indian law while remaining 100% legally enforceable.',
        riskLevel: 'low',
        riskExplanation: 'Standard legal structure in India.',
        recommendation: 'Ensure e-Stamp paper of local state value is attached.',
        saferAlternative: 'Keep tenure at 11 months with optional mutual renewal clause.',
        citation: citations[0]
      },
      {
        id: 'cl_2',
        clauseTitle: 'Lock-in Period Commitment',
        legaleseText: 'Neither party shall be entitled to determine the license prior to the expiry of lock-in period...',
        plainLanguageText: `If you leave before ${formData.lockInPeriodMonths || 6} months, rent until lock-in ends remains payable.`,
        riskLevel: 'medium',
        riskExplanation: 'Tenant faces financial liability if job or relocation changes suddenly.',
        recommendation: 'Negotiate a shorter lock-in period (e.g. 3 months).',
        saferAlternative: 'Either party may terminate during lock-in period upon 30 days notice in case of official job transfer.',
        citation: citations[1] || citations[0]
      }
    ];

    return {
      id: 'doc_' + Math.random().toString(36).substr(2, 9),
      title: formData.documentTitle,
      templateType: formData.templateId,
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      state: formData.state,
      draftText,
      plainSummaryText: plainSummary,
      clauses,
      riskScore: validation.score >= 80 ? 92 : 75,
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

    const citations = LegalRAGEngine.retrieveRelevantStatutes(text, 2);
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
}
