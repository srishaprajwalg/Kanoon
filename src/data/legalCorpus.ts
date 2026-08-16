export interface CorpusItem {
  id: string;
  actName: string;
  actShortTitle: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  stateSpecific?: string;
  keywords: string[];
  embeddingVector?: number[]; // Vector weights for cosine similarity
}

export const INDIAN_LEGAL_CORPUS: CorpusItem[] = [
  // 1. General Contract Law
  {
    id: 'ica_sec_2_h',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 2(h)',
    sectionTitle: 'Definition of Contract',
    statuteText: 'An agreement enforceable by law is a contract.',
    applicabilityCategory: 'general_contract',
    keywords: ['contract', 'enforceable', 'agreement', 'validity', 'law', 'binding']
  },
  {
    id: 'ica_sec_10',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 10',
    sectionTitle: 'What agreements are contracts',
    statuteText: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
    applicabilityCategory: 'general_contract',
    keywords: ['free consent', 'lawful consideration', 'competent', 'lawful object', 'valid contract']
  },
  {
    id: 'ica_sec_14',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 14',
    sectionTitle: 'Free Consent Defined',
    statuteText: 'Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake.',
    applicabilityCategory: 'general_contract',
    keywords: ['free consent', 'coercion', 'undue influence', 'fraud', 'misrepresentation', 'mistake']
  },
  {
    id: 'ica_sec_73',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 73',
    sectionTitle: 'Compensation for loss or damage caused by breach of contract',
    statuteText: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach.',
    applicabilityCategory: 'general_contract',
    keywords: ['breach of contract', 'compensation', 'damages', 'liquidated damages', 'loss']
  },
  {
    id: 'ica_sec_74',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 74',
    sectionTitle: 'Compensation for breach of contract where penalty stipulated for',
    statuteText: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named.',
    applicabilityCategory: 'general_contract',
    keywords: ['penalty', 'liquidated damages', 'security deposit', 'breach penalty', 'stipulation']
  },

  // 2. Lease & Tenancy Law
  {
    id: 'topa_sec_105',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 105',
    sectionTitle: 'Lease Defined',
    statuteText: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee.',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['lease', 'rent', 'immovable property', 'tenancy', 'landlord', 'tenant', 'license']
  },
  {
    id: 'topa_sec_106',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 106',
    sectionTitle: 'Duration of certain leases in absence of written contract or local usage',
    statuteText: 'In the absence of a contract or local law to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable on the part of either lessor or lessee by six months notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable by fifteen days notice.',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['notice period', 'termination notice', 'month to month', '15 days notice', 'lease termination']
  },
  {
    id: 'topa_sec_107',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 107',
    sectionTitle: 'Leases how made',
    statuteText: 'A lease of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made only by a registered instrument. All other leases of immovable property may be made either by a registered instrument or by oral agreement accompanied by delivery of possession. (Note: State amendments like Maharashtra Rent Control Act 1999 require registration for all leases regardless of duration).',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration', '11 months', 'registered instrument', 'exceeding one year', 'sub-registrar', 'stamp duty']
  },
  {
    id: 'mta_2021',
    actName: 'Model Tenancy Act, 2021',
    actShortTitle: 'Model Tenancy Act 2021',
    sectionNumber: 'Section 11',
    sectionTitle: 'Security Deposit Provisions',
    statuteText: 'The security deposit to be paid by the tenant in advance shall not exceed two months rent in case of residential premises, and six months rent in case of non-residential premises. The security deposit shall be refunded to the tenant at the time of vacating the premises, after making necessary deductions.',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['security deposit', 'two months rent', 'residential tenancy', 'refund', 'model tenancy act']
  },

  // 3. Confidentiality & NDA Law
  {
    id: 'it_sec_43a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    sectionNumber: 'Section 43A',
    sectionTitle: 'Compensation for failure to protect data',
    statuteText: 'Where a body corporate possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices and procedures, such body corporate shall be liable to pay damages by way of compensation to the person so affected.',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['confidentiality', 'data privacy', 'sensitive personal data', 'nda', 'security practices', 'trade secret']
  },
  {
    id: 'it_sec_72a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    sectionNumber: 'Section 72A',
    sectionTitle: 'Punishment for disclosure of information in breach of lawful contract',
    statuteText: 'Save as otherwise provided in this Act or any other law for the time being in force, any person who has secured access to any material containing personal information about another person, with the intent to cause or knowing that he is likely to cause wrongful loss or wrongful gain discloses, without the consent of the person concerned, shall be punished with imprisonment for a term which may extend to three years, or with fine which may extend to five lakh rupees, or with both.',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['disclosure', 'unauthorized disclosure', 'breach of contract', 'confidential information', 'trade secrets']
  },

  // 4. Employment & Restraint of Trade
  {
    id: 'ica_sec_27',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 27',
    sectionTitle: 'Agreement in restraint of trade void',
    statuteText: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
    applicabilityCategory: 'employment_service',
    keywords: ['non-compete', 'restraint of trade', 'employment', 'business restriction', 'void clause', 'solicitation']
  },

  // 5. Dispute Resolution & Arbitration (Only for Arbitration queries)
  {
    id: 'aca_sec_7',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    sectionNumber: 'Section 7',
    sectionTitle: 'Arbitration agreement',
    statuteText: 'Arbitration agreement means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing.',
    applicabilityCategory: 'dispute_arbitration',
    keywords: ['arbitration', 'arbitrator', 'dispute resolution', 'written agreement', 'conciliation']
  }
];
