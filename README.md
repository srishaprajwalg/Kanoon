# Kanoon AI - Plain-Language Legal Documentation Assistant for India 🇮🇳

**Kanoon AI** is an intelligent, retrieval-grounded legal documentation assistant built for individuals, tenants, freelancers, and small business owners (MSMEs) in India. It simplifies legal jargon into plain English, drafts legally sound contracts grounded in verified statutory provisions from **India Code**, flags hidden risk traps, and provides state-specific e-Stamp duty and lease registration compliance guidance.

---

## 🏛️ Phase 3 Grounded Statutory RAG Architecture

Kanoon AI implements a **Single-Model Dense Semantic Retrieval-Augmented Generation (RAG)** pipeline powered by local ONNX sentence transformer inference (`Xenova/all-MiniLM-L6-v2`, 384 dimensions) and Google Gemini for grounded generation.

```
                  Authentic India Code Statutory Chunks
                                    ↓
            Local 384D Dense Vector Ingestion (all-MiniLM-L6-v2)
                                    ↓
                       Pre-Calculated Vector Cache
                                    ↓
       User Query / Document Metadata + Document Category Filter
                                    ↓
        Query Embedding (384D ONNX Model) & Cosine Similarity Ranking
                                    ↓
          Confidence Score Thresholding (MIN_CONFIDENCE_THRESHOLD = 0.35)
                                    ↙                             ↘
       [Sufficient Evidence ≥ 0.35]                       [Insufficient Evidence < 0.35]
                    ↓                                                   ↓
     Retrieved Statutory Chunks & Provenance                 Suppress Fake Citations & Display
     Passed into Gemini Grounded Prompt                      "Insufficient Statutory Evidence" Banner
                    ↓                                                   ↓
     Generated Draft + Citation Cards with                   No Hallucinated Legal Sections Invented
     Official India Code URIs & "Why this clause?"
```

### 🛠️ Core Technical Pillars

1. **Single Canonical Embedding Model**: Uses `Xenova/all-MiniLM-L6-v2` locally via ONNX execution. Generates 384-dimensional normalized float vectors for both corpus chunks and user queries without external API dependencies.
2. **Pre-Calculated Corpus Lifecycle**: Ingests and caches 384-D dense embeddings for all statutory chunks at startup, ensuring sub-10ms query retrieval without redundant re-embedding.
3. **Verified Statutory Provenance**: Ingests verbatim statutory text from official enactments (*Indian Contract Act 1872*, *Transfer of Property Act 1882*, *Registration Act 1908*, *Information Technology Act 2000*, *Consumer Protection Act 2019*, *Maharashtra Rent Control Act 1999*, *Model Tenancy Act 2021*, *Specific Relief Act 1963*, *Arbitration & Conciliation Act 1996*). Every citation links directly to government URIs on `indiacode.nic.in`.
4. **Metadata-Aware Vector Retrieval**: Combines 384D dense cosine similarity with document template category filtering and state jurisdiction scoping.
5. **Anti-Hallucination Guardrails**: Enforces a strict confidence threshold (`minThreshold = 0.35`). Queries for non-existent provisions (e.g. "Section 999 of Indian Contract Act") or out-of-domain topics (sports, weather) return 0 chunks, preventing LLM fabrication.
6. **State-Aware Tenancy Rules**: Avoids blanket claims that 11-month agreements are universally exempt from registration. Specifically enforces Maharashtra's mandatory registration requirement under Section 55 of the *Maharashtra Rent Control Act 1999*.
7. **"Why This Clause?" Rationale Cards**: Every generated statutory citation includes a metadata-derived explanation detailing why the specific legal authority was retrieved.

---

## 📊 Phase 3 Evaluation & Benchmark Metrics

Evaluated using `npx tsx scripts/evaluateRAG.ts` across 15 standard test cases (Exact Legal, Natural Language, Out-Of-Domain, Non-Existent Section Hallucination):

| Metric | Measured Value | Standard Target | Status |
| :--- | :--- | :--- | :--- |
| **Embedding Model** | `Xenova/all-MiniLM-L6-v2` (384D) | Local ONNX 384D | ✅ PASS |
| **Corpus Pre-calculation Time** | 1,314 ms (20 statutory chunks) | < 3,000 ms | ✅ PASS |
| **Single Query Embedding Latency** | 6 ms | < 50 ms | ✅ PASS |
| **Average Retrieval Latency** | 8 ms | < 20 ms | ✅ PASS |
| **Top-1 Statutory Precision** | **80%** (8 / 10 queries) | ≥ 75% | ✅ PASS |
| **Top-K Statutory Recall** | **100%** (10 / 10 queries) | ≥ 90% | ✅ PASS |
| **Out-Of-Domain Rejection Rate** | **100%** (5 / 5 queries rejected) | 100% | ✅ PASS |
| **Anti-Hallucination Section 999 Test** | **PASS** (0 fake sections invented) | 0 Fabrications | ✅ PASS |
| **TypeScript / Vite Build** | **0 Errors** (`npm run build`) | 0 Errors | ✅ PASS |

---

## ✨ Key Features

- **Smart Plain-Language Legal Drafter**: Guided form-based contract creation (Leave & License Rent Agreements, NDAs, Service Agreements, Employment Contracts, Partnership Deeds, Demand Notices) with layman summaries.
- **AI Legalese Translator & Trap Detector**: Translates complex clauses into plain terms and flags high-risk traps (unlimited indemnity, unilateral termination, unfair penalty clauses).
- **Indian Legal Reference Database**: Searchable statutory corpus with official India Code URIs.
- **State Stamp Duty & Registration Guide**: State-specific stamp paper values (Maharashtra, Karnataka, Delhi NCR, Tamil Nadu, Telangana, Gujarat, West Bengal) and lease registration mandates.
- **Verified Legal Advice Hub**: Directory of verified Bar Council advocates with professional profiles and consultation booking.
- **Hackathon Presentation Deck**: Built-in slide deck summarizing problem statement, technical architecture, and societal impact.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Dark Glassmorphic Design System)
- **Icons & UI**: Lucide React
- **PDF Export**: jsPDF
- **Local Dense RAG Engine**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384D ONNX Dense Vector Embeddings + Cosine Similarity)
- **AI Backend**: Express + Node.js + `@google/genai` (Google Gemini 2.5) with statutory grounding system prompts

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) & npm

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/srishaprajwalg/Kanoon.git
cd Kanoon

# Install dependencies
npm install

# Run RAG Evaluation Benchmark Suite
npx tsx scripts/evaluateRAG.ts

# Run End-to-End API Validation Suite
npx tsx scripts/testEndToEnd.ts

# Start development server & backend
npm run dev
npm run server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Data Privacy & Security

- **Server-Side API Key Storage**: `GEMINI_API_KEY` is restricted strictly to the Express server environment (`.env`). No secret keys are exposed in frontend bundles.
- **DPDP Act Compliance**: Client state operates with local browser storage (`localStorage`) and adheres to India's **Digital Personal Data Protection (DPDP) Act 2023** principles.

---

## ⚖️ Legal Disclaimer

*Kanoon AI is an automated legal documentation assistant designed to help individuals and small businesses draft plain-language agreements and understand statutory provisions under Indian law. It provides AI-assisted statutory documentation and does not constitute formal attorney-client legal advice.*
