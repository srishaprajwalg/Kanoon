import { LegalRAGEngine } from './ragEngine.js';
import type {
  ExtractedDocument,
  ParsedClause,
  ReviewedClauseAnalysis,
  DocumentReviewIssue,
  MissingClauseInfo,
  DocumentInconsistencyInfo,
  DocumentTypeResult,
  DocumentReviewReport,
  LegalStatuteCitation
} from '../types/index.js';
import { segmentDocumentIntoClauses } from './documentSegmenter.js';

/**
 * Detects document type and confidence from filename, headers, and text keywords.
 */
export function detectDocumentType(extractedDoc: ExtractedDocument): DocumentTypeResult {
  const textLower = extractedDoc.text.toLowerCase();
  const nameLower = extractedDoc.filename.toLowerCase();

  let rentScore = 0;
  let ndaScore = 0;
  let employmentScore = 0;
  let freelanceScore = 0;
  let partnershipScore = 0;
  let noticeScore = 0;

  // Filename heuristics
  if (nameLower.includes('rent') || nameLower.includes('lease') || nameLower.includes('tenancy') || nameLower.includes('license')) rentScore += 4;
  if (nameLower.includes('nda') || nameLower.includes('confidential') || nameLower.includes('disclosure')) ndaScore += 4;
  if (nameLower.includes('employ') || nameLower.includes('offer') || nameLower.includes('appoint')) employmentScore += 4;
  if (nameLower.includes('freelance') || nameLower.includes('consult') || nameLower.includes('service')) freelanceScore += 4;
  if (nameLower.includes('partner')) partnershipScore += 4;
  if (nameLower.includes('notice') || nameLower.includes('legal')) noticeScore += 4;

  // Text content heuristics
  if (textLower.includes('leave and license') || textLower.includes('licensor') || textLower.includes('licensee') || textLower.includes('monthly rent') || textLower.includes('demised premises') || textLower.includes('security deposit')) rentScore += 3;
  if (textLower.includes('non-disclosure') || textLower.includes('disclosing party') || textLower.includes('receiving party') || textLower.includes('confidential information') || textLower.includes('proprietary information')) ndaScore += 3;
  if (textLower.includes('employment') || textLower.includes('employee') || textLower.includes('employer') || textLower.includes('probation period') || textLower.includes('ctc') || textLower.includes('salary')) employmentScore += 3;
  if (textLower.includes('freelance') || textLower.includes('independent contractor') || textLower.includes('statement of work') || textLower.includes('deliverables') || textLower.includes('client')) freelanceScore += 3;
  if (textLower.includes('partnership deed') || textLower.includes('partners') || textLower.includes('capital contribution') || textLower.includes('profit sharing')) partnershipScore += 3;
  if (textLower.includes('legal notice') || textLower.includes('under instructions from my client') || textLower.includes('advocate') || textLower.includes('demand notice')) noticeScore += 3;

  const scores = [
    { type: 'rent_agreement', label: 'Residential / Commercial Rent Agreement', score: rentScore },
    { type: 'nda_agreement', label: 'Non-Disclosure Agreement (NDA)', score: ndaScore },
    { type: 'employment_contract', label: 'Employment Contract', score: employmentScore },
    { type: 'freelance_contract', label: 'Freelance / Service Agreement', score: freelanceScore },
    { type: 'partnership_deed', label: 'Partnership Deed', score: partnershipScore },
    { type: 'legal_notice', label: 'Legal Notice', score: noticeScore }
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best.score >= 3) {
    const confidence = Math.min(0.98, Math.round((best.score / 7) * 100) / 100);
    return {
      documentType: best.type,
      label: best.label,
      confidence
    };
  }

  return {
    documentType: 'general_contract',
    label: 'Unknown / General Contract',
    confidence: 0.35
  };
}

/**
 * Performs legal clause analysis and RAG citation matching against verified Indian statutory corpus
 */
export async function analyzeClause(
  clause: ParsedClause,
  documentType: string
): Promise<ReviewedClauseAnalysis> {
  const queryText = `${clause.heading} ${clause.originalText}`;
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(queryText, documentType, 3);
  const hasSufficientEvidence = citations.length > 0 && citations.some(c => (c.confidenceScore || 0) >= LegalRAGEngine.MIN_CONFIDENCE_THRESHOLD);
  
  const lower = clause.originalText.toLowerCase();
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let riskExplanation = '';
  let plainExplanation = '';
  let saferAlternative: string | undefined = undefined;

  // Legal Heuristics + Risk Detection
  if (lower.includes('indemnify') && (lower.includes('unlimited') || lower.includes('all claims') || !lower.includes('capped'))) {
    riskLevel = 'high';
    riskExplanation = 'Unlimited Indemnity Trap: Exposes you to uncapped financial liability for legal fees and third-party damages.';
    plainExplanation = 'You promise to pay for all damages, losses, and lawyer fees without any upper monetary limit.';
    saferAlternative = 'Total indemnity liability under this clause shall be capped at the total fee/consideration paid under this agreement in the preceding 6 months.';
  } else if (lower.includes('terminate at sole discretion') || lower.includes('without notice') || (lower.includes('immediate termination') && !lower.includes('breach'))) {
    riskLevel = 'critical';
    riskExplanation = 'Unilateral Exit Trap: The other party can cancel the agreement instantly at any moment without prior notice.';
    plainExplanation = 'The other party can cancel this contract immediately without warning or opportunity to fix issues.';
    saferAlternative = 'Either party may terminate this agreement by providing 30 days prior written notice to the other party.';
  } else if (lower.includes('non-compete') && (lower.includes('after termination') || lower.includes('post-exit') || lower.includes('years'))) {
    riskLevel = 'medium';
    riskExplanation = 'Restraint of Trade Risk: Post-employment blanket non-competes are void under Section 27 of the Indian Contract Act 1872.';
    plainExplanation = 'Restricts your right to work or start a competing business after this agreement ends.';
    saferAlternative = 'Non-solicitation applies strictly to soliciting existing company clients for a period of 6 months post termination.';
  } else if (lower.includes('forfeit') && lower.includes('security deposit')) {
    riskLevel = 'medium';
    riskExplanation = 'Arbitrary Forfeiture Exposure: Permits landlord/party to keep security deposit without mandatory proof of actual property damage.';
    plainExplanation = 'Risk of losing security deposit without clear inspection guidelines.';
    saferAlternative = 'Security deposit shall be refunded within 7 days of key handover, less legitimate utility arrears backed by actual bills.';
  } else if (lower.includes('lock-in') && (lower.includes('24 month') || lower.includes('36 month') || lower.includes('2 year') || lower.includes('3 year'))) {
    riskLevel = 'high';
    riskExplanation = 'Excessive Lock-in Commitment: Long lock-in period creates severe financial penalty if business or personal needs change.';
    plainExplanation = 'You are locked into paying rent/fees for an excessively long period regardless of job or market changes.';
    saferAlternative = 'Lock-in period shall be limited to 6 months, after which either party may terminate by giving 30 days notice.';
  } else {
    riskLevel = 'low';
    riskExplanation = 'Standard contractual clause without immediate high-risk traps detected.';
    plainExplanation = `Defines standard covenants for ${clause.heading.toLowerCase()} under Indian law.`;
  }

  const evidenceWarning = hasSufficientEvidence ? undefined : 'Insufficient verified statutory evidence was retrieved to make a confident legal claim.';

  return {
    ...clause,
    riskLevel,
    plainExplanation,
    riskExplanation,
    saferAlternative,
    citations,
    hasSufficientEvidence,
    evidenceWarning
  };
}

/**
 * Detects missing essential clauses for the specific document type
 */
export function detectMissingClauses(documentType: string, clauses: ParsedClause[]): MissingClauseInfo[] {
  const missing: MissingClauseInfo[] = [];
  const fullTextLower = clauses.map(c => `${c.heading} ${c.originalText}`).join(' ').toLowerCase();

  if (documentType === 'rent_agreement') {
    if (!fullTextLower.includes('rent') && !fullTextLower.includes('license fee')) {
      missing.push({
        clauseType: 'Rent / License Fee Amount',
        importance: 'critical',
        explanation: 'Monetary contracts require clear consideration under Section 2(d) of Indian Contract Act 1872.',
        suggestedTemplate: 'Licensee shall pay a monthly license fee of ₹[Amount] on or before the 5th of each calendar month.'
      });
    }
    if (!fullTextLower.includes('security deposit')) {
      missing.push({
        clauseType: 'Security Deposit Refund Timeline',
        importance: 'recommended',
        explanation: 'Absence of deposit refund terms leads to landlord-tenant disputes upon exit.',
        suggestedTemplate: 'Refundable security deposit of ₹[Amount] shall be returned within 7 days of vacant possession.'
      });
    }
    if (!fullTextLower.includes('lock-in') && !fullTextLower.includes('tenure')) {
      missing.push({
        clauseType: 'Tenure & Lock-in Commitment',
        importance: 'recommended',
        explanation: 'Specifies lease duration and early exit conditions.',
        suggestedTemplate: 'Tenure shall be 11 months starting from [Date]. Lock-in period shall be 6 months.'
      });
    }
    if (!fullTextLower.includes('stamp duty') && !fullTextLower.includes('registration')) {
      missing.push({
        clauseType: 'State e-Stamp & Registration Clause',
        importance: 'recommended',
        explanation: 'Under Registration Act 1908 & local state stamp acts, tenancy registration and e-Stamp paper are mandatory.',
        suggestedTemplate: 'The cost of e-Stamp paper and registration fees shall be shared equally between Licensor and Licensee.'
      });
    }
  } else if (documentType === 'nda_agreement') {
    if (!fullTextLower.includes('definition') && !fullTextLower.includes('confidential information')) {
      missing.push({
        clauseType: 'Definition of Confidential Information',
        importance: 'critical',
        explanation: 'NDAs must explicitly define what proprietary data, code, or trade secrets are protected.',
        suggestedTemplate: 'Confidential Information includes all proprietary technical data, algorithms, trade secrets, and customer lists.'
      });
    }
    if (!fullTextLower.includes('exclusion') && !fullTextLower.includes('public domain')) {
      missing.push({
        clauseType: 'Carve-outs / Standard Exclusions',
        importance: 'recommended',
        explanation: 'Information already public or independently developed should be excluded from NDA restrictions.',
        suggestedTemplate: 'Confidential information shall not include data publicly available or already known to receiving party.'
      });
    }
    if (!fullTextLower.includes('return') && !fullTextLower.includes('destroy')) {
      missing.push({
        clauseType: 'Return or Destruction of Data',
        importance: 'standard',
        explanation: 'Mandates deletion or return of proprietary materials upon agreement termination.',
        suggestedTemplate: 'Upon request or termination, Receiving Party shall destroy or return all confidential documents within 14 days.'
      });
    }
  }

  // General checks for all contracts
  if (!fullTextLower.includes('governing law') && !fullTextLower.includes('jurisdiction')) {
    missing.push({
      clauseType: 'Governing Law & Jurisdiction',
      importance: 'critical',
      explanation: 'Without a specified jurisdiction, dispute venue remains uncertain in Indian courts.',
      suggestedTemplate: 'This agreement shall be governed by the laws of India and subject to exclusive jurisdiction of courts in [City].'
    });
  }

  if (!fullTextLower.includes('dispute resolution') && !fullTextLower.includes('arbitrat')) {
    missing.push({
      clauseType: 'Dispute Resolution / Arbitration',
      importance: 'recommended',
      explanation: 'Arbitration under Section 7 of Arbitration and Conciliation Act 1996 resolves conflicts faster than litigation.',
      suggestedTemplate: 'Any dispute arising under this agreement shall be resolved via sole arbitrator under Arbitration Act 1996.'
    });
  }

  return missing;
}

/**
 * Detects internal inconsistencies and conflicting provisions within the document
 */
export function detectInconsistencies(_clauses: ParsedClause[], fullText: string): DocumentInconsistencyInfo[] {
  const inconsistencies: DocumentInconsistencyInfo[] = [];

  // Check notice period conflicts
  const noticeMatches = fullText.match(/(\d+)\s*days?\s*notice/gi);
  if (noticeMatches && noticeMatches.length > 1) {
    const numbers = noticeMatches.map(m => parseInt(m.match(/\d+/)?.[0] || '0', 10));
    const uniqueNums = Array.from(new Set(numbers));
    if (uniqueNums.length > 1) {
      inconsistencies.push({
        issueTitle: 'Conflicting Notice Period Requirements',
        explanation: `Document mentions multiple conflicting notice durations (${uniqueNums.join(' days vs ')} days). This causes ambiguity during contract termination.`,
        conflictingClauses: noticeMatches
      });
    }
  }

  // Check lock-in vs zero notice conflict
  const lower = fullText.toLowerCase();
  if (lower.includes('lock-in') && lower.includes('terminate immediately without notice')) {
    inconsistencies.push({
      issueTitle: 'Contradictory Lock-In vs Immediate Exit Terms',
      explanation: 'Document specifies a binding lock-in period while simultaneously claiming right to terminate immediately without notice.',
      conflictingClauses: ['Lock-in Commitment Clause', 'Immediate Termination Clause']
    });
  }

  return inconsistencies;
}

/**
 * Calculates overall document risk score (0-100) and risk level
 */
export function calculateOverallDocumentRisk(
  clauses: ReviewedClauseAnalysis[],
  missingClauses: MissingClauseInfo[],
  inconsistencies: DocumentInconsistencyInfo[]
): { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; summary: string } {
  let score = 100;

  for (const c of clauses) {
    if (c.riskLevel === 'critical') score -= 25;
    else if (c.riskLevel === 'high') score -= 15;
    else if (c.riskLevel === 'medium') score -= 5;
  }

  for (const m of missingClauses) {
    if (m.importance === 'critical') score -= 15;
    else if (m.importance === 'recommended') score -= 8;
  }

  score -= inconsistencies.length * 10;
  score = Math.max(10, Math.min(100, score));

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score < 40) level = 'CRITICAL';
  else if (score < 65) level = 'HIGH';
  else if (score < 85) level = 'MEDIUM';

  const criticalCount = clauses.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length;
  const missingCount = missingClauses.filter(m => m.importance === 'critical').length;

  let summary = `Document Risk Assessment Score: ${score}/100 (${level}). `;
  if (criticalCount > 0) {
    summary += `Found ${criticalCount} high-risk or critical clause trap(s). `;
  } else {
    summary += `No critical clause traps detected. `;
  }
  if (missingCount > 0) {
    summary += `${missingCount} essential statutory provision(s) are missing.`;
  }

  return { score, level, summary };
}

/**
 * Main Orchestrator: Conducts complete legal document review
 */
export async function performFullDocumentReview(extractedDoc: ExtractedDocument): Promise<DocumentReviewReport> {
  const docTypeRes = detectDocumentType(extractedDoc);
  const parsedClauses = segmentDocumentIntoClauses(extractedDoc);

  const reviewedClauses: ReviewedClauseAnalysis[] = [];
  for (const c of parsedClauses) {
    const reviewed = await analyzeClause(c, docTypeRes.documentType);
    reviewedClauses.push(reviewed);
  }

  const missingClauses = detectMissingClauses(docTypeRes.documentType, parsedClauses);
  const inconsistencies = detectInconsistencies(parsedClauses, extractedDoc.text);
  const riskRes = calculateOverallDocumentRisk(reviewedClauses, missingClauses, inconsistencies);

  const criticalIssues: DocumentReviewIssue[] = [];
  const highRiskIssues: DocumentReviewIssue[] = [];
  const mediumRiskIssues: DocumentReviewIssue[] = [];

  reviewedClauses.forEach(c => {
    if (c.riskLevel === 'critical' || c.riskLevel === 'high' || c.riskLevel === 'medium') {
      const issue: DocumentReviewIssue = {
        id: `iss_${c.id}`,
        title: c.heading,
        riskLevel: c.riskLevel,
        explanation: c.riskExplanation,
        clauseId: c.id,
        recommendation: c.saferAlternative || 'Review clause with legal counsel.'
      };
      if (c.riskLevel === 'critical') criticalIssues.push(issue);
      else if (c.riskLevel === 'high') highRiskIssues.push(issue);
      else mediumRiskIssues.push(issue);
    }
  });

  // State Stamp & Registration Guidance
  const complianceGuidance: string[] = [];
  if (docTypeRes.documentType === 'rent_agreement') {
    complianceGuidance.push(
      'Karnataka Stamp Act 1957 (Article 30): Tenancy agreements in Karnataka must pay prescribed e-Stamp duty via Kaveri 2.0 (Department of Stamps & Registration).'
    );
    complianceGuidance.push(
      'Karnataka Rent Act 1999 (Section 4): Tenancy agreements must be in writing and registered with the Rent Controller / Sub-Registrar.'
    );
    complianceGuidance.push(
      'Maharashtra Rent Control Act 1999 (Section 55): Compulsory registration mandated for ALL Leave & License agreements regardless of tenure duration.'
    );
  } else {
    complianceGuidance.push(
      'Indian Stamp Act 1899 & Indian Contract Act 1872: Ensure valid stamp duty is affixed as per governing state rules to preserve admissibility in court.'
    );
  }

  // Aggregate all unique citations
  const citationsMap = new Map<string, LegalStatuteCitation>();
  reviewedClauses.forEach(c => {
    c.citations.forEach(cit => {
      citationsMap.set(cit.id, cit);
    });
  });
  const allCitations = Array.from(citationsMap.values());

  const hasSufficientEvidence = allCitations.length > 0;

  return {
    documentType: docTypeRes.documentType,
    documentTypeLabel: docTypeRes.label,
    documentTypeConfidence: docTypeRes.confidence,
    pageCount: extractedDoc.pageCount,
    clauseCount: reviewedClauses.length,
    overallRiskScore: riskRes.score,
    overallRiskLevel: riskRes.level,
    executiveSummary: riskRes.summary,
    criticalIssues,
    highRiskIssues,
    mediumRiskIssues,
    missingClauses,
    inconsistencies,
    clauses: reviewedClauses,
    complianceGuidance,
    citations: allCitations,
    hasSufficientEvidence
  };
}
