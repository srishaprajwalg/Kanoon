export interface CorpusItem {
  id: string;
  actName: string;
  actShortTitle: string;
  sectionNumber: string;
  sectionTitle: string;
  statuteText: string;
  applicabilityTag: string;
  keywords: string[];
}

export const INDIAN_LEGAL_CORPUS: CorpusItem[] = [
  {
    id: 'ica_sec_2_h',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 2(h)',
    sectionTitle: 'Definition of Contract',
    statuteText: 'An agreement enforceable by law is a contract.',
    applicabilityTag: 'General Enforceability',
    keywords: ['contract', 'enforceable', 'agreement', 'validity', 'law']
  },
  {
    id: 'ica_sec_10',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 10',
    sectionTitle: 'What agreements are contracts',
    statuteText: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
    applicabilityTag: 'Contract Validity',
    keywords: ['free consent', 'lawful consideration', 'competent', 'lawful object', 'valid contract']
  },
  {
    id: 'ica_sec_14',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 14',
    sectionTitle: 'Free Consent Defined',
    statuteText: 'Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake.',
    applicabilityTag: 'Consent & Fraud',
    keywords: ['free consent', 'coercion', 'undue influence', 'fraud', 'misrepresentation']
  },
  {
    id: 'ica_sec_27',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 27',
    sectionTitle: 'Agreement in restraint of trade void',
    statuteText: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
    applicabilityTag: 'Non-Compete & Employment',
    keywords: ['non-compete', 'restraint of trade', 'employment', 'business restriction', 'void clause']
  },
  {
    id: 'ica_sec_73',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 73',
    sectionTitle: 'Compensation for loss or damage caused by breach of contract',
    statuteText: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach.',
    applicabilityTag: 'Breach & Damages',
    keywords: ['breach of contract', 'compensation', 'damages', 'liquidated damages', 'loss']
  },
  {
    id: 'ica_sec_74',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    sectionNumber: 'Section 74',
    sectionTitle: 'Compensation for breach of contract where penalty stipulated for',
    statuteText: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named.',
    applicabilityTag: 'Penalty & Security Deposit',
    keywords: ['penalty', 'liquidated damages', 'security deposit', 'breach penalty', 'stipulation']
  },
  {
    id: 'topa_sec_105',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 105',
    sectionTitle: 'Lease Defined',
    statuteText: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee.',
    applicabilityTag: 'Residential & Commercial Leases',
    keywords: ['lease', 'rent', 'immovable property', 'tenancy', 'landlord', 'tenant']
  },
  {
    id: 'topa_sec_106',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 106',
    sectionTitle: 'Duration of certain leases in absence of written contract or local usage',
    statuteText: 'In the absence of a contract or local law to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable on the part of either lessor or lessee by six months notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable by fifteen days notice.',
    applicabilityTag: 'Notice Period & Termination',
    keywords: ['notice period', 'termination notice', 'month to month', '15 days notice', 'lease termination']
  },
  {
    id: 'topa_sec_107',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    sectionNumber: 'Section 107',
    sectionTitle: 'Leases how made',
    statuteText: 'A lease of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made only by a registered instrument. All other leases of immovable property may be made either by a registered instrument or by oral agreement accompanied by delivery of possession.',
    applicabilityTag: '11-Month Rental Registration',
    keywords: ['registration', '11 months', 'registered instrument', 'exceeding one year', 'sub-registrar']
  },
  {
    id: 'it_sec_10a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    sectionNumber: 'Section 10A',
    sectionTitle: 'Validity of contracts formed through electronic means',
    statuteText: 'Where in a contract formation, the communication of proposals, the acceptance of proposals, the revocation of proposals and acceptances, as the case may be, are expressed in electronic form or by means of an electronic record, such contract shall not be deemed to be unenforceable solely on the ground that such electronic form or means was used for that purpose.',
    applicabilityTag: 'Digital Signatures & Remote Agreements',
    keywords: ['electronic contract', 'digital signature', 'email agreement', 'online contract', 'whatsapp']
  },
  {
    id: 'it_sec_43a',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    sectionNumber: 'Section 43A',
    sectionTitle: 'Compensation for failure to protect data',
    statuteText: 'Where a body corporate possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices and procedures, such body corporate shall be liable to pay damages by way of compensation to the person so affected.',
    applicabilityTag: 'NDA & Data Privacy',
    keywords: ['confidentiality', 'data privacy', 'sensitive personal data', 'nda', 'security practices']
  },
  {
    id: 'cpa_sec_2_47',
    actName: 'The Consumer Protection Act, 2019',
    actShortTitle: 'Consumer Protection Act 2019',
    sectionNumber: 'Section 2(47)',
    sectionTitle: 'Unfair Trade Practice',
    statuteText: 'Unfair trade practice means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or for the provision of any service, adopts any unfair method or unfair or deceptive practice.',
    applicabilityTag: 'Consumer Rights & Service Contracts',
    keywords: ['unfair practice', 'defective service', 'consumer rights', 'deceptive practice', 'misleading']
  },
  {
    id: 'rera_sec_13',
    actName: 'Real Estate (Regulation and Development) Act, 2016',
    actShortTitle: 'RERA 2016',
    sectionNumber: 'Section 13',
    sectionTitle: 'Limit on advance deposit',
    statuteText: 'A promoter shall not accept a sum more than ten per cent of the cost of the apartment, plot, or building as the case may be, as an advance payment or an application fee, from a person without first entering into a written agreement for sale with such person and register the said agreement for sale.',
    applicabilityTag: 'Property Advance & Security Deposit',
    keywords: ['advance payment', 'security deposit', 'builder', 'agreement for sale', 'rera']
  },
  {
    id: 'aca_sec_7',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    sectionNumber: 'Section 7',
    sectionTitle: 'Arbitration agreement',
    statuteText: 'Arbitration agreement means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing.',
    applicabilityTag: 'Dispute Resolution Clause',
    keywords: ['arbitration', 'dispute resolution', 'written agreement', 'arbitrator', 'conciliation']
  }
];
