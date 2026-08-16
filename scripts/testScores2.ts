import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function run() {
  await LegalRAGEngine.initializeCorpus();
  const query = "My seller knew there was a defect in the property but didn't tell me. What does the law say?";
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  console.log(citations.map(c => c.sectionNumber));
}
run().catch(console.error);
