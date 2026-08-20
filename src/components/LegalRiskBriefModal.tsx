import React, { useState } from 'react';
import type { LegalRiskBrief, AdvocateProfile } from '../types/index.js';
import { ADVOCATES_DIRECTORY } from '../data/expertAdvocates.js';
import { formatBriefAsText } from '../services/briefGenerator.js';
import {
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  X,
  UserCheck,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Scale,
  Lock
} from 'lucide-react';
import { ReadAloudButton } from './ReadAloudButton';

interface LegalRiskBriefModalProps {
  brief: LegalRiskBrief | null;
  onClose: () => void;
  onSelectAdvocateInHub?: (advocate: AdvocateProfile) => void;
}

export const LegalRiskBriefModal: React.FC<LegalRiskBriefModalProps> = ({
  brief: initialBrief,
  onClose,
  onSelectAdvocateInHub
}) => {
  const [brief, setBrief] = useState<LegalRiskBrief | null>(initialBrief);
  const [userNotes, setUserNotes] = useState<string>(initialBrief?.userNotes || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'advocates' | 'notes'>('preview');

  if (!brief) return null;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserNotes(val);
    setBrief((prev) => (prev ? { ...prev, userNotes: val } : null));
  };

  const handleSelectAdvocate = (advocate: AdvocateProfile) => {
    setBrief((prev) =>
      prev
        ? {
            ...prev,
            selectedAdvocate: advocate,
            handoffStatus: 'advocate_assigned'
          }
        : null
    );
  };

  const handleCopyText = () => {
    if (!brief) return;
    const formattedText = formatBriefAsText(brief);
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!brief) return;
    const formattedText = formatBriefAsText(brief);
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Risk_Brief_${brief.documentTitle.replace(/\s+/g, '_')}_KanoonAI.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const riskBadgeColor =
    brief.executiveSummary.overallRiskLevel === 'LOW'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-200'
      : brief.executiveSummary.overallRiskLevel === 'MEDIUM'
      ? 'bg-legal-50 text-legal-600 border-legal-600/30'
      : brief.executiveSummary.overallRiskLevel === 'HIGH'
      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
      <div className="bg-white shadow-sm w-full max-w-4xl rounded-3xl border border-slate-300 p-5 sm:p-8 max-h-[92vh] flex flex-col justify-between shadow-2xl relative animate-fadeIn">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-legal-100 border border-legal-200 text-legal-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-slate-900 text-lg">Advocate Legal Risk Brief</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-legal-50 text-legal-600 border border-legal-600/30">
                  {brief.sourceType === 'drafted' ? 'Kanoon AI Draft' : 'Uploaded Document'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Structured legal summary & statutory evidence brief for Bar Council advocate consultation
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto flex-wrap">
            <ReadAloudButton text={formatBriefAsText(brief)} />
            
            <button
              onClick={handleCopyText}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-xs font-medium text-slate-900 border border-slate-300 transition-colors"
              title="Copy formatted brief text"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-legal-600 hover:bg-legal-700 text-white text-xs font-bold shadow transition-colors"
              title="Download brief as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
              title="Print brief"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advocate Handoff Banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">Handoff Status:</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-500/20 font-semibold uppercase">
                  {brief.handoffStatus === 'advocate_assigned' ? 'Advocate Assigned' : 'Professional Legal Review Recommended'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {brief.selectedAdvocate
                  ? `Assigned: ${brief.selectedAdvocate.name} (${brief.selectedAdvocate.city}) — Fee: ₹${brief.selectedAdvocate.consultationFee}`
                  : 'Select a verified advocate from the directory to review this AI brief.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('advocates')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'advocates'
                  ? 'bg-legal-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-700'
              }`}
            >
              {brief.selectedAdvocate ? 'Change Advocate' : 'Select Advocate'}
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-legal-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-700'
              }`}
            >
              Add User Notes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 mb-3">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'preview' ? 'border-legal-600/30 text-legal-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Brief Overview & Evidence
          </button>
          <button
            onClick={() => setActiveTab('advocates')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'advocates' ? 'border-legal-600/30 text-legal-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Advocate Handoff ({ADVOCATES_DIRECTORY.length} Available)
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'notes' ? 'border-legal-600/30 text-legal-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            User Notes {userNotes ? '✓' : ''}
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 my-1">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Executive Summary</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${riskBadgeColor}`}>
                    Safety Score: {brief.executiveSummary.overallRiskScore}/100 ({brief.executiveSummary.overallRiskLevel} RISK)
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Document Title</span>
                    <strong className="text-slate-900 font-semibold">{brief.documentTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jurisdiction</span>
                    <strong className="text-slate-900 font-semibold">{brief.jurisdiction}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Source</span>
                    <strong className="text-legal-600 font-semibold">
                      {brief.sourceType === 'drafted' ? 'Kanoon SmartDrafter' : 'Uploaded File'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Analysis Date</span>
                    <strong className="text-slate-900 font-mono text-[11px]">
                      {new Date(brief.createdAt).toLocaleDateString('en-IN')}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {brief.executiveSummary.summaryText}
                </p>
              </div>

              {/* Critical & High Risk Issues */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>3. Critical & High-Risk Issues ({brief.criticalIssues.length})</span>
                </h3>

                {brief.criticalIssues.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No high or critical risks were flagged in this document.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brief.criticalIssues.map((item, idx) => (
                      <div key={idx} className="bg-white shadow-sm p-4 rounded-xl border border-rose-500/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            {item.clauseTitle} {item.clauseNumber ? `(${item.clauseNumber})` : ''}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            {item.riskLevel} Risk
                          </span>
                        </div>

                        <p className="text-slate-700">
                          <strong className="text-slate-600">Plain Explanation:</strong> {item.plainEnglishExplanation}
                        </p>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <span className="text-legal-600 font-bold text-[11px] block">Recommended Action:</span>
                          <p className="text-slate-700">{item.recommendedAction}</p>
                          {item.saferAlternative && (
                            <div className="pt-1.5 border-t border-slate-850 mt-1">
                              <span className="text-emerald-400 font-bold text-[11px] block">Suggested Safer Alternative Clause:</span>
                              <p className="text-emerald-800 font-mono text-[11px] italic">"{item.saferAlternative}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Provisions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-legal-600" />
                  <span>4. Missing Essential Provisions ({brief.missingProvisions.length})</span>
                </h3>

                {brief.missingProvisions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>All essential legal provisions appear present.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {brief.missingProvisions.map((m, idx) => (
                      <div key={idx} className="bg-white shadow-sm p-3.5 rounded-xl border border-legal-600/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{m.clauseType}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-legal-50 text-legal-600 uppercase">
                            {m.importance}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px]">{m.whyItMatters}</p>
                        <p className="text-legal-500/90 text-[11px] font-medium pt-1 border-t border-slate-200">{m.recommendedAction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inconsistencies */}
              {brief.inconsistencies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>5. Internal Inconsistencies ({brief.inconsistencies.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {brief.inconsistencies.map((inc, idx) => (
                      <div key={idx} className="bg-white shadow-sm p-3.5 rounded-xl border border-orange-500/20 text-xs space-y-1">
                        <span className="font-bold text-slate-900">{inc.issueTitle}</span>
                        <p className="text-slate-700">{inc.explanation}</p>
                        {inc.conflictingClauses.length > 0 && (
                          <div className="text-[11px] text-legal-600 font-mono">
                            Conflicts between: {inc.conflictingClauses.join(' ↔ ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Evidence & Anti-Hallucination Disclaimer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-legal-600" />
                    <span>6. Verified Statutory Evidence (Indian Central & State Acts)</span>
                  </h3>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Tier 1 Gazette Sources</span>
                </div>

                {/* Statutory Evidence Distinction Banner */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Verification & Anti-Hallucination Safeguard:</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    The <strong>AI Analysis & Recommendations</strong> above are distinguished from the <strong>Verified Statutory Evidence</strong> below.
                    Statutory sections are retrieved from official government PDFs via 384D ONNX embeddings with SHA-256 hash provenance.
                  </p>
                </div>

                {!brief.hasSufficientEvidence || brief.citations.length === 0 ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                    <div className="font-bold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{brief.evidenceWarning || 'Insufficient verified statutory evidence was retrieved.'}</span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      No statutory provisions met the strict 0.38 vector similarity threshold for this query. Kanoon AI explicitly refrains from inventing synthetic statutory citations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brief.citations.map((cit, idx) => (
                      <div key={idx} className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="font-bold text-slate-900 text-sm">
                            {cit.actShortTitle || cit.actName} — {cit.sectionNumber} ({cit.sectionTitle})
                          </div>
                          {cit.similarityScore !== undefined && (
                            <span className="px-2 py-0.5 rounded bg-legal-50 text-legal-600 border border-legal-600/30 text-[10px] font-mono font-bold self-start sm:self-auto">
                              Similarity: {(cit.similarityScore * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 font-serif bg-slate-50 p-3 rounded-lg border border-slate-850 text-[11px] italic">
                          "{cit.statuteText}"
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                          {cit.sourceUrl && (
                            <a
                              href={cit.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-legal-600 hover:underline flex items-center space-x-1 font-medium"
                            >
                              <span>View Official Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {(cit.pdfUrl || cit.sourceUrl) && (
                            <a
                              href={cit.pdfUrl || cit.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center space-x-1 font-medium"
                            >
                              <span>View Official PDF</span>
                              <FileText className="w-3 h-3" />
                            </a>
                          )}
                          {cit.sha256 && (
                            <span className="font-mono text-[10px] text-slate-500">
                              SHA256: {cit.sha256.slice(0, 16)}...
                            </span>
                          )}
                          {cit.pageNumbers && cit.pageNumbers.length > 0 && (
                            <span>Page(s): {cit.pageNumbers.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Questions for Advocate */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-legal-600" />
                  <span>7. Recommended Questions for Advocate Consultation</span>
                </h3>
                <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  {brief.recommendedQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-700">
                      <span className="font-bold text-legal-600">{idx + 1}.</span>
                      <p>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advocates' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Select Advocate for Professional Handover</h3>
                <p className="text-xs text-slate-600">
                  Selecting an advocate attaches this Legal Risk Brief to your consultation request.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADVOCATES_DIRECTORY.map((advocate: AdvocateProfile) => {
                  const isSelected = brief.selectedAdvocate?.id === advocate.id;

                  return (
                    <div
                      key={advocate.id}
                      className={`bg-white shadow-sm p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-legal-400 bg-legal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={advocate.avatarUrl}
                          alt={advocate.name}
                          className="w-12 h-12 rounded-xl object-cover border border-legal-600/30"
                        />
                        <div className="space-y-0.5 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm">{advocate.name}</h4>
                          <p className="text-[11px] text-legal-700">{advocate.title}</p>
                          <p className="text-[11px] text-slate-600">
                            {advocate.city}, {advocate.state} • Bar: {advocate.barCouncilNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="font-extrabold text-legal-700">₹{advocate.consultationFee} / 30m</span>
                        <button
                          onClick={() => {
                            handleSelectAdvocate(advocate);
                            if (onSelectAdvocateInHub) onSelectAdvocateInHub(advocate);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-legal-600 hover:bg-legal-700 text-white'
                          }`}
                        >
                          {isSelected ? '✓ Assigned Counsel' : 'Select for Handoff'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-legal-600" />
                  <span>8. Add User Concerns & Custom Notes</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Include specific commercial context or questions you want the lawyer to address during consultation.
                </p>
              </div>

              <textarea
                rows={8}
                value={userNotes}
                onChange={handleNotesChange}
                placeholder="Example: I am concerned about the 24-month lock-in period because our office lease might need relocation after 12 months..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-legal-500 focus:border-legal-500 leading-relaxed font-sans"
              />

              <div className="text-xs text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Notes automatically update in the downloadable and printable Legal Risk Brief.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{brief.disclaimer}</span>
          <span className="font-mono text-slate-600">Kanoon AI v2.0 Legal Brief</span>
        </div>
      </div>
    </div>
  );
};
