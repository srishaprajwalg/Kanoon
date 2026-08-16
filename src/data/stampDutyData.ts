import type { StampDutyInfo } from '../types';

export const STAMP_DUTY_GUIDE: StampDutyInfo[] = [
  {
    state: 'Maharashtra',
    rentAgreementRate: '0.25% of Total Rent + Deposit (Max ₹1,000 for residential leave & license up to 60 months)',
    ndaRate: '₹500 e-Stamp',
    serviceAgreementRate: '₹500 or 0.1% of contract value',
    registrationMandatoryThreshold: 'Compulsory for ALL leave and license agreements regardless of tenure under Sec 55 of Maharashtra Rent Control Act.',
    notes: 'Online e-registration via Inspector General of Registration (IGR) website available with biometric authentication.'
  },
  {
    state: 'Karnataka',
    rentAgreementRate: '0.5% to 1% of total rent + deposit (Min ₹200 e-Stamp for 11 months)',
    ndaRate: '₹200 e-Stamp',
    serviceAgreementRate: '₹200 e-Stamp (or 0.5% for high value)',
    registrationMandatoryThreshold: 'Mandatory if lease period is 12 months or longer.',
    notes: 'Kaveri 2.0 portal enables e-Stamping across Bengaluru & Karnataka districts.'
  },
  {
    state: 'Delhi NCR (Delhi/Noida/Gurugram)',
    rentAgreementRate: '2% of average annual rent for 1-5 yrs (Min ₹50 e-Stamp for 11 months)',
    ndaRate: '₹100 e-Stamp',
    serviceAgreementRate: '₹100 e-Stamp',
    registrationMandatoryThreshold: 'Leases above 11 months require registration at Sub-Registrar Office.',
    notes: 'Stock Holding Corporation of India (SHCIL) e-Stamp centers widely available.'
  },
  {
    state: 'Tamil Nadu',
    rentAgreementRate: '1% of total rent + advance deposit (Min ₹100 e-Stamp)',
    ndaRate: '₹100 e-Stamp',
    serviceAgreementRate: '₹100 e-Stamp',
    registrationMandatoryThreshold: 'Mandatory registration for all tenancy agreements under TN Regulation of Rights and Responsibilities of Landlords and Tenants Act.',
    notes: 'TNE-Sevai online portal provides digital stamp certificates.'
  },
  {
    state: 'Telangana & Andhra Pradesh',
    rentAgreementRate: '0.4% to 1% of total rent + advance deposit',
    ndaRate: '₹100 e-Stamp',
    serviceAgreementRate: '₹100 e-Stamp',
    registrationMandatoryThreshold: 'Mandatory if lease exceeds 11 months.',
    notes: 'IGRS Telangana portal available for online slot booking and e-Stamping.'
  },
  {
    state: 'West Bengal',
    rentAgreementRate: '4% to 5% on average annual rent (Min ₹100 for short tenure)',
    ndaRate: '₹100 e-Stamp',
    serviceAgreementRate: '₹100 e-Stamp',
    registrationMandatoryThreshold: 'Mandatory if lease exceeds 11 months.',
    notes: 'e-Nathikaran online registration service by WB Finance Dept.'
  },
  {
    state: 'Gujarat',
    rentAgreementRate: '1% of total rent + deposit (Min ₹300 e-Stamp)',
    ndaRate: '₹300 e-Stamp',
    serviceAgreementRate: '₹300 e-Stamp',
    registrationMandatoryThreshold: 'Mandatory for leases exceeding 11 months.',
    notes: 'Garvi Gujarat online portal provides e-Stamping facilities.'
  }
];
