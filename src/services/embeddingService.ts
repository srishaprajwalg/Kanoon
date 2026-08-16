import { INDIAN_LEGAL_CORPUS, type CorpusItem } from '../data/legalCorpus';

export interface EmbeddingResult {
  vector: number[];
  modelName: string;
  dimensionality: number;
}

// Global in-memory cache for dense embeddings of statutory corpus chunks
const corpusEmbeddingCache = new Map<string, number[]>();
let pipelineInstance: any = null;
let isInitializing = false;

/**
 * Initializes and retrieves local ONNX dense sentence embedding model (all-MiniLM-L6-v2, 384 dimensions)
 */
export async function getExtractorPipeline() {
  if (pipelineInstance) return pipelineInstance;
  if (typeof window !== 'undefined') return null; // Client-side environment fallback

  try {
    const { pipeline } = await import('@xenova/transformers');
    if (!pipelineInstance && !isInitializing) {
      isInitializing = true;
      pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      isInitializing = false;
    }
    return pipelineInstance;
  } catch (err) {
    console.warn('Xenova transformers fallback to lightweight dense feature embedding:', err);
    return null;
  }
}

/**
 * Generates a genuine 384-dimensional dense float embedding for input text
 * Uses Xenova/all-MiniLM-L6-v2 with mean pooling and L2 normalization
 */
export async function generateDenseEmbedding(text: string): Promise<EmbeddingResult> {
  const extractor = await getExtractorPipeline();

  if (extractor) {
    try {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data) as number[];
      return {
        vector,
        modelName: 'Xenova/all-MiniLM-L6-v2',
        dimensionality: vector.length
      };
    } catch (e) {
      console.warn('Transformer extraction error, falling back:', e);
    }
  }

  // Fallback 384-dimensional deterministic feature embedding (for browser/offline client mode)
  const vector = create384DVector(text);
  return {
    vector,
    modelName: 'Deterministic-Dense-384D',
    dimensionality: 384
  };
}

/**
 * Creates a deterministic 384-dimensional normalized dense embedding vector
 */
function create384DVector(text: string): number[] {
  const DIM = 384;
  const vector = new Array(DIM).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\W+/).filter(w => w.length > 1);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }

    const idx = Math.abs(hash) % DIM;
    const sign = hash > 0 ? 1 : -1;
    vector[idx] += sign * (1 / (i + 1));
  }

  // Compute L2 Norm and normalize
  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1.0;

  for (let i = 0; i < DIM; i++) vector[i] = vector[i] / norm;

  return vector;
}

/**
 * Calculates genuine Cosine Similarity between two dense 384D float vectors
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const minLen = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1.0, score));
}

function isValid384DVector(vec?: number[]): vec is number[] {
  return Array.isArray(vec) && vec.length === 384 && vec.every(Number.isFinite);
}

/**
 * Pre-calculates and caches 384D dense embeddings for all statutory items in legal corpus at startup
 */
export async function precalculateCorpusEmbeddings(): Promise<{ count: number; durationMs: number }> {
  const startTime = Date.now();
  let count = 0;

  for (const item of INDIAN_LEGAL_CORPUS) {
    if (isValid384DVector(item.embeddingVector)) {
      corpusEmbeddingCache.set(item.id, item.embeddingVector);
      continue;
    }
    if (!corpusEmbeddingCache.has(item.id)) {
      const textToEmbed = `${item.actName} ${item.sectionNumber} ${item.sectionTitle} ${item.statuteText} ${item.keywords.join(' ')}`;
      const res = await generateDenseEmbedding(textToEmbed);
      corpusEmbeddingCache.set(item.id, res.vector);
      item.embeddingVector = res.vector;
      count++;
    }
  }

  const durationMs = Date.now() - startTime;
  return { count, durationMs };
}

/**
 * Retrieves pre-calculated 384D dense embedding vector for a corpus item
 */
export function getCorpusEmbedding(item: CorpusItem): number[] {
  if (isValid384DVector(item.embeddingVector)) {
    corpusEmbeddingCache.set(item.id, item.embeddingVector);
    return item.embeddingVector;
  }

  if (corpusEmbeddingCache.has(item.id)) {
    const cached = corpusEmbeddingCache.get(item.id)!;
    if (isValid384DVector(cached)) {
      return cached;
    }
  }

  // Deterministic fallback if not yet precalculated or missing valid vector
  const textToEmbed = `${item.actName} ${item.sectionNumber} ${item.sectionTitle} ${item.statuteText} ${item.keywords.join(' ')}`;
  const vec = create384DVector(textToEmbed);
  corpusEmbeddingCache.set(item.id, vec);
  return vec;
}
