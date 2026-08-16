import React, { useState } from 'react';
import { KanoonAIService } from '../services/aiService';
import { Sparkles, AlertTriangle, BookOpen, RefreshCw, FileSearch, ShieldAlert } from 'lucide-react';

interface JargonSimplifierProps {
  apiKey?: string;
}

export const JargonSimplifier: React.FC<JargonSimplifierProps> = ({ apiKey }) => {
  const [inputText, setInputText] = useState<string>(
    `The Licensee covenants to indemnify, defend, and hold harmless the Licensor from and against any and all liabilities, claims, demands, damages, losses, or costs arising out of or related to the Licensee's breach of this Agreement, provided that the Licensor may, at its sole discretion, terminate this Agreement immediately without prior notice.`
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    plainEnglishText: string;
    keyTermsExplained: { term: string; explanation: string }[];
    redFlagsFound: { severity: 'high' | 'medium' | 'low'; issue: string; advice: string }[];
    simplificationScore: number;
  } | null>(null);

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await KanoonAIService.simplifyLegalese(inputText, apiKey);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Jargon & Contract Analyzer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Translate Legalese into <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Plain English</span>
          </h1>
          <p className="text-xs text-slate-400">
            Paste any complicated legal clause, contract paragraph, or legal notice to uncover hidden traps and get a layman explanation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Box (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-amber-400" />
                <span>Paste Legal Text / Clause Here</span>
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any legalese contract clause here..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">{inputText.length} characters</span>
              <button
                disabled={isAnalyzing || !inputText.trim()}
                onClick={handleSimplify}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 text-xs"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Legal Jargon...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simplify to Plain English</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Sample Clauses for Quick Test */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Try quick sample clauses:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setInputText("The Licensor may, at its sole discretion, terminate this Agreement immediately without prior notice and forfeit the security deposit as liquidated damages.")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                Unilateral Termination Clause
              </button>

              <button
                onClick={() => setInputText("Neither party shall be liable for any failure or delay in performance under this Agreement due to acts of God, war, pandemic, government restriction, or civil disturbance.")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                Force Majeure Exemption
              </button>

              <button
                onClick={() => setInputText("Party B agrees to non-compete for a period of 24 months post-employment within the entire territory of India without prior written consent.")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700 transition-colors"
              >
                Non-Compete Covenant
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Plain English Box */}
              <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Plain Language Translation</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {result.simplificationScore}% Clarity Rating
                  </span>
                </div>
                <div className="whitespace-pre-line text-sm text-slate-100 font-sans leading-relaxed font-medium">
                  {result.plainEnglishText}
                </div>
              </div>

              {/* Red Flags / Traps Detected */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Hidden Legal Traps & Risk Alerts</span>
                </h3>

                <div className="space-y-3">
                  {result.redFlagsFound.map((rf, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1 text-xs ${
                        rf.severity === 'high'
                          ? 'bg-red-500/10 border-red-500/30 text-red-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>{rf.issue}</span>
                        </span>
                        <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                          {rf.severity} priority
                        </span>
                      </div>
                      <p className="text-slate-300 pl-5">💡 <strong>Advice:</strong> {rf.advice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Terms Dictionary */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Key Legal Terms Dictionary</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.keyTermsExplained.map((kt, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <span className="font-bold text-amber-400 block">{kt.term}</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{kt.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">No Legal Clause Analyzed Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click "Simplify to Plain English" on the left to translate complex legal jargon into understandable terms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
