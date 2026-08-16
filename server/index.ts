import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import type { DocumentFormData, GeneratedDocument, ClauseAnalysis, LegalStatuteCitation } from '../src/types/index.js';
import { STAMP_DUTY_GUIDE } from '../src/data/stampDutyData.js';

import { extractDocumentContent } from '../src/services/documentExtractor.js';
import { performFullDocumentReview } from '../src/services/documentReviewer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

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
    ragEngine: 'India Code Grounded Vector RAG Engine',
    embeddingModel: LegalRAGEngine.EMBEDDING_MODEL_NAME,
    vectorDimensionality: LegalRAGEngine.EMBEDDING_DIMENSIONALITY,
    retrievalAlgorithm: LegalRAGEngine.RETRIEVAL_ALGORITHM,
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
 * RAG Legal Citation Retrieval Endpoint
 */
app.get('/api/rag-search', async (req, res) => {
  const query = (req.query.q as string) || '';
  const templateId = (req.query.templateId as string) || undefined;
  const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : LegalRAGEngine.MIN_CONFIDENCE_THRESHOLD;

  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, templateId, 5, minScore);
  const hasSufficientEvidence = citations.length > 0;

  res.json({
    query,
    count: citations.length,
    hasSufficientEvidence,
    evidenceWarning: hasSufficientEvidence ? undefined : 'Insufficient statutory evidence was retrieved to confidently support this query under verified Indian Acts.',
    citations
  });
});

/**
 * REAL AI-Powered Document Generator Grounded in RAG Indian Law
 * Prompt includes the ACTUAL retrieved statutory chunks from the legal corpus.
 */
app.post('/api/generate-document', async (req, res) => {
  try {
    const formData: DocumentFormData = req.body;

    // 1. Run Pre-generation Validation
    const validation = LegalRAGEngine.validateDocumentInputs(formData);

    // 2. Document-Type Aware RAG Retrieval: fetch relevant legal statutory chunks using 384D dense embeddings
    const citations: LegalStatuteCitation[] = await LegalRAGEngine.retrieveCitationsForDocumentAsync(formData);
    const hasSufficientEvidence = validation.hasSufficientEvidence ?? (citations.length > 0);
    const evidenceWarning = validation.evidenceWarning;

    // Build ACTUAL statutory text block with provenance links to feed directly into Gemini prompt
    const statutoryContextPrompt = hasSufficientEvidence
      ? citations.map((c, i) =>
          `[Retrieved Statute Chunk ${i + 1}]: ${c.actName} (${c.sectionNumber} - ${c.sectionTitle})\nChapter: ${c.chapter || 'N/A'} | Act Number: ${c.actNumber || 'N/A'}\nStatute Text: "${c.statuteText}"\nOfficial India Code Provenance: ${c.sourceUrl || 'https://www.indiacode.nic.in'}\nRelevance Score: ${Math.round((c.confidenceScore || 0.8) * 100)}%`
        ).join('\n\n')
      : 'NO SUFFICIENT VERIFIED STATUTORY EVIDENCE FOUND IN CORPUS FOR CUSTOM PROVISION.';

    // 3. Look up State e-Stamp Regulations
    const stampInfo = STAMP_DUTY_GUIDE.find(
      s => s.state.toLowerCase() === formData.state.toLowerCase()
    ) || STAMP_DUTY_GUIDE[0];

    const partyAName = formData.partyA.name || 'First Party';
    const partyBName = formData.partyB.name || 'Second Party';
    const amountFormatted = formData.financialAmount > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.financialAmount)
      : 'Non-monetary Mutual Consideration';

    const depositFormatted = formData.securityDeposit && formData.securityDeposit > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.securityDeposit)
      : 'N/A';

    let draftText = '';
    let plainSummary = '';
    let clauses: ClauseAnalysis[] = [];

    // Attempt Real Gemini LLM Generation passing ACTUAL retrieved text chunks into prompt
    if (aiClient) {
      try {
        const prompt = `You are Kanoon AI, an expert Indian legal document drafting assistant.
Draft a structured, plain-language, legally sound agreement under Indian law based STRICTLY on the supplied legal grounds and input details:

=== USER INPUT DETAILS ===
- Document Type: ${formData.documentTitle} (${formData.templateId})
- First Party: ${partyAName} (${formData.partyA.address || 'Address withheld'})
- Second Party: ${partyBName} (${formData.partyB.address || 'Address withheld'})
- State Jurisdiction: ${formData.state}, ${formData.city}
- Financial Consideration: ${amountFormatted}
- Security Deposit: ${depositFormatted}
- Duration: ${formData.durationMonths} months
- Lock-in Period: ${formData.lockInPeriodMonths || 0} months
- Notice Period: ${formData.noticePeriodDays} days
- Dispute Resolution: ${formData.disputeResolution}
- Custom Terms: ${formData.customClauses.join('; ') || 'Standard covenants apply'}

=== RETRIEVED STATUTORY CHUNKS (GROUND YOUR GENERATION ON THESE) ===
${statutoryContextPrompt}

CRITICAL SAFETY REQUIREMENT:
You MUST NOT fabricate statutory citations or section numbers. If the provided statutory chunks do NOT contain explicit statutory evidence for a provision, DO NOT invent a section number. Instead, state clearly: "Insufficient statutory evidence was retrieved to confidently support this provision."

INSTRUCTIONS:
1. Incorporate and cite ONLY the retrieved statutory sections explicitly inside relevant clauses.
2. Maintain plain-language clarity while preserving legal enforceability under Indian law.
3. State clearly that stamp duty and registration requirements depend on applicable state laws (e.g. Maharashtra Rent Control Act requires registration regardless of tenure). Do NOT make blanket claims that 11-month agreements are universally exempt from registration.
4. Output clean plain text formatted with numbered sections.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        draftText = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini LLM call fallback to RAG template structure:', geminiErr);
      }
    }

    // Build specialized rider text section
    let customRiderSection = '';
    const selectedConfigs = formData.selectedClauseConfigs || [];
    if (selectedConfigs.length > 0) {
      customRiderSection = '\n\n5. SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES:\n' +
        selectedConfigs.map((c: any, i: number) => `5.${i + 1} [${c.category.toUpperCase()}] ${c.title.toUpperCase()}: ${c.clauseText}`).join('\n\n');
    } else if (formData.customClauses && formData.customClauses.length > 0) {
      customRiderSection = '\n\n5. CUSTOM AGREED TERMS:\n' +
        formData.customClauses.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n');
    }

    // Fallback to RAG-Grounded Structuring if LLM offline or unconfigured
    if (!draftText) {
      if (formData.templateId === 'rent_agreement') {
        draftText = `RESIDENTIAL LEAVE AND LICENSE AGREEMENT
(Drafted under Indian Contract Act 1872 & Transfer of Property Act 1882)

THIS LEAVE AND LICENSE AGREEMENT is executed at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

BETWEEN:
${partyAName.toUpperCase()} ("Licensor / Owner"), Address: ${formData.partyA.address || 'Address A'}.

AND:
${partyBName.toUpperCase()} ("Licensee / Tenant"), Address: ${formData.partyB.address || 'Address B'}.

1. GRANT OF LICENSE & TENURE:
The Licensor hereby permits the Licensee to occupy the premises situated at ${formData.city}, ${formData.state} for a period of ${formData.durationMonths} months starting ${formData.effectiveDate}.

2. LICENSE FEE & SECURITY DEPOSIT:
- Monthly Rent: ${amountFormatted} payable on or before the 5th day of each calendar month.
- Refundable Security Deposit: ${depositFormatted}. Returned upon vacant possession after legitimate utility or damage deductions.

3. LOCK-IN PERIOD & TERMINATION:
- Lock-in Period: ${formData.lockInPeriodMonths || 6} months.
- Notice Period: Post lock-in, either party may terminate by giving ${formData.noticePeriodDays} days written notice.

4. STATUTORY GROUNDING & REGISTRATION:
Grounded in ${citations.length > 0 ? citations.map(c => `${c.actShortTitle} ${c.sectionNumber}`).join(', ') : 'General Contract Law principles'}. Registration requirements and stamp duty depend on applicable state laws.${customRiderSection}

6. DISPUTE RESOLUTION:
Governed by laws of ${formData.governingLawState}, India. Disputes resolved via ${formData.disputeResolution}.

_____________________________                _____________________________
LICENSOR                                     LICENSEE`;
      } else {
        draftText = `${formData.documentTitle.toUpperCase()}
(Grounded in ${citations.length > 0 ? citations.map(c => c.actShortTitle).join(', ') : 'Indian Contract Act 1872'})

THIS AGREEMENT is entered into at ${formData.city}, ${formData.state} on ${formData.effectiveDate}.

PARTIES:
1. ${partyAName.toUpperCase()}, Address: ${formData.partyA.address || 'Address A'}.
2. ${partyBName.toUpperCase()}, Address: ${formData.partyB.address || 'Address B'}.

1. OBLIGATIONS & CONSIDERATION:
Agreed consideration of ${amountFormatted} for a duration of ${formData.durationMonths} months.

2. STATUTORY GROUNDING:
${citations.length > 0 ? `Grounded in ${citations.map(c => `${c.actShortTitle} (${c.sectionNumber})`).join(', ')}.` : 'Insufficient statutory evidence was retrieved to confidently support specific statutory section claims.'}${customRiderSection}

3. GOVERNING LAW & DISPUTES:
Governed by laws of ${formData.governingLawState}, India. Dispute resolution via ${formData.disputeResolution}.

_____________________________                _____________________________
FIRST PARTY                                  SECOND PARTY`;
      }
    }

    plainSummary = `📌 PLAIN ENGLISH SUMMARY FOR SIGNING PARTIES:
- Financial Consideration: ${amountFormatted}
- Security Deposit: ${depositFormatted}
- Duration: ${formData.durationMonths} months
- Minimum Commitment (Lock-in): ${formData.lockInPeriodMonths || 0} months
- Notice Period: ${formData.noticePeriodDays} days advance notice
- Customized Riders Included: ${selectedConfigs.length} special clauses
- Legal Registration Note: Stamp duty rates and compulsory registration depend on local state law.`;

    clauses = [
      {
        id: 'cl_1',
        clauseTitle: 'Tenure & State Stamp / Registration Compliance',
        legaleseText: 'Governed by Section 107 of Transfer of Property Act 1882 and local state tenancy enactments...',
        plainLanguageText: `Agreed tenure of ${formData.durationMonths} months. Registration mandates depend on applicable state law in ${formData.state}.`,
        riskLevel: 'low',
        riskExplanation: 'Standard tenure clause complying with Indian statutory framework.',
        recommendation: 'Attach state e-Stamp paper as prescribed by local sub-registrar.',
        saferAlternative: 'Specify exact tenure with clear renewal and stamp duty responsibility.',
        citation: citations[0],
        clauseSourceType: 'statutory'
      },
      {
        id: 'cl_2',
        clauseTitle: 'Lock-in Period Commitment',
        legaleseText: 'Neither party shall determine the agreement prior to expiry of lock-in period...',
        plainLanguageText: `If exited before ${formData.lockInPeriodMonths || 6} months, rent until lock-in end remains due.`,
        riskLevel: formData.lockInPeriodMonths && formData.lockInPeriodMonths > 6 ? 'high' : 'medium',
        riskExplanation: 'Long lock-in periods create financial exposure if job or personal situation changes.',
        recommendation: 'Negotiate a shorter lock-in period or add employment transfer exceptions.',
        saferAlternative: 'Either party may terminate during lock-in period upon 30 days notice in case of official job transfer.',
        citation: citations[1] || citations[0],
        clauseSourceType: 'statutory'
      },
      {
        id: 'cl_3',
        clauseTitle: 'Security Deposit Refund Timeline',
        legaleseText: 'Licensor covenants to refund security deposit simultaneously upon vacant possession...',
        plainLanguageText: `Deposit of ${depositFormatted} to be refunded within 7 days of key handover.`,
        riskLevel: 'low',
        riskExplanation: 'Protects tenant against arbitrary deposit retention.',
        recommendation: 'Conduct joint inspection on hand-over day.',
        saferAlternative: 'Deposit refunded within 7 working days via direct bank transfer (NEFT/UPI).',
        citation: citations[2] || citations[0],
        clauseSourceType: 'statutory'
      }
    ];

    // Add selected/custom clause rider analyses
    selectedConfigs.forEach((cfg: any, idx: number) => {
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

    // DYNAMIC Risk Score calculation from actual detected clause risks
    const dynamicRiskScore = LegalRAGEngine.calculateDynamicRiskScore(clauses);

    const result: GeneratedDocument = {
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
      recommendations: validation.recommendations,
      disclaimer: 'DISCLAIMER: Kanoon AI is an automated legal documentation assistant. Documents generated are AI-assisted drafts for informational purposes under Indian law and do not constitute formal attorney-client legal advice.',
      hasSufficientEvidence,
      evidenceWarning
    };

    res.json(result);
  } catch (error: any) {
    console.error('Document Generation Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error during document generation' });
  }
});

/**
 * Hybrid Clause Analysis & Contextual Risk Inspector
 * Rule-based first layer + Gemini LLM contextual risk analysis
 */
app.post('/api/analyze-clause', async (req, res) => {
  try {
    const { clauseText } = req.body;
    if (!clauseText) {
      return res.status(400).json({ error: 'Clause text is required' });
    }

    // 1. Retrieve relevant statutory citations via RAG
    const citations = LegalRAGEngine.retrieveRelevantStatutes(clauseText, undefined, 3);
    const hasSufficientEvidence = citations.length > 0;

    let plainExplanation = '';
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let riskExplanation = '';
    let saferAlternative = '';

    // 2. Gemini LLM Contextual Risk Analysis if AI available
    if (aiClient) {
      try {
        const statutoryContext = hasSufficientEvidence
          ? citations.map(c => `${c.actShortTitle} ${c.sectionNumber}: ${c.statuteText} [Source: ${c.sourceUrl || 'India Code'}]`).join('\n')
          : 'NO EXPLICIT STATUTORY MATCH IN CORPUS';

        const prompt = `You are Kanoon AI's Indian Legal Risk Inspector.
Analyze the following legal clause for red flags, unconscionable obligations, or legal traps under Indian Law:

=== LEGAL CLAUSE TO INSPECT ===
"${clauseText}"

=== RELEVANT INDIAN STATUTES ===
${statutoryContext}

CRITICAL SAFETY REQUIREMENT:
If statutory evidence is missing or ambiguous, DO NOT invent fake act section numbers.

Respond strictly with valid JSON with keys:
- "plainExplanation": (string - plain English explanation of what this clause forces the user to agree to)
- "riskLevel": ("low" | "medium" | "high" | "critical")
- "riskExplanation": (string - why this clause is risky or legally unbalanced)
- "saferAlternative": (string - balanced alternative clause protecting both parties)`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const responseText = response.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          plainExplanation = parsed.plainExplanation || '';
          riskLevel = parsed.riskLevel || 'low';
          riskExplanation = parsed.riskExplanation || '';
          saferAlternative = parsed.saferAlternative || '';
        }
      } catch (err) {
        console.warn('Gemini clause analysis fallback to rule-based layer:', err);
      }
    }

    // 3. Fallback to Rule-based layer if LLM was unavailable or failed
    if (!plainExplanation) {
      const lower = clauseText.toLowerCase();

      if (lower.includes('indemnify') && !lower.includes('limited to')) {
        riskLevel = 'high';
        riskExplanation = 'Unlimited Indemnity Trap: Uncapped promise to cover all losses, claims, and third-party damages.';
        plainExplanation = 'You promise to pay all damages and legal costs incurred by the other party without any upper limit.';
        saferAlternative = 'Add a liability cap: "Total indemnity obligation under this agreement shall be capped at the total consideration paid in the preceding 6 months."';
      } else if (lower.includes('terminate at sole discretion') || lower.includes('without notice')) {
        riskLevel = 'critical';
        riskExplanation = 'Unilateral Immediate Exit: Other party can cancel instantly without warning or opportunity to cure.';
        plainExplanation = 'The other party can terminate this agreement at any moment without prior written notice.';
        saferAlternative = 'Add notice period: "Either party may terminate this agreement by providing 30 days prior written notice."';
      } else if (lower.includes('non-compete')) {
        riskLevel = 'medium';
        riskExplanation = 'Restraint of Trade: Blanket non-compete clauses post-termination are void under Section 27 of Indian Contract Act 1872.';
        plainExplanation = 'Restricts your freedom to work or engage in competing business after contract ends.';
        saferAlternative = 'Narrow scope: "Non-compete applies strictly to soliciting existing company clients for a period of 6 months post-exit."';
      } else {
        riskLevel = 'low';
        riskExplanation = 'Standard contractual clause without immediate high-risk red flags detected.';
        plainExplanation = 'Defines standard rights and responsibilities between both parties under Indian law.';
        saferAlternative = clauseText;
      }
    }

    res.json({
      clauseText,
      plainExplanation,
      riskLevel,
      riskExplanation,
      saferAlternative,
      hasSufficientEvidence,
      evidenceWarning: hasSufficientEvidence ? undefined : 'Insufficient statutory evidence was retrieved to confidently support this specific clause.',
      citations
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Clause analysis failed' });
  }
});

/**
 * PHASE 2 — EXISTING DOCUMENT REVIEW / LEGAL AUDIT ENDPOINT
 * Ephemeral processing: extracts text, segments clauses, queries statutory RAG corpus,
 * evaluates risks, and returns full structured review report without storing files.
 */
app.post('/api/review-document', async (req, res) => {
  try {
    const { fileData, fileName, mimeType, documentText } = req.body;

    if (!fileData && !documentText) {
      return res.status(400).json({ error: 'Either fileData (base64) or documentText must be provided' });
    }

    const filenameStr = fileName || 'Uploaded_Document.txt';
    let extractedDoc;

    if (documentText) {
      const textClean = String(documentText).trim();
      if (textClean.length < 15) {
        return res.status(400).json({ error: 'Provided document text is empty or too short (minimum 15 characters required).' });
      }
      extractedDoc = {
        text: textClean,
        pageCount: Math.ceil(textClean.length / 3000),
        filename: filenameStr,
        mimeType: mimeType || 'text/plain',
        pages: [{ pageNumber: 1, text: textClean }]
      };
    } else {
      extractedDoc = await extractDocumentContent(fileData, filenameStr, mimeType);
    }

    const report = await performFullDocumentReview(extractedDoc);
    res.json(report);
  } catch (error: any) {
    console.error('Document Review Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to review uploaded document' });
  }
});

LegalRAGEngine.initializeCorpus().then(() => {
  app.listen(PORT, () => {
    console.log(`⚖️ Kanoon AI Backend API Server running on http://localhost:${PORT}`);
    console.log(`🧠 Dense Embedding Model: ${LegalRAGEngine.EMBEDDING_MODEL_NAME} (${LegalRAGEngine.EMBEDDING_DIMENSIONALITY}-D Dense Vector Embeddings)`);
  });
});
