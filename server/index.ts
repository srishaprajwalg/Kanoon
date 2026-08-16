import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import type { DocumentFormData, GeneratedDocument, ClauseAnalysis } from '../src/types/index.js';
import { STAMP_DUTY_GUIDE } from '../src/data/stampDutyData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Initialize Google Gemini AI client securely on backend
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Health Endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConnected: Boolean(aiClient),
    ragEngine: 'Indian Statutory Vector Corpus v1.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Pre-Generation Input Validation & Missing Field Detector
 */
app.post('/api/validate-inputs', (req, res) => {
  try {
    const formData: DocumentFormData = req.body;
    const validation = LegalRAGEngine.validateDocumentInputs(formData);
    res.json(validation);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation failed' });
  }
});

/**
 * RAG Legal Citation Retrieval
 */
app.get('/api/rag-search', (req, res) => {
  const query = (req.query.q as string) || '';
  const citations = LegalRAGEngine.retrieveRelevantStatutes(query, 5);
  res.json({ query, count: citations.length, citations });
});

/**
 * REAL AI-Powered Document Generator Grounded in RAG Indian Law
 */
app.post('/api/generate-document', async (req, res) => {
  try {
    const formData: DocumentFormData = req.body;

    // 1. Run Pre-generation Validation
    const validation = LegalRAGEngine.validateDocumentInputs(formData);

    // 2. Perform RAG Statutory Citation Retrieval
    const citations = LegalRAGEngine.retrieveCitationsForDocument(formData);

    // 3. Look up State e-Stamp Regulations
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
    let plainSummary = '';
    let clauses: ClauseAnalysis[] = [];

    // Attempt Real Gemini LLM Generation if API Key Available
    if (aiClient) {
      try {
        const prompt = `You are Kanoon AI, an expert Indian legal document drafting assistant.
Generate a structured, plain-language, legally sound draft for the following agreement under Indian law:
- Document Type: ${formData.documentTitle} (${formData.templateId})
- First Party: ${partyAName} (${formData.partyA.address})
- Second Party: ${partyBName} (${formData.partyB.address})
- State & Jurisdiction: ${formData.state}, ${formData.city}
- Financial Amount: ${amountFormatted}
- Security Deposit: ${depositFormatted}
- Duration: ${formData.durationMonths} months
- Lock-in Period: ${formData.lockInPeriodMonths || 0} months
- Notice Period: ${formData.noticePeriodDays} days
- Dispute Resolution: ${formData.disputeResolution}
- Relevant Statutory Grounding: ${citations.map(c => `${c.actShortTitle} ${c.sectionNumber} (${c.sectionTitle})`).join(', ')}

INSTRUCTIONS:
1. Draft the contract in clear, transparent English.
2. Avoid archaic Latin jargon where plain English suffices.
3. Include specific clauses for Grant, Payment/Consideration, Duration, Lock-in, Termination, Dispute Resolution under Indian Arbitration Act 1996, and Governing Law.
4. Include custom user terms: ${formData.customClauses.join('; ')}

Format output strictly as clean legal text.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        draftText = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini LLM call failed, utilizing RAG grounded template:', geminiErr);
      }
    }

    // Fallback to RAG-Grounded Structuring if LLM not configured or offline
    if (!draftText) {
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

2. LICENSE FEE & SECURITY DEPOSIT:
- Monthly Rent: ${amountFormatted} payable on or before the 5th day of each calendar month.
- Refundable Security Deposit: ${depositFormatted}. Returned in full within 7 days of key handover, less legitimate utility arrears or structural damages.

3. LOCK-IN PERIOD & TERMINATION:
- Lock-in Period: ${formData.lockInPeriodMonths || 6} months. Early exit requires payment of remaining lock-in rent.
- Notice Period: Post lock-in, either party may terminate by giving ${formData.noticePeriodDays} days written notice.

4. STATUTORY GROUNDING:
Governed by Indian Contract Act 1872 and Transfer of Property Act 1882 (Section 107 exemption for 11-month tenure).

5. CUSTOM AGREED TERMS:
${formData.customClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}

6. DISPUTE RESOLUTION & JURISDICTION:
Governed by laws of ${formData.governingLawState}, India. Disputes resolved via ${formData.disputeResolution}.

_____________________________                _____________________________
LICENSOR                                     LICENSEE`;
      } else {
        draftText = `${formData.documentTitle.toUpperCase()}
(Grounded in Indian Contract Act 1872 & IT Act 2000)

THIS AGREEMENT is entered into at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

PARTIES:
1. ${partyAName.toUpperCase()}, Address: ${formData.partyA.address || 'Address A'}.
2. ${partyBName.toUpperCase()}, Address: ${formData.partyB.address || 'Address B'}.

1. OBLIGATIONS & CONSIDERATION:
Total agreed consideration of ${amountFormatted} for a period of ${formData.durationMonths} months.

2. NOTICE & TERMINATION:
Either party may terminate by serving ${formData.noticePeriodDays} days written notice.

3. CUSTOM AGREED TERMS:
${formData.customClauses.map((c, i) => `${i + 1}. ${c}`).join('\n')}

4. GOVERNING LAW:
Governed by laws of ${formData.governingLawState}, India.

_____________________________                _____________________________
FIRST PARTY                                  SECOND PARTY`;
      }
    }

    plainSummary = `📌 PLAIN ENGLISH SUMMARY FOR SIGNING PARTIES:
- Monthly Fee / Consideration: ${amountFormatted}
- Security Deposit: ${depositFormatted}
- Agreement Duration: ${formData.durationMonths} months
- Minimum Commitment (Lock-in): ${formData.lockInPeriodMonths || 0} months
- Notice Period: ${formData.noticePeriodDays} days advance notice
- Registration Status: ${formData.durationMonths > 11 ? 'Sub-Registrar Registration Required (>11 Mos)' : '11-Month Registration Exemption Applicable'}`;

    clauses = [
      {
        id: 'cl_1',
        clauseTitle: '11-Month Tenure & Registration Exemption',
        legaleseText: 'Whereas under Section 107 of the Transfer of Property Act 1882, leases exceeding 1 year require mandatory registration...',
        plainLanguageText: 'Keeping agreement at 11 months saves mandatory registration costs under Indian law while remaining 100% legally enforceable.',
        riskLevel: 'low',
        riskExplanation: 'Standard legal structure protecting both landlord and tenant in India.',
        recommendation: 'Ensure e-Stamp paper of local state value is attached.',
        saferAlternative: 'Keep tenure at 11 months with optional mutual renewal clause.',
        citation: citations[0]
      },
      {
        id: 'cl_2',
        clauseTitle: 'Lock-in Period Commitment',
        legaleseText: 'Neither party shall be entitled to determine the license prior to the expiry of lock-in period...',
        plainLanguageText: `If you leave before ${formData.lockInPeriodMonths || 6} months, rent until lock-in ends remains payable.`,
        riskLevel: formData.lockInPeriodMonths && formData.lockInPeriodMonths > 6 ? 'high' : 'medium',
        riskExplanation: 'Long lock-in periods create financial liability if employment or living situation changes.',
        recommendation: 'Negotiate a shorter lock-in period (e.g., 3 months) or add a job relocation exception.',
        saferAlternative: 'Either party may terminate during lock-in period upon 30 days notice in case of official job transfer or medical emergency.',
        citation: citations[1] || citations[0]
      },
      {
        id: 'cl_3',
        clauseTitle: 'Security Deposit Refund Timeline',
        legaleseText: 'Licensor covenants to refund security deposit simultaneously upon vacant possession...',
        plainLanguageText: `Landlord must return your ${depositFormatted} deposit within 7 days of key handover.`,
        riskLevel: 'low',
        riskExplanation: 'Protects tenant against delayed deposit returns.',
        recommendation: 'Document house condition with photos on move-in day.',
        saferAlternative: 'Deposit to be refunded within 7 working days via direct bank transfer (NEFT/UPI).',
        citation: citations[2] || citations[0]
      }
    ];

    const result: GeneratedDocument = {
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

    res.json(result);
  } catch (error: any) {
    console.error('Document Generation Error:', error);
    res.status(500).json({ error: error.message || 'Server error during document generation' });
  }
});

/**
 * Clause Analysis, Risk Level & Safer Alternative Suggester
 */
app.post('/api/analyze-clause', async (req, res) => {
  try {
    const { clauseText } = req.body;
    if (!clauseText) {
      return res.status(400).json({ error: 'Clause text is required' });
    }

    const citations = LegalRAGEngine.retrieveRelevantStatutes(clauseText, 2);

    let plainExplanation = '';
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let riskExplanation = '';
    let saferAlternative = '';

    const lower = clauseText.toLowerCase();

    if (lower.includes('indemnify') && !lower.includes('limited to')) {
      riskLevel = 'high';
      riskExplanation = 'Unlimited Indemnity Trap: You promise to pay for all losses, court fees, or third-party damages without a financial cap.';
      plainExplanation = 'You are agreeing to pay all damages and legal fees suffered by the other party if anything goes wrong, without any upper limit.';
      saferAlternative = 'Add a financial liability cap: "Total indemnity obligation under this agreement shall be capped at total fees paid in the preceding 6 months."';
    } else if (lower.includes('terminate at sole discretion') || lower.includes('without notice')) {
      riskLevel = 'critical';
      riskExplanation = 'Unilateral Immediate Termination: The other party can end the contract instantly without giving you time to respond or adjust.';
      plainExplanation = 'The other party can cancel this agreement at any moment without advance notice or explanation.';
      saferAlternative = 'Add notice period: "Either party may terminate this agreement by giving 30 days prior written notice."';
    } else if (lower.includes('non-compete')) {
      riskLevel = 'medium';
      riskExplanation = 'Non-Compete Restraint: Under Section 27 of Indian Contract Act 1872, blanket restraints on trade/employment are void.';
      plainExplanation = 'This restricts your right to work or start a competing business after the contract ends.';
      saferAlternative = 'Restrict scope: "Non-compete applies strictly to solicitation of existing company clients for a period of 6 months post-exit."';
    } else {
      riskLevel = 'low';
      riskExplanation = 'Standard contractual clause without immediate high-risk red flags detected.';
      plainExplanation = 'Defines agreed terms and responsibilities between both parties under Indian law.';
      saferAlternative = clauseText;
    }

    res.json({
      clauseText,
      plainExplanation,
      riskLevel,
      riskExplanation,
      saferAlternative,
      citations
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Clause analysis failed' });
  }
});

app.listen(PORT, () => {
  console.log(`⚖️ Kanoon AI Backend API Server running on http://localhost:${PORT}`);
});
