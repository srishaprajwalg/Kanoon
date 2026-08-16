import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

import ingestedCorpus from '../corpus/processed/ingestedCorpus.json' assert { type: 'json' };

const EXPECTED_PDFS = [
  'arbitration_and_conciliation_act_1996.pdf',
  'commercial_courts_act_2015.pdf',
  'consumer_protection_act_2019.pdf',
  'indian_contract_act_1872.pdf',
  'information_technology_act_2000.pdf',
  'karnataka_land_revenue_act_1964.pdf',
  'karnataka_rent_act_1999.pdf',
  'karnataka_shops_and_commercial_establishments_act_1961.pdf',
  'karnataka_stamp_act_1957.pdf',
  'karnataka_transparency_in_public_procurements_act_1999.pdf',
  'registration_act_1908.pdf',
  'specific_relief_act_1963.pdf',
  'transfer_of_property_act_1882.pdf'
];

async function runAuthenticityTest() {
  console.log('================================================================================');
  console.log('🛡️  KANOON PHASE 4C — CORPUS AUTHENTICITY & PROVENANCE VERIFICATION');
  console.log('================================================================================\n');

  let passed = true;

  // 1. Check that scripts/generateSourcePDFs.ts does NOT exist
  const synthScript = path.resolve(process.cwd(), 'scripts/generateSourcePDFs.ts');
  if (fs.existsSync(synthScript)) {
    console.error('❌ FAIL: Synthetic generator scripts/generateSourcePDFs.ts MUST NOT exist.');
    passed = false;
  } else {
    console.log('✅ PASS: No synthetic PDF generator script (generateSourcePDFs.ts) detected.');
  }

  // 2. Verify all 13 official PDFs in corpus/raw/
  const rawDir = path.resolve(process.cwd(), 'corpus/raw');
  if (!fs.existsSync(rawDir)) {
    console.error('❌ FAIL: corpus/raw directory does not exist.');
    process.exit(1);
  }

  for (const filename of EXPECTED_PDFS) {
    const filePath = path.join(rawDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ FAIL: Expected PDF file missing: ${filename}`);
      passed = false;
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const size = buffer.length;

    // Check minimum file size > 3000 bytes
    if (size < 3000) {
      console.error(`❌ FAIL: File ${filename} is suspiciously small (${size} bytes).`);
      passed = false;
    }

    // Check PDF header signature (%PDF)
    const header = buffer.toString('utf8', 0, 4);
    if (header !== '%PDF') {
      console.error(`❌ FAIL: File ${filename} does not start with %PDF header (Found: ${header}).`);
      passed = false;
    }

    // Check SHA-256 calculation
    const computedSha = crypto.createHash('sha256').update(buffer).digest('hex');

    // Parse PDF & verify page count > 0
    try {
      const parser = new PDFParse({ data: buffer });
      const textData = await parser.getText();
      const pages = textData.total || (textData.pages ? textData.pages.length : 1);

      if (pages <= 0) {
        console.error(`❌ FAIL: PDF ${filename} returned 0 pages.`);
        passed = false;
      }

      // Verify matching chunk metadata in ingestedCorpus.json
      const chunksForFile = (ingestedCorpus as any[]).filter(c => c.sourcePdfFilename === filename);
      if (chunksForFile.length === 0) {
        console.error(`❌ FAIL: No ingested chunks found in ingestedCorpus.json for ${filename}`);
        passed = false;
      } else {
        const sampleChunk = chunksForFile[0];
        if (sampleChunk.sha256 !== computedSha) {
          console.error(`❌ FAIL: SHA-256 mismatch for ${filename} (Computed: ${computedSha}, Stored: ${sampleChunk.sha256})`);
          passed = false;
        }

        if (sampleChunk.sourceType !== 'PRIMARY_SOURCE_GOVERNMENT_PDF') {
          console.error(`❌ FAIL: Invalid sourceType for ${filename}: ${sampleChunk.sourceType}`);
          passed = false;
        }

        if (sampleChunk.sourceTier !== 'Tier 1 (Official Government)') {
          console.error(`❌ FAIL: Invalid sourceTier for ${filename}: ${sampleChunk.sourceTier}`);
          passed = false;
        }

        const isGovDomain = sampleChunk.sourceUrl.includes('indiacode.nic.in') || sampleChunk.sourceUrl.includes('karnataka.gov.in');
        if (!isGovDomain) {
          console.error(`❌ FAIL: Non-government source URL for ${filename}: ${sampleChunk.sourceUrl}`);
          passed = false;
        }
      }

      console.log(` ✅ ${filename} | Size: ${(size / 1024).toFixed(1)} KB | Pages: ${pages} | SHA-256: ${computedSha.slice(0, 16)}...`);
    } catch (err: any) {
      console.error(`❌ FAIL: Could not parse PDF ${filename}: ${err.message}`);
      passed = false;
    }
  }

  console.log('\n================================================================================');
  if (passed) {
    console.log('✅ ALL 13 OFFICIAL GOVERNMENT PDFs VERIFIED FOR AUTHENTICITY & PROVENANCE');
    console.log('================================================================================\n');
  } else {
    console.error('❌ CORPUS AUTHENTICITY VERIFICATION FAILED');
    console.error('================================================================================\n');
    process.exit(1);
  }
}

runAuthenticityTest().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
