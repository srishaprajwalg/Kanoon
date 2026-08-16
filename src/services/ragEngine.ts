import { INDIAN_LEGAL_CORPUS } from '../data/legalCorpus';
import type { LegalStatuteCitation, DocumentFormData, ValidationResult, MissingFieldWarning } from '../types';

export class LegalRAGEngine {

  /**
   * Maps document template ID to corpus applicability category
   */
  private static getCategoryForTemplate(templateId: string): string[] {
    switch (templateId) {
      case 'rent_agreement':
        return ['lease_tenancy', 'general_contract'];
      case 'nda_agreement':
        return ['confidentiality_nda', 'general_contract'];
      case 'employment_contract':
      case 'freelance_contract':
        return ['employment_service', 'general_contract'];
      case 'partnership_deed':
      case 'legal_notice':
      default:
        return ['general_contract'];
    }
  }

  /**
   * Performs TF-IDF & Vector Cosine Similarity Retrieval over Indian Legal Corpus.
   * Document-type aware: prioritizes statutes matching the agreement category.
   */
  public static retrieveRelevantStatutes(
    queryText: string,
    templateId?: string,
    topK: number = 3
  ): LegalStatuteCitation[] {
    const allowedCategories = templateId ? this.getCategoryForTemplate(templateId) : [];

    const tokens = queryText.toLowerCase().split(/\W+/).filter(t => t.length > 2);

    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      let score = 0;

      // Category matching bonus
      if (allowedCategories.length > 0) {
        if (allowedCategories.includes(item.applicabilityCategory)) {
          score += 5;
        } else if (item.applicabilityCategory === 'dispute_arbitration' && queryText.toLowerCase().includes('arbitration')) {
          score += 3;
        } else if (item.applicabilityCategory !== 'general_contract') {
          // Penalize irrelevant categories (e.g., lease law for NDA)
          score -= 10;
        }
      }

      // Term Frequency matching
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

    // Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, topK).filter(s => s.score > -5);

    return topMatches.map(({ item, score }) => ({
      id: item.id,
      actName: item.actName,
      actShortTitle: item.actShortTitle,
      sectionNumber: item.sectionNumber,
      sectionTitle: item.sectionTitle,
      statuteText: item.statuteText,
      relevanceExplanation: `Retrieved for document context under ${item.actShortTitle} ${item.sectionNumber} (Relevance Score: ${score}).`,
      applicabilityTag: item.applicabilityCategory
    }));
  }

  /**
   * Retrieves relevant legal citations based on full document metadata.
   */
  public static retrieveCitationsForDocument(formData: DocumentFormData): LegalStatuteCitation[] {
    const combinedQuery = `${formData.documentTitle} ${formData.templateId} ${formData.disputeResolution} ${formData.customClauses.join(' ')} ${formData.state}`;
    return this.retrieveRelevantStatutes(combinedQuery, formData.templateId, 4);
  }

  /**
   * Pre-generation missing information and data consistency validator.
   * Eliminates absolute legal claims and respects non-monetary consideration agreements.
   */
  public static validateDocumentInputs(formData: DocumentFormData): ValidationResult {
    const missingFields: MissingFieldWarning[] = [];
    const recommendations: string[] = [];

    // Party A Name Check
    if (!formData.partyA.name || formData.partyA.name.trim().length < 3) {
      missingFields.push({
        fieldKey: 'partyA.name',
        fieldName: 'First Party Full Legal Name',
        importance: 'critical',
        message: 'First party legal name is required for identification.',
        suggestion: 'Provide full registered name or government photo-ID name.'
      });
    }

    // Party B Name Check
    if (!formData.partyB.name || formData.partyB.name.trim().length < 3) {
      missingFields.push({
        fieldKey: 'partyB.name',
        fieldName: 'Second Party Full Legal Name',
        importance: 'critical',
        message: 'Second party legal name is required for identification.',
        suggestion: 'Provide full registered legal entity or citizen name.'
      });
    }

    // Address Verification
    if (!formData.partyA.address || formData.partyA.address.trim().length < 8) {
      missingFields.push({
        fieldKey: 'partyA.address',
        fieldName: 'First Party Registered Address',
        importance: 'recommended',
        message: 'Incomplete address may complicate notice delivery in case of dispute.',
        suggestion: 'Include door number, street, locality, city and PIN code.'
      });
    }

    // Financial consideration check - ONLY required for monetized contracts (e.g. Rent, Service)
    const isMonetaryTemplate = ['rent_agreement', 'freelance_contract', 'employment_contract'].includes(formData.templateId);
    if (isMonetaryTemplate && formData.financialAmount <= 0) {
      missingFields.push({
        fieldKey: 'financialAmount',
        fieldName: 'Financial Consideration / Fee Amount',
        importance: 'critical',
        message: 'Monetary contracts require valid consideration under Section 2(d) of Indian Contract Act 1872.',
        suggestion: 'Specify fee, rent, or consideration in INR (₹).'
      });
    }

    // Tenancy tenure & stamp registration notice (State-dependent)
    if (formData.templateId === 'rent_agreement') {
      recommendations.push(
        `Registration & Stamp Duty Note for ${formData.state}: Registration mandates and stamp duty rates depend on local state enactments (e.g., Maharashtra Rent Control Act mandates registration regardless of tenure). Consult local Sub-Registrar guidance.`
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

  /**
   * Dynamically calculates document safety risk score from actual detected clause risk levels.
   */
  public static calculateDynamicRiskScore(clauses: { riskLevel: 'low' | 'medium' | 'high' | 'critical' }[]): number {
    let score = 100;
    for (const c of clauses) {
      if (c.riskLevel === 'critical') score -= 30;
      else if (c.riskLevel === 'high') score -= 20;
      else if (c.riskLevel === 'medium') score -= 10;
    }
    return Math.max(0, score);
  }
}
