import type { LegalTemplate } from '../types';

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: 'rent_agreement',
    name: 'Residential Rent / Leave & License Agreement',
    category: 'Property & Rent',
    description: 'Standard plain-language rental agreement compliant with Indian Rent Control Acts & RERA rules.',
    popularIn: 'Tenants, Homeowners, PG Owners',
    iconName: 'Home',
    estimatedTime: '3 mins',
    defaultFormData: {
      documentTitle: 'Residential Leave and License Agreement',
      durationMonths: 11,
      financialAmount: 25000,
      securityDeposit: 75000,
      noticePeriodDays: 30,
      lockInPeriodMonths: 6,
      disputeResolution: 'Arbitration',
      governingLawState: 'Maharashtra',
      usePlainLanguage: true,
      customClauses: [
        'No structural alterations permitted without written consent from Owner.',
        'Tenant responsible for internal minor maintenance up to ₹2,000.',
        'Owner guarantees peaceful possession without illegal interference.'
      ]
    }
  },
  {
    id: 'nda_agreement',
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Business & Startup',
    description: 'Protect confidential business ideas, source code, and trade secrets for Indian startups & freelancers.',
    popularIn: 'Startups, Software Vendors, Co-founders',
    iconName: 'ShieldCheck',
    estimatedTime: '2 mins',
    defaultFormData: {
      documentTitle: 'Mutual Confidentiality and Non-Disclosure Agreement',
      durationMonths: 24,
      financialAmount: 0,
      noticePeriodDays: 15,
      disputeResolution: 'Arbitration',
      governingLawState: 'Karnataka',
      usePlainLanguage: true,
      customClauses: [
        'Confidential info includes proprietary algorithms, customer lists, and financial projections.',
        'Exceptions include publicly known facts and legally subpoenaed disclosures.',
        'Return or destruction of physical/digital assets within 7 working days upon request.'
      ]
    }
  },
  {
    id: 'freelance_service',
    name: 'Freelance & Service Provider Agreement',
    category: 'Employment & Work',
    description: 'Clear scope of work, milestone payments, IP transfer, and late-payment interest clause in simple terms.',
    popularIn: 'Freelancers, Digital Agencies, Consultants',
    iconName: 'Briefcase',
    estimatedTime: '4 mins',
    defaultFormData: {
      documentTitle: 'Master Service and Deliverables Agreement',
      durationMonths: 6,
      financialAmount: 150000,
      noticePeriodDays: 14,
      disputeResolution: 'Arbitration',
      governingLawState: 'Delhi NCR',
      usePlainLanguage: true,
      customClauses: [
        'Client owns full Intellectual Property upon 100% full payment settlement.',
        'Late payment interest of 1.5% per month applicable after 15 calendar days from invoice.',
        'Maximum 2 revision cycles per milestone deliverable included in agreed fee.'
      ]
    }
  },
  {
    id: 'partnership_deed',
    name: 'Partnership Deed (Indian Partnership Act 1932)',
    category: 'Business & Startup',
    description: 'Draft capital contribution, profit sharing ratio, decision power, and partner exit clause.',
    popularIn: 'Small Businesses, Retail Stores, Co-founders',
    iconName: 'Users',
    estimatedTime: '5 mins',
    defaultFormData: {
      documentTitle: 'Partnership Deed',
      durationMonths: 36,
      financialAmount: 500000,
      noticePeriodDays: 60,
      disputeResolution: 'Arbitration',
      governingLawState: 'Gujarat',
      usePlainLanguage: true,
      customClauses: [
        'Profit and Loss shared equally (50%-50%) among all signing partners.',
        'Unanimous consent required for any bank loans above ₹1,00,000.',
        'Retirement of a partner requires 60 days advance written notification.'
      ]
    }
  },
  {
    id: 'employment_contract',
    name: 'Standard Employment Letter & Agreement',
    category: 'Employment & Work',
    description: 'Employment terms, CTC breakdown, probation, non-compete, and confidentiality clause.',
    popularIn: 'MSMEs, Startups, Local Businesses',
    iconName: 'UserCheck',
    estimatedTime: '4 mins',
    defaultFormData: {
      documentTitle: 'Employment Terms Agreement',
      durationMonths: 12,
      financialAmount: 600000,
      noticePeriodDays: 30,
      lockInPeriodMonths: 3,
      disputeResolution: 'Courts',
      governingLawState: 'Tamil Nadu',
      usePlainLanguage: true,
      customClauses: [
        '6-month probation period with 15-day notice clause during probation.',
        'Non-solicitation of company clients/employees for 12 months post employment.',
        'Company property (laptops, access cards) must be surrendered upon exit.'
      ]
    }
  },
  {
    id: 'consumer_legal_notice',
    name: 'Legal Notice for Defective Product / Unpaid Dues',
    category: 'Notices & Disputes',
    description: 'Formal pre-litigation legal notice under Consumer Protection Act / Section 138 Negotiable Instruments.',
    popularIn: 'Agrieved Consumers, Vendors, Creditors',
    iconName: 'AlertTriangle',
    estimatedTime: '3 mins',
    defaultFormData: {
      documentTitle: 'Legal Demand Notice for Unpaid Dues / Service Failure',
      durationMonths: 0,
      financialAmount: 85000,
      noticePeriodDays: 15,
      disputeResolution: 'Courts',
      governingLawState: 'Maharashtra',
      usePlainLanguage: true,
      customClauses: [
        'Demand for immediate payment within 15 days of notice receipt.',
        'Failure to comply will result in filing formal suit before Consumer Forum / Civil Court.',
        'Claim includes interest @ 18% p.a. plus legal expenses of ₹10,000.'
      ]
    }
  }
];
