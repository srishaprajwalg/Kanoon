import http from 'http';
import { spawn } from 'child_process';

const queries = [
  "What is Section 55 of the Transfer of Property Act?",
  "My seller knew there was a defect in the property but didn't tell me. What does the law say?",
  "What happens if the buyer doesn't pay the purchase price?",
  "I am renting a house in Bengaluru for ₹30,000 per month for 11 months. What stamp duty do I pay?",
  "Explain Section 10 of the Contract Act like I'm not a lawyer.",
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
      const text = data.toString();
      process.stdout.write(text); // Pipe server stdout directly!
      if (text.includes(`running on http://localhost:${port}`)) {
        try {
          console.log(`\n--- RUNNING HTTP TESTS ON PORT ${port} ---`);
          for (const [index, q] of queries.entries()) {
            const res: any = await fetchChatExplain(q, port);
            console.log(`\nQuery: ${q}`);
            if (index === 1) {
              console.log(`\n--- FULL EXPLANATION FOR QUERY 2 ---\n${res.explanation}\n-----------------------------------\n`);
            } else {
              console.log(`Explanation snippet: ${res.explanation.substring(0, 150).replace(/\n/g, ' ')}...`);
            }
          }
          setTimeout(() => {
            srv.kill();
            resolve();
          }, 2000); // Wait 2 seconds for logs to flush
        } catch (e) {
          srv.kill();
          reject(e);
        }
      }
    });
    
    srv.stderr.on('data', (data) => {
      process.stderr.write(data.toString()); // Pipe server stderr directly!
    });
  });
}

runServerAndTest(5021).catch(console.error);
