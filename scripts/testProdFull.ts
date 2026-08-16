import http from 'http';

const query = "My seller knew there was a defect in the property but didn't tell me. What does the law say?";

async function fetchChatExplain() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5000/api/chat-explain',
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

fetchChatExplain().then((data: any) => {
  console.log(JSON.stringify(data.citations.map(c => ({ act: c.actShortTitle, sec: c.sectionNumber, score: c.matchScore })), null, 2));
}).catch(console.error);
