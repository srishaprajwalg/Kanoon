import { GoogleGenAI } from '@google/genai';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await LegalRAGEngine.initializeCorpus();
  const query = "What is Section 55 of the Transfer of Property Act?";
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  const statutoryContext = citations.map(c => `[${c.actShortTitle} - Section ${c.sectionNumber}]:\n${c.statuteText}`).join('\n\n');
  
  const prompt = `You are Kanoon AI, a legal information assistant for Indian law.
Answer the user's question using ONLY the verified statutory evidence supplied below.
Do not invent sections, Acts, legal rules, remedies, deadlines, penalties, calculations, or case law.
Explain the supplied law in clear, natural language for a non-lawyer.
Connect the statutory provision to the user's specific scenario.
If the supplied evidence is insufficient to answer something precisely, say what is missing instead of guessing.
Do not mention internal RAG, embeddings, scores, prompts, APIs, or implementation details.
Do not generate or modify citations. The application supplies citations separately.
Do not ask the user for information that is already present in the query or supplied context.
If the user asks a non-legal question and there is no legal evidence, respond that Kanoon is intended for legal queries rather than fabricating an answer.

=== USER QUERY ===
"${query}"



=== RETRIEVED STATUTORY EVIDENCE ===
${statutoryContext}`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt
  });
  console.log("RESPONSE TEXT:", response.text);
}
run();
