import type {
  LegalRiskBrief,
  LegalRiskBriefIssueItem,
  LegalRiskBriefMissingItem,
  LegalRiskBriefInconsistencyItem,
  DocumentReviewReport,
  GeneratedDocument,
  ReviewedClauseAnalysis,
  AdvocateProfile
} from '../types/index.js';

/**
 * Generates a structured Legal Risk Brief from a DocumentReviewReport (uploaded document review).
 */
export function generateBriefFromReviewReport(
  report: DocumentReviewReport,
  options?: {
    jurisdiction?: string;
    parties?: { partyA?: string; partyB?: string };
    userNotes?: string;
    selectedAdvocate?: AdvocateProfile;
  }
): LegalRiskBrief {
  // 1. Map Critical & High Risk Issues from reviewed clauses or issues
  const criticalIssues: LegalRiskBriefIssueItem[] = [];

  if (report.clauses && report.clauses.length > 0) {
    report.clauses
      .filter((cl: ReviewedClauseAnalysis) => cl.riskLevel === 'high' || cl.riskLevel === 'critical' || cl.riskLevel === 'medium')
      .forEach((cl: ReviewedClauseAnalysis) => {
        criticalIssues.push({
          id: cl.id,
          clauseTitle: cl.heading || cl.sectionNumber || 'Clause Risk',
          clauseNumber: cl.sectionNumber,
          riskLevel: cl.riskLevel,
          description: cl.riskExplanation || cl.plainExplanation,
          plainEnglishExplanation: cl.plainExplanation,
          recommendedAction: cl.saferAlternative
            ? `Replace high-risk clause with safer alternative.`
            : `Review clause terms with legal counsel.`,
          saferAlternative: cl.saferAlternative,
          citations: cl.citations || []
        });
      });
  }

  // Fallback to report.criticalIssues / highRiskIssues if clauses array didn't yield items
  if (criticalIssues.length === 0 && report.criticalIssues && report.criticalIssues.length > 0) {
    report.criticalIssues.forEach((issue) => {
      criticalIssues.push({
        id: issue.id,
        clauseTitle: issue.title,
        riskLevel: issue.riskLevel,
        description: issue.explanation,
        plainEnglishExplanation: issue.explanation,
        recommendedAction: issue.recommendation,
        citations: report.citations || []
      });
    });
  }

  // 2. Map Missing Provisions
  const missingProvisions: LegalRiskBriefMissingItem[] = (report.missingClauses || []).map((m) => ({
    clauseType: m.clauseType,
    importance: m.importance,
    whyItMatters: m.explanation,
    recommendedAction: `Insert standard statutory clause into document: "${m.suggestedTemplate}"`
  }));

  // 3. Map Internal Inconsistencies
  const inconsistencies: LegalRiskBriefInconsistencyItem[] = (report.inconsistencies || []).map((inc) => ({
    issueTitle: inc.issueTitle,
    explanation: inc.explanation,
    recommendedAction: 'Reconcile conflicting clause terms to ensure legal clarity.',
    conflictingClauses: inc.conflictingClauses
  }));

  // 4. Generate Recommended Questions for Advocate
  const recommendedQuestions: string[] = [];

  const hasIndemnityRisk = criticalIssues.some(
    (i) => i.description.toLowerCase().includes('indemn') || (i.clauseTitle && i.clauseTitle.toLowerCase().includes('indemn'))
  );
  if (hasIndemnityRisk) {
    recommendedQuestions.push('How can we cap the indemnity liability to match our commercial risk tolerance under Indian Contract Law?');
  }

  const hasTerminationRisk = criticalIssues.some(
    (i) => i.description.toLowerCase().includes('terminat') || (i.clauseTitle && i.clauseTitle.toLowerCase().includes('terminat'))
  );
  if (hasTerminationRisk) {
    recommendedQuestions.push('Does the current termination clause expose my side to unfair unilateral exit traps without adequate notice?');
  }

  if (missingProvisions.some((m) => m.clauseType.toLowerCase().includes('governing') || m.clauseType.toLowerCase().includes('arbitration') || m.clauseType.toLowerCase().includes('dispute'))) {
    recommendedQuestions.push('Which court jurisdiction and arbitration mechanism should be specified to minimize litigation overhead?');
  }

  if (inconsistencies.length > 0) {
    recommendedQuestions.push('How should the conflicting clause notice/tenure terms be standardized before execution?');
  }

  // Default advocate questions if list is short
  if (recommendedQuestions.length < 3) {
    recommendedQuestions.push('Are there any state-specific e-Stamp or mandatory registration requirements applicable to this contract?');
    recommendedQuestions.push('What specific amendments do you recommend to protect my rights before signing?');
  }

  const hasSufficientEvidence = report.hasSufficientEvidence ?? (report.citations && report.citations.length > 0);
  const evidenceWarning = hasSufficientEvidence
    ? undefined
    : 'Insufficient verified statutory evidence was retrieved.';

  return {
    id: `brief_rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourceType: 'uploaded',
    documentTitle: report.documentTypeLabel || 'Uploaded Legal Document',
    documentType: report.documentType,
    jurisdiction: options?.jurisdiction || 'India (Central & State Statutes)',
    parties: options?.parties,
    executiveSummary: {
      summaryText: report.executiveSummary,
      overallRiskScore: report.overallRiskScore,
      overallRiskLevel: report.overallRiskLevel
    },
    criticalIssues,
    missingProvisions,
    inconsistencies,
    citations: report.citations || [],
    hasSufficientEvidence,
    evidenceWarning,
    recommendedQuestions,
    userNotes: options?.userNotes || '',
    selectedAdvocate: options?.selectedAdvocate,
    handoffStatus: options?.selectedAdvocate ? 'advocate_assigned' : 'professional_review_recommended',
    disclaimer: 'DISCLAIMER: This Legal Risk Brief is generated automatically by Kanoon AI for informational handoff purposes. It does NOT constitute formal legal advice or create an attorney-client relationship. All AI recommendations must be verified by a licensed Bar Council Advocate.'
  };
}

/**
 * Generates a structured Legal Risk Brief from a GeneratedDocument (SmartDrafter document).
 */
export function generateBriefFromDraftedDocument(
  doc: GeneratedDocument,
  options?: {
    userNotes?: string;
    selectedAdvocate?: AdvocateProfile;
  }
): LegalRiskBrief {
  const criticalIssues: LegalRiskBriefIssueItem[] = [];

  if (doc.clauses && doc.clauses.length > 0) {
    doc.clauses
      .filter((cl) => cl.riskLevel === 'high' || cl.riskLevel === 'critical' || cl.riskLevel === 'medium')
      .forEach((cl) => {
        criticalIssues.push({
          id: cl.id || `cl_${Math.random()}`,
          clauseTitle: cl.clauseTitle,
          riskLevel: cl.riskLevel,
          description: cl.riskExplanation,
          plainEnglishExplanation: cl.plainLanguageText,
          recommendedAction: cl.recommendation,
          saferAlternative: cl.saferAlternative,
          citations: cl.citation ? [cl.citation] : []
        });
      });
  }

  const missingProvisions: LegalRiskBriefMissingItem[] = (doc.validationWarnings || []).map((w) => ({
    clauseType: w.fieldName,
    importance: w.importance === 'critical' ? 'critical' : 'recommended',
    whyItMatters: w.message,
    recommendedAction: w.suggestion
  }));

  const recommendedQuestions: string[] = [
    `Are the liability caps and dispute resolution terms in this ${doc.title} enforceable under ${doc.state} jurisdiction?`,
    `What mandatory e-Stamp paper value and registration procedures apply for this document in ${doc.state}?`,
    `Do you recommend any customized protective covenants for my specific business context?`
  ];

  const overallRiskLevel =
    doc.riskScore >= 85 ? 'LOW' : doc.riskScore >= 65 ? 'MEDIUM' : doc.riskScore >= 40 ? 'HIGH' : 'CRITICAL';

  const hasSufficientEvidence = doc.hasSufficientEvidence ?? (doc.citations && doc.citations.length > 0);
  const evidenceWarning = doc.evidenceWarning || (!hasSufficientEvidence ? 'Insufficient verified statutory evidence was retrieved.' : undefined);

  return {
    id: `brief_draft_${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourceType: 'drafted',
    documentTitle: doc.title,
    documentType: doc.templateType,
    jurisdiction: doc.state || 'India (Central & State Statutes)',
    executiveSummary: {
      summaryText: doc.plainSummaryText || `Statutorily grounded ${doc.title} drafted via Kanoon AI.`,
      overallRiskScore: doc.riskScore,
      overallRiskLevel
    },
    criticalIssues,
    missingProvisions,
    inconsistencies: [],
    citations: doc.citations || [],
    hasSufficientEvidence,
    evidenceWarning,
    recommendedQuestions,
    userNotes: options?.userNotes || '',
    selectedAdvocate: options?.selectedAdvocate,
    handoffStatus: options?.selectedAdvocate ? 'advocate_assigned' : 'professional_review_recommended',
    disclaimer: 'DISCLAIMER: This Legal Risk Brief is generated automatically by Kanoon AI for informational handoff purposes. It does NOT constitute formal legal advice or create an attorney-client relationship. All AI recommendations must be verified by a licensed Bar Council Advocate.'
  };
}

/**
 * Formats a LegalRiskBrief into plain text for copying, downloading as .txt, or printing.
 */
export function formatBriefAsText(brief: LegalRiskBrief): string {
  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('⚖️  KANOON AI — ADVOCATE LEGAL RISK BRIEF');
  lines.push('================================================================================');
  lines.push(`Generated On: ${new Date(brief.createdAt).toLocaleString('en-IN')}`);
  lines.push(`Handoff Status: ${brief.handoffStatus.toUpperCase()}`);
  if (brief.selectedAdvocate) {
    lines.push(`Assigned Counsel: ${brief.selectedAdvocate.name} (${brief.selectedAdvocate.barCouncilNumber}) - ${brief.selectedAdvocate.city}`);
  }
  lines.push('');

  lines.push('--------------------------------------------------------------------------------');
  lines.push('1. DOCUMENT INFORMATION');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Document Title: ${brief.documentTitle}`);
  lines.push(`Document Type:  ${brief.documentType}`);
  lines.push(`Jurisdiction:   ${brief.jurisdiction}`);
  lines.push(`Source:         ${brief.sourceType === 'drafted' ? 'Drafted by Kanoon AI SmartDrafter' : 'Uploaded Existing Document'}`);
  if (brief.parties?.partyA || brief.parties?.partyB) {
    lines.push(`Parties:        ${brief.parties.partyA || 'N/A'} <---> ${brief.parties.partyB || 'N/A'}`);
  }
  lines.push('');

  lines.push('--------------------------------------------------------------------------------');
  lines.push('2. EXECUTIVE SUMMARY & RISK ASSESSMENT');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Safety/Risk Score: ${brief.executiveSummary.overallRiskScore} / 100`);
  lines.push(`Overall Risk Level: ${brief.executiveSummary.overallRiskLevel}`);
  lines.push(`Summary: ${brief.executiveSummary.summaryText}`);
  lines.push('');

  lines.push('--------------------------------------------------------------------------------');
  lines.push('3. CRITICAL & HIGH RISK ISSUES (AI DETECTED)');
  lines.push('--------------------------------------------------------------------------------');
  if (brief.criticalIssues.length === 0) {
    lines.push('No critical or high-risk clauses were detected in this document.');
  } else {
    brief.criticalIssues.forEach((item, idx) => {
      lines.push(`[Issue #${idx + 1}] ${item.clauseTitle || 'Clause Issue'} [Risk: ${item.riskLevel.toUpperCase()}]`);
      lines.push(`  • Description: ${item.description}`);
      lines.push(`  • Plain-English Meaning: ${item.plainEnglishExplanation}`);
      lines.push(`  • Recommended Action: ${item.recommendedAction}`);
      if (item.saferAlternative) {
        lines.push(`  • Safer Alternative Clause: "${item.saferAlternative}"`);
      }
      lines.push('');
    });
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('4. MISSING ESSENTIAL PROVISIONS');
  lines.push('--------------------------------------------------------------------------------');
  if (brief.missingProvisions.length === 0) {
    lines.push('All standard essential statutory provisions appear to be present.');
  } else {
    brief.missingProvisions.forEach((m, idx) => {
      lines.push(`[Missing #${idx + 1}] ${m.clauseType} [Importance: ${m.importance.toUpperCase()}]`);
      lines.push(`  • Why It Matters: ${m.whyItMatters}`);
      lines.push(`  • Recommended Action: ${m.recommendedAction}`);
      lines.push('');
    });
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('5. INTERNAL INCONSISTENCIES & CONFLICTS');
  lines.push('--------------------------------------------------------------------------------');
  if (brief.inconsistencies.length === 0) {
    lines.push('No internal clause contradictions were identified.');
  } else {
    brief.inconsistencies.forEach((inc, idx) => {
      lines.push(`[Inconsistency #${idx + 1}] ${inc.issueTitle}`);
      lines.push(`  • Explanation: ${inc.explanation}`);
      lines.push(`  • Conflicting Terms: ${inc.conflictingClauses.join(' vs ')}`);
      lines.push(`  • Recommended Action: ${inc.recommendedAction}`);
      lines.push('');
    });
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('6. VERIFIED STATUTORY EVIDENCE & CITATIONS (INDIAN ACTS)');
  lines.push('--------------------------------------------------------------------------------');
  if (!brief.hasSufficientEvidence || brief.citations.length === 0) {
    lines.push(`⚠️ WARNING: ${brief.evidenceWarning || 'Insufficient verified statutory evidence was retrieved.'}`);
  } else {
    brief.citations.forEach((cit, idx) => {
      lines.push(`[Statutory Citation #${idx + 1}]`);
      lines.push(`  • Act: ${cit.actName} (${cit.actShortTitle || ''})`);
      lines.push(`  • Section: ${cit.sectionNumber} — ${cit.sectionTitle}`);
      if (cit.pageNumbers && cit.pageNumbers.length > 0) {
        lines.push(`  • Source Pages: Page(s) ${cit.pageNumbers.join(', ')}`);
      }
      if (cit.sourceUrl) {
        lines.push(`  • Official Source URL: ${cit.sourceUrl}`);
      }
      if (cit.sha256) {
        lines.push(`  • Provenance SHA-256: ${cit.sha256}`);
      }
      if (cit.similarityScore !== undefined) {
        lines.push(`  • Cosine Similarity: ${cit.similarityScore.toFixed(2)}`);
      }
      lines.push(`  • Statutory Text: "${cit.statuteText.slice(0, 200)}..."`);
      lines.push('');
    });
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('7. RECOMMENDED QUESTIONS FOR ADVOCATE CONSULTATION');
  lines.push('--------------------------------------------------------------------------------');
  brief.recommendedQuestions.forEach((q, idx) => {
    lines.push(`${idx + 1}. ${q}`);
  });
  lines.push('');

  if (brief.userNotes) {
    lines.push('--------------------------------------------------------------------------------');
    lines.push('8. USER CONCERNS & SPECIFIC NOTES');
    lines.push('--------------------------------------------------------------------------------');
    lines.push(brief.userNotes);
    lines.push('');
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('9. LEGAL DISCLAIMER');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(brief.disclaimer);
  lines.push('================================================================================');

  return lines.join('\n');
}
