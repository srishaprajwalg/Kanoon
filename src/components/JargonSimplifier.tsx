import React, { useState } from 'react';
import { KanoonAIService } from '../services/aiService';
import { 
  Sparkles, AlertTriangle, ShieldCheck, Copy, CheckCircle2, 
  BookOpen, Lightbulb, FileText 
} from 'lucide-react';
import type { LegalStatuteCitation } from '../types';

interface JargonSimplifierProps {
  apiKey?: string;
}

export const JargonSimplifier: React.FC<JargonSimplifierProps> = ({ apiKey }) => {
  const [inputClause, setInputClause] = useState<string>(
    'The Licensee covenants to indemnify, defend, and hold harmless the Licensor from and against any and all liabilities, claims, demands, damages, losses, or costs arising out of or related to the Licensee\'s breach of this Agreement, provided that the Licensor may, at its sole discretion, terminate this Agreement immediately without prior notice.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    plainEnglishText: string;
    keyTermsExplained: { term: string; explanation: string }[];
    redFlagsFound: { severity: 'low' | 'high' | 'critical'; issue: string; advice: string }[];
    saferAlternative?: string;
    citations?: LegalStatuteCitation[];
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  const SAMPLE_CLAUSES = [
    {
      title: 'Unlimited Indemnity & Instant Exit',
      text: 'The Licensee covenants to indemnify, defend, and hold harmless the Licensor from and against any and all liabilities, claims, demands, damages, losses, or costs arising out of or related to the Licensee\'s breach of this Agreement, provided that the Licensor may, at its sole discretion, terminate this Agreement immediately without prior notice.'
    },
    {
      title: 'Restraint of Trade / Non-Compete',
      text: 'For a period of two (2) years post-termination, the Employee shall not directly or indirectly engage in, perform services for, or establish any business or employment competing with the Company anywhere in India.'
    },
    {
      title: 'Forfeiture of Full Security Deposit',
      text: 'In the event of any early termination prior to expiry of 11 months for any reason whatsoever, the entire security deposit shall stand absolutely forfeited to the Landlord as liquidated damages.'
    }
  ];

  const handleSimplify = async () => {
    if (!inputClause.trim()) return;
    setIsLoading(true);

    try {
      // Call backend API / RAG Service for full clause analysis
      const res = await fetch('http://localhost:5000/api/analyze-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: inputClause })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult({
          plainEnglishText: `💡 IN PLAIN ENGLISH:\n${data.plainExplanation}`,
          keyTermsExplained: [
            { term: 'Legal Liability', explanation: 'Financial obligation to pay for damages under Indian Contract Act 1872.' },
            { term: 'Termination Notice', explanation: 'Advance written warning required before ending contract.' }
          ],
          redFlagsFound: [
            {
              severity: data.riskLevel === 'critical' ? 'critical' : data.riskLevel === 'high' ? 'high' : 'low',
              issue: data.riskExplanation,
              advice: data.saferAlternative ? `Suggested Fix: ${data.saferAlternative}` : 'Seek advocate review.'
            }
          ],
          saferAlternative: data.saferAlternative,
          citations: data.citations
        });
      } else {
        const fallback = await KanoonAIService.simplifyLegalese(inputClause, apiKey);
        setAnalysisResult({
          ...fallback,
          redFlagsFound: fallback.redFlagsFound.map(rf => ({
            ...rf,
            severity: rf.severity === 'high' ? 'high' : 'low'
          }))
        });
      }
    } catch (_err) {
      const fallback = await KanoonAIService.simplifyLegalese(inputClause, apiKey);
      setAnalysisResult({
        ...fallback,
        redFlagsFound: fallback.redFlagsFound.map(rf => ({
          ...rf,
          severity: rf.severity === 'high' ? 'high' : 'low'
        }))
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySafer = () => {
    if (!analysisResult?.saferAlternative) return;
    navigator.clipboard.writeText(analysisResult.saferAlternative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white shadow-sm p-6 sm:p-8 rounded-2xl border border-indigo-600/30 shadow-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-600 border border-indigo-600/30 text-indigo-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Legalese Translator & Risk Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Translate Legalese into <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">Plain English & Find Hidden Risks</span>
          </h1>
          <p className="text-slate-700 text-sm leading-relaxed">
            Paste any complex legal clause to uncover hidden traps, translate archaic terms, retrieve relevant Indian statutory sections, and get safer alternative clause suggestions.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Box & Sample Clauses (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Paste Legal Text / Clause Here</span>
              </label>
              <button
                onClick={() => setInputClause('')}
                className="text-[11px] text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            </div>

            <textarea
              rows={6}
              value={inputClause}
              onChange={(e) => setInputClause(e.target.value)}
              placeholder="Paste contract paragraph or clause here..."
              className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-600">{inputClause.length} characters</span>

              <button
                disabled={isLoading || !inputClause.trim()}
                onClick={handleSimplify}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Analyzing Clause...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simplify & Inspect Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Samples */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-600 block">Try Quick Sample Clauses:</span>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_CLAUSES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputClause(sample.text)}
                  className="text-left p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs transition-colors space-y-1"
                >
                  <span className="font-bold text-indigo-600 block">{sample.title}</span>
                  <p className="text-slate-600 text-[11px] truncate">{sample.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis, Risk Level & Safer Alternative (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Plain English Translation Card */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-indigo-600/30 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm border-b border-slate-200 pb-3">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Plain Language Explanation</span>
                </div>
                <div className="text-xs text-slate-900 whitespace-pre-line leading-relaxed">
                  {analysisResult.plainEnglishText}
                </div>
              </div>

              {/* Red Flags & Risk Indicators */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Clause Risk Assessment</span>
                </div>

                <div className="space-y-3">
                  {analysisResult.redFlagsFound.map((flag, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Risk Severity:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          flag.severity === 'critical' || flag.severity === 'high'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-200'
                        }`}>
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs">{flag.issue}</p>
                      <p className="text-indigo-600 text-[11px] font-medium">💡 {flag.advice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safer Alternative Suggestion */}
              {analysisResult.saferAlternative && (
                <div className="bg-white shadow-sm p-5 rounded-2xl border border-emerald-200 space-y-3 bg-emerald-500/5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Suggested Safer Clause Alternative</span>
                    </div>
                    <button
                      onClick={handleCopySafer}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-800 hover:bg-emerald-500/30 text-xs font-bold transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Safer Clause'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-900 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    "{analysisResult.saferAlternative}"
                  </p>
                </div>
              )}

              {/* Statutory Citations */}
              {analysisResult.citations && analysisResult.citations.length > 0 && (
                <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Statutory Grounding (Indian Law)</span>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.citations.map((c, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-indigo-600">
                          <span>{c.actShortTitle}</span>
                          <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">{c.sectionNumber}</span>
                        </div>
                        <span className="font-medium text-slate-700 block">{c.sectionTitle}</span>
                        <p className="text-slate-600 text-[11px] italic">"{c.statuteText}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white shadow-sm p-8 rounded-2xl border border-slate-200 text-center space-y-4 min-h-[350px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-slate-900 text-base">No Legal Clause Analyzed Yet</h3>
                <p className="text-slate-600 text-xs">
                  Click "Simplify & Inspect Risk" on the left or select a sample clause to see instant plain-English translation and risk analysis.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
