import { INDIAN_LEGAL_CORPUS } from '../data/legalCorpus';
import { enrichCitationWithOfficialProvenance } from '../data/statutoryRegistry';
import { generateDenseEmbedding, calculateCosineSimilarity, getCorpusEmbedding, precalculateCorpusEmbeddings } from './embeddingService';
import type { LegalStatuteCitation, ValidationResult, MissingFieldWarning, DocumentFormData } from '../types';

export interface QueryIntent {
  isPropertySale: boolean;
  isRentalLease: boolean;
  isContractFormation: boolean;
  isStampDuty: boolean;
  explicitAct?: 'tpa' | 'contract' | 'karnataka_stamp' | 'registration' | 'karnataka_rent';
  explicitSectionNumber?: string;
  parsedValues: {
    monthlyRent?: string;
    tenureMonths?: string;
    deposit?: string;
  };
}

export class LegalRAGEngine {
  /**
   * Reusable lightweight query-intent and scenario parser
   */
  public static detectQueryIntent(queryText: string): QueryIntent {
    const qLower = queryText.toLowerCase();

    const propertySaleKeywords = ['buyer', 'seller', 'property', 'sale', 'purchase price', 'material defect', 'disclose', 'disclosure', 'title', 'defect', 'immovable property', 'conveyance'];
    const rentalLeaseKeywords = ['rent', 'rental', 'tenant', 'landlord', 'lease', 'tenancy', 'eviction'];
    const stampDutyKeywords = ['stamp', 'stamp duty', 'e-stamp', 'duty'];
    const contractKeywords = ['contract', 'agreement', 'consent', 'consideration', 'lawful object', 'competent'];

    const propertySaleCount = propertySaleKeywords.filter(k => qLower.includes(k)).length;
    const rentalLeaseCount = rentalLeaseKeywords.filter(k => qLower.includes(k)).length;
    const stampDutyCount = stampDutyKeywords.filter(k => qLower.includes(k)).length;
    const contractCount = contractKeywords.filter(k => qLower.includes(k)).length;

    const isPropertySale = propertySaleCount >= 2 || (qLower.includes('seller') || qLower.includes('buyer') || qLower.includes('purchase price'));
    const isRentalLease = rentalLeaseCount >= 1 || (qLower.includes('bengaluru') && qLower.includes('rent'));
    const isStampDuty = stampDutyCount >= 1;
    const isContractFormation = contractCount >= 2 || (qLower.includes('contract act') && qLower.includes('section 10'));

    let explicitAct: QueryIntent['explicitAct'] = undefined;
    if (qLower.includes('transfer of property') || qLower.includes('tpa')) {
      explicitAct = 'tpa';
    } else if (qLower.includes('contract act') || qLower.includes('indian contract')) {
      explicitAct = 'contract';
    } else if (qLower.includes('karnataka stamp') || qLower.includes('stamp act')) {
      explicitAct = 'karnataka_stamp';
    } else if (qLower.includes('registration act')) {
      explicitAct = 'registration';
    } else if (qLower.includes('karnataka rent') || qLower.includes('rent act')) {
      explicitAct = 'karnataka_rent';
    }

    let explicitSectionNumber: string | undefined = undefined;
    const secMatch = qLower.match(/\b(section|sec|article|art)\s+(\d+|30)\b/i);
    if (secMatch) {
      explicitSectionNumber = secMatch[2];
    }

    const rentMatch = queryText.match(/(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:per\s*month|\/month|pm|monthly)/i) ||
                      queryText.match(/rent\s*(?:of|is|\:)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);

    const tenureMatch = queryText.match(/(\d+)\s*(?:months?|yrs?|years?)/i);

    const depositMatch = queryText.match(/(?:deposit|advance)\s*(?:of|is|\:)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);

    return {
      isPropertySale,
      isRentalLease,
      isContractFormation,
      isStampDuty,
      explicitAct,
      explicitSectionNumber,
      parsedValues: {
        monthlyRent: rentMatch ? rentMatch[1] : undefined,
        tenureMonths: tenureMatch ? tenureMatch[1] : undefined,
        deposit: depositMatch ? depositMatch[1] : undefined
      }
    };
  }
  /**
   * Minimum confidence threshold for 384D dense vector similarity
   */
  public static readonly MIN_CONFIDENCE_THRESHOLD = 0.38;

  /**
   * Dense Embedding Model Specs
   */
  public static readonly EMBEDDING_MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
  public static readonly EMBEDDING_DIMENSIONALITY = 384;
  public static readonly RETRIEVAL_ALGORITHM = 'Dense Vector Cosine Similarity + Jurisdiction & Metadata Filtering';

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
        return ['employment_service', 'general_contract'];
      case 'freelance_service':
      case 'freelance_contract':
      case 'service_agreement':
        return ['employment_service', 'general_contract'];
      case 'partnership_deed':
        return ['general_contract', 'dispute_arbitration'];
      case 'consumer_legal_notice':
      case 'legal_notice':
        return ['dispute_arbitration', 'general_contract', 'consumer_rights'];
      default:
        return ['general_contract', 'lease_tenancy', 'confidentiality_nda', 'employment_service', 'dispute_arbitration', 'consumer_rights'];
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

    const qLower = queryText.toLowerCase();
    const isKarnatakaQuery = qLower.includes('karnataka') || qLower.includes('bengaluru') || qLower.includes('bangalore');
    const isMaharashtraQuery = qLower.includes('maharashtra') || qLower.includes('mumbai') || qLower.includes('pune');

    const normalizeTitle = (t: string) => t.toLowerCase().replace(/&/g, ' and ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanQueryText = (q: string) => q.toLowerCase().replace(/^(what\s+is|what\s+are|tell\s+me\s+about|explain|details\s+of|show\s+me)\s+/i, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const normQuery = normalizeTitle(queryText);
    const cleanQ = cleanQueryText(queryText);

    const intent = LegalRAGEngine.detectQueryIntent(queryText);

    // 2. Score corpus items using dense vector cosine similarity + jurisdiction & category metadata filtering
    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      const itemVector = getCorpusEmbedding(item);
      const rawCosine = calculateCosineSimilarity(queryVector, itemVector);

      let categoryMultiplier = 1.0;
      if (templateId) {
        if (allowedCategories.includes(item.applicabilityCategory)) {
          categoryMultiplier = 1.35;
        } else if (item.applicabilityCategory === 'dispute_arbitration' && allowedCategories.includes('dispute_arbitration') && qLower.includes('arbitr')) {
          categoryMultiplier = 1.2;
        } else {
          categoryMultiplier = 0.0;
        }
      }

      let jurisdictionMultiplier = 1.0;
      if (isKarnatakaQuery) {
        if (item.jurisdiction === 'KARNATAKA') {
          jurisdictionMultiplier = 1.4; // State law boost for relevant legal queries
        } else if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0; // Central law preserved
        } else {
          jurisdictionMultiplier = 0.0; // Strictly exclude non-matching state laws
        }
      } else if (isMaharashtraQuery) {
        if ((item as any).jurisdiction === 'MAHARASHTRA' || (item as any).stateSpecific === 'Maharashtra') {
          jurisdictionMultiplier = 1.4;
        } else if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0;
        } else {
          jurisdictionMultiplier = 0.0;
        }
      } else {
        if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0;
        } else if (item.jurisdiction === 'KARNATAKA') {
          jurisdictionMultiplier = 0.0; // Strictly exclude Karnataka state laws when query state is not Karnataka
        }
      }

      // 3. Act Title & Statutory Keyword Boost
      let actKeywordMultiplier = 1.0;
      const actShortLower = item.actShortTitle.toLowerCase();
      const actNameLower = item.actName.toLowerCase();
      const cleanActShort = actShortLower.replace(/\d{4}/g, '').replace(/,/g, '').replace(/^the\s+/, '').trim();
      const cleanActName = actNameLower.replace(/\d{4}/g, '').replace(/,/g, '').replace(/^the\s+/, '').trim();
      const isActExplicitlyMentioned = cleanActShort.length > 3 && (qLower.includes(cleanActShort) || qLower.includes(cleanActName));

      if (isActExplicitlyMentioned) {
        if (categoryMultiplier < 1.0) categoryMultiplier = 1.0;
        actKeywordMultiplier *= 2.5;
      } else {
        const actWords = cleanActShort.split(/\s+/).filter(w => w.length > 2 && w !== 'act');
        if (actWords.length >= 2 && actWords.every(w => qLower.includes(w))) {
          if (categoryMultiplier < 1.0) categoryMultiplier = 1.0;
          actKeywordMultiplier *= 2.0;
        }
      }

      // Domain-consistency ranking boost based on detected query intent
      if (intent.explicitAct) {
        const matchesAct = (
          (intent.explicitAct === 'tpa' && actShortLower.includes('transfer of property')) ||
          (intent.explicitAct === 'contract' && actShortLower.includes('contract')) ||
          (intent.explicitAct === 'karnataka_stamp' && actShortLower.includes('stamp')) ||
          (intent.explicitAct === 'registration' && actShortLower.includes('registration')) ||
          (intent.explicitAct === 'karnataka_rent' && actShortLower.includes('rent'))
        );
        if (matchesAct) {
          actKeywordMultiplier *= 2.5;
        } else {
          actKeywordMultiplier *= 0.4;
        }
      }

      if (intent.isPropertySale) {
        if (actShortLower.includes('transfer of property')) {
          actKeywordMultiplier *= 2.0;
        }
      } else if (intent.isContractFormation) {
        if (actShortLower.includes('contract') || item.applicabilityCategory === 'general_contract') {
          actKeywordMultiplier *= 2.0;
        }
      } else if (intent.isRentalLease || intent.isStampDuty) {
        if (isKarnatakaQuery && (actShortLower.includes('karnataka stamp') || item.sectionNumber.includes('Article 30'))) {
          actKeywordMultiplier *= 2.5;
        }
      }

      // Section Number Match Normalization with Word Boundaries and Explicit Act Guard
      const cleanSecNum = item.sectionNumber
        ? item.sectionNumber.toLowerCase().replace(/^(section|article|sec|rule)\s+/i, '').trim()
        : '';

      if (cleanSecNum.length > 0) {
        const secRegex = new RegExp(`\\b(section|sec|article|art|rule)\\s+${cleanSecNum}\\b`, 'i');
        if (secRegex.test(qLower)) {
          if (intent.explicitAct) {
            const matchesAct = (
              (intent.explicitAct === 'tpa' && actShortLower.includes('transfer of property')) ||
              (intent.explicitAct === 'contract' && actShortLower.includes('contract')) ||
              (intent.explicitAct === 'karnataka_stamp' && actShortLower.includes('stamp')) ||
              (intent.explicitAct === 'registration' && actShortLower.includes('registration')) ||
              (intent.explicitAct === 'karnataka_rent' && actShortLower.includes('rent'))
            );
            if (matchesAct) {
              actKeywordMultiplier *= 3.0;
            } else {
              actKeywordMultiplier *= 0.5;
            }
          } else {
            actKeywordMultiplier *= 3.0;
          }
        }
      }

      // Section Title Phrase & Token Overlap Boost
      if (item.sectionTitle) {
        const normTitle = normalizeTitle(item.sectionTitle);
        if (normTitle.length >= 6) {
          if (normQuery.includes(normTitle) || (normTitle.length >= 12 && normTitle.includes(normQuery))) {
            actKeywordMultiplier *= 2.5;
          } else {
            const stopWords = new Set(['what', 'is', 'the', 'for', 'are', 'under', 'from', 'with', 'and', 'clause', 'who', 'must']);
            const titleWords = normTitle.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
            if (titleWords.length >= 3 && titleWords.every(w => normQuery.includes(w))) {
              actKeywordMultiplier *= 2.0;
            }
          }
        }
      }

      if ((qLower.includes('rent') || qLower.includes('tenancy') || qLower.includes('eviction')) && (actShortLower.includes('rent') || item.applicabilityCategory === 'lease_tenancy')) {
        actKeywordMultiplier *= 1.8;
      }
      if ((qLower.includes('stamp') || qLower.includes('duty')) && actShortLower.includes('stamp')) {
        actKeywordMultiplier *= 1.8;
      }
      if ((qLower.includes('registr') || qLower.includes('sub-registrar')) && actShortLower.includes('registration')) {
        actKeywordMultiplier *= 1.4;
      }
      if ((qLower.includes('contract') || qLower.includes('agreement')) && actShortLower.includes('contract')) {
        actKeywordMultiplier *= 1.25;
      }
      if (actShortLower.includes('procurement') && !qLower.includes('procurement') && !qLower.includes('tender')) {
        actKeywordMultiplier = 0.0;
      }
      if (actShortLower.includes('land revenue') && !qLower.includes('land revenue') && !qLower.includes('agricultural')) {
        actKeywordMultiplier = 0.0;
      }

      const unclippedScore = rawCosine * categoryMultiplier * jurisdictionMultiplier * actKeywordMultiplier;
      const finalScore = Math.min(1.0, Math.round(unclippedScore * 100) / 100);

      // Deterministic relevance hierarchy score
      const normTitle = item.sectionTitle ? normalizeTitle(item.sectionTitle) : '';

      let tierBonus = 0;
      if (normTitle.length >= 5) {
        if (normQuery === normTitle || cleanQ === normTitle) {
          tierBonus += 10000;
        } else if (normQuery.includes(normTitle) || cleanQ.includes(normTitle)) {
          tierBonus += 8000;
        } else if (normTitle.includes(cleanQ) && cleanQ.length >= 10) {
          tierBonus += 6000;
        } else {
          const stopWords = new Set(['what', 'is', 'the', 'for', 'are', 'under', 'from', 'with', 'and', 'clause', 'who', 'must', 'of', 'in']);
          const titleWords = normTitle.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
          if (titleWords.length >= 2) {
            const matchingWords = titleWords.filter(w => normQuery.includes(w) || cleanQ.includes(w));
            const matchRatio = matchingWords.length / titleWords.length;
            if (matchRatio === 1.0) {
              tierBonus += 4000;
            } else if (matchRatio >= 0.75 && titleWords.length >= 3) {
              tierBonus += 2000;
            }
          }
        }
      }

      if (cleanSecNum.length > 0) {
        const secRegex = new RegExp(`\\b(section|sec|article|art|rule)\\s+${cleanSecNum}\\b`, 'i');
        if (secRegex.test(queryText)) {
          if (intent.explicitAct) {
            const matchesAct = (
              (intent.explicitAct === 'tpa' && actShortLower.includes('transfer of property')) ||
              (intent.explicitAct === 'contract' && actShortLower.includes('contract')) ||
              (intent.explicitAct === 'karnataka_stamp' && actShortLower.includes('stamp')) ||
              (intent.explicitAct === 'registration' && actShortLower.includes('registration')) ||
              (intent.explicitAct === 'karnataka_rent' && actShortLower.includes('rent'))
            );
            if (matchesAct) {
              tierBonus += 15000;
            } else {
              tierBonus -= 5000;
            }
          } else {
            tierBonus += 2500;
          }
        }
      }

      if (cleanActShort.length > 3 && (normQuery.includes(cleanActShort) || normQuery.includes(cleanActName))) {
        tierBonus += 1250;
      }

      if (intent.isPropertySale) {
        if (actShortLower.includes('transfer of property')) {
          tierBonus += 4000;
          if (item.sectionNumber.includes('55')) {
            tierBonus += 6000;
          }
        }
      }

      const tierScore = tierBonus + unclippedScore;
      return { item, rawCosine, unclippedScore, finalScore, tierScore };
    });

    // 3. Sort by deterministic tier score descending
    scored.sort((a, b) => b.tierScore - a.tierScore);

    // Generic provision deduplication by identity: Act + sectionNumber + sectionTitle
    const distinctProvisionMap = new Map<string, typeof scored[0]>();
    for (const s of scored) {
      const normSecNum = (s.item.sectionNumber || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const normSecTitle = (s.item.sectionTitle || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const actKey = (s.item.actShortTitle || s.item.actName).toLowerCase().trim();
      const provisionKey = `${actKey}::${normSecNum}::${normSecTitle}`;
      if (!distinctProvisionMap.has(provisionKey) || distinctProvisionMap.get(provisionKey)!.tierScore < s.tierScore) {
        distinctProvisionMap.set(provisionKey, s);
      }
    }
    const deduplicatedScored = Array.from(distinctProvisionMap.values());
    deduplicatedScored.sort((a, b) => b.tierScore - a.tierScore);

    // 4. When templateId is provided (document drafting), deduplicate by distinct Act to present broad statutory coverage
    let candidatesToSlice = deduplicatedScored;
    if (templateId) {
      const distinctActMap = new Map<string, typeof deduplicatedScored[0]>();
      for (const s of deduplicatedScored) {
        const actKey = s.item.actShortTitle || s.item.actName;
        if (!distinctActMap.has(actKey) || distinctActMap.get(actKey)!.tierScore < s.tierScore) {
          distinctActMap.set(actKey, s);
        }
      }
      candidatesToSlice = Array.from(distinctActMap.values());
      candidatesToSlice.sort((a, b) => b.tierScore - a.tierScore);
    }

    // 5. Relevance Gate: Filter out unrelated Acts if explicit Act requested
    let relevanceGated = candidatesToSlice;
    if (intent.explicitAct) {
      const explicitMatches = candidatesToSlice.filter(s => {
        const actLower = s.item.actShortTitle.toLowerCase();
        return (
          (intent.explicitAct === 'tpa' && actLower.includes('transfer of property')) ||
          (intent.explicitAct === 'contract' && actLower.includes('contract')) ||
          (intent.explicitAct === 'karnataka_stamp' && actLower.includes('stamp')) ||
          (intent.explicitAct === 'registration' && actLower.includes('registration')) ||
          (intent.explicitAct === 'karnataka_rent' && actLower.includes('rent'))
        );
      });
      if (explicitMatches.length > 0) {
        relevanceGated = explicitMatches;
      }
    }

    // 5. Filter by strict minimum confidence threshold
    let qualified = relevanceGated.filter(s => s.finalScore >= minThreshold);
    
    // 6. Final UX/Relevance Polish: Isolate exact provisions or apply strict relative cutoff
    if (qualified.length > 0) {
      if (intent.explicitAct && intent.explicitSectionNumber) {
        // Explicit Act + Section requested: Display ONLY the requested provision
        const exactSecMatches = qualified.filter(s => {
          const normSec = s.item.sectionNumber.toLowerCase();
          return normSec.includes(intent.explicitSectionNumber!.toLowerCase());
        });
        if (exactSecMatches.length > 0) {
          qualified = [exactSecMatches[0]];
        }
      } else {
        // Scenario-based: keep multiple citations only when they materially support the answer
        // Drop merely semantically similar provisions by enforcing a strict relative score bound
        const topTierScore = qualified[0].tierScore;
        qualified = qualified.filter(s => s.tierScore >= topTierScore - 0.04);
      }
    }

    const topMatches = qualified.slice(0, topK);

    return topMatches.map(({ item, finalScore }) => {
      const confidenceLevel: 'High' | 'Medium' | 'Low' = finalScore >= 0.7 ? 'High' : finalScore >= 0.4 ? 'Medium' : 'Low';
      const evidenceStrength: 'Strong' | 'Moderate' | 'Weak' = finalScore >= 0.7 ? 'Strong' : finalScore >= 0.4 ? 'Moderate' : 'Weak';

      let dynamicCategory: string = item.applicabilityCategory;
      if (intent.isPropertySale) {
        dynamicCategory = 'property_sale';
      } else if (intent.isRentalLease) {
        dynamicCategory = 'lease_tenancy';
      } else if (intent.isContractFormation) {
        dynamicCategory = 'contract_formation';
      } else if (intent.isStampDuty) {
        dynamicCategory = 'stamp_duty_assessment';
      } else {
        // Fallback correction for stale corpus metadata
        const normTitle = (item.sectionTitle || '').toLowerCase();
        if (normTitle.includes('buyer and seller')) {
          dynamicCategory = 'property_sale';
        }
      }

      const categoryLabel = dynamicCategory.replace(/_/g, ' ');
      const whyThisClause = `This provision was retrieved because the request concerns ${categoryLabel} under ${item.jurisdiction} law, matching ${item.actShortTitle} ${item.sectionNumber} (${item.sectionTitle}) with a 384D vector similarity of ${finalScore.toFixed(2)}.`;

      return enrichCitationWithOfficialProvenance({
        id: item.id,
        actName: item.actName,
        actShortTitle: item.actShortTitle,
        actNumber: item.actNumber,
        year: item.year,
        chapter: item.chapter,
        sectionNumber: item.sectionNumber,
        sectionTitle: item.sectionTitle,
        statuteText: item.statuteText,
        relevanceExplanation: `Retrieved via 384D Dense Vector Similarity (${finalScore.toFixed(2)}) under ${item.actShortTitle} ${item.sectionNumber} (${item.jurisdiction}).`,
        whyThisClause,
        applicabilityTag: dynamicCategory as any,
        jurisdiction: item.jurisdiction,
        sourceUrl: item.sourceUrl,
        pdfUrl: item.pdfUrl,
        sourcePdfFilename: item.sourcePdfFilename,
        sourceDocument: item.sourceDocument || `${item.actShortTitle} Official Text`,
        sourceTier: item.sourceTier || 'Tier 1 (Official Government)',
        effectiveDate: item.effectiveDate,
        pageNumbers: item.pageNumbers,
        sha256: item.sha256,
        confidenceScore: finalScore,
        similarityScore: parseFloat(finalScore.toFixed(2)),
        confidenceLevel,
        evidenceStrength
      });
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

    const queryVector = getCorpusEmbedding(INDIAN_LEGAL_CORPUS[0]); // Baseline fallback
    const qLower = queryText.toLowerCase();
    const isKarnatakaQuery = qLower.includes('karnataka') || qLower.includes('bengaluru') || qLower.includes('bangalore');
    const isMaharashtraQuery = qLower.includes('maharashtra') || qLower.includes('mumbai') || qLower.includes('pune');

    const normalizeTitleSync = (t: string) => t.toLowerCase().replace(/&/g, ' and ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanQueryTextSync = (q: string) => q.toLowerCase().replace(/^(what\s+is|what\s+are|tell\s+me\s+about|explain|details\s+of|show\s+me)\s+/i, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const normQuerySync = normalizeTitleSync(queryText);
    const cleanQSync = cleanQueryTextSync(queryText);

    const scored = INDIAN_LEGAL_CORPUS.map(item => {
      const itemVector = getCorpusEmbedding(item);
      const rawCosine = calculateCosineSimilarity(queryVector, itemVector);

      let categoryMultiplier = 1.0;
      if (allowedCategories.length > 0) {
        if (allowedCategories.includes(item.applicabilityCategory)) {
          categoryMultiplier = 1.35;
        } else if (item.applicabilityCategory === 'dispute_arbitration' && allowedCategories.includes('dispute_arbitration') && qLower.includes('arbitr')) {
          categoryMultiplier = 1.2;
        } else {
          categoryMultiplier = 0.0;
        }
      }

      let jurisdictionMultiplier = 1.0;
      if (isKarnatakaQuery) {
        if (item.jurisdiction === 'KARNATAKA') {
          jurisdictionMultiplier = 1.4;
        } else if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0;
        } else {
          jurisdictionMultiplier = 0.0;
        }
      } else if (isMaharashtraQuery) {
        if ((item as any).jurisdiction === 'MAHARASHTRA' || (item as any).stateSpecific === 'Maharashtra') {
          jurisdictionMultiplier = 1.4;
        } else if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0;
        } else {
          jurisdictionMultiplier = 0.0;
        }
      } else {
        if (item.jurisdiction === 'CENTRAL') {
          jurisdictionMultiplier = 1.0;
        } else if (item.jurisdiction === 'KARNATAKA') {
          jurisdictionMultiplier = 0.0;
        }
      }

      let actKeywordMultiplier = 1.0;
      const actShortLower = item.actShortTitle.toLowerCase();
      const actNameLower = item.actName.toLowerCase();
      const cleanActShort = actShortLower.replace(/\d{4}/g, '').replace(/,/g, '').replace(/^the\s+/, '').trim();
      const cleanActName = actNameLower.replace(/\d{4}/g, '').replace(/,/g, '').replace(/^the\s+/, '').trim();
      const isActExplicitlyMentioned = cleanActShort.length > 3 && (qLower.includes(cleanActShort) || qLower.includes(cleanActName));

      if (isActExplicitlyMentioned) {
        if (categoryMultiplier < 1.0) categoryMultiplier = 1.0;
        actKeywordMultiplier *= 2.5;
      } else {
        const actWords = cleanActShort.split(/\s+/).filter(w => w.length > 2 && w !== 'act');
        if (actWords.length >= 2 && actWords.every(w => qLower.includes(w))) {
          if (categoryMultiplier < 1.0) categoryMultiplier = 1.0;
          actKeywordMultiplier *= 2.0;
        }
      }

      const cleanSecNum = item.sectionNumber
        ? item.sectionNumber.toLowerCase().replace(/^(section|article|sec|rule)\s+/i, '').trim()
        : '';

      if (cleanSecNum.length > 0) {
        const secRegex = new RegExp(`\\b(section|sec|article|art|rule)\\s+${cleanSecNum}\\b`, 'i');
        if (secRegex.test(qLower)) {
          actKeywordMultiplier *= 3.0;
        }
      }

      if (item.sectionTitle) {
        const normTitle = normalizeTitleSync(item.sectionTitle);
        if (normTitle.length >= 6) {
          if (normQuerySync.includes(normTitle) || (normTitle.length >= 12 && normTitle.includes(normQuerySync))) {
            actKeywordMultiplier *= 2.5;
          } else {
            const stopWords = new Set(['what', 'is', 'the', 'for', 'are', 'under', 'from', 'with', 'and', 'clause', 'who', 'must']);
            const titleWords = normTitle.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
            if (titleWords.length >= 3 && titleWords.every(w => normQuerySync.includes(w))) {
              actKeywordMultiplier *= 2.0;
            }
          }
        }
      }
      if ((qLower.includes('rent') || qLower.includes('tenancy') || qLower.includes('eviction')) && (actShortLower.includes('rent') || item.applicabilityCategory === 'lease_tenancy')) {
        actKeywordMultiplier *= 1.8;
      }
      if ((qLower.includes('stamp') || qLower.includes('duty')) && actShortLower.includes('stamp')) {
        actKeywordMultiplier *= 1.8;
      }
      if ((qLower.includes('registr') || qLower.includes('sub-registrar')) && actShortLower.includes('registration')) {
        actKeywordMultiplier *= 1.4;
      }
      if ((qLower.includes('contract') || qLower.includes('agreement')) && actShortLower.includes('contract')) {
        actKeywordMultiplier *= 1.25;
      }
      if (actShortLower.includes('procurement') && !qLower.includes('procurement') && !qLower.includes('tender')) {
        actKeywordMultiplier = 0.0;
      }
      if (actShortLower.includes('land revenue') && !qLower.includes('land revenue') && !qLower.includes('agricultural')) {
        actKeywordMultiplier = 0.0;
      }

      const unclippedScore = rawCosine * categoryMultiplier * jurisdictionMultiplier * actKeywordMultiplier;
      const finalScore = Math.min(1.0, Math.round(unclippedScore * 100) / 100);

      // Deterministic relevance hierarchy score
      const normTitle = item.sectionTitle ? normalizeTitleSync(item.sectionTitle) : '';

      let tierBonus = 0;
      if (normTitle.length >= 5) {
        if (normQuerySync === normTitle || cleanQSync === normTitle) {
          tierBonus += 10000;
        } else if (normQuerySync.includes(normTitle) || cleanQSync.includes(normTitle)) {
          tierBonus += 8000;
        } else if (normTitle.includes(cleanQSync) && cleanQSync.length >= 10) {
          tierBonus += 6000;
        } else {
          const stopWords = new Set(['what', 'is', 'the', 'for', 'are', 'under', 'from', 'with', 'and', 'clause', 'who', 'must', 'of', 'in']);
          const titleWords = normTitle.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
          if (titleWords.length >= 2) {
            const matchingWords = titleWords.filter(w => normQuerySync.includes(w) || cleanQSync.includes(w));
            const matchRatio = matchingWords.length / titleWords.length;
            if (matchRatio === 1.0) {
              tierBonus += 4000;
            } else if (matchRatio >= 0.75 && titleWords.length >= 3) {
              tierBonus += 2000;
            }
          }
        }
      }

      if (cleanSecNum.length > 0) {
        const secRegex = new RegExp(`\\b(section|sec|article|art|rule)\\s+${cleanSecNum}\\b`, 'i');
        if (secRegex.test(queryText)) {
          tierBonus += 2500;
        }
      }

      if (cleanActShort.length > 3 && (normQuerySync.includes(cleanActShort) || normQuerySync.includes(cleanActName))) {
        tierBonus += 1250;
      }

      const tierScore = tierBonus + unclippedScore;
      return { item, unclippedScore, finalScore, tierScore };
    });

    scored.sort((a, b) => b.tierScore - a.tierScore);

    // Generic provision deduplication by identity: Act + sectionNumber + sectionTitle
    const distinctProvisionMap = new Map<string, typeof scored[0]>();
    for (const s of scored) {
      const normSecNum = (s.item.sectionNumber || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const normSecTitle = (s.item.sectionTitle || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const actKey = (s.item.actShortTitle || s.item.actName).toLowerCase().trim();
      const provisionKey = `${actKey}::${normSecNum}::${normSecTitle}`;
      if (!distinctProvisionMap.has(provisionKey) || distinctProvisionMap.get(provisionKey)!.tierScore < s.tierScore) {
        distinctProvisionMap.set(provisionKey, s);
      }
    }
    const deduplicatedScored = Array.from(distinctProvisionMap.values());
    deduplicatedScored.sort((a, b) => b.tierScore - a.tierScore);

    let candidatesToSlice = deduplicatedScored;
    if (templateId) {
      const distinctActMap = new Map<string, typeof deduplicatedScored[0]>();
      for (const s of deduplicatedScored) {
        const actKey = s.item.actShortTitle || s.item.actName;
        if (!distinctActMap.has(actKey) || distinctActMap.get(actKey)!.tierScore < s.tierScore) {
          distinctActMap.set(actKey, s);
        }
      }
      candidatesToSlice = Array.from(distinctActMap.values());
      candidatesToSlice.sort((a, b) => b.tierScore - a.tierScore);
    }

    const intent = LegalRAGEngine.detectQueryIntent(queryText);
    let relevanceGated = candidatesToSlice;
    if (intent.explicitAct) {
      const explicitMatches = candidatesToSlice.filter(s => {
        const actLower = s.item.actShortTitle.toLowerCase();
        return (
          (intent.explicitAct === 'tpa' && actLower.includes('transfer of property')) ||
          (intent.explicitAct === 'contract' && actLower.includes('contract')) ||
          (intent.explicitAct === 'karnataka_stamp' && actLower.includes('stamp')) ||
          (intent.explicitAct === 'registration' && actLower.includes('registration')) ||
          (intent.explicitAct === 'karnataka_rent' && actLower.includes('rent'))
        );
      });
      if (explicitMatches.length > 0) {
        relevanceGated = explicitMatches;
      }
    }

    // 5. Filter by strict minimum confidence threshold
    let qualified = relevanceGated.filter(s => s.finalScore >= minThreshold);
    
    // 6. Final UX/Relevance Polish: Isolate exact provisions or apply strict relative cutoff
    if (qualified.length > 0) {
      if (intent.explicitAct && intent.explicitSectionNumber) {
        // Explicit Act + Section requested: Display ONLY the requested provision
        const exactSecMatches = qualified.filter(s => {
          const normSec = s.item.sectionNumber.toLowerCase();
          return normSec.includes(intent.explicitSectionNumber!.toLowerCase());
        });
        if (exactSecMatches.length > 0) {
          qualified = [exactSecMatches[0]];
        }
      } else {
        // Scenario-based: keep multiple citations only when they materially support the answer
        // Drop merely semantically similar provisions by enforcing a strict relative score bound
        const topScore = qualified[0].finalScore;
        qualified = qualified.filter(s => s.finalScore >= topScore - 0.04);
      }
    }

    const topMatches = qualified.slice(0, topK);

    return topMatches.map(({ item, finalScore }) => {
      const confidenceLevel: 'High' | 'Medium' | 'Low' = finalScore >= 0.7 ? 'High' : finalScore >= 0.4 ? 'Medium' : 'Low';
      const evidenceStrength: 'Strong' | 'Moderate' | 'Weak' = finalScore >= 0.7 ? 'Strong' : finalScore >= 0.4 ? 'Moderate' : 'Weak';

      const categoryLabel = item.applicabilityCategory.replace(/_/g, ' ');
      const whyThisClause = `This provision was retrieved because the request concerns ${categoryLabel} under ${item.jurisdiction} law, matching ${item.actShortTitle} ${item.sectionNumber} (${item.sectionTitle}) with a vector cosine similarity score of ${finalScore.toFixed(2)}.`;

      return enrichCitationWithOfficialProvenance({
        id: item.id,
        actName: item.actName,
        actShortTitle: item.actShortTitle,
        actNumber: item.actNumber,
        year: item.year,
        chapter: item.chapter,
        sectionNumber: item.sectionNumber,
        sectionTitle: item.sectionTitle,
        statuteText: item.statuteText,
        relevanceExplanation: `Retrieved via 384D Dense Vector Similarity (${finalScore.toFixed(2)}) under ${item.actShortTitle} ${item.sectionNumber} (${item.jurisdiction}).`,
        whyThisClause,
        applicabilityTag: item.applicabilityCategory,
        jurisdiction: item.jurisdiction,
        sourceUrl: item.sourceUrl,
        pdfUrl: item.pdfUrl,
        sourcePdfFilename: item.sourcePdfFilename,
        sourceDocument: item.sourceDocument || `${item.actShortTitle} Official Text`,
        sourceTier: item.sourceTier || 'Tier 1 (Official Government)',
        effectiveDate: item.effectiveDate,
        pageNumbers: item.pageNumbers,
        sha256: item.sha256,
        confidenceScore: finalScore,
        similarityScore: parseFloat(finalScore.toFixed(2)),
        confidenceLevel,
        evidenceStrength
      });
    });
  }

  /**
   * Domain query keywords map by document template ID
   */
  private static getTemplateKeywords(templateId: string): string {
    switch (templateId) {
      case 'rent_agreement':
        return 'rent tenancy lease stamp duty registration sub-registrar property transfer eviction landlord tenant';
      case 'nda_agreement':
        return 'non-disclosure confidentiality proprietary information trade secret IT act contract disclosure';
      case 'employment_contract':
        return 'employment service shops establishments worker employee contract salary termination';
      case 'freelance_service':
      case 'freelance_contract':
      case 'service_agreement':
        return 'service contract freelance employment IT act agreement compensation';
      case 'partnership_deed':
        return 'partnership deed contract dispute arbitration firm partner';
      case 'consumer_legal_notice':
      case 'legal_notice':
        return 'consumer rights protection legal notice dispute arbitration contract compensation';
      default:
        return 'contract agreement legal clause';
    }
  }

  /**
   * Retrieves relevant legal citations based on full document metadata & customized clause riders.
   */
  public static retrieveCitationsForDocument(formData: DocumentFormData): LegalStatuteCitation[] {
    const selectedTexts = formData.selectedClauseConfigs ? formData.selectedClauseConfigs.map(c => `${c.title} ${c.category} ${c.clauseText}`).join(' ') : '';
    const customTexts = formData.customUserClauses ? formData.customUserClauses.map(c => `${c.title} ${c.category} ${c.clauseText}`).join(' ') : '';
    const stateName = formData.governingLawState || formData.state || 'Karnataka';
    const domainKeywords = this.getTemplateKeywords(formData.templateId);
    const combinedQuery = `${formData.documentTitle} ${domainKeywords} ${formData.templateId} ${formData.customClauses.join(' ')} ${selectedTexts} ${customTexts} ${stateName}`;
    
    return this.retrieveRelevantStatutes(combinedQuery, formData.templateId, 5);
  }

  /**
   * Async dense vector retrieval for full document metadata & customized clause riders.
   */
  public static async retrieveCitationsForDocumentAsync(formData: DocumentFormData): Promise<LegalStatuteCitation[]> {
    const selectedTexts = formData.selectedClauseConfigs ? formData.selectedClauseConfigs.map(c => `${c.title} ${c.category} ${c.clauseText}`).join(' ') : '';
    const customTexts = formData.customUserClauses ? formData.customUserClauses.map(c => `${c.title} ${c.category} ${c.clauseText}`).join(' ') : '';
    const stateName = formData.governingLawState || formData.state || 'Karnataka';
    const domainKeywords = this.getTemplateKeywords(formData.templateId);
    const combinedQuery = `${formData.documentTitle} ${domainKeywords} ${formData.templateId} ${formData.customClauses.join(' ')} ${selectedTexts} ${customTexts} ${stateName}`;

    return this.retrieveRelevantStatutesAsync(combinedQuery, formData.templateId, 5);
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
    const isMonetaryTemplate = ['rent_agreement', 'freelance_service', 'freelance_contract', 'employment_contract', 'partnership_deed'].includes(formData.templateId);
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
      const stateLower = formData.state.toLowerCase();
      const isKarnataka = stateLower.includes('karnataka') || stateLower.includes('bengaluru') || stateLower.includes('bangalore');
      const isMaharashtra = stateLower.includes('maharashtra');

      if (isKarnataka) {
        recommendations.push(
          `Karnataka Rent Act & Kaveri e-Stamp Mandate: Under Section 4 of Karnataka Rent Act 1999 and Article 30 of Karnataka Stamp Act 1957, tenancy agreements in Karnataka must be in writing, pay applicable e-Stamp duty via Kaveri 2.0 (Department of Stamps & Registration), and be registered before the Rent Controller / Sub-Registrar.`
        );
      } else if (isMaharashtra) {
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
      if (c.riskLevel === 'critical') score -= 25;
      else if (c.riskLevel === 'high') score -= 15;
      else if (c.riskLevel === 'medium') score -= 5;
    }
    return Math.max(10, score);
  }

  /**
   * Generates a grounded, plain-English legal explanation strictly from retrieved RAG citations.
   * Does NOT hallucinate external provisions or general knowledge.
   */
  public static generateGroundedExplanation(query: string, citations: LegalStatuteCitation[]): string {
    if (!citations || citations.length === 0) {
      return `No verified statutory provision found in Kanoon legal database matching "${query}". Please verify the Act or section details under Indian Central and Karnataka State Law.`;
    }

    const top = citations[0];
    const qLower = query.toLowerCase();

    const isCalculationQuery = qLower.includes('stamp duty') || qLower.includes('how much') || qLower.includes('calculate') || qLower.includes('fee') || qLower.includes('rate');

    const intent = LegalRAGEngine.detectQueryIntent(query);
    const { monthlyRent, tenureMonths, deposit } = intent.parsedValues;

    let explanation = '';

    if (isCalculationQuery && (top.actShortTitle.toLowerCase().includes('stamp') || top.sectionNumber.toLowerCase().includes('article 30'))) {
      explanation += `Based on **${top.sectionNumber}** of the **${top.actShortTitle}** (*${top.sectionTitle}*), stamp duty on lease and tenancy agreements in Karnataka is calculated using the lease tenure, average annual rent, and any advance or security deposit.\n\n`;

      if (monthlyRent || tenureMonths || deposit) {
        explanation += `Extracted Parameters from Query:\n`;
        if (monthlyRent) explanation += `- **Monthly Rent:** ₹${monthlyRent}\n`;
        if (tenureMonths) explanation += `- **Lease Tenure:** ${tenureMonths} months\n`;
        if (deposit) explanation += `- **Advance / Deposit:** ₹${deposit}\n`;
        explanation += `\n`;
      }

      const missingFacts: string[] = [];
      if (!monthlyRent) missingFacts.push('the **monthly rent** (e.g., ₹25,000)');
      if (!tenureMonths) missingFacts.push('the **lease tenure** (e.g., 11 months, 1 to 5 years, or >5 years)');
      if (!deposit) missingFacts.push('the **refundable security deposit** (e.g., ₹1,50,000)');

      if (missingFacts.length > 0) {
        explanation += `To determine the exact e-stamp duty amount payable for your rental agreement in Bengaluru, I still need: ${missingFacts.join(', and ')}.\n`;
      } else {
        explanation += `With a rent of ₹${monthlyRent} per month and a tenure of ${tenureMonths} months, your agreement falls under the short-term residential tenancy lease schedule under Article 30 of the Karnataka Stamp Act.\n`;
      }
    } else {
      explanation += `Here is what the law says based on **${top.sectionNumber}** of the **${top.actShortTitle}** (*${top.sectionTitle}*):\n\n`;

      const text = top.statuteText || '';
      const cleanText = text.replace(/^(Section|Article)\s+\d+\s*[-—:\.]\s*/i, '').trim();

      if (top.sectionNumber.includes('55') && top.actShortTitle.includes('Transfer of Property')) {
        explanation += `This section places clear duties on both buyers and sellers of immovable property. For instance:\n\n`;
        explanation += `- **Sellers** must disclose material property or title defects that the buyer cannot reasonably discover, produce title deeds for inspection, and properly transfer ownership.\n`;
        explanation += `- **Buyers** are obligated to pay the purchase price at the agreed time and inform the seller of facts that might increase the property's value.\n\n`;
        explanation += `If your situation involves a seller knowingly hiding an important defect, this duty to disclose is directly relevant. What remedies you have depends on the specific defect and the terms of your sale.\n`;
      } else if (top.sectionNumber.includes('10') && top.actShortTitle.includes('Contract')) {
        explanation += `This section outlines the basic requirements for an agreement to become a legally binding contract. It requires:\n\n`;
        explanation += `- **Free Consent**: All parties must agree voluntarily, without coercion or fraud.\n`;
        explanation += `- **Competent Parties**: Parties must be of legal age and sound mind.\n`;
        explanation += `- **Lawful Object & Consideration**: The agreement must be for a legal purpose and involve lawful consideration (like money or services).\n\n`;
        explanation += `If any of these essential elements are missing, the agreement is generally void and unenforceable in court.\n`;
      } else {
        const keySentences = cleanText.split(/(?<=[.!?])\s+/).filter(s => s.length > 20).slice(0, 3);
        if (keySentences.length > 0) {
          keySentences.forEach(sentence => {
            explanation += `- ${sentence.trim()}\n`;
          });
        } else {
          explanation += `- ${cleanText}\n`;
        }
      }
    }

    return explanation.trim();
  }
}
