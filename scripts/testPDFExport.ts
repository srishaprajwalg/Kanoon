import { exportDocumentToPDF } from '../src/utils/pdfExporter';
import fs from 'fs';
import path from 'path';

async function runPDFExportTests() {
  console.log('---------------------------------------------------------');
  console.log('🧪 RUNNING PDF EXPORT & MULTI-PAGE WRAPPING TEST SUITE');
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

  // Define long test clauses as instructed by user
  const longIndemnityClause = `
5.1 COMPREHENSIVE MUTUAL INDEMNIFICATION AND HOLD HARMLESS OBLIGATIONS:
Each party ("Indemnifying Party") agrees to defend, indemnify, and hold harmless the other party, its affiliates, directors, officers, employees, agents, successors, and permitted assigns ("Indemnified Party") from and against any and all claims, demands, suits, actions, causes of action, damages, liabilities, losses, judgments, settlements, costs, and expenses (including reasonable legal fees and court costs) resulting from or arising out of: (a) any breach of representation or warranty made by the Indemnifying Party in this Agreement; (b) any failure by the Indemnifying Party to perform or satisfy any covenant or obligation required to be performed or satisfied by it under this Agreement; (c) any gross negligence, willful misconduct, or fraud committed by the Indemnifying Party, its officers, employees, or sub-contractors in connection with the performance of services; or (d) any infringement, misappropriation, or violation of any patent, copyright, trademark, trade secret, or other intellectual property right of any third party under Indian Law, including the Information Technology Act 2000 and the Indian Patents Act 1970.
`.repeat(3);

  const longConfidentialityClause = `
5.2 DETAILED CONFIDENTIALITY AND TRADE SECRET PROTECTION PROVISIONS:
The Receiving Party acknowledges that in the course of performing services under this Agreement, it will have access to non-public, highly sensitive, proprietary, and confidential information belonging to the Disclosing Party ("Confidential Information"). Confidential Information includes, without limitation: (i) source code, object code, algorithms, software architectures, system designs, product roadmaps, data structures, and database schemas; (ii) business plans, financial projections, pricing strategies, customer lists, vendor agreements, marketing strategies, and operational methodologies; (iii) any third-party confidential information disclosed to the Receiving Party under protective covenants; and (iv) plain-language legal analyses, statutory risk vectors, e-Stamp records, and dispute resolution briefs prepared under Indian law. The Receiving Party agrees to hold all such Confidential Information in strict confidence and shall not disclose, reproduce, distribute, or reverse-engineer any portion thereof without explicit prior written authorization from the Disclosing Party.
`.repeat(3);

  const longTerminationClause = `
5.3 EXIT PROCEDURE, CONSEQUENCES OF TERMINATION, AND SURVIVAL OF COVENANTS:
Upon the expiration or termination of this Agreement for any reason whatsoever: (a) all licenses, rights, and permissions granted hereunder shall immediately cease and revert to the rightful owner; (b) the Receiving Party shall immediately return or destroy all physical and digital copies of Confidential Information, proprietary software, and project assets in its possession or control within seven (7) business days of termination, and shall certify such return or destruction in writing signed by an authorized executive officer; (c) all accrued payment obligations and outstanding invoices accrued prior to the effective date of termination shall become immediately due and payable; and (d) provisions relating to Confidential Information, Intellectual Property Rights, Indemnification, Limitation of Liability, Governing Law, and Dispute Resolution shall survive the termination or expiry of this Agreement indefinitely or for the statutory limitation period prescribed under the Indian Limitation Act 1963.
`.repeat(3);

  const multiPageDraftText = `
RESIDENTIAL LEAVE AND LICENSE AGREEMENT
(Drafted under Indian Contract Act 1872 & Transfer of Property Act 1882)

THIS LEAVE AND LICENSE AGREEMENT is executed at Bengaluru, Karnataka on 2026-08-16.

BETWEEN:
RAMESH SHARMA ("Licensor / Owner"), Address: Flat 402, Sunshine Apartments, Indiranagar, Bengaluru, Contact: +91 98765 43210.

AND:
PRIYA TECH VENTURES PVT LTD ("Licensee / Tenant"), Address: Suite 12, Tech Park, Outer Ring Road, Bengaluru, Contact: +91 91234 56789.

1. GRANT OF LICENSE & TENURE:
The Licensor hereby permits the Licensee to occupy the residential premises situated at Bengaluru, Karnataka for a period of 11 months starting 2026-08-16.

2. MONTHLY LICENSE FEE & SECURITY DEPOSIT:
- Monthly Rent: ₹30,000 payable on or before the 5th day of every calendar month.
- Refundable Security Deposit: ₹90,000. Refunded within 7 days of key handover, less legitimate utility arrears.

3. LOCK-IN PERIOD & TERMINATION:
- Lock-in Period: 6 months. Neither party can terminate during lock-in without paying remaining rent.
- Notice Period: Post lock-in, either party may terminate by giving 30 days advance written notice.

4. STATUTORY CITATIONS & REGISTRATION COMPLIANCE:
Grounded in Indian Contract Act 1872 (Section 10) and Transfer of Property Act 1882 (Section 107). Registration requirements and stamp duty depend on local state law.

5. SPECIALIZED CONTRACT RIDERS & CUSTOM CLAUSES:

${longIndemnityClause}

${longConfidentialityClause}

${longTerminationClause}

6. DISPUTE RESOLUTION & GOVERNING LAW:
Governed by laws of Karnataka, India. Disputes resolved via Arbitration in Bengaluru.

_____________________________                _____________________________
LICENSOR                                     LICENSEE
`;

  // TEST 1: Generate Multi-Page PDF without crash
  console.log('📍 TEST 1: Multi-Page PDF Generation with Long Clauses');
  const tempOutputDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(tempOutputDir)) {
    fs.mkdirSync(tempOutputDir, { recursive: true });
  }
  const testFileName = path.join(tempOutputDir, 'Test_MultiPage_Agreement_KanoonAI.pdf');

  try {
    exportDocumentToPDF({
      title: 'Residential Leave and License Agreement',
      state: 'Karnataka',
      draftText: multiPageDraftText,
      fileName: testFileName
    });

    assert(
      fs.existsSync(testFileName),
      'PDF file generated successfully on disk',
      `File created at: ${testFileName}`
    );

    const stats = fs.statSync(testFileName);
    assert(
      stats.size > 2000,
      'PDF file contains multi-page content (> 2KB)',
      `Actual file size: ${stats.size} bytes`
    );

  } catch (err: any) {
    assert(false, 'PDF export threw an exception', err.message || String(err));
  }

  console.log('\n---------------------------------------------------------');
  console.log(`📊 PDF EXPORT TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('---------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPDFExportTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
