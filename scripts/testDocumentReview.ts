import { LegalRAGEngine } from '../src/services/ragEngine.js';
import { extractDocumentContent } from '../src/services/documentExtractor.js';
import { segmentDocumentIntoClauses } from '../src/services/documentSegmenter.js';
import { performFullDocumentReview, detectDocumentType } from '../src/services/documentReviewer.js';
import type { ExtractedDocument } from '../src/types/index.js';

console.log(`
================================================================================
🛡️ KANOON PHASE 2 — EXISTING DOCUMENT REVIEW & AUDIT TEST SUITE
================================================================================
`);

async function runDocumentReviewTests() {
  let passedCount = 0;
  let totalTests = 8;

  // Initialize RAG Engine
  await LegalRAGEngine.initializeCorpus();

  // ---------------------------------------------------------------------------
  // TEST 1: Simple Rental Agreement Type & Karnataka Law Retrieval
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 1: Simple Rental Agreement Classification & Karnataka Law Grounding');
  console.log('--------------------------------------------------------------------------------');
  try {
    const rentDocText = `
    LEAVE AND LICENSE AGREEMENT
    This agreement is made at Bengaluru, Karnataka between Landlord and Tenant.
    1. DEMISED PREMISES & RENT: Tenant agrees to pay monthly rent of Rs. 25,000.
    2. SECURITY DEPOSIT: Refundable security deposit of Rs. 150,000 shall be returned within 7 days of key handover.
    3. TENURE & NOTICE: Duration is 11 months. Either party may terminate with 30 days notice.
    4. GOVERNING LAW: Governed by the laws of Karnataka, India.
    `;
    
    const extracted: ExtractedDocument = {
      text: rentDocText,
      pageCount: 1,
      filename: 'Bengaluru_Rent_Agreement.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: rentDocText }]
    };

    const review = await performFullDocumentReview(extracted);
    console.log(`  • Detected Document Type: ${review.documentType} (${review.documentTypeLabel})`);
    console.log(`  • Extracted Clauses: ${review.clauseCount}`);
    console.log(`  • Grounded Statutory Citations: ${review.citations.length}`);

    const isRentType = review.documentType === 'rent_agreement';
    const hasCitations = review.citations.length > 0;

    if (isRentType && hasCitations) {
      console.log('  ✅ TEST 1 PASSED: Rental agreement classified and Karnataka statutory law retrieved successfully.');
      passedCount++;
    } else {
      console.error(`  ❌ TEST 1 FAILED: Expected rent_agreement type and citations. Got type: ${review.documentType}`);
    }
  } catch (err: any) {
    console.error('  ❌ TEST 1 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Agreement with Unlimited Indemnity Trap
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 2: Unlimited Indemnity Risk Detection & Safer Alternative');
  console.log('--------------------------------------------------------------------------------');
  try {
    const indemnityText = `
    COMMERCIAL SERVICES AGREEMENT
    1. UNLIMITED INDEMNITY: Contractor agrees to indemnify and hold harmless Client from any and all claims, liabilities, damages, losses, and legal costs with unlimited monetary liability without any cap.
    2. GOVERNING LAW: Governed by Indian law.
    `;

    const extracted: ExtractedDocument = {
      text: indemnityText,
      pageCount: 1,
      filename: 'Service_Agreement_Trap.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: indemnityText }]
    };

    const review = await performFullDocumentReview(extracted);
    const indemnityClause = review.clauses.find(c => c.originalText.toLowerCase().includes('indemnify'));
    
    if (indemnityClause) {
      console.log(`  • Indemnity Risk Level: ${indemnityClause.riskLevel.toUpperCase()}`);
      console.log(`  • Risk Explanation: ${indemnityClause.riskExplanation}`);
      console.log(`  • Safer Alternative: ${indemnityClause.saferAlternative}`);
    }

    const isHighOrCritical = indemnityClause && (indemnityClause.riskLevel === 'high' || indemnityClause.riskLevel === 'critical');
    const hasAlternative = Boolean(indemnityClause?.saferAlternative);

    if (isHighOrCritical && hasAlternative) {
      console.log('  ✅ TEST 2 PASSED: Unlimited indemnity detected as high/critical risk with safer alternative.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 2 FAILED: Failed to flag unlimited indemnity as high/critical risk.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 2 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Unilateral Immediate Exit Trap
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 3: Unilateral Immediate Termination Risk Detection');
  console.log('--------------------------------------------------------------------------------');
  try {
    const terminationText = `
    FREELANCE CONTRACT
    1. UNILATERAL TERMINATION: Client reserves the right to terminate at sole discretion immediately without notice and forfeit all pending contractor payments.
    2. PAYMENT: Monthly payment of Rs. 50,000.
    `;

    const extracted: ExtractedDocument = {
      text: terminationText,
      pageCount: 1,
      filename: 'Freelance_Trap.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: terminationText }]
    };

    const review = await performFullDocumentReview(extracted);
    const termClause = review.clauses.find(c => c.originalText.toLowerCase().includes('terminate'));

    if (termClause) {
      console.log(`  • Termination Risk Level: ${termClause.riskLevel.toUpperCase()}`);
      console.log(`  • Explanation: ${termClause.riskExplanation}`);
    }

    const isCritical = termClause && (termClause.riskLevel === 'critical' || termClause.riskLevel === 'high');

    if (isCritical) {
      console.log('  ✅ TEST 3 PASSED: Unilateral immediate termination trap correctly detected as critical/high risk.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 3 FAILED: Unilateral exit trap not flagged as critical/high risk.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 3 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Missing Important Clauses
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 4: Missing Essential Clauses Detection');
  console.log('--------------------------------------------------------------------------------');
  try {
    const incompleteText = `
    RENTAL AGREEMENT
    1. DEMISED PREMISES: Apartment in Bengaluru.
    Party A lets out apartment to Party B.
    `;

    const extracted: ExtractedDocument = {
      text: incompleteText,
      pageCount: 1,
      filename: 'Incomplete_Rent.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: incompleteText }]
    };

    const review = await performFullDocumentReview(extracted);
    console.log(`  • Detected Missing Provisions Count: ${review.missingClauses.length}`);
    review.missingClauses.forEach(m => console.log(`    - [${m.importance.toUpperCase()}] ${m.clauseType}: ${m.explanation}`));

    const hasMissingRent = review.missingClauses.some(m => m.clauseType.toLowerCase().includes('rent') || m.clauseType.toLowerCase().includes('deposit') || m.clauseType.toLowerCase().includes('governing'));

    if (hasMissingRent && review.missingClauses.length >= 2) {
      console.log('  ✅ TEST 4 PASSED: Missing essential clauses (rent, deposit, governing law) correctly identified.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 4 FAILED: Incomplete document did not report expected missing clauses.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 4 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Contradictory Clauses Detection
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 5: Document Inconsistencies & Contradictions Detection');
  console.log('--------------------------------------------------------------------------------');
  try {
    const contradictoryText = `
    AGREEMENT
    1. TERMINATION NOTICE: Either party may terminate this agreement by giving 30 days notice in writing.
    2. EARLY EXIT NOTICE: Contractor must provide 90 days notice in writing to terminate early.
    `;

    const extracted: ExtractedDocument = {
      text: contradictoryText,
      pageCount: 1,
      filename: 'Contradictory_Notice.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: contradictoryText }]
    };

    const review = await performFullDocumentReview(extracted);
    console.log(`  • Detected Inconsistencies Count: ${review.inconsistencies.length}`);
    review.inconsistencies.forEach(inc => console.log(`    - ${inc.issueTitle}: ${inc.explanation}`));

    if (review.inconsistencies.length > 0) {
      console.log('  ✅ TEST 5 PASSED: Contradictory notice periods correctly flagged as document inconsistency.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 5 FAILED: Failed to detect conflicting notice durations.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 5 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Out-of-Domain Document (No Fabrication)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 6: Out-of-Domain Document Non-Fabrication Check');
  console.log('--------------------------------------------------------------------------------');
  try {
    const oodText = `
    BAKING RECIPE FOR CHOCOLATE CAKE
    Mix 2 cups of flour, 1 cup of sugar, and 3 eggs. Bake at 350 degrees Fahrenheit for 30 minutes. Serve cold with chocolate fudge frosting.
    `;

    const extracted: ExtractedDocument = {
      text: oodText,
      pageCount: 1,
      filename: 'Cake_Recipe.txt',
      mimeType: 'text/plain',
      pages: [{ pageNumber: 1, text: oodText }]
    };

    const review = await performFullDocumentReview(extracted);
    console.log(`  • Document Type: ${review.documentType} (${review.documentTypeLabel})`);
    console.log(`  • Total Grounded Citations: ${review.citations.length}`);

    const isGeneralType = review.documentType === 'general_contract';
    const noFabricatedCitations = review.citations.length === 0 || review.clauses.every(c => !c.hasSufficientEvidence || c.citations.length === 0);

    if (isGeneralType && noFabricatedCitations) {
      console.log('  ✅ TEST 6 PASSED: Non-legal recipe document correctly handled without inventing fake statutory evidence.');
      passedCount++;
    } else {
      console.error(`  ❌ TEST 6 FAILED: Out-of-domain document produced unexpected citations or classification.`);
    }
  } catch (err: any) {
    console.error('  ❌ TEST 6 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Document Extraction (PDF Parsing with Page Metadata)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 7: PDF Document Text & Page Structure Extraction');
  console.log('--------------------------------------------------------------------------------');
  try {
    const fs = await import('fs');
    const pdfPath = './corpus/raw/arbitration_and_conciliation_act_1996.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);

    const extracted = await extractDocumentContent(pdfBuffer, 'Arbitration_Act_1996.pdf', 'application/pdf');
    const clauses = segmentDocumentIntoClauses(extracted);

    console.log(`  • Extracted Text Length: ${extracted.text.length} chars`);
    console.log(`  • Page Count: ${extracted.pageCount}`);
    console.log(`  • Segmented Clauses Count: ${clauses.length}`);

    if (extracted.text.length > 500 && extracted.pageCount > 10 && clauses.length > 5) {
      console.log('  ✅ TEST 7 PASSED: Official PDF document text and multi-page structure successfully extracted.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 7 FAILED: PDF extraction returned insufficient text or clauses.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 7 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Empty / Invalid File Upload Rejection
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST 8: Empty & Invalid Upload Rejection');
  console.log('--------------------------------------------------------------------------------');
  try {
    let emptyRejected = false;
    try {
      await extractDocumentContent(Buffer.from('', 'utf-8'), 'Empty.pdf', 'application/pdf');
    } catch (emptyErr: any) {
      console.log(`  • Empty File Error Caught: "${emptyErr.message}"`);
      emptyRejected = true;
    }

    let shortRejected = false;
    try {
      await extractDocumentContent(Buffer.from('Hello', 'utf-8'), 'Short.txt', 'text/plain');
    } catch (shortErr: any) {
      console.log(`  • Short/Unreadable File Error Caught: "${shortErr.message}"`);
      shortRejected = true;
    }

    if (emptyRejected && shortRejected) {
      console.log('  ✅ TEST 8 PASSED: Empty and unreadable uploads cleanly rejected with clear error messages.');
      passedCount++;
    } else {
      console.error('  ❌ TEST 8 FAILED: Empty or short file was not rejected as expected.');
    }
  } catch (err: any) {
    console.error('  ❌ TEST 8 EXCEPTION:', err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`📊 PHASE 2 TEST SUITE SUMMARY: ${passedCount} / ${totalTests} TESTS PASSED`);
  console.log('================================================================================\n');

  if (passedCount < totalTests) {
    process.exit(1);
  }
}

runDocumentReviewTests();
