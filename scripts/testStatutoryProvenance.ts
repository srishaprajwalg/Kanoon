import fs from 'fs';
import path from 'path';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import { STATUTORY_SOURCE_REGISTRY, findStatutorySourceEntry } from '../src/data/statutoryRegistry.js';

async function testStatutoryProvenance() {
  console.log('================================================================================');
  console.log('⚖️  KANOON AI — STATUTORY PROVENANCE & DUAL SOURCE VERIFICATION TEST');
  console.log('================================================================================\n');

  let testCount = 0;
  let passCount = 0;

  function assert(condition: boolean, description: string) {
    testCount++;
    if (condition) {
      console.log(`  [PASS] Test #${testCount}: ${description}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] Test #${testCount}: ${description}`);
    }
  }

  // 1. Check Statutory Registry Coverage
  console.log('🔍 Checking Statutory Registry (13 Official Indian Acts)...');
  const registryEntries = Object.values(STATUTORY_SOURCE_REGISTRY);
  assert(registryEntries.length === 13, `Registry contains exactly 13 official acts (Found ${registryEntries.length}).`);

  // 2. Verify all local raw PDFs exist in corpus/raw/
  console.log('\n📄 Verifying Local PDF Files in corpus/raw/...');
  const corpusRawDir = path.join(process.cwd(), 'corpus', 'raw');
  for (const entry of registryEntries) {
    const pdfPath = path.join(corpusRawDir, entry.sourcePdfFilename);
    const exists = fs.existsSync(pdfPath);
    assert(exists, `Local raw PDF file exists: ${entry.sourcePdfFilename}`);
  }

  // 3. Verify Source URLs, Direct PDF Fallbacks & SHA-256 Hashes
  console.log('\n🌐 Verifying Official Web Source URLs & Direct PDF Fallbacks...');
  for (const entry of registryEntries) {
    const validSourceUrl = entry.sourceUrl.startsWith('http://') || entry.sourceUrl.startsWith('https://');
    const validPdfUrl = !entry.pdfUrl || entry.pdfUrl.startsWith('http://') || entry.pdfUrl.startsWith('https://');
    const validSha256 = /^[a-f0-9]{64}$/i.test(entry.sha256);

    assert(validSourceUrl, `${entry.actShortTitle} has valid primary source URL: ${entry.sourceUrl}`);
    assert(validPdfUrl, `${entry.actShortTitle} has valid direct PDF URL format: ${entry.pdfUrl || '(Web landing page only)'}`);
    assert(validSha256, `${entry.actShortTitle} has valid 64-char SHA-256 hash: ${entry.sha256.slice(0, 16)}...`);
  }

  // 4. Test RAG Citation Retrieval & Provenance Enrichment
  console.log('\n🤖 Testing RAG Citation Retrieval & Provenance Enrichment...');
  const testQueries = [
    { query: 'tenant security deposit refund 7 days', docType: 'rent_agreement', expectedAct: 'Contract Act 1872' },
    { query: 'indemnify uncapped financial loss liabilities', docType: 'general_contract', expectedAct: 'Contract Act 1872' },
    { query: 'Karnataka e-stamp duty Kaveri sub-registrar', docType: 'rent_agreement', expectedAct: 'Karnataka Stamp Act 1957' },
    { query: 'arbitration sole arbitrator venue dispute resolution', docType: 'general_contract', expectedAct: 'Arbitration Act 1996' }
  ];

  for (const t of testQueries) {
    const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(t.query, t.docType, 2);
    assert(citations.length > 0, `RAG query "${t.query}" returned ${citations.length} citation(s).`);

    for (const cit of citations) {
      assert(!!cit.sourceUrl, `Citation ${cit.actShortTitle} S.${cit.sectionNumber} contains primary sourceUrl`);
      assert(cit.pdfUrl === undefined || typeof cit.pdfUrl === 'string', `Citation ${cit.actShortTitle} S.${cit.sectionNumber} has valid pdfUrl property`);
      assert(!!cit.sourcePdfFilename, `Citation ${cit.actShortTitle} S.${cit.sectionNumber} contains sourcePdfFilename`);
      assert(!!cit.sha256, `Citation ${cit.actShortTitle} S.${cit.sectionNumber} contains SHA-256 provenance hash`);
    }
  }

  console.log('\n================================================================================');
  console.log(`📊 STATUTORY PROVENANCE TEST SUMMARY: ${passCount}/${testCount} TESTS PASSED`);
  console.log('================================================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  }
}

testStatutoryProvenance().catch((err) => {
  console.error('Fatal Error running testStatutoryProvenance:', err);
  process.exit(1);
});
