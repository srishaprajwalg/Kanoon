import http from 'http';
import { spawn } from 'child_process';

const queries = [
  "My seller knew there was a defect in the property but didn't tell me.",
  "What happens if the buyer doesn't pay the purchase price?",
  "What is Section 55 of the Transfer of Property Act?",
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

async function runServerAndTest(port: number) {
  return new Promise<void>((resolve, reject) => {
    const srv = spawn('npx', ['tsx', 'server/index.ts'], {
      env: { ...process.env, PORT: port.toString() }
    });
    
    srv.stdout.on('data', async (data) => {
      if (data.toString().includes(`running on http://localhost:${port}`)) {
        try {
          console.log(`\n--- RUNNING HTTP TESTS ON PORT ${port} ---`);
          for (const q of queries) {
            const res: any = await fetchChatExplain(q, port);
            console.log(`\nQuery: ${q}`);
            const citations = res.citations || [];
            console.log(`Citations Returned: ${citations.length}`);
            citations.forEach((c: any, i: number) => {
              console.log(`  [${i}] ${c.actShortTitle} ${c.sectionNumber} - Tag: ${c.applicabilityTag}`);
              if (i === 0) console.log(`      Why: ${c.whyThisClause}`);
            });
          }
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

runServerAndTest(5015).catch(console.error);
