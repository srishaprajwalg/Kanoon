import React from 'react';
import type { GeneratedDocument } from '../types';
import { Printer, Download, Copy, X, CheckCircle2, Scale } from 'lucide-react';
import jsPDF from 'jspdf';

interface DocumentViewerModalProps {
  document: GeneratedDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(document.title, 40, 50);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`State Jurisdiction: ${document.state} | Plain-Language AI Legal Draft`, 40, 68);
    pdf.text(`---------------------------------------------------------------------------------------------------`, 40, 78);

    const splitText = pdf.splitTextToSize(document.draftText, 515);
    pdf.text(splitText, 40, 100);

    pdf.save(`${document.title.replace(/\s+/g, '_')}_KanoonAI.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-print">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-700 space-y-4 p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between shadow-2xl relative animate-fadeIn">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">{document.title}</h3>
              <p className="text-xs text-slate-400">Jurisdiction: {document.state} • Plain-Language Legal Format</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 text-lg font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Content */}
        <div className="flex-1 overflow-y-auto pr-2 my-2">
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-slate-200 font-serif text-sm leading-relaxed whitespace-pre-wrap legal-document-paper select-text">
            {document.draftText}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-3">
          <span>Drafted under Indian Contract Act 1872</span>
          <span>Kanoon AI Legal Documentation Assistant</span>
        </div>
      </div>
    </div>
  );
};
