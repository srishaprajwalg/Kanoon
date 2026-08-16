import { LegalRAGEngine } from '../src/services/ragEngine.js';
import { STATUTORY_SOURCE_REGISTRY } from '../src/data/statutoryRegistry.js';

async function runRAGFixesValidationSuite() {
  console.log("================================================================================");
  console.log("          KANOON AI — UNIFIED RAG ENGINE & CHATBOT VALIDATION SUITE           ");
  console.log("================================================================================");

  let passedTests = 0;
  let totalTests = 0;

  // TEST 1: Exact title query with "What is"
  totalTests++;
  console.log(`\nTEST 1: Exact Title Query ("What is Rights and liabilities of buyer and seller")`);
  const c1 = await LegalRAGEngine.retrieveRelevantStatutesAsync("What is Rights and liabilities of buyer and seller", undefined, 4, 0.4);
  if (c1.length > 0 && c1[0].actShortTitle.includes("Transfer of Property Act") && c1[0].sectionNumber.includes("55")) {
    console.log(`✅ PASS: Primary citation is ${c1[0].actShortTitle} ${c1[0].sectionNumber} - "${c1[0].sectionTitle}" (Score: ${c1[0].confidenceScore})`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Expected Section 55 as Primary, got: ${c1[0]?.actShortTitle} ${c1[0]?.sectionNumber}`);
  }

  // TEST 2: Exact title query without "What is"
  totalTests++;
  console.log(`\nTEST 2: Exact Title Query Without Prefix ("Rights and liabilities of buyer and seller")`);
  const c2 = await LegalRAGEngine.retrieveRelevantStatutesAsync("Rights and liabilities of buyer and seller", undefined, 4, 0.4);
  if (c2.length > 0 && c2[0].actShortTitle.includes("Transfer of Property Act") && c2[0].sectionNumber.includes("55")) {
    console.log(`✅ PASS: Primary citation is ${c2[0].actShortTitle} ${c2[0].sectionNumber} - "${c2[0].sectionTitle}" (Score: ${c2[0].confidenceScore})`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Expected Section 55 as Primary, got: ${c2[0]?.actShortTitle} ${c2[0]?.sectionNumber}`);
  }

  // TEST 3: Explicit section query
  totalTests++;
  console.log(`\nTEST 3: Explicit Section Query ("What is Section 55 of the Transfer of Property Act?")`);
  const c3 = await LegalRAGEngine.retrieveRelevantStatutesAsync("What is Section 55 of the Transfer of Property Act?", undefined, 4, 0.4);
  if (c3.length > 0 && c3[0].actShortTitle.includes("Transfer of Property Act") && c3[0].sectionNumber.includes("55")) {
    console.log(`✅ PASS: Primary citation is ${c3[0].actShortTitle} ${c3[0].sectionNumber} - "${c3[0].sectionTitle}" (Score: ${c3[0].confidenceScore})`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Expected Section 55 as Primary, got: ${c3[0]?.actShortTitle} ${c3[0]?.sectionNumber}`);
  }

  // TEST 4: Different exact section-title query
  totalTests++;
  console.log(`\nTEST 4: Different Exact Section-Title Query ("Compounding of contraventions")`);
  const c4 = await LegalRAGEngine.retrieveRelevantStatutesAsync("Compounding of contraventions", undefined, 4, 0.4);
  if (c4.length > 0 && c4[0].actShortTitle.includes("IT Act") && c4[0].sectionNumber.includes("63")) {
    console.log(`✅ PASS: Primary citation is ${c4[0].actShortTitle} ${c4[0].sectionNumber} - "${c4[0].sectionTitle}" (Score: ${c4[0].confidenceScore})`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Expected IT Act Section 63 as Primary, got: ${c4[0]?.actShortTitle} ${c4[0]?.sectionNumber}`);
  }

  // TEST 5: Out-of-domain query
  totalTests++;
  console.log(`\nTEST 5: Existing Out-of-Domain Test ("Who won the Cricket World Cup in 2011?")`);
  const c5 = await LegalRAGEngine.retrieveRelevantStatutesAsync("Who won the Cricket World Cup in 2011?", undefined, 4, 0.4);
  if (c5.length === 0) {
    console.log(`✅ PASS: 0 statutory citations returned (correct rejection)`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Expected 0 citations, got ${c5.length}`);
  }

  // TEST 6: SmartDrafter retrieval behavior
  totalTests++;
  console.log(`\nTEST 6: SmartDrafter Context-Aware Retrieval Verification`);
  const c6 = await LegalRAGEngine.retrieveRelevantStatutesAsync("Leave and license agreement for residential property in Bengaluru", "rent_agreement", 5, 0.38);
  const distinctActs = new Set(c6.map(c => c.actShortTitle));
  if (c6.length > 0 && distinctActs.size === c6.length) {
    console.log(`✅ PASS: SmartDrafter returned ${c6.length} distinct Act citations: ${Array.from(distinctActs).join(', ')}`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: SmartDrafter failed distinct Act deduplication`);
  }

  // TEST 7: Statutory Registry official source URLs verification
  totalTests++;
  console.log(`\nTEST 7: Official Government Source URLs Verification`);
  const tpaRegistry = STATUTORY_SOURCE_REGISTRY['transfer_of_property_act_1882.pdf'];
  if (tpaRegistry && tpaRegistry.sourceUrl.includes("indiacode.nic.in") && tpaRegistry.pdfUrl.includes("indiacode.nic.in")) {
    console.log(`✅ PASS: Official source URLs intact (${tpaRegistry.sourceUrl})`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: Statutory source URLs were altered or missing`);
  }

  console.log("\n================================================================================");
  console.log(`SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runRAGFixesValidationSuite().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
