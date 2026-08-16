import { performFullDocumentReview } from '../src/services/documentReviewer.js';
import { generateBriefFromReviewReport, generateBriefFromDraftedDocument, formatBriefAsText } from '../src/services/briefGenerator.js';
import type { ExtractedDocument, GeneratedDocument, LegalRiskBrief } from '../src/types/index.js';
import { ADVOCATES_DIRECTORY } from '../src/data/expertAdvocates.js';

async function runLegalRiskBriefTestSuite() {
  console.log('================================================================================');
  console.log('🛡️ KANOON PHASE 3 — ADVOCATE LEGAL RISK BRIEF TEST SUITE');
  console.log('================================================================================\n');

  let passedTests = 0;
  const totalTests = 6;

  // ---------------------------------------------------------------------------
  // TEST 1: Brief from reviewed rental agreement with unlimited indemnity
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 1: Generate Brief from Reviewed Rental Agreement with Unlimited Indemnity');
  console.log('--------------------------------------------------------------------------------');

  const textWithIndemnity = `COMMERCIAL LEASE AGREEMENT
1. RENT: Monthly rent of Rs 1,500,000 in Bengaluru, Karnataka.
2. UNLIMITED INDEMNITY: Lessee shall indemnify, defend, and hold harmless Lessor against any and all claims, damages, liabilities, and attorney fees without any monetary cap.
3. GOVERNING LAW: Governed by laws of Karnataka.`;

  const doc1: ExtractedDocument = {
    text: textWithIndemnity,
    pageCount: 1,
    filename: 'Indemnity_Lease.txt',
    mimeType: 'text/plain',
    pages: [{ pageNumber: 1, text: textWithIndemnity }]
  };

  const report1 = await performFullDocumentReview(doc1);
  const brief1 = generateBriefFromReviewReport(report1, {
    jurisdiction: 'Karnataka',
    userNotes: 'Concerned about uncapped indemnity liability.'
  });

  console.log(`  • Document Title: ${brief1.documentTitle}`);
  console.log(`  • Risk Score: ${brief1.executiveSummary.overallRiskScore} / 100 (${brief1.executiveSummary.overallRiskLevel})`);
  console.log(`  • Critical Issues Count: ${brief1.criticalIssues.length}`);

  const indemnityIssue = brief1.criticalIssues.find(
    (i) => i.description.toLowerCase().includes('indemn') || (i.clauseTitle && i.clauseTitle.toLowerCase().includes('indemn'))
  );

  if (
    brief1.sourceType === 'uploaded' &&
    brief1.criticalIssues.length > 0 &&
    indemnityIssue &&
    indemnityIssue.saferAlternative &&
    brief1.citations.length > 0 &&
    brief1.userNotes.includes('indemnity')
  ) {
    console.log(`  • Critical Issue Title: ${indemnityIssue.clauseTitle}`);
    console.log(`  • Safer Alternative: ${indemnityIssue.saferAlternative}`);
    console.log(`  • Grounded Statutory Citations Preserved: ${brief1.citations.length}`);
    console.log('  ✅ TEST 1 PASSED: Unlimited indemnity brief correctly generated with safer alternative and statutory evidence.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 1 FAILED: Brief generation missing critical indemnity details or citations.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Brief from document containing conflicting notice periods
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 2: Generate Brief from Document with Conflicting Notice Periods');
  console.log('--------------------------------------------------------------------------------');

  const textWithInconsistency = `EMPLOYMENT AGREEMENT
1. NOTICE PERIOD: Employee shall give 30 days notice prior to resignation.
2. TERMINATION TERMS: Either party may terminate by providing 90 days notice in writing.`;

  const doc2: ExtractedDocument = {
    text: textWithInconsistency,
    pageCount: 1,
    filename: 'Inconsistent_Notice.txt',
    mimeType: 'text/plain',
    pages: [{ pageNumber: 1, text: textWithInconsistency }]
  };

  const report2 = await performFullDocumentReview(doc2);
  const brief2 = generateBriefFromReviewReport(report2);

  console.log(`  • Inconsistencies Detected: ${brief2.inconsistencies.length}`);

  if (brief2.inconsistencies.length > 0) {
    console.log(`  • Inconsistency Title: ${brief2.inconsistencies[0].issueTitle}`);
    console.log(`  • Explanation: ${brief2.inconsistencies[0].explanation}`);
    console.log('  ✅ TEST 2 PASSED: Conflicting notice periods correctly surfaced in brief inconsistencies.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 2 FAILED: Inconsistent notice periods not detected in brief.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Brief from document with missing essential provisions
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 3: Generate Brief from Document with Missing Essential Provisions');
  console.log('--------------------------------------------------------------------------------');

  const textMissingClauses = `SIMPLE TENANCY AGREEMENT
Tenant pays rent to landlord monthly.`;

  const doc3: ExtractedDocument = {
    text: textMissingClauses,
    pageCount: 1,
    filename: 'Incomplete_Tenancy.txt',
    mimeType: 'text/plain',
    pages: [{ pageNumber: 1, text: textMissingClauses }]
  };

  const report3 = await performFullDocumentReview(doc3);
  const brief3 = generateBriefFromReviewReport(report3);

  console.log(`  • Missing Provisions Count: ${brief3.missingProvisions.length}`);

  if (brief3.missingProvisions.length > 0) {
    brief3.missingProvisions.forEach((m) => {
      console.log(`    - [Missing] ${m.clauseType}: ${m.whyItMatters}`);
    });
    console.log('  ✅ TEST 3 PASSED: Missing essential provisions correctly identified in brief.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 3 FAILED: Missing provisions not surfaced in brief.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Brief from out-of-domain / non-legal document
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 4: Generate Brief from Out-of-Domain Non-Legal Document');
  console.log('--------------------------------------------------------------------------------');

  const nonLegalText = `CHOCOLATE CAKE RECIPE
Preheat oven to 350F. Mix flour, sugar, cocoa powder, baking powder, and milk. Bake for 30 minutes.`;

  const doc4: ExtractedDocument = {
    text: nonLegalText,
    pageCount: 1,
    filename: 'Cake_Recipe.txt',
    mimeType: 'text/plain',
    pages: [{ pageNumber: 1, text: nonLegalText }]
  };

  const report4 = await performFullDocumentReview(doc4);
  const brief4 = generateBriefFromReviewReport(report4);

  console.log(`  • Grounded Citations Count: ${brief4.citations.length}`);
  console.log(`  • Evidence Warning: ${brief4.evidenceWarning || 'None'}`);

  if (brief4.citations.length === 0 && (brief4.evidenceWarning || brief4.hasSufficientEvidence === false)) {
    console.log('  ✅ TEST 4 PASSED: Out-of-domain document produced no fabricated statutory evidence and explicit warning.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 4 FAILED: Out-of-domain document fabricated statutory citations.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Brief from newly drafted document (SmartDrafter integration)
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 5: Generate Brief from Newly Drafted Document (SmartDrafter)');
  console.log('--------------------------------------------------------------------------------');

  const draftedDoc: GeneratedDocument = {
    id: 'doc_draft_101',
    title: 'Mutual Non-Disclosure Agreement',
    templateType: 'nda_agreement',
    createdAt: new Date().toISOString(),
    state: 'Karnataka',
    draftText: 'MUTUAL NON-DISCLOSURE AGREEMENT...',
    plainSummaryText: 'Mutual NDA protecting proprietary technical and commercial data.',
    clauses: [
      {
        clauseTitle: 'Indemnification & Breach Damage',
        legaleseText: 'Receiving party shall indemnify disclosing party against all losses...',
        plainLanguageText: 'You promise to pay for damages if confidential data is leaked.',
        riskLevel: 'high',
        riskExplanation: 'Uncapped breach indemnity creates financial risk.',
        recommendation: 'Add a liability cap equal to total project fee.',
        saferAlternative: 'Total liability under this NDA shall not exceed Rs. 500,000.'
      }
    ],
    riskScore: 78,
    completenessScore: 90,
    stampDutyRequired: 'Rs. 200 e-Stamp paper under Karnataka Stamp Act 1957',
    notarizationRequired: false,
    registrationRequired: false,
    legalActReferences: ['Karnataka Procurement Act 1999 Section 3'],
    citations: [
      {
        id: 'karnataka_procurement_act_1999_sec_3',
        actName: 'The Karnataka Transparency in Public Procurements Act, 1999',
        actShortTitle: 'Karnataka Procurement Act 1999',
        sectionNumber: 'Section 3',
        sectionTitle: 'Provisions for confidentiality',
        statuteText: 'Provisions relating to confidentiality in procurement and commercial documents...',
        relevanceExplanation: 'Grounded statutory reference for NDA confidentiality.',
        applicabilityTag: 'commercial_nda',
        jurisdiction: 'KARNATAKA',
        sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Procurement_Act_1999.pdf',
        sha256: '9f8374a2b9183748291038475629103847562910384756291038475629103847'
      }
    ],
    validationWarnings: [],
    disclaimer: 'Generated for informational purposes.'
  };

  const selectedAdvocate = ADVOCATES_DIRECTORY[0];
  const brief5 = generateBriefFromDraftedDocument(draftedDoc, {
    userNotes: 'Client wants to confirm whether Rs. 500,000 liability cap is enforceable in Bengaluru courts.',
    selectedAdvocate
  });

  console.log(`  • Source Type: ${brief5.sourceType}`);
  console.log(`  • Document Title: ${brief5.documentTitle}`);
  console.log(`  • Risk Score: ${brief5.executiveSummary.overallRiskScore}`);
  console.log(`  • Assigned Advocate: ${brief5.selectedAdvocate?.name} (${brief5.selectedAdvocate?.city})`);
  console.log(`  • Handoff Status: ${brief5.handoffStatus}`);

  const formattedText = formatBriefAsText(brief5);

  if (
    brief5.sourceType === 'drafted' &&
    brief5.documentTitle === 'Mutual Non-Disclosure Agreement' &&
    brief5.criticalIssues.length === 1 &&
    brief5.selectedAdvocate?.id === 'adv_1' &&
    brief5.handoffStatus === 'advocate_assigned' &&
    formattedText.includes('ADVOCATE LEGAL RISK BRIEF')
  ) {
    console.log('  ✅ TEST 5 PASSED: Drafted document correctly converted into Legal Risk Brief with advocate handoff.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 5 FAILED: SmartDrafter brief conversion failed.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Citation Object Matching & Preservation
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST 6: Statutory Evidence Object Preservation & SHA-256 Provenance');
  console.log('--------------------------------------------------------------------------------');

  const sourceCitation = draftedDoc.citations[0];
  const briefCitation = brief5.citations[0];

  console.log(`  • Source Citation SHA-256: ${sourceCitation.sha256}`);
  console.log(`  • Brief Citation SHA-256:  ${briefCitation.sha256}`);
  console.log(`  • Source URL: ${sourceCitation.sourceUrl}`);
  console.log(`  • Section Number: ${briefCitation.sectionNumber}`);

  if (
    briefCitation &&
    briefCitation.actName === sourceCitation.actName &&
    briefCitation.sectionNumber === sourceCitation.sectionNumber &&
    briefCitation.sha256 === sourceCitation.sha256 &&
    briefCitation.sourceUrl === sourceCitation.sourceUrl
  ) {
    console.log('  ✅ TEST 6 PASSED: Verified statutory evidence objects, SHA-256 hashes, and URLs match exactly.\n');
    passedTests++;
  } else {
    console.error('  ❌ TEST 6 FAILED: Statutory citation objects altered or corrupted during brief generation.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('================================================================================');
  console.log(`📊 PHASE 3 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('================================================================================\n');
}

runLegalRiskBriefTestSuite().catch((err) => {
  console.error('Fatal error during Legal Risk Brief test suite:', err);
  process.exit(1);
});
