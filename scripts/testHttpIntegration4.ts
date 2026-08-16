import http from 'http';
import { spawn } from 'child_process';

const queries = [
  "What is Section 55 of the Transfer of Property Act?"
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
    
    let serverStdout = "";
    
    srv.stdout.on('data', async (data) => {
      const text = data.toString();
      serverStdout += text;
      
      if (text.includes(`running on http://localhost:${port}`)) {
        try {
          console.log(`\n--- RUNNING HTTP TESTS ON PORT ${port} ---`);
          for (const q of queries) {
            const res: any = await fetchChatExplain(q, port);
            console.log(`\nQuery: ${q}`);
            console.log(`Explanation snippet: ${res.explanation.substring(0, 150).replace(/\n/g, ' ')}...`);
          }
          console.log("\n--- SERVER STDOUT ---");
          console.log(serverStdout);
          srv.kill();
          resolve();
        } catch (e) {
          srv.kill();
          reject(e);
        }
      }
    });
    
    srv.stderr.on('data', (data) => {
      console.log("STDERR:", data.toString());
    });
  });
}

runServerAndTest(5018).catch(console.error);
