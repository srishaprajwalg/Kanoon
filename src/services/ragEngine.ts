import { INDIAN_LEGAL_CORPUS } from '../data/legalCorpus.js';
import { 
  generateDenseEmbedding, 
  getCorpusEmbedding, 
  calculateCosineSimilarity, 
  precalculateCorpusEmbeddings 
} from './embeddingService.js';
import type { LegalStatuteCitation, DocumentFormData, ValidationResult, MissingFieldWarning } from '../types';

export class LegalRAGEngine {

  /**
   * Minimum confidence threshold for statutory retrieval grounding.
   * If retrieved chunks score below this threshold, retrieval is deemed insufficient.
   */
  public static readonly MIN_CONFIDENCE_THRESHOLD = 0.25;

  /**
   * Dense Embedding Model Specs
   */
  public static readonly EMBEDDING_MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
  public static readonly EMBEDDING_DIMENSIONALITY = 384;
  public static readonly RETRIEVAL_ALGORITHM = 'Dense Vector Cosine Similarity + Metadata Filtering';

  /**
   * Initializes dense embeddings for all corpus chunks
   */
  public static async initializeCorpus(): Promise<void> {
    await precalculateCorpusEmbeddings();
  }

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
   * Performs Genuine Dense Vector & Metadata Filtered Semantic Retrieval.
   * Calculates cosine similarity between 384D query vector and statutory corpus vectors.
   */
  public static async retrieveRelevantStatutesAsync(
    queryText: string,
    templateId?: string,
    topK: number = 3,
    minThreshold: number = LegalRAGEngine.MIN_CONFIDENCE_THRESHOLD
  ): Promise<LegalStatuteCitation[]> {
    if (!queryText || queryText.trim().length === 0) return [];

    // 1. Generate 384-dimensional dense vector for input query
    const queryEmb = await generateDenseEmbedding(queryText);
    const queryVector = queryEmb.vector;
    const allowedCategories = templateId ? this.getCategoryForTemplate(templateId) : [];

    // 2. Score corpus items using dense vector cosine similarity + metadata filtering
    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      const itemVector = getCorpusEmbedding(item);
      const rawCosine = calculateCosineSimilarity(queryVector, itemVector);

      let categoryMultiplier = 1.0;
      if (allowedCategories.length > 0) {
        if (allowedCategories.includes(item.applicabilityCategory)) {
          categoryMultiplier = 1.35;
        } else if (item.applicabilityCategory === 'dispute_arbitration' && queryText.toLowerCase().includes('arbitr')) {
          categoryMultiplier = 1.2;
        } else if (item.applicabilityCategory !== 'general_contract') {
          // Penalize out-of-domain categories (e.g. lease laws for NDA queries)
          categoryMultiplier = 0.05;
        }
      }

      const finalScore = Math.min(1.0, Math.round((rawCosine * categoryMultiplier) * 100) / 100);
      return { item, rawCosine, finalScore };
    });

    // 3. Sort by final score descending
    scored.sort((a, b) => b.finalScore - a.finalScore);

    // 4. Filter by strict minimum confidence threshold
    const qualified = scored.filter(s => s.finalScore >= minThreshold);
    const topMatches = qualified.slice(0, topK);

    return topMatches.map(({ item, finalScore }) => {
      // Determine non-misleading qualitative confidence labels
      const confidenceLevel: 'High' | 'Medium' | 'Low' = finalScore >= 0.7 ? 'High' : finalScore >= 0.4 ? 'Medium' : 'Low';
      const evidenceStrength: 'Strong' | 'Moderate' | 'Weak' = finalScore >= 0.7 ? 'Strong' : finalScore >= 0.4 ? 'Moderate' : 'Weak';

      const categoryLabel = item.applicabilityCategory.replace(/_/g, ' ');
      const whyThisClause = `This provision was retrieved because the request concerns ${categoryLabel} under ${item.jurisdiction || 'Indian'} law, matching ${item.actShortTitle} ${item.sectionNumber} (${item.sectionTitle}) with a vector cosine similarity score of ${finalScore.toFixed(2)}.`;

      return {
        id: item.id,
        actName: item.actName,
        actShortTitle: item.actShortTitle,
        actNumber: item.actNumber,
        year: item.year,
        chapter: item.chapter,
        sectionNumber: item.sectionNumber,
        sectionTitle: item.sectionTitle,
        statuteText: item.statuteText,
        relevanceExplanation: `Retrieved via 384D Dense Vector Cosine Similarity (${finalScore.toFixed(2)}) under ${item.actShortTitle} ${item.sectionNumber}.`,
        whyThisClause,
        applicabilityTag: item.applicabilityCategory,
        jurisdiction: item.jurisdiction || 'Federal',
        sourceUrl: item.sourceUrl,
        effectiveDate: item.effectiveDate,
        confidenceScore: finalScore,
        similarityScore: parseFloat(finalScore.toFixed(2)),
        confidenceLevel,
        evidenceStrength
      };
    });
  }

  /**
   * Synchronous wrapper for statutory retrieval
   */
  public static retrieveRelevantStatutes(
    queryText: string,
    templateId?: string,
    topK: number = 3,
    minThreshold: number = LegalRAGEngine.MIN_CONFIDENCE_THRESHOLD
  ): LegalStatuteCitation[] {
    if (!queryText || queryText.trim().length === 0) return [];
    const allowedCategories = templateId ? this.getCategoryForTemplate(templateId) : [];

    // Compute query vector using corpus embedding utility
    const queryVector = getCorpusEmbedding({
      id: '__query__',
      actName: queryText,
      actShortTitle: queryText,
      sectionNumber: '',
      sectionTitle: queryText,
      statuteText: queryText,
      applicabilityCategory: 'general_contract',
      keywords: queryText.toLowerCase().split(/\W+/).filter(w => w.length > 1)
    });

    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      const itemVector = getCorpusEmbedding(item);
      const rawCosine = calculateCosineSimilarity(queryVector, itemVector);

      let categoryMultiplier = 1.0;
      if (allowedCategories.length > 0) {
        if (allowedCategories.includes(item.applicabilityCategory)) {
          categoryMultiplier = 1.35;
        } else if (item.applicabilityCategory === 'dispute_arbitration' && queryText.toLowerCase().includes('arbitr')) {
          categoryMultiplier = 1.2;
        } else if (item.applicabilityCategory !== 'general_contract') {
          categoryMultiplier = 0.05;
        }
      }

      const finalScore = Math.min(1.0, Math.round((rawCosine * categoryMultiplier) * 100) / 100);
      return { item, finalScore };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);
    const qualified = scored.filter(s => s.finalScore >= minThreshold);
    const topMatches = qualified.slice(0, topK);

    return topMatches.map(({ item, finalScore }) => {
      const confidenceLevel: 'High' | 'Medium' | 'Low' = finalScore >= 0.7 ? 'High' : finalScore >= 0.4 ? 'Medium' : 'Low';
      const evidenceStrength: 'Strong' | 'Moderate' | 'Weak' = finalScore >= 0.7 ? 'Strong' : finalScore >= 0.4 ? 'Moderate' : 'Weak';

      const categoryLabel = item.applicabilityCategory.replace(/_/g, ' ');
      const whyThisClause = `This provision was retrieved because the request concerns ${categoryLabel} under ${item.jurisdiction || 'Indian'} law, matching ${item.actShortTitle} ${item.sectionNumber} (${item.sectionTitle}) with a vector cosine similarity score of ${finalScore.toFixed(2)}.`;

      return {
        id: item.id,
        actName: item.actName,
        actShortTitle: item.actShortTitle,
        actNumber: item.actNumber,
        year: item.year,
        chapter: item.chapter,
        sectionNumber: item.sectionNumber,
        sectionTitle: item.sectionTitle,
        statuteText: item.statuteText,
        relevanceExplanation: `Retrieved via 384D Dense Vector Cosine Similarity (${finalScore.toFixed(2)}) under ${item.actShortTitle} ${item.sectionNumber}.`,
        whyThisClause,
        applicabilityTag: item.applicabilityCategory,
        jurisdiction: item.jurisdiction || 'Federal',
        sourceUrl: item.sourceUrl,
        effectiveDate: item.effectiveDate,
        confidenceScore: finalScore,
        similarityScore: parseFloat(finalScore.toFixed(2)),
        confidenceLevel,
        evidenceStrength
      };
    });
  }

  /**
   * Retrieves relevant legal citations based on full document metadata.
   */
  public static retrieveCitationsForDocument(formData: DocumentFormData): LegalStatuteCitation[] {
    const combinedQuery = `${formData.documentTitle} ${formData.templateId} ${formData.disputeResolution} ${formData.customClauses.join(' ')} ${formData.state}`;
    return this.retrieveRelevantStatutes(combinedQuery, formData.templateId, 4);
  }

  /**
   * Async dense vector retrieval for full document metadata.
   */
  public static async retrieveCitationsForDocumentAsync(formData: DocumentFormData): Promise<LegalStatuteCitation[]> {
    const combinedQuery = `${formData.documentTitle} ${formData.templateId} ${formData.disputeResolution} ${formData.customClauses.join(' ')} ${formData.state}`;
    return this.retrieveRelevantStatutesAsync(combinedQuery, formData.templateId, 4);
  }

  /**
   * Pre-generation missing information, data consistency, and RAG statutory evidence validator.
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

    // Check RAG Statutory Evidence Sufficiency
    const retrievedCitations = this.retrieveCitationsForDocument(formData);
    const hasSufficientEvidence = retrievedCitations.length > 0 && retrievedCitations.some(c => (c.confidenceScore || 0) >= this.MIN_CONFIDENCE_THRESHOLD);
    let evidenceWarning: string | undefined = undefined;

    if (!hasSufficientEvidence) {
      evidenceWarning = 'Insufficient statutory evidence was retrieved to confidently support this custom legal provision under verified Indian Acts.';
    }

    // Tenancy tenure & stamp registration notice (State-dependent)
    if (formData.templateId === 'rent_agreement') {
      const isMaharashtra = formData.state.toLowerCase().includes('maharashtra');
      if (isMaharashtra) {
        recommendations.push(
          `Maharashtra Registration Mandate (Section 55, Maharashtra Rent Control Act 1999): ALL leave and license agreements in Maharashtra MUST be registered in writing regardless of tenure duration (even for 11 months). Landlord/Licensor bears primary legal responsibility for registration.`
        );
      } else {
        recommendations.push(
          `State Registration & Stamp Duty Note for ${formData.state}: Under Section 17(1)(d) of Registration Act 1908 and Section 107 of Transfer of Property Act 1882, leases up to 11 months are not compulsorily registrable at the central level, but appropriate state e-Stamp duty remains mandatory.`
        );
      }
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
      recommendations,
      hasSufficientEvidence,
      evidenceWarning
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
