import React, { useState } from 'react';
import { LEGAL_TEMPLATES } from '../data/legalTemplates';
import type { DocumentFormData, GeneratedDocument } from '../types';
import { KanoonAIService } from '../services/aiService';
import { 
  FileText, Sparkles, Shield, Plus, Trash2, Download, Printer, 
  Copy, CheckCircle2, ChevronRight, Scale, Info, Layers, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

interface SmartDrafterProps {
  apiKey?: string;
  onOpenDocumentModal: (doc: GeneratedDocument) => void;
}

export const SmartDrafter: React.FC<SmartDrafterProps> = ({ apiKey, onOpenDocumentModal }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('rent_agreement');
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedTemplate = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId) || LEGAL_TEMPLATES[0];

  const [formData, setFormData] = useState<DocumentFormData>({
    templateId: selectedTemplate.id,
    documentTitle: selectedTemplate.defaultFormData.documentTitle || selectedTemplate.name,
    partyA: {
      name: 'Ramesh Sharma',
      type: 'individual',
      address: 'Flat 402, Sunshine Apartments, Indiranagar, Bengaluru',
      contact: '+91 98765 43210',
      panOrGst: 'ABCPS1234F'
    },
    partyB: {
      name: 'Priya Tech Ventures Pvt Ltd',
      type: 'business',
      address: 'Suite 12, Tech Park, Outer Ring Road, Bengaluru',
      contact: '+91 91234 56789',
      panOrGst: '29ABCDE1234F1Z5'
    },
    effectiveDate: new Date().toISOString().split('T')[0],
    state: selectedTemplate.defaultFormData.governingLawState || 'Karnataka',
    city: 'Bengaluru',
    durationMonths: selectedTemplate.defaultFormData.durationMonths || 11,
    financialAmount: selectedTemplate.defaultFormData.financialAmount || 30000,
    securityDeposit: selectedTemplate.defaultFormData.securityDeposit || 90000,
    noticePeriodDays: selectedTemplate.defaultFormData.noticePeriodDays || 30,
    lockInPeriodMonths: selectedTemplate.defaultFormData.lockInPeriodMonths || 6,
    governingLawState: selectedTemplate.defaultFormData.governingLawState || 'Karnataka',
    disputeResolution: 'Arbitration',
    customClauses: [...(selectedTemplate.defaultFormData.customClauses || [])],
    additionalNotes: '',
    usePlainLanguage: true
  });

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = LEGAL_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplateId(templateId);
    setFormData(prev => ({
      ...prev,
      templateId: tmpl.id,
      documentTitle: tmpl.defaultFormData.documentTitle || tmpl.name,
      durationMonths: tmpl.defaultFormData.durationMonths || prev.durationMonths,
      financialAmount: tmpl.defaultFormData.financialAmount || prev.financialAmount,
      securityDeposit: tmpl.defaultFormData.securityDeposit || prev.securityDeposit,
      noticePeriodDays: tmpl.defaultFormData.noticePeriodDays || prev.noticePeriodDays,
      lockInPeriodMonths: tmpl.defaultFormData.lockInPeriodMonths || prev.lockInPeriodMonths,
      governingLawState: tmpl.defaultFormData.governingLawState || prev.governingLawState,
      customClauses: tmpl.defaultFormData.customClauses ? [...tmpl.defaultFormData.customClauses] : []
    }));
  };

  const handleAddClause = () => {
    setFormData(prev => ({
      ...prev,
      customClauses: [...prev.customClauses, '']
    }));
  };

  const handleClauseChange = (index: number, val: string) => {
    const updated = [...formData.customClauses];
    updated[index] = val;
    setFormData(prev => ({ ...prev, customClauses: updated }));
  };

  const handleRemoveClause = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customClauses: prev.customClauses.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const doc = await KanoonAIService.generateDocument(formData, apiKey);
      setGeneratedDoc(doc);
      setStep(3); // Result View
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(generatedDoc.title, 40, 50);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`State Stamp Jurisdiction: ${generatedDoc.state} | Plain-Language AI Draft`, 40, 68);
    pdf.text(`---------------------------------------------------------------------------------------------------`, 40, 78);

    const splitText = pdf.splitTextToSize(generatedDoc.draftText, 515);
    pdf.text(splitText, 40, 100);

    pdf.save(`${generatedDoc.title.replace(/\s+/g, '_')}_KanoonAI.pdf`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Intro */}
      <div className="relative rounded-2xl glass-panel p-6 sm:p-8 overflow-hidden border border-amber-500/20 shadow-glow">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Plain-Language Generator for India</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Draft Bulletproof Legal Documents in <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Plain English</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              No lawyer jargon, no confusion. Input key terms, and Kanoon AI will generate legally compliant, easy-to-read contracts tailored for individuals and small businesses in India.
            </p>
          </div>

          {/* Stepper indicators */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800 self-stretch md:self-auto justify-center">
            <button 
              onClick={() => setStep(1)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              <span>1. Choose Type</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button 
              onClick={() => setStep(2)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              <span>2. Key Terms</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button 
              disabled={!generatedDoc}
              onClick={() => generatedDoc && setStep(3)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 3 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
            >
              <span>3. AI Draft & Risk</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Legal Document Template */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Select Document Template</span>
            </h2>
            <span className="text-xs text-slate-400">All templates aligned with Indian Contract Act & State Acts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEGAL_TEMPLATES.map(template => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`cursor-pointer rounded-xl p-5 transition-all duration-200 glass-card relative flex flex-col justify-between border ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-glow'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-amber-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 inline-block mb-3 border border-slate-700">
                      {template.category}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base mb-1.5 pr-6">{template.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{template.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Popular: <strong className="text-slate-300">{template.popularIn.split(',')[0]}</strong></span>
                    <span className="text-amber-400/90 font-medium">⚡ {template.estimatedTime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Next: Fill Key Details</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Guided Form Inputs & Customization */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Customizing: {selectedTemplate.name}</span>
              </h2>
              <p className="text-xs text-slate-400">Fill in party details and terms. Kanoon AI will convert them into plain language clauses.</p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-xs text-amber-400 hover:underline"
            >
              ← Change Template
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Party A (First Party) Card */}
            <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-extrabold">1</span>
                  <span>First Party (Owner / Landlord / Client / Discloser)</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Legal Name / Business Name *</label>
                  <input
                    type="text"
                    value={formData.partyA.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyA: { ...prev.partyA, name: e.target.value }
                    }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Ramesh Sharma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Entity Type</label>
                    <select
                      value={formData.partyA.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyA: { ...prev.partyA, type: e.target.value as 'individual' | 'business' }
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="individual">Individual / Citizen</option>
                      <option value="business">Pvt Ltd / LLP / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">PAN / GST (Optional)</label>
                    <input
                      type="text"
                      value={formData.partyA.panOrGst || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyA: { ...prev.partyA, panOrGst: e.target.value }
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="e.g. ABCPS1234F"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Residential / Office Address</label>
                  <input
                    type="text"
                    value={formData.partyA.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyA: { ...prev.partyA, address: e.target.value }
                    }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Flat 402, Sunshine Apartments, Bengaluru"
                  />
                </div>
              </div>
            </div>

            {/* Party B (Second Party) Card */}
            <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-extrabold">2</span>
                  <span>Second Party (Tenant / Freelancer / Recipient)</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Legal Name / Business Name *</label>
                  <input
                    type="text"
                    value={formData.partyB.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyB: { ...prev.partyB, name: e.target.value }
                    }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Priya Tech Pvt Ltd"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Entity Type</label>
                    <select
                      value={formData.partyB.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyB: { ...prev.partyB, type: e.target.value as 'individual' | 'business' }
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="individual">Individual / Citizen</option>
                      <option value="business">Pvt Ltd / LLP / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Contact Phone / Email</label>
                    <input
                      type="text"
                      value={formData.partyB.contact}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyB: { ...prev.partyB, contact: e.target.value }
                      }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="+91 98765 00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Address</label>
                  <input
                    type="text"
                    value={formData.partyB.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyB: { ...prev.partyB, address: e.target.value }
                    }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Suite 12, Tech Park, Outer Ring Road, Bengaluru"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Financials & Jurisdiction Terms */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Financial Terms & Indian Legal Jurisdiction</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Indian State (Stamp Duty)</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    state: e.target.value,
                    governingLawState: e.target.value
                  }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">City of Jurisdiction</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Monthly Fee / Total Amount (₹)</label>
                <input
                  type="number"
                  value={formData.financialAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, financialAmount: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Security Deposit / Advance (₹)</label>
                <input
                  type="number"
                  value={formData.securityDeposit || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Agreement Duration (Months)</label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notice Period (Days)</label>
                <input
                  type="number"
                  value={formData.noticePeriodDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, noticePeriodDays: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Lock-in Period (Months)</label>
                <input
                  type="number"
                  value={formData.lockInPeriodMonths || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, lockInPeriodMonths: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Dispute Resolution Mode</label>
                <select
                  value={formData.disputeResolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, disputeResolution: e.target.value as 'Arbitration' | 'Courts' | 'Mutual Conciliation' }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Arbitration">Fast Arbitration (Act 1996)</option>
                  <option value="Courts">Civil Court Jurisdiction</option>
                  <option value="Mutual Conciliation">Mutual Conciliation First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Clauses */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Custom Agreed Clauses & Specific Requirements</span>
              </h3>
              <button
                onClick={handleAddClause}
                className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500/20 font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Clause</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.customClauses.map((clause, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono w-6 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={clause}
                    onChange={(e) => handleClauseChange(idx, e.target.value)}
                    placeholder="Enter custom requirement e.g., 'No pets allowed without landlord approval'"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleRemoveClause(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 text-sm"
            >
              Back
            </button>

            <button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold hover:brightness-110 transition-all shadow-lg shadow-amber-500/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>AI Drafting in Plain Language...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Plain-Language Draft</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Generated Document Result, Plain English Summary & Clause Analysis */}
      {step === 3 && generatedDoc && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Header */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-slate-100">{generatedDoc.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Legally Enforceable</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created for <strong className="text-slate-300">{formData.partyA.name}</strong> & <strong className="text-slate-300">{formData.partyB.name}</strong> ({generatedDoc.state})
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <button
                onClick={handleCopyText}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => onOpenDocumentModal(generatedDoc)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-medium border border-amber-500/30 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Full-Screen Print View</span>
              </button>
            </div>
          </div>

          {/* 2 Column Layout: Plain English Side & Draft Document */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Plain Language Breakdown & Stamp Duty Info (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Plain English Summary Box */}
              <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Plain Language Overview (No Jargon)</span>
                </div>
                <div className="text-xs text-slate-200 space-y-2 whitespace-pre-line leading-relaxed font-sans">
                  {generatedDoc.plainSummaryText}
                </div>
              </div>

              {/* Indian Stamp Duty & Registration Checker */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>State Compliance: {generatedDoc.state}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Recommended Stamp Paper Value:</span>
                    <p className="font-semibold text-amber-300">{generatedDoc.stampDutyRequired}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className={`p-2.5 rounded-xl border ${generatedDoc.registrationRequired ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <span className="block text-[10px] uppercase font-bold">Sub-Registrar Reg.</span>
                      <span className="font-bold text-xs">{generatedDoc.registrationRequired ? 'Mandatory (>11 Mos)' : 'Optional (≤11 Mos)'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="block text-[10px] uppercase font-bold">Notarization</span>
                      <span className="font-bold text-xs">Notary Public Recommended</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clause by Clause Safety Analysis */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Clause Risk & Protection Assessment</span>
                </h3>

                <div className="space-y-3">
                  {generatedDoc.clauses.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{c.clauseTitle}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {c.riskLevel} risk
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{c.plainLanguageText}</p>
                      <div className="text-[11px] text-amber-400/90 italic flex items-center space-x-1">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        <span>{c.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Full Draft Document Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700 space-y-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">PLAIN LANGUAGE LEGAL DRAFT</span>
                  <span className="text-xs text-slate-400">Indian Format • {generatedDoc.createdAt}</span>
                </div>

                <div className="whitespace-pre-wrap font-serif text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-6 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-h-[600px] overflow-y-auto">
                  {generatedDoc.draftText}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Governing Act: Indian Contract Act 1872</span>
                  <button
                    onClick={() => setStep(2)}
                    className="text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Edit Form Data</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
