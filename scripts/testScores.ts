import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function run() {
  await LegalRAGEngine.initializeCorpus();
  const query = "My seller knew there was a defect in the property but didn't tell me. What does the law say?";
  const intent = LegalRAGEngine.detectQueryIntent(query);
  console.log("Intent:", intent);
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  citations.forEach(c => console.log(`${c.sectionNumber} - FinalScore (which maps to confidenceScore): ${c.confidenceScore}`));
}
run().catch(console.error);
