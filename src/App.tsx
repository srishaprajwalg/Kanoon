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
    <div className="flex flex-col font-sans min-h-screen bg-stone-50 text-slate-900 selection:bg-legal-100 selection:text-legal-900 dark:bg-background dark:text-primary dark:selection:bg-accent/20 dark:selection:text-accent">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
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
      <footer className="border-t border-slate-200 bg-white text-slate-600 dark:border-border dark:bg-surface dark:text-secondary text-xs py-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-legal-50 text-legal-700 dark:bg-surface-elevated dark:text-accent flex items-center justify-center font-bold border border-legal-200 dark:border-border">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-slate-800 dark:text-primary text-sm tracking-tight">Kanoon AI</span>
              <span className="text-slate-400 dark:text-muted">|</span>
              <span className="text-slate-600 dark:text-secondary font-medium">Legal Documentation Assistant</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-500 dark:text-secondary">
              <button
                onClick={() => setActiveTab('database')}
                className="hover:text-legal-700 dark:hover:text-accent flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 dark:focus-visible:ring-accent rounded transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="font-medium">Indian Acts Database</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 dark:bg-surface-elevated dark:border-border text-[13px] leading-relaxed text-slate-700 dark:text-secondary flex items-start space-x-4 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-primary">Ethical AI &amp; Legal Disclaimer</p>
              <p>
                Kanoon AI is designed to assist individuals and small businesses in drafting plain-language contracts and understanding legal terminology under Indian law (Contract Act 1872, Transfer of Property Act, CPA 2019, IT Act 2000). Kanoon AI is an automated software tool and <strong>does not provide formal attorney-client privileged legal representation</strong>. For complex disputes or court litigation, please consult a verified Advocate.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-muted pt-4 border-t border-slate-100 dark:border-border">
            <span>© 2026 Kanoon AI. Empowering Access to Justice in India.</span>
            <span className="flex items-center space-x-1.5 mt-2 sm:mt-0 font-medium">
              <span>Empowering Access to Justice</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 dark:text-error dark:fill-error" aria-label="Heart icon" />
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

