import { INDIAN_LEGAL_CORPUS } from '../data/legalCorpus';
import type { LegalStatuteCitation, DocumentFormData, ValidationResult, MissingFieldWarning } from '../types';

export class LegalRAGEngine {

  /**
   * Performs vector-based keyword similarity retrieval over authentic Indian statutes.
   */
  public static retrieveRelevantStatutes(
    queryText: string,
    topK: number = 3
  ): LegalStatuteCitation[] {
    const tokens = queryText.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    if (tokens.length === 0) {
      return INDIAN_LEGAL_CORPUS.slice(0, topK).map(item => ({
        id: item.id,
        actName: item.actName,
        actShortTitle: item.actShortTitle,
        sectionNumber: item.sectionNumber,
        sectionTitle: item.sectionTitle,
        statuteText: item.statuteText,
        relevanceExplanation: `Grounding provision under ${item.actShortTitle} governing statutory compliance.`,
        applicabilityTag: item.applicabilityTag
      }));
    }

    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      let score = 0;
      const itemText = `${item.actName} ${item.sectionNumber} ${item.sectionTitle} ${item.statuteText} ${item.keywords.join(' ')}`.toLowerCase();

      for (const token of tokens) {
        if (item.keywords.some(k => k.includes(token))) {
          score += 3;
        }
        if (itemText.includes(token)) {
          score += 1;
        }
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(({ item, score }) => ({
      id: item.id,
      actName: item.actName,
      actShortTitle: item.actShortTitle,
      sectionNumber: item.sectionNumber,
      sectionTitle: item.sectionTitle,
      statuteText: item.statuteText,
      relevanceExplanation: score > 0
        ? `Retrieved for query context "${queryText.substring(0, 40)}..." (Relevance Score: ${score})`
        : `Statutory grounding under ${item.actShortTitle}`,
      applicabilityTag: item.applicabilityTag
    }));
  }

  /**
   * Retrieves relevant legal citations based on full document metadata.
   */
  public static retrieveCitationsForDocument(formData: DocumentFormData): LegalStatuteCitation[] {
    const combinedQuery = `${formData.documentTitle} ${formData.templateId} ${formData.disputeResolution} ${formData.customClauses.join(' ')} ${formData.state}`;
    return this.retrieveRelevantStatutes(combinedQuery, 4);
  }

  /**
   * Pre-generation missing information and data consistency validator.
   */
  public static validateDocumentInputs(formData: DocumentFormData): ValidationResult {
    const missingFields: MissingFieldWarning[] = [];
    const recommendations: string[] = [];

    // Party A Name Check
    if (!formData.partyA.name || formData.partyA.name.trim().length < 3) {
      missingFields.push({
        fieldKey: 'partyA.name',
        fieldName: 'First Party (Landlord/Client) Full Name',
        importance: 'critical',
        message: 'First party legal name is missing or incomplete.',
        suggestion: 'Enter full government photo-ID name (e.g. as on Aadhaar/PAN card).'
      });
    }

    // Party B Name Check
    if (!formData.partyB.name || formData.partyB.name.trim().length < 3) {
      missingFields.push({
        fieldKey: 'partyB.name',
        fieldName: 'Second Party (Tenant/Vendor) Full Name',
        importance: 'critical',
        message: 'Second party legal name is missing or incomplete.',
        suggestion: 'Provide full registered legal entity or citizen name.'
      });
    }

    // Address Verification
    if (!formData.partyA.address || formData.partyA.address.trim().length < 8) {
      missingFields.push({
        fieldKey: 'partyA.address',
        fieldName: 'First Party Registered Address',
        importance: 'recommended',
        message: 'Incomplete address may create service of notice challenges.',
        suggestion: 'Include door number, street, locality, city and PIN code.'
      });
    }

    // Financial consideration check
    if (formData.financialAmount <= 0) {
      missingFields.push({
        fieldKey: 'financialAmount',
        fieldName: 'Financial Consideration / Rent Amount',
        importance: 'critical',
        message: 'Contracts without valid consideration are void under Section 25 of Indian Contract Act 1872.',
        suggestion: 'Specify monthly rent, fee, or consideration in INR (₹).'
      });
    }

    // Security deposit vs rent ratio warning
    if (formData.templateId === 'rent_agreement' && formData.securityDeposit && formData.securityDeposit > formData.financialAmount * 12) {
      recommendations.push(
        `Security deposit (₹${formData.securityDeposit.toLocaleString('en-IN')}) exceeds 12 months' rent. Under Model Tenancy Act rules, standard residential deposits are capped at 2-6 months' rent.`
      );
    }

    // 11-Month Registration Check under Section 107 TOPA
    if (formData.templateId === 'rent_agreement' && formData.durationMonths > 11) {
      recommendations.push(
        `Lease tenure is ${formData.durationMonths} months. Under Section 107 of Transfer of Property Act 1882, leases exceeding 11 months require mandatory Sub-Registrar registration and full stamp duty.`
      );
    } else if (formData.templateId === 'rent_agreement' && formData.durationMonths === 11) {
      recommendations.push(
        `11-month tenure selected: Qualifies for exemption from mandatory registration in most states, saving registration fees while remaining enforceable.`
      );
    }

    // Calculate completeness score
    const criticalCount = missingFields.filter(f => f.importance === 'critical').length;
    const recommendedCount = missingFields.filter(f => f.importance === 'recommended').length;

    let score = 100 - (criticalCount * 30) - (recommendedCount * 10);
    if (score < 0) score = 0;

    return {
      isComplete: criticalCount === 0,
      score,
      missingFields,
      recommendations
    };
  }
}
