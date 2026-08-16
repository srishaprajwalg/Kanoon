import type { LegalActInfo } from '../types';

export const INDIAN_LEGAL_ACTS: LegalActInfo[] = [
  {
    id: 'contract_act_1872',
    title: 'The Indian Contract Act, 1872',
    shortTitle: 'Contract Act',
    year: 1872,
    category: 'Commercial Law',
    summary: 'The principal legislation governing contracts in India. It defines lawful consideration, free consent, void agreements, and remedies for breach of contract.',
    keySections: [
      {
        section: 'Section 10',
        title: 'What agreements are contracts',
        explanation: 'All agreements are contracts if made by free consent of parties competent to contract, for a lawful consideration and object.'
      },
      {
        section: 'Section 14',
        title: 'Free Consent',
        explanation: 'Consent is free when not caused by coercion, undue influence, fraud, misrepresentation, or mistake.'
      },
      {
        section: 'Section 73',
        title: 'Compensation for loss caused by breach',
        explanation: 'The party who suffers from breach of contract is entitled to receive compensation for any loss or damage naturally arising from such breach.'
      }
    ],
    impactForSmallBiz: 'Ensures that verbal or written agreements with suppliers/clients are legally enforceable as long as offer, acceptance, and consideration exist.'
  },
  {
    id: 'topa_1882',
    title: 'Transfer of Property Act, 1882',
    shortTitle: 'Property Act',
    year: 1882,
    category: 'Property Law',
    summary: 'Regulates the transfer of immovable property by sale, mortgage, lease, exchange, and gift across India.',
    keySections: [
      {
        section: 'Section 105',
        title: 'Lease Defined',
        explanation: 'A lease of immovable property is a transfer of a right to enjoy such property for a certain time in consideration of price or rent.'
      },
      {
        section: 'Section 107',
        title: 'Leases how made',
        explanation: 'Leases of immovable property from year to year or exceeding 1 year can only be made by a registered instrument. 11-month rent agreements avoid mandatory registration.'
      }
    ],
    impactForSmallBiz: 'Saves tenants & small offices heavy registration fees by legally validating 11-month renewable lease agreements.'
  },
  {
    id: 'cpa_2019',
    title: 'Consumer Protection Act, 2019',
    shortTitle: 'Consumer Act',
    year: 2019,
    category: 'Consumer Rights',
    summary: 'Protects consumer rights, establishes Consumer Protection Councils & Dispute Redressal Commissions, and penalizes unfair trade practices & misleading ads.',
    keySections: [
      {
        section: 'Section 2(47)',
        title: 'Unfair Trade Practice',
        explanation: 'Includes false representations about goods/services quality, failure to issue bill/receipt, or refusing refund within agreed time.'
      },
      {
        section: 'Section 35',
        title: 'Manner of making complaint',
        explanation: 'A consumer can file a complaint directly in the District Commission having jurisdiction, with minimal court fees.'
      }
    ],
    impactForSmallBiz: 'Protects small business buyers purchasing goods/services for self-employment, and requires businesses to maintain honest refund & warranty terms.'
  },
  {
    id: 'it_act_2000',
    title: 'Information Technology Act, 2000',
    shortTitle: 'IT Act',
    year: 2000,
    category: 'Digital & Cyber Law',
    summary: 'Provides legal recognition for electronic transactions, digital signatures, cybercrimes, and electronic contracts.',
    keySections: [
      {
        section: 'Section 10A',
        title: 'Validity of contracts formed through electronic means',
        explanation: 'Contracts entered into via email, WhatsApp, or electronic signatures are legally valid and enforceable in court.'
      },
      {
        section: 'Section 43A',
        title: 'Compensation for failure to protect sensitive data',
        explanation: 'Body corporate possessing sensitive personal data must maintain reasonable security practices or pay damages.'
      }
    ],
    impactForSmallBiz: 'Validates digital signatures, online client signoffs, email approvals, and requires data privacy compliance.'
  },
  {
    id: 'bns_2023',
    title: 'Bharatiya Nyaya Sanhita (BNS), 2023',
    shortTitle: 'BNS 2023 (Replaced IPC)',
    year: 2023,
    category: 'Criminal Law',
    summary: 'Replaced the Indian Penal Code 1860. Contains modernized penal provisions for fraud, forgery, breach of trust, and cyber fraud.',
    keySections: [
      {
        section: 'Section 316',
        title: 'Criminal Breach of Trust',
        explanation: 'Dishonest misappropriation or conversion of property entrusted to a person/employee.'
      },
      {
        section: 'Section 318',
        title: 'Cheating',
        explanation: 'Deceiving any person to fraudulently induce delivery of property or consent to retain property.'
      }
    ],
    impactForSmallBiz: 'Provides criminal remedies against commercial fraud, fake invoices, and employee embezzlement.'
  },
  {
    id: 'rera_2016',
    title: 'Real Estate (Regulation and Development) Act, 2016',
    shortTitle: 'RERA',
    year: 2016,
    category: 'Real Estate Law',
    summary: 'Established state RERA authorities to protect homebuyers and boost investments in real estate by regulating builder compliance and possession dates.',
    keySections: [
      {
        section: 'Section 13',
        title: 'Limit on advance deposit',
        explanation: 'Promoter cannot accept more than 10% of property cost without entering into a registered written agreement for sale.'
      },
      {
        section: 'Section 18',
        title: 'Return of amount and compensation',
        explanation: 'Homebuyer entitled to full refund with interest if promoter fails to hand over possession as per agreement.'
      }
    ],
    impactForSmallBiz: 'Protects commercial office buyers and tenants against builder defaults, delayed possession, or unauthorized building alterations.'
  }
];
