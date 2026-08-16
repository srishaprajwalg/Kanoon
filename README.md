# Kanoon AI - Plain-Language Legal Documentation Assistant for India 🇮🇳

**Kanoon AI** is an intelligent, privacy-first legal documentation assistant built for individuals, tenants, freelancers, and small business owners (MSMEs) in India. It simplifies legal jargon into plain English, drafts legally binding contracts grounded in verified statutory provisions, flags hidden risk traps, and provides state-wise e-Stamp duty compliance guidance.

---

## 🏛️ Phase 2 Production Statutory RAG Architecture

Kanoon AI implements a **Ground Truth Legal Retrieval-Augmented Generation (RAG)** architecture using codified statutory text directly from **India Code** (Ministry of Law & Justice, Govt. of India).

```
Authentic India Code Statutory Chunks
               ↓
   Vector & Keyword Indexing (Hybrid Engine)
               ↓
  User Request + Template & State Metadata
               ↓
 Dense Embedding & Lexical Similarity Scoring
               ↓
 Metadata Filtering (Category + Jurisdiction)
               ↓
 Score Thresholding (minScoreThreshold >= 0.25)
               ↙                             ↘
  [Sufficient Evidence]             [Insufficient Evidence]
           ↓                                   ↓
 Pass Chunks to Gemini               Flag Warning & Suppress
 Grounded Generation                  Fake Section Citations
           ↓                                   ↓
 Citation Mapping + India            "Insufficient Statutory
 Code Provenance URLs                Evidence Found" Warning
```

### Key Technical Pillars:
1. **India Code Statutory Corpus**: Ingests codified provisions from central and state enactments (*Indian Contract Act 1872*, *Transfer of Property Act 1882*, *Registration Act 1908*, *Information Technology Act 2000*, *Consumer Protection Act 2019*, *Maharashtra Rent Control Act 1999*, *Model Tenancy Act 2021*, *Specific Relief Act 1963*, *Arbitration Act 1996*).
2. **Dense Embedding & Vector Similarity**: Evaluates query relevance using cosine vector similarity with category weighting.
3. **Official Provenance Metadata**: Every citation rendered links directly to the official government URI on `indiacode.nic.in` with section numbers, chapter titles, act numbers, and enactment years.
4. **Anti-Hallucination Guardrail**: Enforces strict confidence thresholding (`minScoreThreshold = 0.25`). If the statutory evidence is insufficient, the system explicitly returns `"Insufficient statutory evidence was retrieved..."` instead of fabricating fake statutory citations.
5. **Hybrid Risk Analysis**: Combines Gemini LLM contextual risk inspection with a deterministic rule engine to flag high-risk traps (unlimited indemnity, unilateral termination, post-employment non-compete) and provide safer alternative clauses.

---

## ✨ Features

- **Smart Plain-Language Legal Drafter**: Guided form-based contract creation (Leave & License Rent Agreements, NDAs, Service Agreements, Employment Contracts, Partnership Deeds, Demand Notices) with layman summaries.
- **AI Legalese Translator & Trap Detector**: Translates complex clauses into plain terms and flags high-risk traps (unlimited indemnity, unilateral termination, unfair penalty clauses).
- **Indian Legal Reference Database**: Searchable statutes repository covering central and state legislation with official India Code URIs.
- **State Stamp Duty & Registration Guide**: State-specific stamp paper values (Maharashtra, Karnataka, Delhi NCR, Tamil Nadu, Telangana, Gujarat, West Bengal) and lease registration mandates.
- **Verified Legal Advice Hub**: Directory of verified Bar Council advocates with professional profiles and consultation booking.
- **Hackathon Presentation Deck**: Built-in slide deck summarizing problem statement, technical architecture, and societal impact.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Custom Dark Glassmorphic Design System)
- **Icons & UI**: Lucide React
- **PDF Export**: jsPDF
- **RAG Engine**: Dense Embedding Cosine Vector Similarity + India Code Provenance Links
- **AI Backend**: Express + `@google/genai` (Google Gemini 2.5) with strict RAG grounding system prompts

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

# Start development server
npm run dev

# Start backend server
npm run server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Data Privacy & DPDP Compliance

Kanoon AI operates with client-side state handling and local browser storage (`localStorage`) for API keys. It adheres to India's **Digital Personal Data Protection (DPDP) Act 2023** principles.

---

## ⚖️ Legal Disclaimer

*Kanoon AI is designed to assist individuals and small businesses in drafting plain-language agreements and understanding legal terminology under Indian law. It is an automated software tool and does not provide formal attorney-client privileged legal representation. For complex litigation or court disputes, please consult a verified Advocate.*
