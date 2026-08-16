import http from 'http';

const testQueries = [
  "What is Section 55 of the Transfer of Property Act?",
  "My seller knew there was a defect in the property but didn't tell me. What does the law say?",
  "What happens if the buyer doesn't pay the purchase price?",
  "I am renting a house in Bengaluru for ₹30,000 per month for 11 months. What stamp duty do I pay?",
  "Explain Section 10 of the Contract Act like I'm not a lawyer.",
  "Who won the Cricket World Cup in 2011?"
];

async function fetchChatExplain(query) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5000/api/chat-explain',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({ queryText: query }));
    req.end();
  });
}

async function runTests() {
  for (let i = 0; i < testQueries.length; i++) {
    const q = testQueries[i];
    console.log(`\nQuery ${i+1}: ${q}`);
    const data: any = await fetchChatExplain(q);
    const topCitation = data.citations && data.citations.length > 0 ? `${data.citations[0].actShortTitle} ${data.citations[0].sectionNumber}` : 'None';
    console.log(`Primary Citation: ${topCitation}`);
  }
}
runTests().catch(console.error);
