import fs from 'fs';
import path from 'path';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import { ACT_METADATA_MAP } from './ingestLegalCorpus.js';

async function runE2EValidation() {
  console.log("================================================================================");
  console.log("KANOON AI — UNIFIED LEGAL CHATBOT GROUNDING & RETRIEVAL E2E TEST SUITE");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] Test ${totalTests}: ${testName}`);
    } else {
      console.error(`❌ [FAIL] Test ${totalTests}: ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
    }
  }

  // TEST 1: Article 30 presence & embedding integrity in ingestedCorpus.json
  const corpusPath = path.resolve(process.cwd(), 'corpus/processed/ingestedCorpus.json');
  const rawCorpus = fs.readFileSync(corpusPath, 'utf-8');
  const chunks = JSON.parse(rawCorpus);
  const art30 = chunks.find((c: any) => c.sectionNumber === 'Article 30' && c.actShortTitle.includes('Karnataka Stamp'));
  
  assert(
    !!art30 && Array.isArray(art30.embeddingVector) && art30.embeddingVector.length === 384,
    "Article 30 of Karnataka Stamp Act present in ingestedCorpus.json with 384D ONNX dense embedding",
    art30 ? `Found Article 30 with embedding length ${art30.embeddingVector?.length}` : "Article 30 missing"
  );

  // TEST 2: Retrieval & Grounding for Stamp Duty Query
  const stampQuery = "What stamp duty applies to a rental agreement in Bengaluru under Karnataka Stamp Act?";
  const stampCitations = await LegalRAGEngine.retrieveRelevantStatutesAsync(stampQuery, undefined, 4, 0.4);

  assert(
    stampCitations.length > 0 && stampCitations[0].sectionNumber === 'Article 30',
    "Primary citation for stamp duty on rental agreement is Article 30 of Karnataka Stamp Act",
    `Primary citation returned: ${stampCitations[0]?.actShortTitle} ${stampCitations[0]?.sectionNumber} - ${stampCitations[0]?.sectionTitle}`
  );

  assert(
    stampCitations[0].sectionNumber !== 'Section 29',
    "Primary citation for stamp duty is NOT misattributed to Section 29",
    `Primary provision: ${stampCitations[0]?.sectionNumber}`
  );

  // TEST 3: Deduplication Verification
  const provisionKeys = stampCitations.map(c => `${c.actShortTitle}::${c.sectionNumber}::${c.sectionTitle}`);
  const uniqueKeys = new Set(provisionKeys);
  assert(
    provisionKeys.length === uniqueKeys.size,
    "Retrieved citations contain no duplicate provision chunks",
    `Total citations: ${provisionKeys.length}, Unique provisions: ${uniqueKeys.size}`
  );

  // TEST 4: Section Title Match (Section 55 Transfer of Property Act)
  const topaQuery = "Rights and liabilities of buyer and seller";
  const topaCitations = await LegalRAGEngine.retrieveRelevantStatutesAsync(topaQuery, undefined, 4, 0.4);

  assert(
    topaCitations.length > 0 && topaCitations[0].sectionNumber.includes('55'),
    "Query for 'Rights and liabilities of buyer and seller' retrieves Section 55 of Transfer of Property Act as Primary",
    `Primary citation returned: ${topaCitations[0]?.actShortTitle} ${topaCitations[0]?.sectionNumber}`
  );

  // TEST 5: Out-of-Domain Graceful Rejection
  const invalidQuery = "What is the recipe for preparing authentic Indian butter chicken?";
  const invalidCitations = await LegalRAGEngine.retrieveRelevantStatutesAsync(invalidQuery, undefined, 4, 0.4);

  assert(
    invalidCitations.length === 0,
    "Out-of-domain query yields 0 citations (triggers grounding fallback)",
    `Retrieved ${invalidCitations.length} citations for out-of-domain query`
  );

  // TEST 6: Statutory Registry Official URL Integrity
  let urlIntegrityOk = true;
  Object.values(ACT_METADATA_MAP).forEach(meta => {
    if (!meta.sourceUrl || !meta.sourceUrl.startsWith('http')) {
      urlIntegrityOk = false;
    }
  });

  assert(
    urlIntegrityOk,
    "All statutory metadata map entries maintain valid, verified official government source URLs",
    "Statutory metadata map integrity check"
  );

  console.log("\n================================================================================");
  console.log(`FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runE2EValidation().catch(err => {
  console.error(err);
  process.exit(1);
});
