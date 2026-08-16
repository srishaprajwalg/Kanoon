import ingestedCorpus from '../corpus/processed/ingestedCorpus.json' assert { type: 'json' };

const REPRESENTATIVE_SECTIONS: { actFilename: string; sectionNumber: string }[] = [
  { actFilename: 'indian_contract_act_1872.pdf', sectionNumber: 'Section 10' },
  { actFilename: 'indian_contract_act_1872.pdf', sectionNumber: 'Section 73' },
  { actFilename: 'transfer_of_property_act_1882.pdf', sectionNumber: 'Section 105' },
  { actFilename: 'registration_act_1908.pdf', sectionNumber: 'Section 17' },
  { actFilename: 'specific_relief_act_1963.pdf', sectionNumber: 'Section 14' },
  { actFilename: 'arbitration_and_conciliation_act_1996.pdf', sectionNumber: 'Section 7' },
  { actFilename: 'information_technology_act_2000.pdf', sectionNumber: 'Section 72' },
  { actFilename: 'consumer_protection_act_2019.pdf', sectionNumber: 'Section 2' },
  { actFilename: 'commercial_courts_act_2015.pdf', sectionNumber: 'Section 12A' },
  { actFilename: 'karnataka_rent_act_1999.pdf', sectionNumber: 'Section 4' },
  { actFilename: 'karnataka_stamp_act_1957.pdf', sectionNumber: 'Section 30' },
  { actFilename: 'karnataka_shops_and_commercial_establishments_act_1961.pdf', sectionNumber: 'Section 25' },
  { actFilename: 'karnataka_land_revenue_act_1964.pdf', sectionNumber: 'Section 95' },
  { actFilename: 'karnataka_transparency_in_public_procurements_act_1999.pdf', sectionNumber: 'Section 4' }
];

function runIntegrityTest() {
  console.log('================================================================================');
  console.log('🔍 KANOON PHASE 4C — EXTRACTION INTEGRITY VERIFICATION');
  console.log('================================================================================\n');

  let passed = true;
  const chunks = ingestedCorpus as any[];

  console.log(`• Total Processed Chunks Loaded: ${chunks.length}`);

  if (chunks.length === 0) {
    console.error('❌ FAIL: Processed corpus JSON is empty.');
    process.exit(1);
  }

  for (const expected of REPRESENTATIVE_SECTIONS) {
    const matched = chunks.find(c =>
      c.sourcePdfFilename === expected.actFilename &&
      (c.sectionNumber.toLowerCase() === expected.sectionNumber.toLowerCase() ||
       c.sectionNumber.toLowerCase().includes(expected.sectionNumber.toLowerCase()))
    );

    if (!matched) {
      console.error(`❌ FAIL: Representative provision missing for ${expected.actFilename}: ${expected.sectionNumber}`);
      passed = false;
      continue;
    }

    if (!matched.statuteText || matched.statuteText.trim().length < 20) {
      console.error(`❌ FAIL: Provision text empty or truncated for ${expected.actFilename} ${expected.sectionNumber}`);
      passed = false;
      continue;
    }

    if (!matched.pageNumbers || matched.pageNumbers.length === 0) {
      console.error(`❌ FAIL: Missing page numbers for ${expected.actFilename} ${expected.sectionNumber}`);
      passed = false;
      continue;
    }

    console.log(` ✅ Matched: ${matched.actShortTitle} [${matched.sectionNumber}] | Pages: ${matched.pageNumbers.join(', ')} | Text Length: ${matched.statuteText.length} chars`);
  }

  console.log('\n================================================================================');
  if (passed) {
    console.log('✅ ALL REPRESENTATIVE PROVISIONS PASSED EXTRACTION INTEGRITY CHECKS');
    console.log('================================================================================\n');
  } else {
    console.error('❌ EXTRACTION INTEGRITY VERIFICATION FAILED');
    console.error('================================================================================\n');
    process.exit(1);
  }
}

runIntegrityTest();
