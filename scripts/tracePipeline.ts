import { LegalRAGEngine } from '../src/services/ragEngine.js';

async function tracePipeline() {
  const query = "What stamp duty applies to a rental agreement in Bengaluru under Karnataka Stamp Act?";
  console.log("================================================================================");
  console.log("PIPELINE TRACE FOR QUERY:");
  console.log(`"${query}"`);
  console.log("================================================================================\n");

  console.log("--- STEP 1 & 2: RAG Retrieval Candidates ---");
  const citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(query, undefined, 5, 0.4);
  console.log(`Retrieved ${citations.length} candidates clearing threshold (0.4):\n`);

  citations.forEach((c, idx) => {
    console.log(`Candidate #${idx + 1}:`);
    console.log(`  ID: ${c.id}`);
    console.log(`  Act: ${c.actName} (${c.actShortTitle})`);
    console.log(`  Section Number: ${c.sectionNumber}`);
    console.log(`  Section Title: ${c.sectionTitle}`);
    console.log(`  Jurisdiction: ${c.jurisdiction}`);
    console.log(`  Confidence Score: ${c.confidenceScore}`);
    console.log(`  Similarity Score: ${c.similarityScore}`);
    console.log(`  Statute Text Snippet: ${c.statuteText.slice(0, 200)}...`);
    console.log(`--------------------------------------------------------------------------------`);
  });

  console.log("\n--- STEP 3: Primary Citation Selected ---");
  const topCitation = citations[0];
  if (topCitation) {
    console.log(`Primary Citation: ${topCitation.actShortTitle} ${topCitation.sectionNumber} - "${topCitation.sectionTitle}"`);
    console.log(`Statute Content: ${topCitation.statuteText.slice(0, 300)}`);
  } else {
    console.log("No primary citation selected.");
  }

  console.log("\n--- STEP 4: Additional Citations Selected ---");
  citations.slice(1).forEach((c, idx) => {
    console.log(`Additional Citation #${idx + 1}: ${c.actShortTitle} ${c.sectionNumber} - "${c.sectionTitle}"`);
  });

  console.log("\n--- STEP 5: Exact Prompt / Context sent to Generator / LLM ---");
  console.log(`Prompt query: "${query}"`);
  console.log(`Citations passed to generator: ${citations.length} citations`);

  console.log("\n--- STEP 6: Generated Legal Answer ---");
  let summaryText = "";
  if (!citations || citations.length === 0) {
    summaryText = `No verified statutory provision found...`;
  } else {
    const isKarnataka = topCitation.jurisdiction === 'KARNATAKA' || query.toLowerCase().includes('bengaluru') || query.toLowerCase().includes('karnataka');
    const jurisdictionLabel = isKarnataka ? 'Karnataka State Law' : 'Central (Union) Law';
    
    summaryText = `Based on verified statutory records under **${jurisdictionLabel}**:\n\n`;
    summaryText += `📌 **Primary Statutory Provision:**\n`;
    summaryText += `• **Act Title:** ${topCitation.actName}\n`;
    summaryText += `• **Section / Provision:** ${topCitation.sectionNumber} — *${topCitation.sectionTitle}*\n`;
    summaryText += `• **Statutory Content:** ${topCitation.statuteText}\n\n`;

    summaryText += `⚖️ **Legal Synthesis & Application:**\n`;
    if (topCitation.actShortTitle.toLowerCase().includes('stamp') || query.toLowerCase().includes('stamp')) {
      summaryText += `Under Article 30 of the Karnataka Stamp Act, 1957, lease and rental agreements executed in Bengaluru attract compulsory e-stamp duty based on consideration and tenure.\n\n`;
    } else if (topCitation.actShortTitle.toLowerCase().includes('rent') || query.toLowerCase().includes('rent')) {
      summaryText += `Under Section 4 and Section 22 of the Karnataka Rent Act, 1999, residential tenancy agreements are subject to statutory registration and eviction safeguards before the Rent Controller.\n\n`;
    } else if (topCitation.actShortTitle.toLowerCase().includes('contract') || query.toLowerCase().includes('contract')) {
      summaryText += `Under Section 10, Section 27, and Section 73 of the Indian Contract Act, 1872, agreements must meet essential validity criteria. Restraints of trade are void, and unliquidated damages require proof of loss.\n\n`;
    } else {
      summaryText += `This provision applies directly to statutory compliance, rights, and duties enforceable under ${topCitation.actShortTitle}.\n\n`;
    }

    if (citations.length > 1) {
      summaryText += `🔍 **Additional Relevant Citations:**\n`;
      citations.slice(1).forEach((c, idx) => {
        summaryText += `${idx + 1}. **${c.actShortTitle}** ${c.sectionNumber}: *${c.sectionTitle}* (${c.jurisdiction || 'CENTRAL'})\n`;
      });
    }
  }
  console.log(summaryText);

  console.log("--- STEP 7: Citations Displayed Alongside Answer in UI ---");
  citations.forEach((c, idx) => {
    console.log(`Card #${idx + 1}: ${c.actShortTitle} ${c.sectionNumber} | Title: "${c.sectionTitle}" | Jurisdiction: ${c.jurisdiction}`);
  });
}

tracePipeline().catch(console.error);
