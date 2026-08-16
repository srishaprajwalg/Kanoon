import { useState, useEffect } from 'react';
import type { ActiveTab, GeneratedDocument } from './types';
import { Header } from './components/Header';
import { SmartDrafter } from './components/SmartDrafter';
import { JargonSimplifier } from './components/JargonSimplifier';
import { LegalDatabase } from './components/LegalDatabase';
import { ExpertHub } from './components/ExpertHub';
import { PresentationView } from './components/PresentationView';
import { DocumentReviewer } from './components/DocumentReviewer';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Scale, ShieldAlert, Heart, ExternalLink, Presentation } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('drafter');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('kanoon_gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('kanoon_gemini_api_key', key);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'drafter' && (
          <SmartDrafter
            apiKey={apiKey}
            onOpenDocumentModal={(doc) => setViewingDocument(doc)}
          />
        )}

        {activeTab === 'review' && (
          <DocumentReviewer onNavigateToExpert={() => setActiveTab('experts')} />
        )}

        {activeTab === 'simplifier' && (
          <JargonSimplifier apiKey={apiKey} />
        )}

        {activeTab === 'database' && (
          <LegalDatabase />
        )}

        {activeTab === 'experts' && (
          <ExpertHub />
        )}

        {activeTab === 'presentation' && (
          <PresentationView />
        )}
      </main>

      {/* Footer & Ethical Legal Disclaimer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 text-xs py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-200 text-sm">Kanoon AI Legal Documentation Assistant</span>
              <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                v1.0 Hackathon Release
              </span>
            </div>

            <div className="flex items-center space-x-4 text-slate-400">
              <button
                onClick={() => setActiveTab('presentation')}
                className="hover:text-amber-400 flex items-center space-x-1"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Presentation Deck</span>
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className="hover:text-amber-400 flex items-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Indian Acts Database</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed text-slate-400 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Ethical AI & Legal Disclaimer:</strong> Kanoon AI is designed to assist individuals and small businesses in drafting plain-language contracts and understanding legal terminology under Indian law (Contract Act 1872, Transfer of Property Act, CPA 2019, IT Act 2000). Kanoon AI is an automated software tool and does not provide formal attorney-client privileged legal representation. For complex disputes or court litigation, please consult a verified Advocate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            <span>© 2026 Kanoon AI. Built for India AI Legal Documentation Hackathon.</span>
            <span className="flex items-center space-x-1">
              <span>Empowering Access to Justice</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </footer>

      {/* Full Document Printable Modal */}
      <DocumentViewerModal
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}

export default App;
