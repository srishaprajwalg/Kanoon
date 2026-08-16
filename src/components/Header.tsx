import React from 'react';
import type { ActiveTab } from '../types';
import { Scale, FileText, Sparkles, BookOpen, UserCheck, Key, Shield, Presentation, FileSearch } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeyModal,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('drafter')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Scale className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-100">Kanoon</span>
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent font-black text-xl">AI</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">India</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Plain-Language AI Legal Documentation Assistant</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('drafter')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'drafter'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Smart Drafter</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'review'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span>Review Document</span>
            </button>

            <button
              onClick={() => setActiveTab('simplifier')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simplifier'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Jargon Simplifier</span>
            </button>

            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chatbot'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Legal Chatbot</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Legal DB & Stamp Duty</span>
            </button>

            <button
              onClick={() => setActiveTab('experts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'experts'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Legal Advice Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'presentation'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Hackathon Presentation</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasApiKey
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Configure Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasApiKey ? 'Gemini AI Ready' : 'Set Gemini Key'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1 text-slate-400 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>DPDP Compliant</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('drafter')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'drafter' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span>Draft</span>
          </button>

          <button
            onClick={() => setActiveTab('simplifier')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'simplifier' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Simplify</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'database' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Database</span>
          </button>

          <button
            onClick={() => setActiveTab('experts')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'experts' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <UserCheck className="w-4 h-4 mb-0.5" />
            <span>Experts</span>
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`flex flex-col items-center py-1 px-2 ${activeTab === 'presentation' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Presentation className="w-4 h-4 mb-0.5" />
            <span>Slides</span>
          </button>
        </div>
      </div>
    </header>
  );
};
