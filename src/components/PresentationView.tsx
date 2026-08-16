import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, Scale, Sparkles, Shield, 
  Database, Users, Lock, FileCode
} from 'lucide-react';

export const PresentationView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: "KANOON AI",
      subtitle: "AI-Powered Plain-Language Legal Documentation Assistant for India",
      tagline: "Empowering Citizens, Tenants & Small Businesses with Access to Plain Justice",
      icon: Scale,
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 mx-auto flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30">
            <Scale className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <p className="text-slate-300 text-sm leading-relaxed">
              Legal documents in India are filled with archaic legalese, Latin phrases, and hidden risk traps. Millions of MSMEs and citizens sign agreements without understanding their full liabilities.
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
              <span>Problem Statement #AI-Legal-2026 • India AI Hackathon</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Problem & Market Need",
      subtitle: "High Legal Costs, Complex Jargon & Hidden Traps",
      tagline: "Over 85% of small business owners sign contracts without formal legal review.",
      icon: Shield,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold text-sm">1. Archaic Legalese</div>
            <p className="text-slate-300 leading-relaxed">
              Phrases like "Indemnify & hold harmless" or "sole discretion" confuse non-lawyers and conceal unilateral liabilities.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold text-sm">2. High Lawyer Fees</div>
            <p className="text-slate-300 leading-relaxed">
              Standard contract drafting costs ₹5,000 to ₹25,000 per draft, which is unaffordable for gig workers and early-stage founders.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold text-sm">3. State Stamp Confusion</div>
            <p className="text-slate-300 leading-relaxed">
              Each Indian state (MH, KA, DL, TN) has different e-Stamp duty rules and mandatory registration thresholds.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Our Solution: Kanoon AI",
      subtitle: "Automated Plain-Language Drafting & Legalese Simplification",
      tagline: "Combining local Indian statute intelligence with Google Gemini LLM reasoning.",
      icon: Sparkles,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
          <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <h4 className="font-bold text-amber-400 text-sm">1. Smart Plain-Language Drafter</h4>
            <ul className="space-y-2 text-slate-300 list-disc list-inside">
              <li>Generates Leave & License, NDAs, Freelance Agreements in easy English.</li>
              <li>Calculates state-specific e-Stamp duty (e.g. Maharashtra 0.25%, Karnataka e-Stamp).</li>
              <li>Highlights 11-month tenure registration rules under Transfer of Property Act 1882.</li>
            </ul>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <h4 className="font-bold text-amber-400 text-sm">2. AI Jargon & Risk Analyzer</h4>
            <ul className="space-y-2 text-slate-300 list-disc list-inside">
              <li>Paste any raw contract text to instantly spot unlimited indemnity traps.</li>
              <li>Explains key terms (Force Majeure, Severability, Jurisdiction) in plain terms.</li>
              <li>Assigns contract safety ratings before signing.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Technical Architecture & DPDP Compliance",
      subtitle: "Built with Modern Stack & Privacy-First Architecture",
      tagline: "Vite + React 19 + TypeScript + Gemini 1.5 Pro + Client-Side Privacy",
      icon: FileCode,
      content: (
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="font-bold text-slate-200 block">Frontend</span>
              <span className="text-[11px] text-slate-400">React 19 + TypeScript + Tailwind</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <Database className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="font-bold text-slate-200 block">Legal Dataset</span>
              <span className="text-[11px] text-slate-400">Indian Statutes & State Stamp DB</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto" />
              <span className="font-bold text-slate-200 block">Data Privacy</span>
              <span className="text-[11px] text-slate-400">DPDP Act Compliant Client Storage</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <Users className="w-5 h-5 text-amber-400 mx-auto" />
              <span className="font-bold text-slate-200 block">Human-in-the-Loop</span>
              <span className="text-[11px] text-slate-400">Verified Bar Advocates Hub</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6 pb-12">
      {/* Slide View Container */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 shadow-2xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <slide.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                SLIDE {currentSlide + 1} OF {slides.length}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-100">{slide.title}</h2>
              <p className="text-xs text-slate-400">{slide.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Slide Body */}
        <div className="my-6 relative z-10">
          <blockquote className="text-amber-400 text-xs font-mono italic mb-4 border-l-2 border-amber-500 pl-3">
            "{slide.tagline}"
          </blockquote>
          {slide.content}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 relative z-10">
          <div className="flex space-x-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-8 h-2 rounded-full transition-all ${
                  currentSlide === i ? 'bg-amber-500 w-12' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-40 shadow-lg shadow-amber-500/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
