import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function testUnrelatedQueries() {
  const queries = [
    "Tell me something completely unrelated that is not supported by the current legal corpus.",
    "Who won the Cricket World Cup in 2011?",
    "How do I bake a chocolate cake at home?"
  ];

  for (const q of queries) {
    console.log(`\nTesting Query: "${q}"`);
    const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(q, undefined, 4, 0.4);
    if (citations.length === 0) {
      console.log(`Result: 0 CITATIONS RETURNED (Refused out-of-domain query, Threshold = 0.4)`);
    } else {
      citations.forEach((c, idx) => {
        console.log(`Rank #${idx + 1} | Act: ${c.actShortTitle} | ${c.sectionNumber} - "${c.sectionTitle}" | Score: ${c.confidenceScore}`);
      });
    }
  }
}

testUnrelatedQueries();
