import { useState } from 'react';
import type { ActiveTab, GeneratedDocument } from './types';
import { Header } from './components/Header';
import { SmartDrafter } from './components/SmartDrafter';
import { JargonSimplifier } from './components/JargonSimplifier';
import { LegalChatbot } from './components/LegalChatbot';
import { LegalDatabase } from './components/LegalDatabase';
import { ExpertHub } from './components/ExpertHub';
import { DocumentReviewer } from './components/DocumentReviewer';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { Scale, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('drafter');
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'drafter' && (
          <SmartDrafter
            onOpenDocumentModal={(doc) => setViewingDocument(doc)}
          />
        )}

        {activeTab === 'review' && (
          <DocumentReviewer onNavigateToExpert={() => setActiveTab('experts')} />
        )}

        {activeTab === 'simplifier' && (
          <JargonSimplifier />
        )}

        {activeTab === 'chatbot' && (
          <LegalChatbot />
        )}

        {activeTab === 'database' && (
          <LegalDatabase />
        )}

        {activeTab === 'experts' && (
          <ExpertHub />
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
            </div>

            <div className="flex items-center space-x-4 text-slate-400">
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
              <strong>Ethical AI &amp; Legal Disclaimer:</strong> Kanoon AI is designed to assist individuals and small businesses in drafting plain-language contracts and understanding legal terminology under Indian law (Contract Act 1872, Transfer of Property Act, CPA 2019, IT Act 2000). Kanoon AI is an automated software tool and does not provide formal attorney-client privileged legal representation. For complex disputes or court litigation, please consult a verified Advocate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            <span>© 2026 Kanoon AI. Empowering Access to Justice in India.</span>
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
    </div>
  );
}

export default App;
