import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function run() {
  await LegalRAGEngine.initializeCorpus();
  const query = "What is Section 55 of the Transfer of Property Act?";
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  console.log("Tag:", citations[0].applicabilityTag);
  console.log("Why:", citations[0].whyThisClause);
}
run().catch(console.error);
