import type { ClauseLibraryItem } from '../types';


export const CLAUSE_LIBRARY: ClauseLibraryItem[] = [
  {
    id: 'clause_confidentiality',
    name: 'Confidentiality & Non-Disclosure',
    category: 'Confidentiality',
    shortDescription: 'Restricts sharing proprietary business secrets and sensitive documents.',
    plainEnglishExplanation: 'Both parties agree to keep all trade secrets, customer lists, and financial information secret and not share them with outside third parties.',
    whyItMatters: 'Protects valuable commercial ideas, software code, customer data, and financial records from leaks during or after business dealings.',
    applicableDocumentTypes: ['nda_agreement', 'employment_contract', 'service_agreement', 'rent_agreement'],
    riskLevel: 'medium',
    defaultClauseText: 'Each party shall maintain strict confidentiality over all proprietary data disclosed hereunder for a period of {confidentiality_duration} years post-termination.',
    relatedStatuteKeywords: ['confidentiality', 'trade secret', 'non disclosure'],
    parameters: [
      {
        key: 'confidentiality_duration',
        label: 'Confidentiality Duration',
        type: 'select',
        defaultValue: '3',
        options: [
          { label: '1 Year', value: '1' },
          { label: '2 Years', value: '2' },
          { label: '3 Years (Standard)', value: '3' },
          { label: '5 Years', value: '5' },
          { label: 'Indefinite / In Perpetuity', value: 'Indefinite' }
        ]
      }
    ]
  },
  {
    id: 'clause_ip_ownership',
    name: 'Intellectual Property Ownership',
    category: 'IP',
    shortDescription: 'Assigns all created work product, code, patents, and designs to the client/employer.',
    plainEnglishExplanation: 'All software, designs, reports, and inventions created under this agreement automatically belong to the client or employer.',
    whyItMatters: 'Prevents contractors or employees from claiming co-ownership of code, logos, or business assets developed on company time.',
    applicableDocumentTypes: ['employment_contract', 'service_agreement', 'nda_agreement'],
    riskLevel: 'medium',
    defaultClauseText: 'All works, software code, designs, and deliverables created hereunder shall constitute "work made for hire" and shall vest exclusively with {ip_owner}.',
    relatedStatuteKeywords: ['copyright', 'work for hire', 'intellectual property', 'patent'],
    parameters: [
      {
        key: 'ip_owner',
        label: 'IP Owner Assignment',
        type: 'select',
        defaultValue: 'Client / Employer exclusively',
        options: [
          { label: 'Client / Employer exclusively', value: 'Client / Employer exclusively' },
          { label: 'Joint Ownership', value: 'Joint Ownership between both parties' },
          { label: 'Contractor retains IP with Non-Exclusive License', value: 'Contractor with License to Client' }
        ]
      }
    ]
  },
  {
    id: 'clause_non_solicitation',
    name: 'Non-Solicitation of Employees & Clients',
    category: 'General',
    shortDescription: 'Prevents poaching staff, software developers, or client accounts.',
    plainEnglishExplanation: 'Neither party will try to hire away the other party\'s employees or steal their existing client accounts.',
    whyItMatters: 'Safeguards key talent, project leads, and client relationships from being poached by vendors or former employees.',
    applicableDocumentTypes: ['employment_contract', 'service_agreement', 'nda_agreement'],
    riskLevel: 'high',
    defaultClauseText: 'During the term and for {solicitation_duration} months thereafter, neither party shall directly or indirectly solicit or hire employees of the other party.',
    relatedStatuteKeywords: ['restraint of trade', 'non solicit', 'Section 27 Contract Act'],
    parameters: [
      {
        key: 'solicitation_duration',
        label: 'Restraint Duration',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: '6 Months', value: '6' },
          { label: '12 Months (Standard)', value: '12' },
          { label: '24 Months', value: '24' }
        ]
      }
    ]
  },
  {
    id: 'clause_force_majeure',
    name: 'Force Majeure & Unforeseen Events',
    category: 'General',
    shortDescription: 'Excuses performance during floods, strikes, pandemics, or government orders.',
    plainEnglishExplanation: 'Neither party is held liable for contract delays caused by natural disasters, acts of God, or unexpected government lockdowns.',
    whyItMatters: 'Provides legal relief without breach penalties when catastrophic events prevent performing contractual duties.',
    applicableDocumentTypes: ['rent_agreement', 'service_agreement', 'employment_contract', 'nda_agreement'],
    riskLevel: 'low',
    defaultClauseText: 'Neither party shall be liable for delay or failure in performance due to events beyond reasonable control, provided notice is given within {force_majeure_notice} days.',
    relatedStatuteKeywords: ['force majeure', 'frustration of contract', 'Section 56 Contract Act'],
    parameters: [
      {
        key: 'force_majeure_notice',
        label: 'Notice Period for Relief',
        type: 'select',
        defaultValue: '7',
        options: [
          { label: '3 Days', value: '3' },
          { label: '7 Days (Standard)', value: '7' },
          { label: '14 Days', value: '14' }
        ]
      }
    ]
  },
  {
    id: 'clause_limitation_liability',
    name: 'Limitation of Liability & Monetary Cap',
    category: 'Liability',
    shortDescription: 'Caps maximum financial damages recoverable for contract breach.',
    plainEnglishExplanation: 'Sets a strict maximum financial limit on how much money can be claimed in damages if a party breaches the contract.',
    whyItMatters: 'Prevents small businesses from facing catastrophic multi-crore lawsuits over minor project errors.',
    applicableDocumentTypes: ['service_agreement', 'rent_agreement', 'nda_agreement'],
    riskLevel: 'high',
    defaultClauseText: 'The aggregate liability of either party arising out of or related to this agreement shall not exceed {liability_cap_type}.',
    relatedStatuteKeywords: ['limitation of liability', 'damages', 'Section 73 Contract Act'],
    parameters: [
      {
        key: 'liability_cap_type',
        label: 'Liability Cap Limit',
        type: 'select',
        defaultValue: 'total fees paid in the preceding 6 months',
        options: [
          { label: 'Total fees paid in preceding 6 months', value: 'total fees paid in the preceding 6 months' },
          { label: 'Total contract value', value: 'the total contract value' },
          { label: 'Fixed Cap of ₹5,00,000', value: 'INR 500,000' }
        ]
      }
    ]
  },
  {
    id: 'clause_indemnity',
    name: 'Indemnity & Third-Party Protection',
    category: 'Liability',
    shortDescription: 'Compensates a party against losses caused by breaches or legal claims.',
    plainEnglishExplanation: 'If your breach causes third parties to sue the other party, you agree to cover their legal costs and settlements.',
    whyItMatters: 'Ensures innocent parties aren\'t financially crippled by legal fees caused by another party\'s negligence or breach.',
    applicableDocumentTypes: ['rent_agreement', 'service_agreement', 'employment_contract'],
    riskLevel: 'critical',
    defaultClauseText: 'Each party shall indemnify and hold harmless the other party against third-party claims arising from gross negligence, subject to {indemnity_cap}.',
    relatedStatuteKeywords: ['indemnity', 'Section 124 Contract Act', 'hold harmless'],
    parameters: [
      {
        key: 'indemnity_cap',
        label: 'Indemnity Liability Cap',
        type: 'select',
        defaultValue: 'a maximum cap equal to the total contract consideration',
        options: [
          { label: 'Capped at total contract value (Recommended)', value: 'a maximum cap equal to the total contract consideration' },
          { label: 'Capped at Insurance Coverage Limit', value: 'the limit of applicable insurance coverage' },
          { label: 'Uncapped Indemnity (High Commercial Risk)', value: 'no monetary cap' }
        ]
      }
    ]
  },
  {
    id: 'clause_arbitration',
    name: 'Arbitration & Dispute Resolution Seat',
    category: 'Dispute',
    shortDescription: 'Establishes binding out-of-court arbitration instead of civil court litigation.',
    plainEnglishExplanation: 'If a legal dispute happens, it will be resolved by an independent arbitrator out of court rather than through years of court cases.',
    whyItMatters: 'Arbitration under Indian Arbitration & Conciliation Act 1996 is significantly faster and confidential compared to civil court cases.',
    applicableDocumentTypes: ['rent_agreement', 'service_agreement', 'employment_contract', 'nda_agreement', 'legal_notice'],
    riskLevel: 'low',
    defaultClauseText: 'All disputes shall be referred to arbitration by a {arbitrator_count} under the Arbitration and Conciliation Act 1996, with seat of arbitration at {arbitration_seat}.',
    relatedStatuteKeywords: ['arbitration', 'Arbitration Act 1996', 'Section 7 Arbitration'],
    parameters: [
      {
        key: 'arbitration_seat',
        label: 'Seat of Arbitration (City)',
        type: 'select',
        defaultValue: 'Bengaluru, Karnataka',
        options: [
          { label: 'Bengaluru, Karnataka', value: 'Bengaluru, Karnataka' },
          { label: 'Mumbai, Maharashtra', value: 'Mumbai, Maharashtra' },
          { label: 'New Delhi (NCR)', value: 'New Delhi' },
          { label: 'State Capital Jurisdiction', value: 'the capital city of governing state' }
        ]
      },
      {
        key: 'arbitrator_count',
        label: 'Arbitrator Tribunal Structure',
        type: 'select',
        defaultValue: 'Sole Arbitrator appointed mutually',
        options: [
          { label: 'Sole Arbitrator (Cost Effective)', value: 'Sole Arbitrator appointed mutually' },
          { label: 'Three-Member Arbitral Tribunal', value: '3-member Arbitral Tribunal' }
        ]
      }
    ]
  },
  {
    id: 'clause_termination',
    name: 'Termination & Exit Notice',
    category: 'Termination',
    shortDescription: 'Specifies written notice requirement and cause needed to exit the contract.',
    plainEnglishExplanation: 'Defines how much advance notice either party must give in writing before cancelling or exiting the agreement.',
    whyItMatters: 'Prevents sudden unilateral contract cancellations without transition time or notice.',
    applicableDocumentTypes: ['rent_agreement', 'service_agreement', 'employment_contract', 'nda_agreement'],
    riskLevel: 'medium',
    defaultClauseText: 'Either party may terminate this agreement by providing {notice_days} days advance written notice to the other party.',
    relatedStatuteKeywords: ['termination notice', 'Section 106 Transfer of Property Act'],
    parameters: [
      {
        key: 'notice_days',
        label: 'Notice Period Duration',
        type: 'select',
        defaultValue: '30',
        options: [
          { label: '15 Days', value: '15' },
          { label: '30 Days (Standard)', value: '30' },
          { label: '60 Days', value: '60' },
          { label: '90 Days', value: '90' }
        ]
      }
    ]
  },
  {
    id: 'clause_late_payment',
    name: 'Late Payment Interest & Grace Period',
    category: 'Payment',
    shortDescription: 'Imposes penal interest on overdue invoice payments.',
    plainEnglishExplanation: 'If payments are delayed past the grace period, an annual interest rate will be charged on overdue amounts.',
    whyItMatters: 'Protects cash flow and encourages timely payment of invoices or monthly rent.',
    applicableDocumentTypes: ['rent_agreement', 'service_agreement'],
    riskLevel: 'medium',
    defaultClauseText: 'Payments delayed beyond a grace period of {grace_period_days} days shall attract penal interest at {interest_rate} per annum.',
    relatedStatuteKeywords: ['interest', 'MSME Act interest', 'late payment'],
    parameters: [
      {
        key: 'grace_period_days',
        label: 'Grace Period (Days)',
        type: 'select',
        defaultValue: '7',
        options: [
          { label: '5 Days', value: '5' },
          { label: '7 Days (Standard)', value: '7' },
          { label: '15 Days', value: '15' }
        ]
      },
      {
        key: 'interest_rate',
        label: 'Penal Interest Rate',
        type: 'select',
        defaultValue: '12%',
        options: [
          { label: '12% per annum (Standard)', value: '12%' },
          { label: '18% per annum (MSME Standard)', value: '18%' },
          { label: '24% per annum (High Penalty)', value: '24%' }
        ]
      }
    ]
  },
  {
    id: 'clause_data_protection',
    name: 'Data Protection & DPDP Act 2023 Compliance',
    category: 'Confidentiality',
    shortDescription: 'Mandates compliance with Indian Digital Personal Data Protection Act 2023.',
    plainEnglishExplanation: 'Both parties promise to handle personal data lawfully, obtain consent, and implement security measures against data breaches.',
    whyItMatters: 'Ensures compliance with statutory data privacy duties under DPDP Act 2023 and Information Technology Act 2000.',
    applicableDocumentTypes: ['nda_agreement', 'service_agreement', 'employment_contract'],
    riskLevel: 'low',
    defaultClauseText: 'Both parties shall process personal data in full compliance with the Digital Personal Data Protection Act 2023 and maintain technical safeguards against data breaches.',
    relatedStatuteKeywords: ['DPDP Act 2023', 'data protection', 'IT Act 2000', 'privacy'],
    parameters: [
      {
        key: 'dpdp_standard',
        label: 'Compliance Standard',
        type: 'select',
        defaultValue: 'DPDP Act 2023 & IT Act 2000 mandatory compliance',
        options: [
          { label: 'DPDP Act 2023 & IT Act 2000 (Standard)', value: 'DPDP Act 2023 & IT Act 2000 mandatory compliance' },
          { label: 'ISO 27001 Data Security Standards', value: 'ISO 27001 Certified Security Controls' }
        ]
      }
    ]
  }
];
