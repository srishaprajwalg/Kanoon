import { KanoonAIService } from '../src/services/aiService';
import { LegalRAGEngine } from '../src/services/ragEngine';
import type { DocumentFormData } from '../src/types';

async function runJurisdictionLeakageTests() {
  console.log('---------------------------------------------------------');
  console.log('🧪 RUNNING JURISDICTION LEAKAGE & STATE TRUTH REGRESSION SUITE');
  console.log('---------------------------------------------------------\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    total++;
    if (condition) {
      console.log(`  ✅ PASS [${total}]: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL [${total}]: ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
    }
  }

  // TEST 1: Bengaluru + Karnataka Rent Agreement (Strict No-Maharashtra Leak)
  console.log('📍 TEST 1: Bengaluru, Karnataka - Rent Agreement Generation');
  const karnatakaFormData: DocumentFormData = {
    templateId: 'rent_agreement',
    documentTitle: 'Residential Leave and License Agreement',
    partyA: {
      name: 'Ramesh Kumar',
      type: 'individual',
      address: 'Indiranagar, Bengaluru, Karnataka',
      contact: '+91 98765 43210'
    },
    partyB: {
      name: 'Suresh Rao',
      type: 'individual',
      address: 'Koramangala, Bengaluru, Karnataka',
      contact: '+91 91234 56789'
    },
    effectiveDate: '2026-08-16',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 11,
    financialAmount: 30000,
    securityDeposit: 90000,
    noticePeriodDays: 30,
    lockInPeriodMonths: 6,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: ['Tenant shall keep the property clean and quiet.'],
    usePlainLanguage: true
  };

  const docKarnataka = await KanoonAIService.generateDocument(karnatakaFormData);

  assert(
    docKarnataka.draftText.includes('executed at Bengaluru, Karnataka'),
    'Execution location specifies Bengaluru, Karnataka',
    `Found draft text header: ${docKarnataka.draftText.split('\n')[3] || docKarnataka.draftText.slice(0, 100)}`
  );

  assert(
    docKarnataka.draftText.includes('Governed by laws of Karnataka, India'),
    'Governing law specifies Karnataka, India',
    `Draft text snippet: ${docKarnataka.draftText.slice(-300)}`
  );

  const containsMaharashtraLeak = docKarnataka.draftText.toLowerCase().includes('maharashtra');
  assert(
    !containsMaharashtraLeak,
    'Zero occurrence of "Maharashtra" in generated Karnataka document text',
    `Draft text contained Maharashtra: ${containsMaharashtraLeak}`
  );

  assert(
    docKarnataka.state === 'Karnataka',
    'Generated document metadata state is Karnataka',
    `Received state: ${docKarnataka.state}`
  );

  // Check validation recommendations for Karnataka
  const valResultKarnataka = LegalRAGEngine.validateDocumentInputs(karnatakaFormData);
  const recsKarnatakaText = valResultKarnataka.recommendations.join(' ');
  assert(
    recsKarnatakaText.includes('Karnataka Rent Act') || recsKarnatakaText.includes('Kaveri'),
    'Validation recommendations include Karnataka tenancy / Kaveri stamp guidance',
    `Recommendations: ${recsKarnatakaText}`
  );
  assert(
    !recsKarnatakaText.includes('Maharashtra Rent Control Act'),
    'Validation recommendations do NOT leak Maharashtra Rent Control Act for Karnataka input',
    `Recommendations: ${recsKarnatakaText}`
  );

  // TEST 2: Mumbai + Maharashtra Rent Agreement
  console.log('\n📍 TEST 2: Mumbai, Maharashtra - Rent Agreement Generation');
  const maharashtraFormData: DocumentFormData = {
    templateId: 'rent_agreement',
    documentTitle: 'Residential Leave and License Agreement',
    partyA: {
      name: 'Anil Deshmukh',
      type: 'individual',
      address: 'Andheri West, Mumbai, Maharashtra',
      contact: '+91 98200 12345'
    },
    partyB: {
      name: 'Sunil Patil',
      type: 'individual',
      address: 'Bandra West, Mumbai, Maharashtra',
      contact: '+91 98200 67890'
    },
    effectiveDate: '2026-08-16',
    state: 'Maharashtra',
    city: 'Mumbai',
    durationMonths: 11,
    financialAmount: 45000,
    securityDeposit: 150000,
    noticePeriodDays: 30,
    lockInPeriodMonths: 6,
    governingLawState: 'Maharashtra',
    disputeResolution: 'Arbitration',
    customClauses: ['Tenant shall respect building society regulations.'],
    usePlainLanguage: true
  };

  const docMaharashtra = await KanoonAIService.generateDocument(maharashtraFormData);

  assert(
    docMaharashtra.draftText.includes('executed at Mumbai, Maharashtra'),
    'Execution location specifies Mumbai, Maharashtra',
    `Draft text header: ${docMaharashtra.draftText.slice(0, 150)}`
  );

  assert(
    docMaharashtra.draftText.includes('Governed by laws of Maharashtra, India'),
    'Governing law specifies Maharashtra, India'
  );

  // TEST 3: Custom Rider Clause with Bengaluru, Karnataka
  console.log('\n📍 TEST 3: Custom Clause Riders with Bengaluru, Karnataka Jurisdiction');
  const customRiderFormData: DocumentFormData = {
    ...karnatakaFormData,
    selectedClauseConfigs: [
      {
        clauseId: 'custom_indemnity_1',
        isCustom: true,
        title: 'Comprehensive IP & Data Indemnity',
        category: 'Liability & Indemnity',
        clauseText: 'The Service Provider agrees to indemnify and hold harmless the Client against any third-party claims arising from intellectual property infringement or data breaches under the Information Technology Act 2000.',
        sourceType: 'user_custom'
      }
    ]
  };

  const docCustomRider = await KanoonAIService.generateDocument(customRiderFormData);
  assert(
    docCustomRider.draftText.toUpperCase().includes('COMPREHENSIVE IP & DATA INDEMNITY'),
    'Custom Rider title integrated into draft text'
  );
  assert(
    !docCustomRider.draftText.toLowerCase().includes('maharashtra'),
    'Zero occurrence of "Maharashtra" in custom rider document text'
  );

  console.log('\n---------------------------------------------------------');
  console.log(`📊 JURISDICTION FIX TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('---------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runJurisdictionLeakageTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
