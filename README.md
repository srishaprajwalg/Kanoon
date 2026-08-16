# Kanoon AI — Plain-Language Grounded Legal Documentation Assistant for India 🇮🇳

**Kanoon AI** is a fully verifiable, document-grounded Retrieval-Augmented Generation (RAG) legal assistant built for individuals, tenants, freelancers, and small businesses (MSMEs) in India. Kanoon simplifies complex legal jargon into plain English, drafts legally sound contracts grounded strictly in **official government statutory PDFs** (Central India Code & Karnataka State Enactments), flags hidden legal traps, provides safer alternative clauses, and guides users through state-specific e-Stamp duty and lease registration compliance.

---

## 🏛️ Architecture & Document-Grounded RAG Pipeline

Kanoon AI implements a **Single-Model Dense Semantic Retrieval-Augmented Generation (RAG)** pipeline powered by local ONNX sentence transformer inference (`Xenova/all-MiniLM-L6-v2`, 384 dimensions) and Google Gemini for grounded generation.

```
              Official Government Statutory PDFs (corpus/raw/*.pdf)
                                        ↓
                  pdf-parse Section-Aware Page-Level Extraction
                                        ↓
               Cryptographic SHA-256 Hash & Provenance Generation
                                        ↓
              Local 384D Dense Vector Ingestion (all-MiniLM-L6-v2)
                                        ↓
                  Persisted Corpus Index (ingestedCorpus.json)
                                        ↓
         User Query / Input Form Data + Jurisdiction & Category Filtering
                                        ↓
          384D Cosine Similarity Vector Search & Metadata Ranking
                                        ↓
            Confidence Score Thresholding (MIN_CONFIDENCE_THRESHOLD = 0.38)
                                        ↙                             ↘
         [Sufficient Evidence ≥ 0.38]                       [Insufficient Evidence < 0.38]
                      ↓                                                   ↓
       Retrieved Statutory Chunks & Provenance                 Suppress Section Citations & Display
       Passed into Gemini Grounded Prompt                      "Insufficient Statutory Evidence" Banner
                      ↓                                                   ↓
       Generated Draft + Citation Cards with                   No Hallucinated Legal Sections Invented
       Official Source URIs, SHA-256 & Page Numbers
```

---

## 🛠️ Core Technical Pillars

1. **Official-Source Government Corpus**: All legal knowledge is extracted directly from 13 immutable official government PDFs in `corpus/raw/` (Central enactments from *India Code* and Karnataka enactments from *DPAR Karnataka*). **Zero synthetic or hardcoded legal text is used.**
2. **Deep Provenance & SHA-256 Immutability**: Every ingested statutory chunk in `corpus/processed/ingestedCorpus.json` contains:
   - 64-character cryptographic SHA-256 checksum of the source PDF.
   - Exact PDF page numbers where the section appears.
   - Tier 1 Government URL (e.g. `indiacode.nic.in` or `dpar.karnataka.gov.in`).
   - Official document title, Act number, year, and jurisdiction (`CENTRAL` vs. `KARNATAKA`).
3. **Single Canonical Embedding Model**: Uses `Xenova/all-MiniLM-L6-v2` locally via ONNX execution. Generates 384-dimensional normalized float vectors for both corpus chunks and user queries without external embedding API dependencies.
4. **Jurisdiction-Aware Retrieval**: Scopes retrieval dynamically between Central laws (applying across India) and Karnataka state laws (applying when Karnataka/Bengaluru context is detected), preventing cross-state legal leaks.
5. **Anti-Hallucination Guardrails**: Enforces a strict confidence threshold (`minThreshold = 0.38`). Queries for non-existent provisions or out-of-domain topics (sports, entertainment) return 0 chunks with an explicit warning banner, preventing section fabrication.
6. **Pre-Generation Input Validation**: Inspects incoming document request forms (`POST /api/validate-inputs`), flags missing critical/recommended fields (e.g. missing party names or consideration), calculates a completeness score (0–100), and provides state-specific registration advice.
7. **Clause Risk Inspection & Safer Alternatives**: Analyzes individual clauses (`POST /api/analyze-clause`) for unconscionable legal terms (unlimited indemnity, unilateral immediate termination, void non-compete clauses under Section 27 of Indian Contract Act 1872) and generates balanced, safer alternative clauses.

---

## 📚 Official Legal Corpus Coverage (13 Acts, 2,098 Chunks, 704 Pages)

| Act Title | Jurisdiction | PDF Filename | Page Count | Chunks Ingested | Official Source Tier |
|---|---|---|---|---|---|
| **Indian Contract Act, 1872** | `CENTRAL` | `indian_contract_act_1872.pdf` | 53 | 283 | Tier 1 (India Code) |
| **Transfer of Property Act, 1882** | `CENTRAL` | `transfer_of_property_act_1882.pdf` | 57 | 115 | Tier 1 (India Code) |
| **Registration Act, 1908** | `CENTRAL` | `registration_act_1908.pdf` | 64 | 147 | Tier 1 (India Code) |
| **Information Technology Act, 2000** | `CENTRAL` | `information_technology_act_2000.pdf` | 36 | 144 | Tier 1 (India Code) |
| **Consumer Protection Act, 2019** | `CENTRAL` | `consumer_protection_act_2019.pdf` | 39 | 114 | Tier 1 (India Code) |
| **Commercial Courts Act, 2015** | `CENTRAL` | `commercial_courts_act_2015.pdf` | 24 | 78 | Tier 1 (India Code) |
| **Arbitration & Conciliation Act, 1996** | `CENTRAL` | `arbitration_and_conciliation_act_1996.pdf` | 52 | 215 | Tier 1 (India Code) |
| **Specific Relief Act, 1963** | `CENTRAL` | `specific_relief_act_1963.pdf` | 17 | 67 | Tier 1 (India Code) |
| **Karnataka Land Revenue Act, 1964** | `KARNATAKA` | `karnataka_land_revenue_act_1964.pdf` | 145 | 423 | Tier 1 (DPAR Karnataka) |
| **Karnataka Rent Act, 1999** | `KARNATAKA` | `karnataka_rent_act_1999.pdf` | 63 | 97 | Tier 1 (DPAR Karnataka) |
| **Karnataka Shops & Establishments Act, 1961** | `KARNATAKA` | `karnataka_shops_and_commercial_establishments_act_1961.pdf` | 33 | 80 | Tier 1 (DPAR Karnataka) |
| **Karnataka Stamp Act, 1957** | `KARNATAKA` | `karnataka_stamp_act_1957.pdf` | 108 | 301 | Tier 1 (DPAR Karnataka) |
| **Karnataka Transparency in Public Procurements Act, 1999** | `KARNATAKA` | `karnataka_transparency_in_public_procurements_act_1999.pdf` | 13 | 34 | Tier 1 (DPAR Karnataka) |

---

## ⚡ API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | System status, embedding model specs (384D ONNX), and RAG readiness. |
| `/api/validate-inputs` | `POST` | Pre-generation missing field detector, validation score (0–100), and compliance suggestions. |
| `/api/rag-search` | `GET` | Dense vector semantic search against statutory corpus with jurisdiction filtering and confidence thresholding. |
| `/api/generate-document` | `POST` | Full legal document generator grounded in retrieved statutory chunks, risk scoring, and citations. |
| `/api/analyze-clause` | `POST` | Standalone clause risk inspector flagging traps and suggesting safer alternative clauses. |

---

## 🧪 Pipeline Validation & Test Suites

Kanoon includes forensic verification and automated testing scripts:

1. **`scripts/testCorpusAuthenticity.ts`**:
   - Calculates the 64-character SHA-256 checksum for all 13 source PDFs in `corpus/raw/`.
   - Validates 100% hash match against index metadata in `ingestedCorpus.json`.
2. **`scripts/testExtractionIntegrity.ts`**:
   - Verifies section extraction across all 13 Acts, confirming 0 orphan chunks and 0 empty text sections.
3. **`scripts/testE2EValidation.ts`**:
   - Validates 5 core Problem Statement scenarios end-to-end:
     - **Scenario 1**: Incomplete Input Validation & Tenancy Agreement Generation (Bengaluru).
     - **Scenario 2**: Commercial Lease Risk Analysis & Safer Alternative Clause Generation.
     - **Scenario 3**: Proprietary NDA Generation & IT Act Grounding.
     - **Scenario 4**: Standalone Clause Risk Analysis (`/api/analyze-clause`).
     - **Scenario 5**: Out-of-Domain Non-Legal Query Rejection.

---

## 🧰 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS / Custom Dark Glassmorphism
- **UI & Icons**: Lucide React
- **PDF Export**: jsPDF + html2canvas
- **Local Dense Vector RAG Engine**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384D ONNX Dense Vector Embeddings + Cosine Similarity)
- **AI Backend**: Node.js + Express + `@google/genai` (Google Gemini 2.5 Flash) with statutory grounding prompts

---

## 🚀 Setup and Run Instructions

### Prerequisites
- Node.js (v18+) & npm

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/srishaprajwalg/Kanoon.git
cd Kanoon

# 2. Install dependencies
npm install

# 3. Run Corpus Authenticity Verification
npx tsx scripts/testCorpusAuthenticity.ts

# 4. Run Section Extraction Integrity Check
npx tsx scripts/testExtractionIntegrity.ts

# 5. Run End-to-End Problem Statement Validation Suite
npx tsx scripts/testE2EValidation.ts

# 6. Start the Backend API Server (Port 5000)
npm run server

# 7. Start the Frontend Development Server (Port 5173) in another terminal
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔍 Current Limitations

- **Jurisdiction Scope**: The current corpus specifically covers Central / India-Wide laws and Karnataka State laws. Queries specifying other states (e.g. Maharashtra) retrieve relevant Central law principles with state-specific statutory notices.
- **Initial Model Download**: The first startup of the backend server downloads the ONNX weights for `Xenova/all-MiniLM-L6-v2` (~90MB) into local cache.
- **Vite Chunk Size Warning**: Bundling `@xenova/transformers` in Vite generates a chunk size warning during production build (`npm run build`), which is expected for ONNX browser runtime bundles.

---

## ⚖️ Legal Disclaimer

*Kanoon AI is an automated legal documentation assistant designed to help individuals and small businesses draft plain-language agreements and understand statutory provisions under Indian law. It provides AI-assisted statutory documentation grounded in official government sources and does not constitute formal attorney-client legal advice.*
