import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function testQueryNoWhatIs() {
  const q = "Rights and liabilities of buyer and seller";
  console.log(`Query: "${q}"`);
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(q, undefined, 5, 0.4);
  citations.forEach((c, i) => {
    console.log(`Rank #${i + 1}: ${c.actShortTitle} ${c.sectionNumber} - "${c.sectionTitle}" (Score: ${c.confidenceScore})`);
  });
}

testQueryNoWhatIs();
