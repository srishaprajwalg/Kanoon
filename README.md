# Kanoon AI - Plain-Language Legal Documentation Assistant for India 🇮🇳

**Kanoon AI** is an intelligent, privacy-first legal documentation assistant built for individuals, tenants, freelancers, and small business owners (MSMEs) in India. It simplifies legal jargon into plain English, drafts legally binding contracts, flags hidden risk traps, and provides state-wise e-Stamp duty compliance guidance.

---

## ✨ Features

- **Smart Plain-Language Legal Drafter**: Guided form-based contract creation (Leave & License Rent Agreements, NDAs, Service Agreements, Employment Contracts, Partnership Deeds, Demand Notices) with layman summaries.
- **AI Legalese Translator & Trap Detector**: Translates complex clauses into plain terms and flags high-risk traps (unlimited indemnity, unilateral termination, unfair penalty clauses).
- **Indian Legal Reference Database**: Searchable statutes repository covering *Indian Contract Act 1872*, *Transfer of Property Act 1882*, *Consumer Protection Act 2019*, *IT Act 2000*, *BNS 2023*, and *RERA 2016*.
- **State Stamp Duty & Registration Guide**: State-specific stamp paper values (Maharashtra, Karnataka, Delhi NCR, Tamil Nadu, Telangana, Gujarat, West Bengal) and 11-month lease registration rules.
- **Verified Legal Advice Hub**: Directory of verified Bar Council advocates with professional profiles and consultation booking.
- **Hackathon Presentation Deck**: Built-in slide deck summarizing problem statement, technical architecture, and societal impact.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Custom Dark Glassmorphic Design System)
- **Icons & UI**: Lucide React
- **PDF Export**: jsPDF
- **AI Engine**: Local Rule Engine + Optional Google Gemini LLM API integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) & npm

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/Kanoon.git
cd Kanoon

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Data Privacy & DPDP Compliance

Kanoon AI operates with client-side state handling and local browser storage (`localStorage`) for API keys. It adheres to India's **Digital Personal Data Protection (DPDP) Act 2023** principles.

---

## ⚖️ Legal Disclaimer

*Kanoon AI is designed to assist individuals and small businesses in drafting plain-language agreements and understanding legal terminology under Indian law. It is an automated software tool and does not provide formal attorney-client privileged legal representation. For complex litigation or court disputes, please consult a verified Advocate.*
