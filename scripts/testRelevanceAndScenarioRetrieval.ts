import { LegalRAGEngine } from '../src/services/ragEngine';

async function runRelevanceAndScenarioTests() {
  console.log('================================================================================');
  console.log('KANOON AI — RELEVANCE & SCENARIO RETRIEVAL SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Explicit Act + Section 55 of Transfer of Property Act
  total++;
  const citations1 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    'What is Section 55 of the Transfer of Property Act?',
    undefined,
    5,
    0.4
  );
  const primary1 = citations1[0];
  const tpa55Primary = primary1 && primary1.actShortTitle.includes('Transfer of Property') && primary1.sectionNumber.includes('55');
  const noUnrelatedSec55 = citations1.every(c => !c.sectionNumber.includes('55') || c.actShortTitle.includes('Transfer of Property'));

  if (tpa55Primary && noUnrelatedSec55) {
    console.log('✅ [PASS] Test 1: Explicit TPA Section 55 ranks #1 and filters unrelated Section 55 provisions.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 1: Primary citation was:', primary1 ? `${primary1.actShortTitle} ${primary1.sectionNumber}` : 'None');
  }

  // Test 2: Generic scenario matching (seller property defect non-disclosure)
  total++;
  const citations2 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    "My seller knew there was a defect in the property but didn't tell me. What does the law say?",
    undefined,
    5,
    0.4
  );
  const primary2 = citations2[0];
  if (primary2 && primary2.actShortTitle.includes('Transfer of Property') && primary2.sectionNumber.includes('55')) {
    console.log('✅ [PASS] Test 2: Property defect non-disclosure scenario retrieves TPA Section 55 as Primary.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 2: Primary citation was:', primary2 ? `${primary2.actShortTitle} ${primary2.sectionNumber}` : 'None');
  }

  // Test 3: Generic scenario matching (buyer non-payment of purchase price)
  total++;
  const citations3 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    "What happens if the buyer doesn't pay the purchase price?",
    undefined,
    5,
    0.4
  );
  const primary3 = citations3[0];
  if (primary3 && primary3.actShortTitle.includes('Transfer of Property') && primary3.sectionNumber.includes('55')) {
    console.log('✅ [PASS] Test 3: Buyer non-payment of purchase price scenario retrieves TPA Section 55 as Primary.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 3: Primary citation was:', primary3 ? `${primary3.actShortTitle} ${primary3.sectionNumber}` : 'None');
  }

  // Test 4: Explicit Section 10 of Contract Act
  total++;
  const citations4 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    "Explain Section 10 of the Contract Act like I'm not a lawyer.",
    undefined,
    5,
    0.4
  );
  const primary4 = citations4[0];
  if (primary4 && primary4.actShortTitle.includes('Contract') && primary4.sectionNumber.includes('10')) {
    console.log('✅ [PASS] Test 4: Explicit Contract Act Section 10 query retrieves Section 10 as Primary.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 4: Primary citation was:', primary4 ? `${primary4.actShortTitle} ${primary4.sectionNumber}` : 'None');
  }

  // Test 5: Parameter extraction for rental stamp duty query
  total++;
  const query5 = "I am renting a house in Bengaluru for ₹30,000 per month for 11 months. What stamp duty do I pay?";
  const citations5 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    query5,
    undefined,
    5,
    0.4
  );
  const primary5 = citations5[0];
  const intent5 = LegalRAGEngine.detectQueryIntent(query5);
  const explanation5 = LegalRAGEngine.generateGroundedExplanation(query5, citations5);

  const isArticle30 = primary5 && primary5.actShortTitle.includes('Karnataka Stamp') && primary5.sectionNumber.includes('Article 30');
  const rentExtracted = intent5.parsedValues.monthlyRent === '30,000';
  const tenureExtracted = intent5.parsedValues.tenureMonths === '11';
  const noRedundantAsk = explanation5.includes('Extracted Parameters from Query') && !explanation5.includes('1. **Monthly Rent Amount**');

  if (isArticle30 && rentExtracted && tenureExtracted && noRedundantAsk) {
    console.log('✅ [PASS] Test 5: Bengaluru rental stamp duty retrieves Article 30 and preserves query parameters without asking again.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 5: Article 30:', isArticle30, 'Rent Extracted:', rentExtracted, 'Tenure Extracted:', tenureExtracted, 'No Redundant Ask:', noRedundantAsk);
  }

  // Test 6: Out-of-domain rejection
  total++;
  const citations6 = await LegalRAGEngine.retrieveRelevantStatutesAsync(
    "Who won the Cricket World Cup in 2011?",
    undefined,
    5,
    0.4
  );
  if (citations6.length === 0) {
    console.log('✅ [PASS] Test 6: Out-of-domain query yields 0 legal citations.');
    passed++;
  } else {
    console.error('❌ [FAIL] Test 6: Returned citations for out-of-domain query:', citations6.length);
  }

  console.log('\n================================================================================');
  console.log(`FINAL RESULT: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('================================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runRelevanceAndScenarioTests();
