export interface StatutorySourceEntry {
  sourcePdfFilename: string;
  actName: string;
  actShortTitle: string;
  actNumber: string;
  year: number;
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourceUrl: string; // Primary official webpage URI (e.g. India Code or Karnataka Govt handle)
  pdfUrl: string;    // Direct official statutory PDF download URL
  sourceDomain: string;
  sha256: string;
}

/**
 * Registry of Official Indian Government Statutory Sources & Direct PDF Links
 * Ground Truth for Statutory Citations and Provenance Verification in Kanoon AI.
 */
export const STATUTORY_SOURCE_REGISTRY: Record<string, StatutorySourceEntry> = {
  'arbitration_and_conciliation_act_1996.pdf': {
    sourcePdfFilename: 'arbitration_and_conciliation_act_1996.pdf',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    actNumber: 'Act No. 26 of 1996',
    year: 1996,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21922',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/21922/1/the_arbitration_and_conciliation_act%2C_1996_act_no._26_of_1996.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'ad46eff7a0767690b8a7b3cad631a0a0be0653d4dfd2daa0e68cc00dcc0af0cd'
  },
  'commercial_courts_act_2015.pdf': {
    sourcePdfFilename: 'commercial_courts_act_2015.pdf',
    actName: 'The Commercial Courts Act, 2015',
    actShortTitle: 'Commercial Courts Act 2015',
    actNumber: 'Act No. 4 of 2016',
    year: 2015,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2156',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/2156/1/201604.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'dea56f8890e2608f69aac00a9d916c0d08338ed97afadce7eb9dd5a59ae407ce'
  },
  'consumer_protection_act_2019.pdf': {
    sourcePdfFilename: 'consumer_protection_act_2019.pdf',
    actName: 'The Consumer Protection Act, 2019',
    actShortTitle: 'Consumer Protection Act 2019',
    actNumber: 'Act No. 35 of 2019',
    year: 2019,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/16939',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/16939/1/a2019-35.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: '50120b13c8b6d7aa26369cd23aa0077f7bab58f52a082d5a63ce00c0a2088ac5'
  },
  'indian_contract_act_1872.pdf': {
    sourcePdfFilename: 'indian_contract_act_1872.pdf',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'd756d45a58c4cd8440e70a0189ea1fda9d7c5dfcdd6ef31a5f2ecd9cb209c59d'
  },
  'information_technology_act_2000.pdf': {
    sourcePdfFilename: 'information_technology_act_2000.pdf',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/13116',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/13116/1/it_act_2000_updated.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'e71725fa32e892f887308816046c42275fc855b5cbb4ee1063cdbd518f165140'
  },
  'karnataka_land_revenue_act_1964.pdf': {
    sourcePdfFilename: 'karnataka_land_revenue_act_1964.pdf',
    actName: 'The Karnataka Land Revenue Act, 1964',
    actShortTitle: 'Karnataka Land Revenue Act 1964',
    actNumber: 'Karnataka Act 12 of 1964',
    year: 1964,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2485',
    pdfUrl: 'https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_596_00007_12_1551859218716&filename=12_of_1964_%28e%29.pdf&type=actfile',
    sourceDomain: 'upload.indiacode.nic.in',
    sha256: 'fb84344efdd26328e9a1227f7c353b013856a6c7e8c292b97edeaedbde9d7c99'
  },
  'karnataka_rent_act_1999.pdf': {
    sourcePdfFilename: 'karnataka_rent_act_1999.pdf',
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act 34 of 2001',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7810',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/7810/1/34_of_2001_e.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'c4cdd5c5fcb4e872ab3a7abd1ddba1bf9c87da6ed35c335cb97535b693700ce5'
  },
  'karnataka_shops_and_commercial_establishments_act_1961.pdf': {
    sourcePdfFilename: 'karnataka_shops_and_commercial_establishments_act_1961.pdf',
    actName: 'The Karnataka Shops and Commercial Establishments Act, 1961',
    actShortTitle: 'Karnataka Shops Act 1961',
    actNumber: 'Karnataka Act 8 of 1962',
    year: 1961,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7609?view_type=browse',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/7609/1/8_of_1962_%28e%29.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'd6b599a66faa51756f428edf35e6c3ac1c97dcc2671c165971d4d2b715d39997'
  },
  'karnataka_stamp_act_1957.pdf': {
    sourcePdfFilename: 'karnataka_stamp_act_1957.pdf',
    actName: 'The Karnataka Stamp Act, 1957',
    actShortTitle: 'Karnataka Stamp Act 1957',
    actNumber: 'Karnataka Act 34 of 1957',
    year: 1957,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7744',
    pdfUrl: 'https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_596_00001_34_1551857974089&filename=34_of_1957_%28e%29_30_of_2025.pdf&type=actfile',
    sourceDomain: 'upload.indiacode.nic.in',
    sha256: '245aeefca476e4b447d639a6ca14673887f8db213d1616c2b29df87220c275f8'
  },
  'karnataka_transparency_in_public_procurements_act_1999.pdf': {
    sourcePdfFilename: 'karnataka_transparency_in_public_procurements_act_1999.pdf',
    actName: 'The Karnataka Transparency in Public Procurements Act, 1999',
    actShortTitle: 'Karnataka Procurement Act 1999',
    actNumber: 'Karnataka Act 14 of 2000',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/7000?view_type=browse',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/7000/1/29_of_2000%28e%29.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: '80e341db259f663b437bf362e06ec060f3169634560c0c33f89fede1c836fa69'
  },
  'registration_act_1908.pdf': {
    sourcePdfFilename: 'registration_act_1908.pdf',
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2190',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/2190/5/A1908-16.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: '95b81008f2d529cf84da1ed3bc63d5fdb9d4978ee47426d224ec137244ba2494'
  },
  'specific_relief_act_1963.pdf': {
    sourcePdfFilename: 'specific_relief_act_1963.pdf',
    actName: 'The Specific Relief Act, 1963',
    actShortTitle: 'Specific Relief Act 1963',
    actNumber: 'Act No. 47 of 1963',
    year: 1963,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1583',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/1583/7/A1963-47.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: '7b90aae6b01d7c9533f5b69a8ccbf00c16ba439e4624561204de236d5cb7f43d'
  },
  'transfer_of_property_act_1882.pdf': {
    sourcePdfFilename: 'transfer_of_property_act_1882.pdf',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/14648',
    pdfUrl: 'https://www.indiacode.nic.in/bitstream/123456789/14648/1/tpa.pdf',
    sourceDomain: 'www.indiacode.nic.in',
    sha256: 'a80873b01928d8c5bddd51fae7d390f8b1c1c3ed1add3ce4590adb0ed5648c45'
  }
};

/**
 * Finds a statutory source entry by PDF filename, Act name, or Act short title
 */
export function findStatutorySourceEntry(identifier?: {
  sourcePdfFilename?: string;
  actName?: string;
  actShortTitle?: string;
  sourceUrl?: string;
}): StatutorySourceEntry | undefined {
  if (!identifier) return undefined;

  if (identifier.sourcePdfFilename && STATUTORY_SOURCE_REGISTRY[identifier.sourcePdfFilename]) {
    return STATUTORY_SOURCE_REGISTRY[identifier.sourcePdfFilename];
  }

  const values = Object.values(STATUTORY_SOURCE_REGISTRY);

  if (identifier.actShortTitle) {
    const match = values.find(v => v.actShortTitle.toLowerCase() === identifier.actShortTitle?.toLowerCase());
    if (match) return match;
  }

  if (identifier.actName) {
    const match = values.find(v => v.actName.toLowerCase().includes(identifier.actName?.toLowerCase() || ''));
    if (match) return match;
  }

  if (identifier.sourceUrl) {
    const match = values.find(v => v.sourceUrl === identifier.sourceUrl || v.pdfUrl === identifier.sourceUrl);
    if (match) return match;
  }

  return undefined;
}

/**
 * Enriches a citation object with verified statutory source metadata (sourceUrl, pdfUrl, sourcePdfFilename, sha256)
 */
export function enrichCitationWithOfficialProvenance<T extends Record<string, any>>(cit: T): T {
  const entry = findStatutorySourceEntry({
    sourcePdfFilename: cit.sourcePdfFilename,
    actName: cit.actName,
    actShortTitle: cit.actShortTitle,
    sourceUrl: cit.sourceUrl
  });

  if (entry) {
    const localPdfUrl = entry.sourcePdfFilename 
      ? `http://localhost:5000/api/statutes/${entry.sourcePdfFilename}`
      : undefined;

    return {
      ...cit,
      sourceUrl: localPdfUrl || entry.sourceUrl || cit.sourceUrl,
      pdfUrl: localPdfUrl || entry.pdfUrl || cit.pdfUrl,
      sourceDomain: 'Local Kanoon PDF Repository',
      sourcePdfFilename: entry.sourcePdfFilename || cit.sourcePdfFilename,
      sha256: entry.sha256 || cit.sha256
    };
  }

  return cit;
}
