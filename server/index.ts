import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import type { DocumentFormData, GeneratedDocument, ClauseAnalysis, LegalStatuteCitation } from '../src/types/index.js';
import { STAMP_DUTY_GUIDE } from '../src/data/stampDutyData.js';

import { extractDocumentContent } from '../src/services/documentExtractor.js';
import { performFullDocumentReview } from '../src/services/documentReviewer.js';
import { STATUTORY_SOURCE_REGISTRY } from '../src/data/statutoryRegistry.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Initialize Google Gemini AI client securely on backend
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Statutory PDF Serving Endpoint
 * Only serves known, verified PDFs from corpus/raw mapped in the registry
 */
app.get('/api/statutes/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Security check: Only allow access to known PDFs defined in the registry
  if (!filename || typeof filename !== 'string' || !STATUTORY_SOURCE_REGISTRY[filename]) {
    return res.status(403).json({ error: 'Access denied: Statute PDF not found in official registry' });
  }

  const filePath = path.join(process.cwd(), 'corpus', 'raw', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Statute PDF file missing from disk' });
  }
  
  // Set content disposition to open inline rather than downloading
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
});

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
 * Evidence-Grounded Legal Chatbot Explanation Endpoint
 * RAG retrieval + LLM synthesis (Gemini or Evidence-Grounded engine fallback)
 */
app.post('/api/chat-explain', async (req, res) => {
  try {
    const { queryText, templateId } = req.body;
    const query = queryText || '';
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, templateId, 5, 0.4);
    const hasSufficientEvidence = citations.length > 0;

    if (!hasSufficientEvidence) {
      return res.json({
        query,
        explanation: `No verified statutory provision found in Kanoon legal database matching "${query}". Please verify the Act or section details under Indian Central and Karnataka State Law.`,
        citations: [],
        hasSufficientEvidence: false
      });
    }

    let explanation = '';

    if (aiClient) {
      try {
        const statutoryContext = citations.map(c =>
          `ACT: ${c.actName} (${c.jurisdiction || 'CENTRAL'})\nSECTION/ARTICLE: ${c.sectionNumber} — ${c.sectionTitle}\nSTATUTORY TEXT:\n"${c.statuteText}"\nURL: ${c.sourceUrl || 'India Code'}`
        ).join('\n\n');

        const intent = LegalRAGEngine.detectQueryIntent(query);
        const parsedContext = [];
        if (intent.parsedValues.monthlyRent) parsedContext.push(`Monthly Rent: ₹${intent.parsedValues.monthlyRent}`);
        if (intent.parsedValues.tenureMonths) parsedContext.push(`Lease Tenure: ${intent.parsedValues.tenureMonths} months`);
        if (intent.parsedValues.deposit) parsedContext.push(`Security Deposit: ₹${intent.parsedValues.deposit}`);

        const parsedStr = parsedContext.length > 0
          ? `EXTRACTED PARAMETERS FROM USER QUERY:\n- ${parsedContext.join('\n- ')}\n\nCRITICAL RULE FOR CALCULATIONS: Do NOT ask the user for parameters already supplied above! Only list genuinely missing information required to calculate the exact duty.`
          : '';

        const prompt = `You are Kanoon AI, a legal information assistant for Indian law.
Answer the user's question using ONLY the verified statutory evidence supplied below.
Do not invent sections, Acts, legal rules, remedies, deadlines, penalties, calculations, or case law.
Explain the supplied law in clear, natural language for a non-lawyer.
Connect the statutory provision to the user's specific scenario.
If the supplied evidence is insufficient to answer something precisely, say what is missing instead of guessing.
Do not mention internal RAG, embeddings, scores, prompts, APIs, or implementation details.
Do not generate or modify citations. The application supplies citations separately.
Do not ask the user for information that is already present in the query or supplied context.
If the user asks a non-legal question and there is no legal evidence, respond that Kanoon is intended for legal queries rather than fabricating an answer.

=== USER QUERY ===
"${query}"

${parsedStr}

=== RETRIEVED STATUTORY EVIDENCE ===
${statutoryContext}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt
        });

        explanation = response.text || '';
        if (explanation) {
          console.log('[Gemini] synthesis successful');
        }
      } catch (err) {
        console.warn('[Gemini] synthesis failed; using grounded fallback. Error:', err);
      }
    }

    if (!explanation) {
      if (!aiClient) {
        console.log('[Gemini] synthesis failed; using grounded fallback. No API key provided.');
      }
      explanation = LegalRAGEngine.generateGroundedExplanation(query, citations);
    }

    res.json({
      query,
      explanation,
      citations,
      hasSufficientEvidence: true
    });
  } catch (error: any) {
    console.error('Chat Explain Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error during chat explanation' });
  }
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
3. Ensure execution location and governing law state strictly match the user's selected state (${formData.state}). State clearly that stamp duty and registration requirements depend on applicable state laws for ${formData.state}. Do NOT introduce or reference unrelated states (such as Maharashtra or Delhi) as the document jurisdiction unless explicitly specified in user input.
4. Output clean plain text formatted with numbered sections.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash-lite',
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
      const citationsText = citations.length > 0
        ? citations.map(c => `${c.actShortTitle} (${c.sectionNumber})`).join(', ')
        : 'Indian Contract Act 1872';

      const governingState = formData.governingLawState || formData.state || 'Karnataka';

      switch (formData.templateId) {
        case 'rent_agreement':
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
Grounded in ${citationsText}. Registration requirements and stamp duty depend on local state law for ${formData.state}.${customRiderSection}

5. DISPUTE RESOLUTION & GOVERNING LAW:
Governed by the laws of ${governingState}, India. Disputes resolved via ${formData.disputeResolution} in ${formData.city}.

_____________________________                _____________________________
LICENSOR / OWNER                             LICENSEE / TENANT`;
          break;

        case 'nda_agreement':
          draftText = `MUTUAL CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT
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
          break;

        case 'freelance_service':
        case 'freelance_contract':
        case 'service_agreement':
          draftText = `MASTER SERVICE AND DELIVERABLES AGREEMENT
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
          break;

        case 'employment_contract':
          draftText = `EMPLOYMENT TERMS AGREEMENT
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
          break;

        case 'partnership_deed':
          draftText = `PARTNERSHIP DEED
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
          break;

        case 'consumer_legal_notice':
        case 'legal_notice':
          draftText = `FORMAL LEGAL DEMAND NOTICE
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
          break;

        default:
          draftText = `${formData.documentTitle.toUpperCase()}
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
          model: 'gemini-3.5-flash-lite',
          contents: prompt
        });

        // Strip markdown code fences (```json ... ```) that Gemini sometimes wraps around JSON
        const rawText = response.text || '';
        const strippedText = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
        const jsonMatch = strippedText.match(/\{[\s\S]*\}/);
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

      if (lower.includes('indemnify') || lower.includes('hold harmless')) {
        riskLevel = 'high';
        riskExplanation = 'Indemnity / Hold Harmless: This clause requires one party to absorb all claims, losses, and damages of the other, which can be financially unlimited.';
        plainExplanation = 'You are agreeing to protect the other party from any and all legal claims and financial losses — even those caused by them. This is an unusually broad obligation.';
        saferAlternative = 'Add a cap: "Indemnity obligations are limited to direct damages not exceeding the total consideration paid under this agreement."';
      } else if (lower.includes('terminate at sole discretion') || lower.includes('without notice') || lower.includes('without prior notice')) {
        riskLevel = 'critical';
        riskExplanation = 'Unilateral Immediate Exit: Other party can cancel instantly without warning or opportunity to cure.';
        plainExplanation = 'The other party can terminate this agreement at any moment without prior written notice.';
        saferAlternative = 'Add notice period: "Either party may terminate this agreement by providing 30 days prior written notice."';
      } else if (lower.includes('non-compete')) {
        riskLevel = 'medium';
        riskExplanation = 'Restraint of Trade: Blanket non-compete clauses post-termination are void under Section 27 of Indian Contract Act 1872.';
        plainExplanation = 'Restricts your freedom to work or engage in competing business after contract ends.';
        saferAlternative = 'Narrow scope: "Non-compete applies strictly to soliciting existing company clients for a period of 6 months post-exit."';
      } else if (lower.includes('confidential') || lower.includes('disclose') || lower.includes('non-disclosure')) {
        riskLevel = 'medium';
        riskExplanation = 'Confidentiality Obligation: Parties are restricted from sharing information covered under this clause. Violation can lead to injunction or damages.';
        plainExplanation = 'This clause prohibits sharing specified information with anyone outside the agreement. You are legally bound to keep this information secret.';
        saferAlternative = 'Limit scope: "Confidentiality obligations apply only to information expressly marked Confidential and do not cover information already in the public domain."';
      } else if (lower.includes('pay') || lower.includes('rent') || lower.includes('fee') || lower.includes('consideration')) {
        riskLevel = 'low';
        const citationRef = citations[0] ? `as governed by ${citations[0].actShortTitle} ${citations[0].sectionNumber}` : 'under Indian Contract Act 1872';
        riskExplanation = `Payment Obligation: A financial obligation is imposed on one party ${citationRef}. Late payment may attract penalties or termination rights.`;
        plainExplanation = `This clause requires a party to make a specified payment by a defined deadline. Failure to pay on time may constitute a breach of contract ${citationRef}.`;
        saferAlternative = 'Add a cure period: "In case of delayed payment, the defaulting party shall have 7 days from written notice to remedy the breach before the agreement is deemed terminated."';
      } else {
        riskLevel = 'low';
        const clausePreview = clauseText.length > 120 ? clauseText.substring(0, 120) + '...' : clauseText;
        const citationRef = citations[0] ? `under ${citations[0].actShortTitle} ${citations[0].sectionNumber}` : 'under Indian law';
        riskExplanation = `Contractual Obligation: The clause "${clausePreview}" imposes binding duties on one or both parties ${citationRef}.`;
        plainExplanation = `This clause sets out a specific legal obligation. It is binding on the parties ${citationRef}. Review carefully to ensure the terms are fair and the obligations are within your ability to perform.`;
        saferAlternative = 'Ensure this clause is accompanied by clear definitions of what constitutes a breach and what remedies are available to each party.';
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
