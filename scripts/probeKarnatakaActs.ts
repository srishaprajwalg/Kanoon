async function searchIndiaCode(query: string) {
  const url = `https://www.indiacode.nic.in/simple-search?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const handles = Array.from(html.matchAll(/\/handle\/123456789\/(\d+)/g)).map(m => m[1]);
    const uniqueHandles = Array.from(new Set(handles));
    console.log(`\n=== Query: "${query}" ===`);
    console.log('Search Status:', res.status);
    console.log('Found Handle IDs:', uniqueHandles.slice(0, 5));

    for (const hId of uniqueHandles.slice(0, 3)) {
      const hUrl = `https://www.indiacode.nic.in/handle/123456789/${hId}?locale=en`;
      const hRes = await fetch(hUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const hHtml = await hRes.text();
      const titleMatch = hHtml.match(/<title>(.*?)<\/title>/s);
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'No Title';
      console.log(`  Handle ${hId}: ${title}`);

      const matches = Array.from(hHtml.matchAll(/\/bitstream\/123456789\/[^\s"'<>]+/g));
      const bitstreams = Array.from(new Set(matches.map(m => m[0])));
      for (const b of bitstreams) {
        const bUrl = 'https://www.indiacode.nic.in' + b;
        try {
          const bRes = await fetch(bUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const buf = Buffer.from(await bRes.arrayBuffer());
          const isPdf = buf.slice(0, 4).toString() === '%PDF';
          console.log(`    Bitstream: ${bUrl} -> Status: ${bRes.status}, isPdf: ${isPdf}, size: ${buf.length}`);
        } catch (err: any) {
          console.log(`    Bitstream Error: ${bUrl}`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.log(`Error searching "${query}":`, err.message);
  }
}

async function main() {
  const queries = [
    'karnataka land revenue act 1964',
    'karnataka rent act 1999',
    'karnataka shops commercial establishments act 1961',
    'karnataka stamp act 1957',
    'karnataka transparency public procurement act 1999'
  ];
  for (const q of queries) {
    await searchIndiaCode(q);
  }
}
main();
