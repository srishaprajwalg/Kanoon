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
  jurisdiction?: 'Federal' | 'Maharashtra' | 'Karnataka' | 'Delhi NCR' | 'Tamil Nadu' | 'Telangana';
  sourceUrl?: string; // Official India Code / Govt URI
  effectiveDate?: string;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  stateSpecific?: string;
  keywords: string[];
  embeddingVector?: number[]; // Pre-calculated normalized dense embedding weights
}

export const INDIAN_LEGAL_CORPUS: CorpusItem[] = [
  // --------------------------------------------------------------------------
  // 1. GENERAL CONTRACT LAW (Indian Contract Act, 1872 - Central Act No. 9 of 1872)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/2263
  // --------------------------------------------------------------------------
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
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
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
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?sam_handle=123456789/1362',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['consideration', 'promise', 'payment', 'service', 'exchange', 'benefit', 'remuneration']
  },
  {
    id: 'ica_sec_10',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 10',
    sectionTitle: 'What agreements are contracts',
    statuteText: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20800',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['free consent', 'lawful consideration', 'competent parties', 'lawful object', 'valid contract', 'enforceability']
  },
  {
    id: 'ica_sec_11',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 11',
    sectionTitle: 'Who are competent to contract',
    statuteText: 'Every person is competent to contract who is of the age of majority according to the law to which he is subject, and who is of sound mind and is not disqualified from contracting by any law to which he is subject.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20801',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['competent', 'majority', 'age of majority', 'sound mind', 'capacity to contract', 'minor']
  },
  {
    id: 'ica_sec_14',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 14',
    sectionTitle: 'Free Consent Defined',
    statuteText: 'Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20804',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['free consent', 'coercion', 'undue influence', 'fraud', 'misrepresentation', 'mistake', 'coerced']
  },
  {
    id: 'ica_sec_23',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 23',
    sectionTitle: 'What considerations and objects are lawful, and what not',
    statuteText: 'The consideration or object of an agreement is lawful, unless it is forbidden by law; or is of such a nature that, if permitted, it would defeat the provisions of any law; or is fraudulent; or involves or implies injury to the person or property of another; or the Court regards it as immoral, or opposed to public policy.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20813',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['lawful consideration', 'public policy', 'forbidden by law', 'immoral', 'void object', 'illegal term']
  },
  {
    id: 'ica_sec_73',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter VI - Of the Consequences of Breach of Contract',
    sectionNumber: 'Section 73',
    sectionTitle: 'Compensation for loss or damage caused by breach of contract',
    statuteText: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20863',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['breach of contract', 'compensation', 'damages', 'liquidated damages', 'loss', 'consequential loss']
  },
  {
    id: 'ica_sec_74',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter VI - Of the Consequences of Breach of Contract',
    sectionNumber: 'Section 74',
    sectionTitle: 'Compensation for breach of contract where penalty stipulated for',
    statuteText: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20864',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['penalty', 'liquidated damages', 'security deposit', 'breach penalty', 'stipulation', 'unreasonable penalty']
  },
  {
    id: 'ica_sec_124',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter VIII - Of Indemnity and Guarantee',
    sectionNumber: 'Section 124',
    sectionTitle: 'Contract of indemnity defined',
    statuteText: 'A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a contract of indemnity.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20914',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'general_contract',
    keywords: ['indemnity', 'indemnify', 'hold harmless', 'loss protection', 'liabilities', 'unlimited indemnity']
  },

  // --------------------------------------------------------------------------
  // 2. LEASE & TENANCY LAW (Transfer of Property Act, 1882 - Act No. 4 of 1882 & Registration Act 1908)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/2338
  // --------------------------------------------------------------------------
  {
    id: 'topa_sec_105',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 105',
    sectionTitle: 'Lease Defined',
    statuteText: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?section_id=22205',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['lease', 'rent', 'immovable property', 'tenancy', 'landlord', 'tenant', 'licensor', 'licensee', 'leave and license']
  },
  {
    id: 'topa_sec_106',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 106',
    sectionTitle: 'Duration of certain leases in absence of written contract',
    statuteText: 'In the absence of a contract or local law to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable by six months notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable by fifteen days notice.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?section_id=22206',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['notice period', 'termination notice', 'month to month', '15 days notice', 'lease termination', 'vacate notice']
  },
  {
    id: 'topa_sec_107',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    chapter: 'Chapter V - Of Leases of Immovable Property',
    sectionNumber: 'Section 107',
    sectionTitle: 'Leases how made',
    statuteText: 'A lease of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made only by a registered instrument. All other leases of immovable property may be made either by a registered instrument or by oral agreement accompanied by delivery of possession. State amendments may prescribe stricter compulsory registration rules.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338?section_id=22207',
    effectiveDate: '1882-07-01',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration', '11 months', 'registered instrument', 'exceeding one year', 'sub-registrar', 'stamp duty', 'compulsory registration']
  },
  {
    id: 'reg_sec_17',
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    chapter: 'Part III - Of Computable Documents',
    sectionNumber: 'Section 17(1)(d)',
    sectionTitle: 'Documents of which registration is compulsory',
    statuteText: 'Leases of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent shall be registered compulsorily under Sub-Registrar of Assurances.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2189?section_id=14017',
    effectiveDate: '1908-12-18',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration', 'compulsory registration', 'sub-registrar', '12 months', 'stamp paper', 'tenancy agreement']
  },
  {
    id: 'mra_sec_55',
    actName: 'The Maharashtra Rent Control Act, 1999',
    actShortTitle: 'Maharashtra Rent Control Act 1999',
    actNumber: 'Maharashtra Act No. 18 of 2000',
    year: 1999,
    chapter: 'Chapter IX - Miscellaneous',
    sectionNumber: 'Section 55',
    sectionTitle: 'Tenancy agreement to be in writing and registered',
    statuteText: 'Notwithstanding anything contained in this Act or any other law for the time being in force, any agreement for leave and license or letting of any premises shall be in writing and shall be registered under the Registration Act 1908. The responsibility of getting such agreement registered shall be on the landlord/licensor.',
    jurisdiction: 'Maharashtra',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2511',
    effectiveDate: '2000-03-31',
    applicabilityCategory: 'lease_tenancy',
    stateSpecific: 'Maharashtra',
    keywords: ['maharashtra', 'leave and license', 'mandatory registration', 'landlord responsibility', 'mumbai', 'pune', 'sub-registrar']
  },
  {
    id: 'mta_2021_sec_11',
    actName: 'Model Tenancy Act, 2021',
    actShortTitle: 'Model Tenancy Act 2021',
    year: 2021,
    chapter: 'Chapter III - Rights and Responsibilities of Landlord and Tenant',
    sectionNumber: 'Section 11',
    sectionTitle: 'Security Deposit Provisions',
    statuteText: 'The security deposit to be paid by the tenant in advance shall not exceed two months rent in case of residential premises, and six months rent in case of non-residential premises. The security deposit shall be refunded to the tenant at the time of vacating the premises, after making necessary deductions.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
    effectiveDate: '2021-06-02',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['security deposit', 'two months rent', 'residential tenancy', 'refund', 'model tenancy act', 'advance deposit']
  },

  // --------------------------------------------------------------------------
  // 3. CONFIDENTIALITY & DATA PROTECTION (IT Act 2000 & Contract Act)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/1999
  // --------------------------------------------------------------------------
  {
    id: 'it_sec_43a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    chapter: 'Chapter IX - Penalties, Compensation and Adjudication',
    sectionNumber: 'Section 43A',
    sectionTitle: 'Compensation for failure to protect data',
    statuteText: 'Where a body corporate possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices and procedures, such body corporate shall be liable to pay damages by way of compensation to the person so affected.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999?section_id=13143',
    effectiveDate: '2008-10-27',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['confidentiality', 'data privacy', 'sensitive personal data', 'nda', 'security practices', 'trade secret', 'data leak']
  },
  {
    id: 'it_sec_72a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    chapter: 'Chapter XI - Offences',
    sectionNumber: 'Section 72A',
    sectionTitle: 'Punishment for disclosure of information in breach of lawful contract',
    statuteText: 'Save as otherwise provided in this Act or any other law for the time being in force, any person who has secured access to any material containing personal information about another person, with the intent to cause or knowing that he is likely to cause wrongful loss or wrongful gain discloses, without the consent of the person concerned, shall be punished with imprisonment for a term which may extend to three years, or with fine which may extend to five lakh rupees, or with both.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999?section_id=13172',
    effectiveDate: '2008-10-27',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['disclosure', 'unauthorized disclosure', 'breach of contract', 'confidential information', 'trade secrets', 'nda breach']
  },

  // --------------------------------------------------------------------------
  // 4. EMPLOYMENT & RESTRAINT OF TRADE (Contract Act Sec 27 & Specific Relief Act)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/2263
  // --------------------------------------------------------------------------
  {
    id: 'ica_sec_27',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    chapter: 'Chapter II - Of Contracts, Voidable Contracts and Void Agreements',
    sectionNumber: 'Section 27',
    sectionTitle: 'Agreement in restraint of trade void',
    statuteText: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. (Note: Post-employment non-compete covenants are strictly void in India under Supreme Court precedents including Percept D\'Mark v. Zaheer Khan).',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263?section_id=20817',
    effectiveDate: '1872-09-01',
    applicabilityCategory: 'employment_service',
    keywords: ['non-compete', 'restraint of trade', 'employment', 'business restriction', 'void clause', 'solicitation', 'post-employment non-compete']
  },

  // --------------------------------------------------------------------------
  // 5. DISPUTE RESOLUTION & ARBITRATION (Arbitration Act 1996)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/1978
  // --------------------------------------------------------------------------
  {
    id: 'aca_sec_7',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    actNumber: 'Act No. 26 of 1996',
    year: 1996,
    chapter: 'Part I - General Provisions',
    sectionNumber: 'Section 7',
    sectionTitle: 'Arbitration agreement',
    statuteText: 'Arbitration agreement means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1978?section_id=12807',
    effectiveDate: '1996-08-22',
    applicabilityCategory: 'dispute_arbitration',
    keywords: ['arbitration', 'arbitrator', 'dispute resolution', 'written agreement', 'conciliation', 'arbitral tribunal']
  },

  // --------------------------------------------------------------------------
  // 6. CONSUMER RIGHTS & UNFAIR CONTRACTS (Consumer Protection Act 2019)
  // Provenance: https://www.indiacode.nic.in/handle/123456789/15256
  // --------------------------------------------------------------------------
  {
    id: 'cpa_sec_2_46',
    actName: 'The Consumer Protection Act, 2019',
    actShortTitle: 'Consumer Protection Act 2019',
    actNumber: 'Act No. 35 of 2019',
    year: 2019,
    chapter: 'Chapter I - Preliminary',
    sectionNumber: 'Section 2(46)',
    sectionTitle: 'Definition of Unfair Contract',
    statuteText: 'Unfair Contract means a contract between a manufacturer or trader or service provider on one hand, and a consumer on the other, having terms which cause significant change in the rights of such consumer, including imposing unreasonable charge or penalty, or unilateral termination rights.',
    jurisdiction: 'Federal',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    effectiveDate: '2020-07-20',
    applicabilityCategory: 'consumer_rights',
    keywords: ['unfair contract', 'unilateral termination', 'unreasonable penalty', 'consumer rights', 'unfair clause', 'one-sided agreement']
  }
];
