import http from 'http';

function postJson(path: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ rawResponse: raw, statusCode: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ rawResponse: raw, statusCode: res.statusCode });
        }
      });
    }).on('error', reject);
  });
}

async function runFullE2EValidation() {
  console.log('================================================================================');
  console.log('⚖️  KANOON AI — END-TO-END PROBLEM STATEMENT VALIDATION');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------------
  // Scenario 1: Incomplete Inputs Handling (Residential Tenancy in Bengaluru)
  // --------------------------------------------------------------------------------
  console.log('📋 SCENARIO 1: Incomplete Input Validation & Legal Document Generation...');
  const incompleteForm = {
    templateId: 'rent_agreement',
    documentTitle: 'Residential Tenancy Agreement',
    partyA: { name: 'Aarav Sharma', type: 'individual', address: 'Indiranagar, Bengaluru', contact: '' },
    partyB: { name: '', type: 'individual', address: '', contact: '' }, // Missing Tenant Details
    effectiveDate: '2026-09-01',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 11,
    financialAmount: 25000,
    securityDeposit: 0, // Missing deposit
    noticePeriodDays: 30,
    lockInPeriodMonths: 0,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: [],
    usePlainLanguage: true
  };

  const val1 = await postJson('/api/validate-inputs', incompleteForm);
  console.log(`   • Validation Score: ${val1.score} / 100`);
  console.log(`   • Missing Fields Flagged: ${val1.missingFields.length} (${val1.missingFields.map((f: any) => f.fieldName || f.fieldKey).join(', ')})`);
  console.log(`   • Recommendations Provided: ${val1.recommendations.length}`);

  const doc1 = await postJson('/api/generate-document', incompleteForm);
  console.log(`   • Document Generated: ${doc1.title}`);
  console.log(`   • Citations Count: ${doc1.citations ? doc1.citations.length : 0}`);
  const cit1 = doc1.citations && doc1.citations[0];
  console.log(`   • Top Citation: [${cit1?.jurisdiction}] ${cit1?.actShortTitle} ${cit1?.sectionNumber}`);
  console.log(`   • Citation Source URL: ${cit1?.sourceUrl}`);
  console.log(`   • Citation Page Numbers: ${JSON.stringify(cit1?.pageNumbers)}`);
  console.log(`   • Result: ${val1.missingFields.length > 0 && doc1.citations.length > 0 ? 'PASS (✅)' : 'FAIL (❌)'}\n`);

  // --------------------------------------------------------------------------------
  // Scenario 2: Commercial Lease with Risky Unilateral Termination Clause
  // --------------------------------------------------------------------------------
  console.log('⚠️ SCENARIO 2: Commercial Lease Risk Analysis & Safer Alternative Suggestions...');
  const riskyForm = {
    templateId: 'rent_agreement',
    documentTitle: 'Commercial Lease Agreement',
    partyA: { name: 'Vanguard Realty Pvt Ltd', type: 'business', address: 'MG Road, Bengaluru', contact: '+91-8012345678' },
    partyB: { name: 'TechStart Innovations LLP', type: 'business', address: 'Koramangala, Bengaluru', contact: '+91-9876543210' },
    effectiveDate: '2026-09-01',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 36,
    financialAmount: 150000,
    securityDeposit: 900000,
    noticePeriodDays: 0,
    lockInPeriodMonths: 24, // Risky 24-month lockin
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: ['Licensor may terminate this agreement immediately without notice and forfeit all security deposit at sole discretion.'],
    usePlainLanguage: true
  };

  const doc2 = await postJson('/api/generate-document', riskyForm);
  console.log(`   • Risk Score: ${doc2.riskScore} / 100`);
  console.log(`   • Registration Mandatory (>11 months): ${doc2.registrationRequired ? 'YES (✅)' : 'NO'}`);
  console.log(`   • Detected Clauses Inspected: ${doc2.clauses.length}`);
  const highRiskClause = doc2.clauses.find((c: any) => c.riskLevel === 'high' || c.riskLevel === 'medium');
  console.log(`   • High Risk Clause Title: ${highRiskClause?.clauseTitle}`);
  console.log(`   • Risk Explanation: ${highRiskClause?.riskExplanation}`);
  console.log(`   • Safer Alternative Suggested: ${highRiskClause?.saferAlternative ? 'YES (✅)' : 'NO'}`);
  console.log(`   • Result: ${doc2.riskScore > 30 && highRiskClause ? 'PASS (✅)' : 'FAIL (❌)'}\n`);

  // --------------------------------------------------------------------------------
  // Scenario 3: Non-Disclosure Agreement (NDA) with IT Act & Contract Grounding
  // --------------------------------------------------------------------------------
  console.log('🔒 SCENARIO 3: Proprietary NDA Document Generation & IT Act Grounding...');
  const ndaForm = {
    templateId: 'nda_agreement',
    documentTitle: 'Mutual Non-Disclosure Agreement',
    partyA: { name: 'Kanoon AI Labs Pvt Ltd', type: 'business', address: 'Indiranagar, Bengaluru, Karnataka', contact: 'legal@kanoon.ai' },
    partyB: { name: 'DataCloud Solutions Inc', type: 'business', address: 'Whitefield, Bengaluru, Karnataka', contact: 'partner@datacloud.com' },
    effectiveDate: '2026-09-01',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 24,
    financialAmount: 0,
    noticePeriodDays: 30,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: ['Receiving party shall maintain strict confidentiality over source code algorithms and customer personal data.'],
    usePlainLanguage: true
  };

  const doc3 = await postJson('/api/generate-document', ndaForm);
  console.log(`   • Document Title: ${doc3.title}`);
  console.log(`   • Plain English Summary Present: ${doc3.plainSummaryText ? 'YES (✅)' : 'NO'}`);
  console.log(`   • Citations Count: ${doc3.citations.length}`);
  console.log(`   • Grounded Statutory References: ${doc3.citations.map((c: any) => `${c.actShortTitle} ${c.sectionNumber}`).join(', ')}`);
  console.log(`   • Result: ${doc3.citations.length > 0 ? 'PASS (✅)' : 'FAIL (❌)'}\n`);

  // --------------------------------------------------------------------------------
  // Scenario 4: Clause-Level Standalone Risk Inspector (/api/analyze-clause)
  // --------------------------------------------------------------------------------
  console.log('🔬 SCENARIO 4: Standalone Clause Risk Analysis & Unfair Term Detection...');
  const riskyClauseInput = {
    clauseText: 'The Service Provider shall indemnify and hold harmless the Customer against any and all claims, damages, losses, and legal costs without any upper monetary limit whatsoever.'
  };

  const clauseRes = await postJson('/api/analyze-clause', riskyClauseInput);
  console.log(`   • Analyzed Risk Level: ${clauseRes.riskLevel.toUpperCase()}`);
  console.log(`   • Plain Explanation: ${clauseRes.plainExplanation}`);
  console.log(`   • Risk Explanation: ${clauseRes.riskExplanation}`);
  console.log(`   • Safer Alternative: ${clauseRes.saferAlternative}`);
  console.log(`   • Grounded Citations: ${clauseRes.citations.length} sections retrieved`);
  console.log(`   • Result: ${clauseRes.riskLevel === 'high' || clauseRes.riskLevel === 'critical' ? 'PASS (✅)' : 'FAIL (❌)'}\n`);

  // --------------------------------------------------------------------------------
  // Scenario 5: Out-of-Domain Non-Legal Query Rejection
  // --------------------------------------------------------------------------------
  console.log('🚫 SCENARIO 5: Out-Of-Domain Non-Legal Query Rejection...');
  const oodRes = await getJson('/api/rag-search?q=Who%20won%20the%20IPL%20cricket%20match%20yesterday%3F');
  console.log(`   • Query: "${oodRes.query}"`);
  console.log(`   • Retrieved Evidence Chunks: ${oodRes.count}`);
  console.log(`   • Evidence Warning Message: "${oodRes.evidenceWarning}"`);
  console.log(`   • Result: ${oodRes.count === 0 && oodRes.evidenceWarning ? 'PASS (✅)' : 'FAIL (❌)'}\n`);

  console.log('================================================================================');
  console.log('🏆 ALL 5 PROBLEM STATEMENT END-TO-END VALIDATION SCENARIOS COMPLETED');
  console.log('================================================================================\n');
}

runFullE2EValidation().catch(err => {
  console.error('Fatal E2E Validation Error:', err);
});
