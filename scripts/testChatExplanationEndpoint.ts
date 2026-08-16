async function testChatExplanationEndpoint() {
  console.log("================================================================================");
  console.log("TESTING CHAT EXPLANATION ENDPOINT (POST http://localhost:5000/api/chat-explain)");
  console.log("================================================================ handler\n");

  const testQueries = [
    {
      id: 1,
      query: "What is Section 55 of the Transfer of Property Act?",
      expectedKeyword: "Section 55"
    },
    {
      id: 2,
      query: "What are the rights and liabilities of buyer and seller?",
      expectedKeyword: "Section 55"
    },
    {
      id: 3,
      query: "What is Section 10 of the Indian Contract Act?",
      expectedKeyword: "Section 10"
    },
    {
      id: 4,
      query: "What stamp duty applies to a rental agreement in Bengaluru under Karnataka Stamp Act?",
      expectedKeyword: "Article 30"
    },
    {
      id: 5,
      query: "Who won the Cricket World Cup in 2011?",
      expectedKeyword: "No verified statutory provision found"
    }
  ];

  let passed = 0;

  for (const q of testQueries) {
    console.log(`[QUERY ${q.id}] "${q.query}"`);

    try {
      const resp = await fetch('http://localhost:5000/api/chat-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: q.query })
      });

      if (!resp.ok) {
        console.error(` ❌ HTTP Error ${resp.status}`);
        continue;
      }

      const data = await resp.json();
      console.log(` Has Sufficient Evidence: ${data.hasSufficientEvidence}`);
      console.log(` Citations Returned: ${data.citations ? data.citations.length : 0}`);
      console.log(` Explanation Preview:\n${data.explanation.substring(0, 300)}...\n`);

      if (q.id === 5) {
        if (!data.hasSufficientEvidence && data.citations.length === 0 && data.explanation.includes(q.expectedKeyword)) {
          console.log(` ✅ PASS: Out-of-domain query rejected with zero citations.`);
          passed++;
        } else {
          console.error(` ❌ FAIL: Out-of-domain query not properly rejected.`);
        }
      } else {
        const topCitation = data.citations && data.citations[0];
        if (data.hasSufficientEvidence && topCitation && data.explanation.length > 50) {
          console.log(` ✅ PASS: Grounded AI Explanation returned with Primary Citation: ${topCitation.actShortTitle} ${topCitation.sectionNumber}`);
          passed++;
        } else {
          console.error(` ❌ FAIL: Expected grounded explanation for query.`);
        }
      }
    } catch (err: any) {
      console.error(` ❌ Fetch failed: ${err.message}`);
    }
    console.log("--------------------------------------------------------------------------------");
  }

  console.log(`\nCHAT EXPLANATION ENDPOINT RESULT: ${passed}/${testQueries.length} PASSED (${((passed / testQueries.length) * 100).toFixed(1)}%)\n`);

  if (passed !== testQueries.length) {
    process.exit(1);
  }
}

testChatExplanationEndpoint().catch(console.error);
