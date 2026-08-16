import http from 'http';
import { spawn } from 'child_process';

const queries = [
  "What is Section 55 of the Transfer of Property Act?",
  "My seller knew there was a defect in the property but didn't tell me.",
  "What happens if the buyer doesn't pay the purchase price?",
  "Explain Section 10 of the Contract Act",
  "I am renting a house in Bengaluru for ₹30,000 per month for 11 months.",
  "Who won the Cricket World Cup in 2011?"
];

async function fetchChatExplain(query: string, port: number) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${port}/api/chat-explain`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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

async function runTests(port: number, label: string) {
  console.log(`\n--- RUNNING TESTS: ${label} ---`);
  for (const q of queries) {
    const res: any = await fetchChatExplain(q, port);
    console.log(`Query: ${q}`);
    const citations = res.citations || [];
    const primary = citations.length > 0 ? `${citations[0].actShortTitle} ${citations[0].sectionNumber}` : 'None';
    console.log(`Primary Citation: ${primary}`);
    console.log(`Citation Count: ${citations.length}`);
    console.log(`Explanation snippet: ${res.explanation.substring(0, 100).replace(/\n/g, ' ')}`);
    console.log('---');
  }
}

async function runServerAndTest(envKey: string, port: number, label: string) {
  return new Promise<void>((resolve, reject) => {
    const srv = spawn('npx', ['tsx', 'server/index.ts'], {
      env: { ...process.env, PORT: port.toString(), GEMINI_API_KEY: envKey }
    });
    
    srv.stdout.on('data', async (data) => {
      if (data.toString().includes(`running on http://localhost:${port}`)) {
        try {
          await runTests(port, label);
          srv.kill();
          resolve();
        } catch (e) {
          srv.kill();
          reject(e);
        }
      }
    });
    
    srv.stderr.on('data', (data) => {
      // console.error(data.toString());
    });
  });
}

async function main() {
  await runServerAndTest('MOCK_KEY_FOR_TESTING', 5001, 'Mocked Gemini Success');
  await runServerAndTest('FAIL_MOCK', 5002, 'Mocked Gemini Failure (Fallback)');
  await runServerAndTest('', 5003, 'Missing API Key (Fallback)');
}

main().catch(console.error);
