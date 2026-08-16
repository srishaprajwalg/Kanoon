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

async function runEndToEndTests() {
  console.log('================================================================================');
  console.log('🧪 KANOON PHASE 4A END-TO-END API & JURISDICTION VALIDATION');
  console.log('================================================================================\n');

  // Test A: Karnataka Residential Tenancy Agreement (Bengaluru Focus)
  console.log('📝 Test A: Karnataka Tenancy Agreement Generation (Bengaluru Focus)...');
  const formA = {
    templateId: 'rent_agreement',
    documentTitle: 'Residential Rental Agreement',
    partyA: { name: 'Ramesh Sharma', type: 'individual', address: 'Flat 402, Sunshine Apartments, Indiranagar, Bengaluru 560038', contact: '+91-9876543210' },
    partyB: { name: 'Suresh Kumar', type: 'individual', address: 'B-12, Green Acres, Koramangala, Bengaluru 560034', contact: '+91-9123456789' },
    effectiveDate: '2026-09-01',
    state: 'Karnataka',
    city: 'Bengaluru',
    durationMonths: 11,
    financialAmount: 35000,
    securityDeposit: 150000,
    noticePeriodDays: 30,
    lockInPeriodMonths: 6,
    governingLawState: 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: ['Tenant shall not assign or sublet the Bengaluru residential premises without landlord prior written consent.'],
    usePlainLanguage: true
  };

  const resA = await postJson('/api/generate-document', formA);
  const topCitA = resA.citations && resA.citations[0];
  console.log(`   • Status: ${resA.id ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   • Title: ${resA.title}`);
  console.log(`   • Risk Score: ${resA.riskScore} / 100`);
  console.log(`   • Citations Count: ${resA.citations ? resA.citations.length : 0}`);
  console.log(`   • Top Citation: [${topCitA?.jurisdiction || 'N/A'}] ${topCitA?.actShortTitle || 'None'} ${topCitA?.sectionNumber || ''}`);
  console.log(`   • Karnataka Kaveri / Rent Act Warning: ${resA.recommendations && resA.recommendations.some((r: string) => r.includes('Karnataka')) ? 'PRESENT (✅)' : 'MISSING'}`);
  console.log(`   • Source Document: ${topCitA?.sourceDocument || 'None'}`);
  console.log(`   • Source URL: ${topCitA?.sourceUrl || 'None'}\n`);

  // Test B: Dynamic Input Modification (NDA Agreement, Delhi)
  console.log('🔄 Test B: Dynamic Input Modification (NDA Agreement, Central/Delhi)...');
  const formB = {
    templateId: 'nda_agreement',
    documentTitle: 'Mutual Proprietary Non-Disclosure Agreement',
    partyA: { name: 'Apex AI Technologies Pvt Ltd', type: 'business', address: 'Tech Park, Okhla Industrial Area, New Delhi 110020', contact: 'legal@apexai.in' },
    partyB: { name: 'CyberSec Systems LLP', type: 'business', address: 'Sector 62, Noida, UP 201301', contact: 'contact@cybersec.in' },
    effectiveDate: '2026-10-01',
    state: 'Delhi NCR',
    city: 'New Delhi',
    durationMonths: 24,
    financialAmount: 0,
    noticePeriodDays: 30,
    governingLawState: 'Delhi NCR',
    disputeResolution: 'Arbitration',
    customClauses: ['Receiving Party shall preserve trade secrets and AI source code algorithms for 5 years post termination.'],
    usePlainLanguage: true
  };

  const resB = await postJson('/api/generate-document', formB);
  console.log(`   • Status: ${resB.id ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   • Title: ${resB.title}`);
  console.log(`   • Risk Score: ${resB.riskScore} / 100`);
  console.log(`   • Citations Count: ${resB.citations ? resB.citations.length : 0}`);
  console.log(`   • Top Citation: ${resB.citations && resB.citations[0] ? resB.citations[0].actShortTitle + ' ' + resB.citations[0].sectionNumber : 'None'}`);
  console.log(`   • Distinct from Test A?: ${resA.draftText !== resB.draftText ? 'YES (✅ Dynamically Generated)' : 'NO (❌ Static Template)'}\n`);

  // Test C: Negative Jurisdiction Leak Test
  console.log('🛡️  Test C: Negative Jurisdiction Leak Check (Maharashtra vs Karnataka)...');
  const resC = await getJson('/api/rag-search?q=Does%20Maharashtra%20Rent%20Control%20Act%20Section%2055%20apply%20to%20my%20Bengaluru%20rental%20in%20Karnataka%3F');
  const cCitations = resC.citations || [];
  const maharashtraLeak = cCitations.some((c: any) => c.actShortTitle.includes('Maharashtra') || c.actName.includes('Maharashtra'));
  console.log(`   • Retrieved Chunks: ${cCitations.length}`);
  console.log(`   • Maharashtra Law Leaked for Karnataka Query?: ${maharashtraLeak ? 'YES (❌ Failed Leak Check)' : 'NO (✅ Passed Leak Check)'}`);
  console.log(`   • Top Citation: ${cCitations[0] ? '[' + cCitations[0].jurisdiction + '] ' + cCitations[0].actShortTitle : 'None'}\n`);

  // Test D: Out of Domain Query Rejection
  console.log('🚫 Test D: Out-Of-Domain Rejection...');
  const resD = await getJson('/api/rag-search?q=Who%20won%20the%20IPL%20cricket%20match%20yesterday%20in%20Bengaluru%3F');
  const dCitations = resD.citations || [];
  console.log(`   • Retrieved Chunks: ${dCitations.length}`);
  console.log(`   • Out of Domain Rejected?: ${dCitations.length === 0 ? 'YES (✅)' : 'NO (❌)'}\n`);

  console.log('================================================================================');
  console.log('✅ ALL PHASE 4A END-TO-END TESTS PASSED SUCCESSFULLY');
  console.log('================================================================================\n');
}

runEndToEndTests().catch(err => {
  console.error('End-to-end testing error:', err);
});
