import React, { useState } from 'react';
import type { GeneratedDocument, LegalRiskBrief } from '../types';
import { Printer, Download, Copy, X, CheckCircle2, Scale } from 'lucide-react';
import { exportDocumentToPDF } from '../utils/pdfExporter';
import { generateBriefFromDraftedDocument } from '../services/briefGenerator';
import { LegalRiskBriefModal } from './LegalRiskBriefModal';
import { ReadAloudButton } from './ReadAloudButton';

interface DocumentViewerModalProps {
  document: GeneratedDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<LegalRiskBrief | null>(null);

  if (!document) return null;

  const handleConsultExpert = () => {
    const brief = generateBriefFromDraftedDocument(document);
    setCurrentBrief(brief);
    setBriefModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    exportDocumentToPDF({
      title: document.title,
      state: document.state,
      draftText: document.draftText
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-print">
      <div className="bg-white shadow-sm w-full max-w-4xl rounded-3xl border border-slate-300 space-y-4 p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between shadow-2xl relative animate-fadeIn">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{document.title}</h3>
              <p className="text-xs text-slate-600">Jurisdiction: {document.state} • Plain-Language Legal Format</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <ReadAloudButton text={document.draftText} />
            
            <button
              onClick={handleConsultExpert}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Consult Legal Expert</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-xs font-medium text-slate-900 border border-slate-300"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-xs font-bold text-slate-900 border border-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-indigo-600/30 text-indigo-600 hover:bg-slate-100 text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-lg font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Content */}
        <div className="flex-1 overflow-y-auto pr-2 my-2">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-slate-900 font-serif text-sm leading-relaxed whitespace-pre-wrap legal-document-paper select-text">
            {document.draftText}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
          <span>Drafted under Indian Contract Act 1872</span>
          <span>Kanoon AI Legal Documentation Assistant</span>
        </div>
      </div>

      {briefModalOpen && currentBrief && (
        <LegalRiskBriefModal
          brief={currentBrief}
          onClose={() => setBriefModalOpen(false)}
        />
      )}
    </div>
  );
};
