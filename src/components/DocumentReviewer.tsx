import React, { useState } from 'react';
import {
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { KanoonAIService } from '../services/aiService';
import type { DocumentReviewReport, ReviewedClauseAnalysis, LegalRiskBrief, AdvocateProfile } from '../types';
import { generateBriefFromReviewReport } from '../services/briefGenerator';
import { LegalRiskBriefModal } from './LegalRiskBriefModal';
import { ReadAloudButton } from './ReadAloudButton';

interface DocumentReviewerProps {
  onNavigateToExpert?: (advocate?: AdvocateProfile) => void;
}

const SAMPLE_DOCUMENTS = [
  {
    title: 'Commercial Lease Agreement (High-Risk Traps)',
    desc: 'Contains unilateral exit, unlimited indemnity, excessive lock-in, and missing deposit refund terms.',
    type: 'rent_agreement',
    text: `COMMERCIAL LEASE AGREEMENT

THIS LEASE AGREEMENT is entered into on 15th January 2026 at Bengaluru, Karnataka.

BETWEEN:
M/s Apex Realty Enterprises ("Lessor / Owner")
AND
TechVentures Solutions Pvt Ltd ("Lessee / Tenant")

1. DEMISED PREMISES & RENT:
The Lessee agrees to pay a monthly rent of Rs. 1,500,000 for office space in Indiranagar, Bengaluru.

2. UNLIMITED INDEMNITY CLAUSE:
The Lessee shall indemnify, defend, and hold harmless the Lessor, its directors, and agents from and against any and all claims, damages, liabilities, losses, costs, and expenses, including unlimited attorney fees, arising out of or related to the Lessee's occupancy or any third-party claims, without any monetary cap.

3. LOCK-IN PERIOD & UNILATERAL TERMINATION:
The lease shall have a binding lock-in period of 36 months. Neither party can exit during the lock-in period. However, the Lessor reserves the right to terminate this lease immediately at its sole discretion without prior notice if the Lessor requires the property for personal use.

4. SECURITY DEPOSIT FORFEITURE:
The Lessee shall deposit Rs. 9,000,000 as security deposit. Upon termination, the Lessor may forfeit the entire security deposit as liquidated damages without proof of actual property loss.

5. NON-COMPETE RESTRICTION:
For a period of 2 years after lease termination, the Lessee shall not operate a competing technology software business within a 10 km radius of the demised premises.`
  },
  {
    title: 'Non-Disclosure Agreement (NDA) with Liability Risk',
    desc: 'Contains missing carve-outs, infinite confidentiality duration, and uncapped breach indemnity.',
    type: 'nda_agreement',
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

THIS AGREEMENT is made between Alpha Corp ("Disclosing Party") and Beta Solutions ("Receiving Party").

1. CONFIDENTIAL INFORMATION:
Confidential Information means all information disclosed by Disclosing Party, including technical, financial, and business data.

2. OBLIGATIONS & DURATION:
The Receiving Party shall hold all Confidential Information in strict confidence indefinitely in perpetuity.

3. INDEMNIFICATION & DAMAGES:
The Receiving Party agrees to indemnify the Disclosing Party against all losses without limit for any disclosure whether accidental or intentional.

4. GOVERNING LAW:
Governed by the laws of India and subject to exclusive jurisdiction of courts in Bengaluru, Karnataka.`
  }
];

export const DocumentReviewer: React.FC<DocumentReviewerProps> = ({ onNavigateToExpert }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'report'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [activeInputMode, setActiveInputMode] = useState<'file' | 'text'>('file');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [report, setReport] = useState<DocumentReviewReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Brief modal state
  const [briefModalOpen, setBriefModalOpen] = useState<boolean>(false);
  const [currentBrief, setCurrentBrief] = useState<LegalRiskBrief | null>(null);

  // Clause filter & expansion states
  const [clauseRiskFilter, setClauseRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});

  const handleGenerateBrief = () => {
    if (!report) return;
    const brief = generateBriefFromReviewReport(report);
    setCurrentBrief(brief);
    setBriefModalOpen(true);
  };

  const toggleClauseExpanded = (id: string) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (selectedFile: File) => {
    setErrorMsg(null);
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum limit of 10MB.');
      return;
    }

    const lower = selectedFile.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt')) {
      setErrorMsg('Unsupported file format. Please upload a PDF, DOCX, or TXT document.');
      return;
    }

    setFile(selectedFile);
    startAnalysis(selectedFile);
  };

  const startAnalysis = async (fileInput?: File, sampleText?: string) => {
    setStep('analyzing');
    setAnalysisProgress(10);
    setProgressStatus('Extracting document text and page structure...');

    try {
      let fileData: string | undefined = undefined;
      let fileName: string = fileInput ? fileInput.name : 'Sample_Contract.txt';
      let mimeType: string = fileInput ? fileInput.type : 'text/plain';
      let documentText: string | undefined = sampleText || (activeInputMode === 'text' ? pastedText : undefined);

      if (fileInput) {
        setAnalysisProgress(25);
        setProgressStatus('Reading document contents in memory...');
        const arrayBuf = await fileInput.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fileData = btoa(binary);
      }

      setAnalysisProgress(45);
      setProgressStatus('Classifying legal document type & segmenting clauses...');

      setTimeout(() => {
        setAnalysisProgress(65);
        setProgressStatus('Querying 384D ONNX Statutory RAG Corpus (13 Indian Acts)...');
      }, 500);

      setTimeout(() => {
        setAnalysisProgress(85);
        setProgressStatus('Evaluating clause risks, missing provisions & e-Stamp mandates...');
      }, 1000);

      const reviewReport = await KanoonAIService.reviewDocument({
        fileData,
        fileName,
        mimeType,
        documentText
      });

      setAnalysisProgress(100);
      setReport(reviewReport);
      setStep('report');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to review document. Please check file integrity.');
      setStep('upload');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> CRITICAL RISK</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-600/30 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> HIGH RISK</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> MEDIUM RISK</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> LOW RISK</span>;
    }
  };

  const filteredClauses = report?.clauses.filter(c => {
    if (clauseRiskFilter === 'all') return true;
    if (clauseRiskFilter === 'high') return c.riskLevel === 'critical' || c.riskLevel === 'high';
    if (clauseRiskFilter === 'medium') return c.riskLevel === 'medium';
    if (clauseRiskFilter === 'low') return c.riskLevel === 'low';
    return true;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-legal-100 border border-legal-200 rounded-xl text-legal-700">
              <FileSearch className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-extrabold text-slate-900">Existing Document Legal Review & Audit</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-legal-600 text-white uppercase tracking-wider">
                  Phase 2 RAG Engine
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Upload existing contracts to extract text, segment clauses, query 13 verified Indian statutory Acts, and detect unconscionable legal traps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-300/60">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ephemeral Privacy-First In-Memory Processing (No DB retention)</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* STEP 1: UPLOAD WORKSPACE */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              {/* Input Mode Selector */}
              <div className="flex border-b border-slate-200 pb-4 mb-6 gap-4">
                <button
                  onClick={() => setActiveInputMode('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeInputMode === 'file'
                      ? 'bg-legal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-stone-100'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Document File (PDF / DOCX / TXT)
                </button>
                <button
                  onClick={() => setActiveInputMode('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeInputMode === 'text'
                      ? 'bg-legal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-stone-100'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Paste Contract Text Directly
                </button>
              </div>

              {activeInputMode === 'file' ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-stone-300 hover:border-legal-500 rounded-2xl p-10 text-center transition-all bg-stone-50 hover:bg-legal-50 group cursor-pointer"
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <div className="w-16 h-16 bg-legal-100 border border-legal-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-legal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Drag and drop your legal contract here</h3>
                  <p className="text-slate-600 text-sm mb-4">Supports PDF, DOCX, or TXT documents up to 10MB</p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-legal-600 hover:bg-legal-700 text-white font-bold text-sm transition-colors shadow-sm">
                    <FileSearch className="w-4 h-4" /> Choose File from Computer
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-300">PDF (.pdf)</span>
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-300">Word (.docx)</span>
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-300">Text (.txt)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste the full text of your rental agreement, NDA, employment contract, or legal notice here..."
                    className="w-full h-64 bg-white border border-stone-200 rounded-xl p-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500 font-serif resize-none"
                  />
                  <button
                    disabled={!pastedText.trim()}
                    onClick={() => startAnalysis()}
                    className="w-full py-3 bg-legal-600 hover:bg-legal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Sparkles className="w-5 h-5" /> Start Legal RAG Audit & Review
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Safeguards Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Lock className="w-4 h-4 text-emerald-400" /> Statutory Privacy & Security Guarantee
              </div>
              <p>
                Kanoon AI handles user uploaded contracts ephemerally. Documents are converted into memory objects for clause segmentation and vector searching against official government Act PDFs, then discarded. No contract content is stored on disk or written to telemetry databases.
              </p>
            </div>
          </div>

          {/* Quick-Load Sample Contracts for Testing */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-legal-600" /> Quick-Test Sample Documents
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Don't have a document on hand? Click a preset sample document below to immediately trigger full RAG review.
              </p>

              <div className="space-y-3">
                {SAMPLE_DOCUMENTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => startAnalysis(undefined, sample.text)}
                    className="w-full text-left p-3.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-legal-400 rounded-xl transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-legal-700 transition-colors">
                        {sample.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-legal-600 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{sample.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ANIMATED ANALYSIS PROGRESS */}
      {step === 'analyzing' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 bg-legal-100 border border-legal-200 rounded-full flex items-center justify-center mx-auto relative animate-pulse">
            <Scale className="w-10 h-10 text-legal-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Analyzing Document Against Statutory Corpus</h2>
            <p className="text-sm text-legal-700 font-mono font-medium">{progressStatus}</p>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
            <div
              className="bg-legal-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 border-t border-slate-200 pt-4">
            <div>1. Text Extraction</div>
            <div>2. Clause Segmentation</div>
            <div>3. RAG Grounding</div>
          </div>
        </div>
      )}

      {/* STEP 3: REPORT DASHBOARD */}
      {step === 'report' && report && (
        <div className="space-y-8">
          {/* Header Metric Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detected Contract Type</span>
                  <span className="px-2.5 py-0.5 rounded bg-legal-100 text-legal-800 text-xs font-bold border border-legal-200">
                    {(report.documentTypeConfidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-extrabold text-slate-900">{report.documentTypeLabel}</h2>
                <p className="text-xs text-slate-600">Filename: <span className="text-slate-900 font-mono font-medium">{file ? file.name : 'Uploaded_Contract'}</span> ({report.pageCount} pages, {report.clauseCount} clauses extracted)</p>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-right">
                  <div className="text-xs text-slate-600 font-bold uppercase tracking-wide">Document Safety Score</div>
                  <div className="text-3xl font-extrabold text-slate-900">{report.overallRiskScore}<span className="text-slate-500 text-sm">/100</span></div>
                </div>
                <div>{getRiskBadge(report.overallRiskLevel)}</div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleGenerateBrief}
                  className="flex items-center gap-2 px-4 py-2 bg-legal-600 hover:bg-legal-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-500 focus-visible:ring-offset-1"
                >
                  <Scale className="w-4 h-4" /> Consult Legal Expert (Generate Brief)
                </button>

                <button
                  onClick={() => { setStep('upload'); setReport(null); setFile(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-slate-700 text-sm font-bold rounded-lg border border-stone-300 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Review Another Document
                </button>
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-white">{report.clauseCount}</div>
                <div className="text-xs text-slate-600">Clauses Reviewed</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-red-400">{report.criticalIssues.length + report.highRiskIssues.length}</div>
                <div className="text-xs text-slate-600">High / Critical Traps</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-indigo-600">{report.missingClauses.length}</div>
                <div className="text-xs text-slate-600">Missing Provisions</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-blue-400">{report.citations.length}</div>
                <div className="text-xs text-slate-600">Statutory Citations</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-sm space-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Executive Legal Summary</div>
                <ReadAloudButton text={report.executiveSummary} />
              </div>
              <p>{report.executiveSummary}</p>
            </div>
          </div>

          {/* Section 1: Critical & High Risk Traps */}
          {(report.criticalIssues.length > 0 || report.highRiskIssues.length > 0) && (
            <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> High-Risk & Unconscionable Clause Traps Detected
              </h3>
              
              <div className="space-y-3">
                {[...report.criticalIssues, ...report.highRiskIssues].map((iss, i) => (
                  <div key={i} className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 text-sm">{iss.title}</span>
                      {getRiskBadge(iss.riskLevel)}
                    </div>
                    <p className="text-xs text-red-800/80 leading-relaxed">{iss.explanation}</p>
                    <div className="text-xs bg-white p-2.5 rounded-lg border border-red-100 text-red-900 font-medium">
                      <strong className="text-red-700">Shield Recommendation:</strong> {iss.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Missing Essential Clauses */}
          {report.missingClauses.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" /> Missing Statutory & Covenants Provisions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.missingClauses.map((m, i) => (
                  <div key={i} className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-sm">{m.clauseType}</span>
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {m.importance}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/80">{m.explanation}</p>
                    <div className="text-xs bg-white p-2 rounded border border-amber-100 text-slate-700 font-mono">
                      <strong className="text-amber-700">Suggested Insert:</strong> "{m.suggestedTemplate}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Inconsistencies (if any) */}
          {report.inconsistencies.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Internal Document Inconsistencies
              </h3>

              <div className="space-y-3">
                {report.inconsistencies.map((inc, i) => (
                  <div key={i} className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-1">
                    <div className="font-bold text-amber-900 text-sm">{inc.issueTitle}</div>
                    <p className="text-xs text-amber-800/80">{inc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Clause-by-Clause Review Workspace */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-legal-600" /> Clause-by-Clause Audit Workspace
                </h3>
                <p className="text-xs text-slate-600">Review ground-truth statutory evidence retrieved for each extracted clause.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200 gap-1 text-xs">
                <button
                  onClick={() => setClauseRiskFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${clauseRiskFilter === 'all' ? 'bg-legal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All ({report.clauses.length})
                </button>
                <button
                  onClick={() => setClauseRiskFilter('high')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${clauseRiskFilter === 'high' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  High / Critical ({report.criticalIssues.length + report.highRiskIssues.length})
                </button>
                <button
                  onClick={() => setClauseRiskFilter('medium')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${clauseRiskFilter === 'medium' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Medium ({report.mediumRiskIssues.length})
                </button>
                <button
                  onClick={() => setClauseRiskFilter('low')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${clauseRiskFilter === 'low' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Low ({report.clauses.filter(c => c.riskLevel === 'low').length})
                </button>
              </div>
            </div>

            {/* Clause Cards List */}
            <div className="space-y-4">
              {filteredClauses.map((clause: ReviewedClauseAnalysis) => {
                const isExpanded = Boolean(expandedClauses[clause.id]);

                return (
                  <div
                    key={clause.id}
                    className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-5 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-legal-700 bg-legal-50 px-2 py-0.5 rounded border border-legal-200">
                          {clause.sectionNumber || 'Clause'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{clause.heading}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(clause.riskLevel)}
                      </div>
                    </div>

                    {/* Original Clause Text */}
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs text-slate-800 font-serif italic">
                      <span className="text-slate-500 font-sans block text-[10px] font-bold uppercase mb-1">Original Extracted Text (Page {clause.pageNumber}):</span>
                      "{clause.originalText}"
                    </div>

                    {/* Plain Language & Risk Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-legal-50 p-3 rounded-lg border border-legal-100 text-legal-900">
                        <strong className="block text-legal-700 mb-1 font-bold">💡 In Plain English:</strong>
                        {clause.plainExplanation}
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-amber-100 text-slate-800">
                        <strong className="block text-amber-700 mb-1 font-bold">⚠️ Risk Evaluation:</strong>
                        {clause.riskExplanation}
                      </div>
                    </div>

                    {/* Safer Alternative */}
                    {clause.saferAlternative && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900">
                        <strong className="block text-emerald-700 mb-1 font-bold">🛡️ Recommended Safer Clause:</strong>
                        "{clause.saferAlternative}"
                      </div>
                    )}

                    {/* RAG Evidence Provenance Footer */}
                    <div className="border-t border-stone-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {clause.hasSufficientEvidence ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Grounded in {clause.citations.length} verified statutory provision(s)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{clause.evidenceWarning || 'Insufficient verified statutory evidence retrieved.'}</span>
                        </div>
                      )}

                      <button
                        onClick={() => toggleClauseExpanded(clause.id)}
                        className="text-legal-600 hover:text-legal-800 flex items-center gap-1 font-bold text-xs ml-auto transition-colors"
                      >
                        {isExpanded ? <>Hide Statutory Evidence <ChevronUp className="w-3.5 h-3.5" /></> : <>View Statutory Evidence ({clause.citations.length}) <ChevronDown className="w-3.5 h-3.5" /></>}
                      </button>
                    </div>

                    {/* Expanded Citations Panel */}
                    {isExpanded && (
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 mt-3">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Official India Code Ground-Truth Statutory Evidence
                        </div>

                        {clause.citations.length > 0 ? (
                          clause.citations.map((cit, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200 space-y-1 text-xs shadow-sm">
                              <div className="flex items-center justify-between text-legal-700 font-bold">
                                <span>{cit.actShortTitle} — Section {cit.sectionNumber}: {cit.sectionTitle}</span>
                                <span className="text-[10px] text-slate-500 font-mono font-medium bg-stone-100 px-1 rounded">Similarity: {((cit.similarityScore || 0) * 100).toFixed(1)}%</span>
                              </div>
                              <p className="text-slate-700 text-[11px] font-serif italic border-l-2 border-legal-200 pl-2 leading-relaxed">{cit.statuteText}</p>
                              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                                {cit.sourceUrl && (
                                  <a
                                    href={cit.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-legal-600 font-bold hover:underline"
                                  >
                                    View Official Source <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {(cit.pdfUrl || cit.sourceUrl) && (
                                  <a
                                    href={cit.pdfUrl || cit.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:underline"
                                  >
                                    View Official PDF <FileText className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-600 italic">No statutory citations met the strict similarity threshold (&gt;= 0.38) for this specific provision.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: State e-Stamp & Registration Compliance */}
          {report.complianceGuidance.length > 0 && (
            <div className="bg-white border border-legal-200 rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-legal-600" /> State Stamp Duty & Compulsory Registration Mandates
              </h3>
              
              <ul className="space-y-2 text-xs text-slate-800">
                {report.complianceGuidance.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-sm">
                    <span className="text-legal-600 font-bold">•</span>
                    <span className="leading-relaxed">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advocates Consultation CTA */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-legal-600" /> Need a Bar Council Advocate to Vett Your Contract?
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Generate an AI Legal Risk Brief containing all detected clause traps and statutory citations for lawyer handoff.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateBrief}
                className="px-5 py-2.5 bg-legal-600 hover:bg-legal-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
              >
                <Scale className="w-4 h-4" /> Consult Legal Expert
              </button>
              {onNavigateToExpert && (
                <button
                  onClick={() => onNavigateToExpert()}
                  className="px-4 py-2.5 bg-white hover:bg-stone-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 border border-stone-300 shadow-sm"
                >
                  View Directory <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legal Risk Brief Modal */}
      {briefModalOpen && currentBrief && (
        <LegalRiskBriefModal
          brief={currentBrief}
          onClose={() => setBriefModalOpen(false)}
          onSelectAdvocateInHub={(advocate) => {
            if (onNavigateToExpert) {
              onNavigateToExpert(advocate);
            }
          }}
        />
      )}
    </div>
  );
};
