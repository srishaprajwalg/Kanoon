export interface CorpusItem {
  id: string;
  actName: string;
  actShortTitle: string;
  actNumber?: string;
  year?: number;
  chapter?: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourceUrl?: string; // India Code / Karnataka Govt Official URI
  sourceDocument?: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  effectiveDate?: string;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  keywords: string[];
  embeddingVector?: number[]; // Pre-calculated normalized 384D dense embedding weights
}

export const INDIAN_LEGAL_CORPUS: CorpusItem[] = [
  // ==========================================================================
  // 1. CENTRAL / INDIA-WIDE STATUTORY ACTS (Tier 1 - India Code)
  // ==========================================================================

  // --- Indian Contract Act, 1872 (Act No. 9 of 1872) ---
  {
    id: 'ica_sec_2_h',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Preliminary',
    sectionNumber: 'Section 2(h)',
    sectionTitle: 'Definition of Contract',
    statuteText: 'An agreement enforceable by law is a contract.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['contract', 'enforceable', 'agreement', 'validity', 'law', 'binding', 'enforceability']
  },
  {
    id: 'ica_sec_2_d',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Preliminary',
    sectionNumber: 'Section 2(d)',
    sectionTitle: 'Definition of Consideration',
    statuteText: 'When, at the desire of the promisor, the promisee or any other person has done or abstained from doing, or does or abstains from doing, or promises to do or to abstain from doing, something, such act or abstinence or promise is called a consideration for the promise.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['consideration', 'promisor', 'promisee', 'financial', 'payment', 'value']
  },
  {
    id: 'ica_sec_10',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 10',
    sectionTitle: 'What Agreements Are Contracts',
    statuteText: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['free consent', 'competent', 'lawful object', 'valid contract', 'capacity']
  },
  {
    id: 'ica_sec_27',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Void Agreements',
    sectionNumber: 'Section 27',
    sectionTitle: 'Agreement in Restraint of Trade Void',
    statuteText: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Exception 1: One who sells the goodwill of a business may agree with the buyer to refrain from carrying on a similar business.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'employment_service',
    keywords: ['restraint of trade', 'non-compete', 'employment restriction', 'void agreement', 'trade secret']
  },
  {
    id: 'ica_sec_73',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter VI - Of the Consequences of Breach of Contract',
    sectionNumber: 'Section 73',
    sectionTitle: 'Compensation for Loss or Damage Caused by Breach of Contract',
    statuteText: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['breach', 'compensation', 'damages', 'loss', 'remedy', 'default', 'penalty']
  },
  {
    id: 'ica_sec_124',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter VIII - Of Indemnity and Guarantee',
    sectionNumber: 'Section 124',
    sectionTitle: 'Contract of Indemnity Defined',
    statuteText: 'A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a contract of indemnity.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    sourceDocument: 'Indian Contract Act 1872 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['indemnity', 'indemnify', 'hold harmless', 'loss protection', 'liability']
  },

  // --- Transfer of Property Act, 1882 (Act No. 4 of 1882) ---
  {
    id: 'tpa_sec_105',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 105',
    sectionTitle: 'Lease Defined',
    statuteText: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee, who accepts the transfer on such terms. The transferor is called the lessor, the transferee is called the lessee, the price is called the premium, and the money, share, service or other thing to be so rendered is called the rent.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?sam_handle=123456789/1362',
    sourceDocument: 'Transfer of Property Act 1882 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['lease', 'lessor', 'lessee', 'rent', 'premium', 'immovable property', 'tenancy', 'tenant', 'landlord']
  },
  {
    id: 'tpa_sec_106',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 106',
    sectionTitle: 'Duration of Certain Leases in Absence of Written Contract',
    statuteText: 'In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable, on the part of either lessor or lessee, by six months notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days notice.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?sam_handle=123456789/1362',
    sourceDocument: 'Transfer of Property Act 1882 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['notice period', 'lease termination', 'month to month', '15 days notice', 'eviction notice']
  },
  {
    id: 'tpa_sec_107',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 107',
    sectionTitle: 'Leases How Made',
    statuteText: 'A lease of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made only by a registered instrument. All other leases of immovable property may be made either by a registered instrument or by oral agreement accompanied by delivery of possession.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?sam_handle=123456789/1362',
    sourceDocument: 'Transfer of Property Act 1882 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration', 'exceeding one year', 'registered instrument', '11 months lease', 'compulsory registration']
  },

  // --- Registration Act, 1908 (Act No. 16 of 1908) ---
  {
    id: 'ra_sec_17_1_d',
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    chapter: 'Part III - Of Registrable Documents',
    sectionNumber: 'Section 17(1)(d)',
    sectionTitle: 'Documents of Which Registration is Compulsory',
    statuteText: 'The following documents shall be registered: (d) leases of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2190?sam_handle=123456789/1362',
    sourceDocument: 'Registration Act 1908 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1908-12-18',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration mandatory', 'compulsory registration', 'lease over 1 year', 'registration officer', 'sub-registrar']
  },
  {
    id: 'ra_sec_49',
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    chapter: 'Part X - Of the Effects of Registration and Non-Registration',
    sectionNumber: 'Section 49',
    sectionTitle: 'Effect of Non-Registration of Documents Required to be Registered',
    statuteText: 'No document required by section 17 or by any provision of the Transfer of Property Act, 1882, to be registered shall affect any immovable property comprised therein, or be received as evidence of any transaction affecting such property, unless it has been registered.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2190?sam_handle=123456789/1362',
    sourceDocument: 'Registration Act 1908 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1908-12-18',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['unregistered agreement', 'inadmissible evidence', 'non-registration effect', 'property dispute', 'court evidence']
  },

  // --- Information Technology Act, 2000 (Act No. 21 of 2000) ---
  {
    id: 'ita_sec_10a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    chapter: 'Chapter IV - Electronic Governance',
    sectionNumber: 'Section 10A',
    sectionTitle: 'Validity of Contracts Formed Through Electronic Means',
    statuteText: 'Where in a contract formation, the communication of proposals, the acceptance of proposals, the revocation of proposals and acceptances, as the case may be, are expressed in electronic form or by means of an electronic record, such contract shall not be deemed to be unenforceable solely on the ground that such electronic form or means was used for that purpose.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362',
    sourceDocument: 'Information Technology Act 2000 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2000-10-17',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['digital contract', 'electronic contract', 'e-signature', 'online contract', 'email agreement']
  },
  {
    id: 'ita_sec_43a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    chapter: 'Chapter IX - Penalties, Compensation and Adjudication',
    sectionNumber: 'Section 43A',
    sectionTitle: 'Compensation for Failure to Protect Sensitive Personal Data',
    statuteText: 'Where a body corporate, possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices and procedures and thereby causes wrongful loss or wrongful gain to any person, such body corporate shall be liable to pay damages by way of compensation to the person so affected.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362',
    sourceDocument: 'Information Technology Act 2000 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2008-10-27',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['data privacy', 'sensitive personal data', 'data leak', 'cybersecurity', 'confidentiality breach', 'body corporate liability']
  },
  {
    id: 'ita_sec_72a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    chapter: 'Chapter XI - Offences',
    sectionNumber: 'Section 72A',
    sectionTitle: 'Punishment for Disclosure of Information in Breach of Lawful Contract',
    statuteText: 'Save as otherwise provided in this Act or any other law for the time being in force, any person including an intermediary who, while providing services under the terms of lawful contract, has secured access to any material containing personal information about another person, with the intent to cause or knowing that he is likely to cause wrongful loss or wrongful gain discloses, without the consent of the person concerned, or in breach of a lawful contract, such material, shall be punished with imprisonment for a term which may extend to three years, or with fine which may extend to five lakh rupees, or with both.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999?sam_handle=123456789/1362',
    sourceDocument: 'Information Technology Act 2000 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2008-10-27',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['nda breach', 'disclosure', 'confidential information', 'trade secret', 'criminal liability', 'wrongful gain']
  },

  // --- Specific Relief Act, 1963 (Act No. 47 of 1963) ---
  {
    id: 'sra_sec_10',
    actName: 'The Specific Relief Act, 1963',
    actShortTitle: 'Specific Relief Act 1963',
    actNumber: 'Act No. 47 of 1963',
    year: 1963,
    chapter: 'Chapter II - Specific Performance of Contracts',
    sectionNumber: 'Section 10',
    sectionTitle: 'Specific Performance in Respect of Contracts',
    statuteText: 'The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1583?sam_handle=123456789/1362',
    sourceDocument: 'Specific Relief Act 1963 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1963-12-13',
    applicabilityCategory: 'general_contract',
    keywords: ['specific performance', 'court enforcement', 'contract obligation', 'injunction', 'performance order']
  },

  // --- Arbitration and Conciliation Act, 1996 (Act No. 26 of 1996) ---
  {
    id: 'aca_sec_7',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    actNumber: 'Act No. 26 of 1996',
    year: 1996,
    chapter: 'Part I - General Provisions',
    sectionNumber: 'Section 7',
    sectionTitle: 'Arbitration Agreement',
    statuteText: 'In this Part, arbitration agreement means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1978?sam_handle=123456789/1362',
    sourceDocument: 'Arbitration and Conciliation Act 1996 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1996-08-22',
    applicabilityCategory: 'dispute_arbitration',
    keywords: ['arbitration clause', 'dispute resolution', 'arbitral tribunal', 'out of court settlement', 'binding arbitration']
  },

  // --- Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) ---
  {
    id: 'dpdpa_sec_4',
    actName: 'The Digital Personal Data Protection Act, 2023',
    actShortTitle: 'DPDP Act 2023',
    actNumber: 'Act No. 22 of 2023',
    year: 2023,
    chapter: 'Chapter II - Obligations of Data Fiduciary',
    sectionNumber: 'Section 4',
    sectionTitle: 'Grounds for Processing Personal Data',
    statuteText: 'A person may process the personal data of a Data Principal only in accordance with the provisions of this Act and for a lawful purpose: (a) for which the Data Principal has given her consent; or (b) for certain legitimate uses.',
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2023?sam_handle=123456789/1362',
    sourceDocument: 'Digital Personal Data Protection Act 2023 - Official Gazette',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2023-08-11',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['dpdp', 'personal data', 'consent', 'data principal', 'data fiduciary', 'privacy law']
  },

  // ==========================================================================
  // 2. KARNATAKA STATE-SPECIFIC STATUTORY ACTS & RULES (Tier 1 / Tier 2)
  // Provenance: Karnataka Government Secretariat / DPAR / Department of Stamps & Registration
  // ==========================================================================

  // --- Karnataka Rent Act, 1999 (Karnataka Act No. 34 of 2001) ---
  {
    id: 'ka_rent_sec_4',
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act No. 34 of 2001',
    year: 1999,
    chapter: 'Chapter II - Execution and Registration of Tenancy Agreement',
    sectionNumber: 'Section 4',
    sectionTitle: 'Tenancy Agreement to be in Writing and Registered',
    statuteText: 'Notwithstanding anything contained in this Act or any other law for the time being in force, no person shall, after the commencement of this Act, let or take on rent any premises except by an agreement in writing, and such agreement shall be registered with the Rent Controller or specified officer in the prescribed manner.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Rent_Act_1999.pdf',
    sourceDocument: 'Karnataka Rent Act 1999 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2001-12-31',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['karnataka rent act', 'bengaluru rental agreement', 'rent controller registration', 'written tenancy karnataka', 'mandatory registration bengaluru']
  },
  {
    id: 'ka_rent_sec_22',
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act No. 34 of 2001',
    year: 1999,
    chapter: 'Chapter V - Control of Eviction of Tenants',
    sectionNumber: 'Section 22',
    sectionTitle: 'Protection of Tenant Against Eviction',
    statuteText: 'No order or decree for the recovery of possession of any premises shall be made by the Court or Rent Controller in favour of the landlord against the tenant except on specified grounds such as non-payment of rent despite notice, sub-letting without written consent, or bona fide personal necessity of the landlord.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Rent_Act_1999.pdf',
    sourceDocument: 'Karnataka Rent Act 1999 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2001-12-31',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['eviction protection karnataka', 'tenant rights bengaluru', 'unlawful eviction', 'rent default notice', 'sub-letting restriction']
  },
  {
    id: 'ka_rent_sec_31',
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act No. 34 of 2001',
    year: 1999,
    chapter: 'Chapter VI - Special Provisions for Short Term Tenancies',
    sectionNumber: 'Section 31',
    sectionTitle: 'Special Provisions Relating to Short Term Tenancies',
    statuteText: 'Where a landlord lets out any premises on a short term tenancy for a limited period not exceeding five years, the agreement shall specify the duration, and on expiry of the agreed term, the landlord shall be entitled to recover vacant possession directly through the Controller without long litigation.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Rent_Act_1999.pdf',
    sourceDocument: 'Karnataka Rent Act 1999 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '2001-12-31',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['short term tenancy karnataka', 'fixed term lease bengaluru', '5 year tenancy', 'vacant possession', 'lease expiry']
  },

  // --- Karnataka Stamp Act, 1957 (Karnataka Act No. 34 of 1957) ---
  {
    id: 'ka_stamp_art_30',
    actName: 'The Karnataka Stamp Act, 1957',
    actShortTitle: 'Karnataka Stamp Act 1957',
    actNumber: 'Karnataka Act No. 34 of 1957',
    year: 1957,
    chapter: 'Schedule - Article 30 (Lease of Immovable Property)',
    sectionNumber: 'Article 30',
    sectionTitle: 'Stamp Duty on Lease & Leave License Agreements in Karnataka',
    statuteText: 'Stamp duty payable on a lease or leave and license agreement executed in Karnataka: (a) Where lease duration is under 1 year, duty is calculated at prescribed percentage of total rent plus deposit; (b) Where duration is 1 to 5 years, duty scales accordingly. Payment must be made via authorized Karnataka e-Stamp portal (Kaveri 2.0 / Department of Stamps & Registration).',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dostar.karnataka.gov.in/storage/pdf-files/Karnataka_Stamp_Act_1957.pdf',
    sourceDocument: 'Department of Stamps and Registration, Government of Karnataka',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1957-09-28',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['karnataka stamp duty', 'kaveri e-stamp', 'bengaluru rent stamp duty', 'article 30 karnataka', 'stamp paper value']
  },
  {
    id: 'ka_stamp_sec_33',
    actName: 'The Karnataka Stamp Act, 1957',
    actShortTitle: 'Karnataka Stamp Act 1957',
    actNumber: 'Karnataka Act No. 34 of 1957',
    year: 1957,
    chapter: 'Chapter IV - Instruments Not Duly Stamped',
    sectionNumber: 'Section 33',
    sectionTitle: 'Impounding of Instruments Not Duly Stamped in Karnataka',
    statuteText: 'Every person having by law or consent of parties authority to receive evidence, and every officer in charge of a public office before whom any instrument chargeable with stamp duty is produced, shall impound the same if it appears to him that such instrument is not duly stamped in accordance with Karnataka state rates.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dostar.karnataka.gov.in/storage/pdf-files/Karnataka_Stamp_Act_1957.pdf',
    sourceDocument: 'Department of Stamps and Registration, Government of Karnataka',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1957-09-28',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['impounding agreement karnataka', 'insufficient stamp duty penalty', 'court admissibility bengaluru', 'deficit stamp duty']
  },

  // --- Registration (Karnataka Amendment) Act & Kaveri Rules ---
  {
    id: 'ka_reg_sec_17_amdt',
    actName: 'The Registration (Karnataka Amendment) Act',
    actShortTitle: 'Registration (Karnataka Amendment) Act',
    actNumber: 'Karnataka Act No. 41 of 1976',
    year: 1976,
    chapter: 'State Amendments to Part III',
    sectionNumber: 'Section 17 (Karnataka State Amendment)',
    sectionTitle: 'State Specific Registration Directives for Karnataka',
    statuteText: 'In Karnataka, all deeds affecting immovable property located within Karnataka state municipalities and Bengaluru Urban district must comply with state e-Registration directives issued by the Inspector General of Registration through Kaveri Online Services.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dostar.karnataka.gov.in',
    sourceDocument: 'Department of Stamps and Registration, Government of Karnataka',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1976-06-15',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['kaveri 2.0 registration', 'bengaluru sub registrar', 'karnataka e-registration', 'property registration karnataka']
  },

  // --- Karnataka Shops and Commercial Establishments Act, 1961 (Karnataka Act No. 8 of 1962) ---
  {
    id: 'ka_shops_sec_25',
    actName: 'The Karnataka Shops and Commercial Establishments Act, 1961',
    actShortTitle: 'Karnataka Shops Act 1961',
    actNumber: 'Karnataka Act No. 8 of 1962',
    year: 1961,
    chapter: 'Chapter V - Employment & Termination',
    sectionNumber: 'Section 25',
    sectionTitle: 'Notice of Termination of Service in Karnataka Establishments',
    statuteText: 'No employer shall dispense with the services of an employee who has been in his continuous employment for not less than six months, without giving at least one month notice in writing, or wages in lieu of such notice, except where the services are dispensed with on a charge of misconduct supported by satisfactory evidence.',
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in',
    sourceDocument: 'Department of Labour, Government of Karnataka',
    sourceTier: 'Tier 1 (Official Government)',
    effectiveDate: '1962-03-01',
    applicabilityCategory: 'employment_service',
    keywords: ['karnataka employment law', 'bengaluru notice period', 'one month notice karnataka', 'termination of service bengaluru', 'karnataka commercial establishment']
  }
];
