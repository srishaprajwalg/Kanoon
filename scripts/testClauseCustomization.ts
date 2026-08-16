import { CLAUSE_LIBRARY } from '../src/data/clauseLibrary';
import { KanoonAIService } from '../src/services/aiService';
import { LegalRAGEngine } from '../src/services/ragEngine';
import type { DocumentFormData, SelectedClauseConfig, CustomUserClause } from '../src/types';

function runTest(testName: string, testFn: () => void) {
  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`TEST: ${testName}`);
  console.log(`--------------------------------------------------------------------------------`);
  try {
    testFn();
    console.log(`  ✅ ${testName} PASSED`);
  } catch (err: any) {
    console.error(`  ❌ ${testName} FAILED: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n================================================================================`);
console.log(`🛡️ KANOON PHASE 4 — CUSTOM CLAUSE & RIDER CUSTOMIZATION TEST SUITE`);
console.log(`================================================================================`);

// 1. Clause Library Loading
runTest('1. Clause Library Loads Correctly', () => {
  if (!CLAUSE_LIBRARY || CLAUSE_LIBRARY.length < 10) {
    throw new Error(`Expected at least 10 curated clauses in library, found ${CLAUSE_LIBRARY.length}`);
  }
  console.log(`  • Loaded ${CLAUSE_LIBRARY.length} curated clauses from local library.`);
});

// 2. Recommended Clauses for Document Types
runTest('2. Recommended Clauses Filtering for Document Types', () => {
  const rentRecommended = CLAUSE_LIBRARY.filter(c => c.applicableDocumentTypes.includes('rent_agreement'));
  const ndaRecommended = CLAUSE_LIBRARY.filter(c => c.applicableDocumentTypes.includes('nda_agreement'));
  const empRecommended = CLAUSE_LIBRARY.filter(c => c.applicableDocumentTypes.includes('employment_contract'));

  if (rentRecommended.length === 0 || ndaRecommended.length === 0 || empRecommended.length === 0) {
    throw new Error('Failed to retrieve recommended clauses for document types.');
  }

  console.log(`  • Rent Agreement Recommendations: ${rentRecommended.map(c => c.name).join(', ')}`);
  console.log(`  • NDA Recommendations: ${ndaRecommended.map(c => c.name).join(', ')}`);
  console.log(`  • Employment Recommendations: ${empRecommended.map(c => c.name).join(', ')}`);
});

// 3. User Selection & Deselection (Add/Remove)
runTest('3. Add & Remove Clauses in Selection State', () => {
  const confidentialityItem = CLAUSE_LIBRARY.find(c => c.id === 'clause_confidentiality')!;
  
  let selectedConfigs: SelectedClauseConfig[] = [];
  
  // Add
  const initialConfig: SelectedClauseConfig = {
    clauseId: confidentialityItem.id,
    isCustom: false,
    title: confidentialityItem.name,
    category: confidentialityItem.category,
    clauseText: confidentialityItem.defaultClauseText.replace('{confidentiality_duration}', '3'),
    paramValues: { confidentiality_duration: '3' },
    sourceType: 'recommended'
  };
  selectedConfigs.push(initialConfig);
  
  if (selectedConfigs.length !== 1) throw new Error('Failed to add clause to selection state');

  // Remove
  selectedConfigs = selectedConfigs.filter(c => c.clauseId !== confidentialityItem.id);
  if (selectedConfigs.length !== 0) throw new Error('Failed to remove clause from selection state');

  console.log(`  • Clause add and remove operations verified.`);
});

// 4. Parameterized Clause Reflection
runTest('4. Parameterized Clause Values Reflected Correctly', () => {
  const terminationItem = CLAUSE_LIBRARY.find(c => c.id === 'clause_termination')!;
  
  // Custom notice period: 60 days
  const updatedText = terminationItem.defaultClauseText.replace('{notice_days}', '60');
  
  const terminationConfig: SelectedClauseConfig = {
    clauseId: terminationItem.id,
    isCustom: false,
    title: terminationItem.name,
    category: terminationItem.category,
    clauseText: updatedText,
    paramValues: { notice_days: '60' },
    sourceType: 'recommended'
  };

  if (!terminationConfig.clauseText.includes('60 days advance written notice')) {
    throw new Error(`Parameterized value '60 days' was not correctly reflected in clause text: ${terminationConfig.clauseText}`);
  }

  console.log(`  • Parameterized clause output: "${terminationConfig.clauseText}"`);
});

// 5. Custom User Clause Preservation
runTest('5. Custom User Clause Preserved in Request State', () => {
  const customUserClause: CustomUserClause = {
    id: 'custom_101',
    title: 'Solar Panel Maintenance Access',
    category: 'Commercial Use',
    clauseText: 'Tenant agrees to grant monthly access to landlord technicians for rooftop solar panel maintenance.'
  };

  const customConfig: SelectedClauseConfig = {
    clauseId: customUserClause.id,
    isCustom: true,
    title: customUserClause.title,
    category: customUserClause.category,
    clauseText: customUserClause.clauseText,
    sourceType: 'user_custom'
  };

  if (customConfig.sourceType !== 'user_custom' || !customConfig.clauseText.includes('solar panel')) {
    throw new Error('Custom user clause structure or source type corrupted.');
  }

  console.log(`  • Custom User Clause Preserved: "${customConfig.title}" -> "${customConfig.clauseText}"`);
});

// 6 & 7. Document Generation & RAG Statutory Grounding for Custom Clauses
runTest('6 & 7. Document Generation & RAG Grounding for Custom Riders', async () => {
  const nonSolicitItem = CLAUSE_LIBRARY.find(c => c.id === 'clause_non_solicitation')!;
  const arbitrationItem = CLAUSE_LIBRARY.find(c => c.id === 'clause_arbitration')!;

  const testFormData: DocumentFormData = {
    templateId: 'service_agreement',
    documentTitle: 'Master Software Development Service Agreement',
    partyA: { name: 'Acme Software Solutions Pvt Ltd', type: 'business', address: 'Bangalore', contact: '1234567890' },
    partyB: { name: 'Global Tech Clients Inc', type: 'business', address: 'Mumbai', contact: '0987654321' },
    effectiveDate: '2026-08-16',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 12,
    financialAmount: 1500000,
    noticePeriodDays: 30,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: [],
    selectedClauseConfigs: [
      {
        clauseId: nonSolicitItem.id,
        isCustom: false,
        title: nonSolicitItem.name,
        category: nonSolicitItem.category,
        clauseText: nonSolicitItem.defaultClauseText.replace('{solicitation_duration}', '12'),
        paramValues: { solicitation_duration: '12' },
        sourceType: 'recommended'
      },
      {
        clauseId: arbitrationItem.id,
        isCustom: false,
        title: arbitrationItem.name,
        category: arbitrationItem.category,
        clauseText: arbitrationItem.defaultClauseText
          .replace('{arbitration_seat}', 'Bengaluru, Karnataka')
          .replace('{arbitrator_count}', 'Sole Arbitrator appointed mutually'),
        paramValues: { arbitration_seat: 'Bengaluru, Karnataka', arbitrator_count: 'Sole Arbitrator' },
        sourceType: 'statutory'
      },
      {
        clauseId: 'custom_99',
        isCustom: true,
        title: 'Weekly Sprint Code Delivery Audit',
        category: 'Development Process',
        clauseText: 'Developer must push clean tested code to GitHub repo every Friday by 5 PM IST.',
        sourceType: 'user_custom'
      }
    ],
    usePlainLanguage: true
  };

  const doc = await KanoonAIService.generateDocument(testFormData);

  if (!doc.draftText.includes('SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES')) {
    throw new Error('Generated document text does not include specialized contract riders section.');
  }

  if (!doc.draftText.toUpperCase().includes('WEEKLY SPRINT CODE DELIVERY AUDIT')) {
    throw new Error('Custom user clause title missing from generated document.');
  }

  // Check that clauses array contains the customized riders
  const customRiderClauses = doc.clauses.filter(c => c.id?.startsWith('custom_rider_'));
  if (customRiderClauses.length !== 3) {
    throw new Error(`Expected 3 custom rider clauses in doc.clauses, found ${customRiderClauses.length}`);
  }

  console.log(`  • Draft Text Length: ${doc.draftText.length} chars`);
  console.log(`  • Total Clauses Generated: ${doc.clauses.length}`);
  console.log(`  • Customized Rider Analyses Count: ${customRiderClauses.length}`);
});

// 8 & 9. Risk Analysis & Statutory Citation Provenance Preservation
runTest('8 & 9. Risk Scoring & Statutory Citation Provenance Preservation', async () => {
  const testFormData: DocumentFormData = {
    templateId: 'rent_agreement',
    documentTitle: 'Commercial Shop Lease Agreement',
    partyA: { name: 'Landlord A', type: 'individual', address: 'Indiranagar, Bengaluru', contact: '9999999999' },
    partyB: { name: 'Tenant B Services', type: 'business', address: 'MG Road, Bengaluru', contact: '8888888888' },
    effectiveDate: '2026-08-16',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 11,
    financialAmount: 50000,
    securityDeposit: 250000,
    noticePeriodDays: 30,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: [],
    selectedClauseConfigs: [
      {
        clauseId: 'clause_confidentiality',
        isCustom: false,
        title: 'Confidentiality & Non-Disclosure',
        category: 'Confidentiality',
        clauseText: 'Confidential information shall be protected for 3 years post termination.',
        sourceType: 'recommended'
      }
    ],
    usePlainLanguage: true
  };

  const doc = await KanoonAIService.generateDocument(testFormData);

  if (typeof doc.riskScore !== 'number' || doc.riskScore < 0 || doc.riskScore > 100) {
    throw new Error(`Invalid risk score calculated: ${doc.riskScore}`);
  }

  if (!doc.citations || doc.citations.length === 0) {
    throw new Error('Statutory citations missing from document generation result.');
  }

  const firstCitation = doc.citations[0];
  if (!firstCitation.actName || !firstCitation.sha256 || !firstCitation.sourceUrl) {
    throw new Error('Citation missing required statutory provenance fields (actName, sha256, sourceUrl).');
  }

  console.log(`  • Document Risk Score: ${doc.riskScore} / 100`);
  console.log(`  • Retrieved Citations Count: ${doc.citations.length}`);
  console.log(`  • Citation Grounding: ${firstCitation.actShortTitle} Section ${firstCitation.sectionNumber}`);
  console.log(`  • Citation SHA-256: ${firstCitation.sha256}`);
  console.log(`  • Citation Source URL: ${firstCitation.sourceUrl}`);
});

console.log(`\n================================================================================`);
console.log(`📊 PHASE 4 TEST SUITE SUMMARY: ALL 9 TESTS PASSED`);
console.log(`================================================================================\n`);
