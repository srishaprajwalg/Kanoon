import { GoogleGenAI } from '@google/genai';
import { LegalRAGEngine } from '../src/services/ragEngine.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await LegalRAGEngine.initializeCorpus();
  const query = "What is Section 55 of the Transfer of Property Act?";
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  const statutoryContext = citations.map(c => `[${c.actShortTitle} - Section ${c.sectionNumber}]:\n${c.statuteText}`).join('\n\n');
  
  const prompt = `You are Kanoon AI...
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
  console.log("RESPONSE RAW:", JSON.stringify(response, null, 2));
}
run();
