import React, { useState } from 'react';
import { INDIAN_LEGAL_ACTS } from '../data/legalActs';
import { STAMP_DUTY_GUIDE } from '../data/stampDutyData';
import { BookOpen, Scale, Search, ShieldCheck } from 'lucide-react';

export const LegalDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'acts' | 'stamp'>('acts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');

  const filteredActs = INDIAN_LEGAL_ACTS.filter(act =>
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStampInfo = STAMP_DUTY_GUIDE.find(
    s => s.state.toLowerCase() === selectedState.toLowerCase()
  ) || STAMP_DUTY_GUIDE[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Indian Acts & State Stamp Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Indian Legal Reference <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Database</span>
          </h1>
          <p className="text-xs text-slate-400">
            Understand key central statutes (Contract Act, IT Act, RERA, CPA) and state-wise e-Stamp duty rates in plain terms.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-stretch md:self-auto justify-center text-xs">
          <button
            onClick={() => setActiveTab('acts')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'acts' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Central Legal Acts
          </button>
          <button
            onClick={() => setActiveTab('stamp')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'stamp' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            State Stamp Duty Guide
          </button>
        </div>
      </div>

      {/* CENTRAL LEGAL ACTS TAB */}
      {activeTab === 'acts' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian statutes, sections, or keywords (e.g. Contract Act, Section 10, RERA)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            />
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredActs.map(act => (
              <div key={act.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-2">
                      {act.category} • Year {act.year}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100">{act.title}</h3>
                  </div>
                  <Scale className="w-6 h-6 text-amber-400 flex-shrink-0" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{act.summary}</p>

                {/* Key sections */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-200 block">Key Sections for Individuals & MSMEs:</span>
                  <div className="space-y-2">
                    {act.keySections.map((sec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-amber-400">{sec.section}: {sec.title}</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{sec.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Impact Note */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p><strong>MSME & Citizen Impact:</strong> {act.impactForSmallBiz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE STAMP DUTY TAB */}
      {activeTab === 'stamp' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Select State Jurisdiction</h2>
              <p className="text-xs text-slate-400">Stamp duty varies by Indian State & Local Revenue Code</p>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1">
              {STAMP_DUTY_GUIDE.map(s => (
                <button
                  key={s.state}
                  onClick={() => setSelectedState(s.state)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedState === s.state
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {s.state}
                </button>
              ))}
            </div>
          </div>

          {/* Selected State Details Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/30 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">STATE STAMP REGULATION</span>
                <h2 className="text-2xl font-extrabold text-slate-100">{selectedStampInfo.state}</h2>
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                Official Revenue Rates
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium block">Rent / Leave & License Rate</span>
                <p className="font-bold text-slate-100 text-sm leading-relaxed">{selectedStampInfo.rentAgreementRate}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium block">Non-Disclosure (NDA) Rate</span>
                <p className="font-bold text-slate-100 text-sm leading-relaxed">{selectedStampInfo.ndaRate}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium block">Service Agreement Rate</span>
                <p className="font-bold text-slate-100 text-sm leading-relaxed">{selectedStampInfo.serviceAgreementRate}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <span className="text-amber-400 font-bold block">Sub-Registrar Registration Threshold:</span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedStampInfo.registrationMandatoryThreshold}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
              <strong>Official Portal & Notes:</strong> {selectedStampInfo.notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
