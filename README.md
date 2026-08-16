# Kanoon AI — Plain-Language Grounded Legal Documentation Assistant for India 🇮🇳

**Kanoon AI** is a document-grounded Retrieval-Augmented Generation (RAG) legal assistant built for individuals, tenants, freelancers, and small businesses (MSMEs) in India. Kanoon simplifies complex legal jargon into plain English, drafts legally grounded contracts, reviews uploaded legal documents for hidden risks, provides safer alternative clauses, and provides verified official statutory references from government sources.

---

## 🏛️ Project Overview

Kanoon AI serves three main capabilities:
1. **Understanding Legal Documents**: Upload existing contracts or notices to receive plain-language summaries, key terms, risk scores, and flagged clauses.
2. **Drafting Legal Contracts**: Step-by-step document drafting for lease agreements, NDAs, employment contracts, and notices grounded in relevant statutory laws.
3. **Grounded Statutory References**: Instant access to verified, immutable official government statutory sources (Central India Code & Karnataka State Enactments) with cryptographic provenance.

---

## ⭐ Core Features

### 1. Document Summarizer & Reviewer
- Uploads and analyzes legal documents (PDF/Text).
- Extracts plain-language key takeaways, critical obligations, and risk levels.
- Flags high-risk clauses (unlimited liability, unilateral termination) and suggests safer alternatives.

### 2. Smart Document Drafter
- Generates legally sound agreements from structured user inputs.
- Incorporates **Context-Aware Statutory References** that adapt dynamically to the document scenario.
- Calculates pre-generation input completeness and provides state-specific stamp duty and registration guidelines.

### 3. Official Statutory References & Deep Provenance
- Displays official government source URIs (`indiacode.nic.in` and `dpar.karnataka.gov.in`) and direct PDF links.
- Statutory metadata, page numbers, Act numbers, and 64-character SHA-256 hashes are maintained via `statutoryRegistry.ts`.
- **Zero invented URLs**: All citation links originate from verified government registries.

### 4. ONE Unified Legal Chatbot
- **Single Chatbot Interface**: ONE unified legal chatbot handles all legal queries without forcing users to manually choose between Central/Union or State law modes.
- **Multi-Corpus RAG Search**: Internally queries both **Union / Central Laws** and **Karnataka State Laws**.
- **Automated Jurisdiction Scoping**: Automatically detects jurisdictional context (e.g., Bengaluru, Karnataka, or India-wide) and retrieves matching statutes.
- **Evidence-Grounded Responses**: AI answers are generated strictly using retrieved statutory chunks as context.
- **Strict Evidence Guardrails**: If retrieval returns insufficient statutory evidence (confidence score < 0.38), the system suppresses section claims and warns the user instead of fabricating legal knowledge.

---

## 📐 RAG Architecture

Kanoon AI implements a dense semantic RAG pipeline using local sentence transformer vector embeddings (`Xenova/all-MiniLM-L6-v2`, 384 dimensions) combined with Google Gemini for grounded text generation.

```
       User Question / SmartDrafter Document Scenario
                             ↓
                 Existing Kanoon RAG Engine
                             ↓
             Local Processed Legal Corpus Index
                             ↓
          Union/Central + Karnataka Statutory Chunks
                             ↓
     Relevance / Jurisdiction / Document-Context Filtering
                             ↓
                    Grounded AI Generation
                             ↓
       Statutory Citations + Verified Official Sources & PDFs
```

> [!IMPORTANT]
> **No External Web Search**: The RAG engine operates entirely on the local processed statutory corpus (`corpus/processed/ingestedCorpus.json`). It does **NOT** use live web searches, Google Search, or Bing search as a legal knowledge source.

---

## 🎯 SmartDrafter Context-Aware Citations

The SmartDrafter reference panel dynamically filters statutory citations based on the active drafting scenario:
- **Document / Template Type**: Maps template scenarios (e.g. `rent_agreement`, `nda_agreement`, `employment_contract`) to valid legal categories.
- **Jurisdiction / State**: Applies strict state multipliers. Non-matching state laws (e.g., Karnataka Rent Act when drafting for Maharashtra) receive a `0.0` relevance score and are excluded.
- **Document Metadata & Rider Clauses**: Incorporates document title, custom clauses, selected clause riders, and user modifications into the vector query.
- **Deduplication by Act**: Groups retrieved statutory chunks by Act short title and returns up to 5 distinct, highly relevant governing Acts rather than repeating sections from a single Act.
- **Fallback Handling**: If no citations pass the minimum confidence threshold, the panel clearly displays *"No directly relevant statutory references found"* alongside an evidence warning banner.

---

## 📚 Legal Corpus Coverage

Kanoon operates on an indexed legal corpus categorized into two distinct jurisdictions:

1. **Union / Central Laws** (Applies across India):
   - Indian Contract Act, 1872
   - Transfer of Property Act, 1882
   - Registration Act, 1908
   - Information Technology Act, 2000
   - Consumer Protection Act, 2019
   - Commercial Courts Act, 2015
   - Arbitration & Conciliation Act, 1996
   - Specific Relief Act, 1963

2. **Karnataka State Laws** (Applies for Karnataka / Bengaluru scenarios):
   - Karnataka Rent Act, 1999
   - Karnataka Stamp Act, 1957
   - Karnataka Shops & Commercial Establishments Act, 1961
   - Karnataka Land Revenue Act, 1964
   - Karnataka Transparency in Public Procurements Act, 1999

All corpus entries originate from official government PDFs located in `corpus/raw/` and are indexed in `corpus/processed/ingestedCorpus.json`.

---

## 🛡️ Grounding & Safety Principles

- **LLM is Not the Source**: The LLM (Google Gemini) is treated purely as a synthesis engine, not a legal knowledge repository.
- **Strict Evidence Thresholding**: RAG searches enforce a minimum similarity threshold (`0.38`). Queries lacking sufficient context yield an explicit warning rather than hallucinated sections.
- **Immutable Provenance**: Statutory section numbers, Act titles, source URIs, and PDF page links are fetched directly from indexed metadata, never dynamically invented.

---

## 🧰 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **PDF Generation & Capture**: jsPDF, html2canvas
- **Local Embedding & Vector Search**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384D ONNX local embeddings)
- **AI Synthesis Backend**: Node.js, Express, `@google/genai` (Google Gemini 2.5 Flash)
- **Corpus Parsing**: `pdf-parse`, SHA-256 cryptographic hashing (`crypto`)

---

## 📁 Project Structure

```
Kanoon/
├── corpus/
│   ├── raw/                        # Official Government Source PDFs (13 Acts)
│   └── processed/
│       └── ingestedCorpus.json     # 384D Vector-Indexed Statutory Chunks & Provenance
├── server/
│   └── index.ts                    # Backend API Server (Express + Gemini Integration)
├── src/
│   ├── components/
│   │   ├── DocumentReviewer.tsx    # Uploaded Document Summarizer & Risk Analyzer
│   │   ├── SmartDrafter.tsx        # Step-by-Step Contract Drafter with Citation Panel
│   │   ├── LegalChatbot.tsx        # Unified Legal Chatbot Interface
│   │   └── Header.tsx              # Application Navigation Header
│   ├── services/
│   │   ├── ragEngine.ts            # Core RAG Retrieval, Scoring & Citation Filtering
│   │   ├── aiService.ts            # Client API Service & Gemini Synthesis Bridge
│   │   └── embeddingService.ts     # ONNX 384D Dense Vector Embedding Generator
│   ├── data/
│   │   ├── legalCorpus.ts          # In-memory Statutory Chunks & Category Metadata
│   │   ├── statutoryRegistry.ts    # Official Government Source URLs & PDF Registry
│   │   └── documentTemplates.ts   # Document Templates & Standard Clause Riders
│   ├── types/
│   │   └── index.ts                # TypeScript Interfaces & Data Models
│   ├── App.tsx                     # Main Application Container & Tab Router
│   └── main.tsx                    # React Entry Point
├── scripts/
│   ├── testCorpusAuthenticity.ts   # SHA-256 Hash Verification Script
│   ├── testExtractionIntegrity.ts  # Chunk Extraction Integrity Verifier
│   └── testE2EValidation.ts        # End-to-End Problem Statement Verification Suite
├── package.json
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+) and `npm`
- Google Gemini API key configured in `.env` (`GEMINI_API_KEY=...`)

### Available Commands

```bash
# 1. Install dependencies
npm install

# 2. Run Backend API Server (Port 5000)
npm run server

# 3. Start Frontend Development Server (Port 5173) in a separate terminal
npm run dev

# 4. Build Production Bundle
npm run build

# 5. Preview Production Build locally
npm run preview

# 6. Run Code Linter
npm run lint
```

---

## 🧪 Testing & Validation Scripts

The repository includes verification scripts to validate corpus integrity and retrieval accuracy:

```bash
# Verify 64-character SHA-256 hashes of raw government PDFs against ingested metadata
npx tsx scripts/testCorpusAuthenticity.ts

# Verify section extraction integrity and chunk completeness
npx tsx scripts/testExtractionIntegrity.ts

# Run End-to-End scenario verification suite
npx tsx scripts/testE2EValidation.ts
```

---

## ⚖️ Hackathon Scope & Disclaimer

- **Hackathon Prototype**: Kanoon AI is built as a hackathon prototype demonstrating verifiable legal RAG architecture for Indian law.
- **Corpus Coverage**: Statutory knowledge is scoped to the indexed 13 enactments (Union/Central laws and Karnataka State laws).
- **Disclaimer**: *Kanoon AI is an automated legal documentation assistant designed to help users draft agreements and understand statutory provisions. It does not provide formal legal advice or substitute for a qualified legal practitioner.*
