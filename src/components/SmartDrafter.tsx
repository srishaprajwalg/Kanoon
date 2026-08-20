import React, { useState, useEffect } from 'react';
import { LEGAL_TEMPLATES } from '../data/legalTemplates';
import type { DocumentFormData, GeneratedDocument, ValidationResult } from '../types';
import { KanoonAIService } from '../services/aiService';
import { LegalRAGEngine } from '../services/ragEngine';
import { ClauseCustomizer } from './ClauseCustomizer';
import { 
  FileText, Sparkles, Shield, Plus, Trash2, Download, Printer, 
  Copy, CheckCircle2, ChevronRight, Scale, Info, Layers, RefreshCw,
  AlertTriangle, BookOpen, Check, Lock, ExternalLink, Sliders
} from 'lucide-react';
import { exportDocumentToPDF } from '../utils/pdfExporter';

interface SmartDrafterProps {
  apiKey?: string;
  onOpenDocumentModal: (doc: GeneratedDocument) => void;
}

const getDocumentTypeMetadata = (templateId: string) => {
  switch (templateId) {
    case 'rent_agreement':
      return {
        partyALabel: 'First Party (Licensor / Property Owner)',
        partyBLabel: 'Second Party (Licensee / Tenant)',
        partyAPlaceholder: 'e.g. Ramesh Sharma',
        partyBPlaceholder: 'e.g. Priya Tech Ventures Pvt Ltd',
        financialLabel: 'Monthly License Fee / Rent (₹)',
        financialShow: true,
        depositLabel: 'Security Deposit / Advance (₹)',
        depositShow: true,
        durationLabel: 'Agreement Tenure (Months)',
        durationShow: true,
        lockInLabel: 'Lock-in Period (Months)',
        lockInShow: true,
        noticeLabel: 'Termination Notice Period (Days)',
        noticeShow: true
      };
    case 'nda_agreement':
      return {
        partyALabel: 'First Party (Disclosing Party)',
        partyBLabel: 'Second Party (Receiving Party)',
        partyAPlaceholder: 'e.g. Apex AI Technologies Pvt Ltd',
        partyBPlaceholder: 'e.g. CyberSec Systems LLP',
        financialLabel: 'Stipulated Damages / Value (₹)',
        financialShow: false,
        depositLabel: 'Security Deposit (N/A)',
        depositShow: false,
        durationLabel: 'Confidentiality Obligations Tenure (Months)',
        durationShow: true,
        lockInLabel: 'Lock-in Commitment (N/A)',
        lockInShow: false,
        noticeLabel: 'Notice Period for Asset Surrender (Days)',
        noticeShow: true
      };
    case 'freelance_service':
    case 'freelance_contract':
    case 'service_agreement':
      return {
        partyALabel: 'First Party (Service Provider / Contractor)',
        partyBLabel: 'Second Party (Client / Principal)',
        partyAPlaceholder: 'e.g. Dev Studio Solutions Pvt Ltd',
        partyBPlaceholder: 'e.g. Global Tech Enterprise Inc',
        financialLabel: 'Total Service Fee / Contract Value (₹)',
        financialShow: true,
        depositLabel: 'Advance Retainer Deposit (₹)',
        depositShow: true,
        durationLabel: 'Project Duration (Months)',
        durationShow: true,
        lockInLabel: 'Minimum Service Commitment (Months)',
        lockInShow: false,
        noticeLabel: 'Termination Notice Period (Days)',
        noticeShow: true
      };
    case 'employment_contract':
      return {
        partyALabel: 'First Party (Employer / Company)',
        partyBLabel: 'Second Party (Employee)',
        partyAPlaceholder: 'e.g. TechCorp India Pvt Ltd',
        partyBPlaceholder: 'e.g. Rahul Verma',
        financialLabel: 'Annual Compensation / CTC (₹)',
        financialShow: true,
        depositLabel: 'Joining Advance (N/A)',
        depositShow: false,
        durationLabel: 'Initial Agreement Term (Months)',
        durationShow: true,
        lockInLabel: 'Probation Period (Months)',
        lockInShow: true,
        noticeLabel: 'Resignation Notice Period (Days)',
        noticeShow: true
      };
    case 'partnership_deed':
      return {
        partyALabel: 'First Partner',
        partyBLabel: 'Second Partner',
        partyAPlaceholder: 'e.g. Anil Kumar',
        partyBPlaceholder: 'e.g. Sunita Rao',
        financialLabel: 'Total Initial Capital Contribution (₹)',
        financialShow: true,
        depositLabel: 'Reserve Fund (N/A)',
        depositShow: false,
        durationLabel: 'Deed Tenure (Months)',
        durationShow: true,
        lockInLabel: 'Lock-in / Exit Restriction (Months)',
        lockInShow: false,
        noticeLabel: 'Partner Exit Notice (Days)',
        noticeShow: true
      };
    case 'consumer_legal_notice':
    case 'legal_notice':
      return {
        partyALabel: 'First Party (Complainant / Sender)',
        partyBLabel: 'Second Party (Opposing Party / Recipient)',
        partyAPlaceholder: 'e.g. Vikram Seth',
        partyBPlaceholder: 'e.g. E-Commerce Retailing Ltd',
        financialLabel: 'Claim / Refund Demand Amount (₹)',
        financialShow: true,
        depositLabel: 'Damage Claim (N/A)',
        depositShow: false,
        durationLabel: 'Default Tenure (N/A)',
        durationShow: false,
        lockInLabel: 'Lock-in Period (N/A)',
        lockInShow: false,
        noticeLabel: 'Response Deadline (Days)',
        noticeShow: true
      };
    default:
      return {
        partyALabel: 'First Party',
        partyBLabel: 'Second Party',
        partyAPlaceholder: 'Full Legal Name',
        partyBPlaceholder: 'Full Legal Name',
        financialLabel: 'Financial Amount (₹)',
        financialShow: true,
        depositLabel: 'Security Deposit (₹)',
        depositShow: true,
        durationLabel: 'Duration (Months)',
        durationShow: true,
        lockInLabel: 'Lock-in Period (Months)',
        lockInShow: true,
        noticeLabel: 'Notice Period (Days)',
        noticeShow: true
      };
  }
};

export const SmartDrafter: React.FC<SmartDrafterProps> = ({ apiKey, onOpenDocumentModal }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('rent_agreement');
  const [step, setStep] = useState<number>(1);
  const [step2SubTab, setStep2SubTab] = useState<'terms' | 'clauses'>('terms');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [privacyConsentGiven, setPrivacyConsentGiven] = useState<boolean>(true);

  const selectedTemplate = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId) || LEGAL_TEMPLATES[0];
  const meta = getDocumentTypeMetadata(selectedTemplateId);
  const isSupportedTemplate = selectedTemplate && selectedTemplate.isSupported !== false;

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

  // Pre-generation validation result
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    LegalRAGEngine.validateDocumentInputs(formData)
  );

  useEffect(() => {
    setValidationResult(LegalRAGEngine.validateDocumentInputs(formData));
  }, [formData]);

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = LEGAL_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplateId(templateId);
    setFormData(prev => {
      const activeState = prev.state || tmpl.defaultFormData.governingLawState || 'Karnataka';
      const activeCity = prev.city || 'Bengaluru';
      return {
        ...prev,
        templateId: tmpl.id,
        documentTitle: tmpl.defaultFormData.documentTitle || tmpl.name,
        durationMonths: tmpl.defaultFormData.durationMonths ?? 12,
        financialAmount: tmpl.defaultFormData.financialAmount ?? 0,
        securityDeposit: tmpl.defaultFormData.securityDeposit ?? 0,
        noticePeriodDays: tmpl.defaultFormData.noticePeriodDays ?? 30,
        lockInPeriodMonths: tmpl.defaultFormData.lockInPeriodMonths ?? 0,
        state: activeState,
        governingLawState: activeState,
        city: activeCity,
        customClauses: tmpl.defaultFormData.customClauses ? [...tmpl.defaultFormData.customClauses] : [],
        selectedClauseConfigs: []
      };
    });
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
    if (!privacyConsentGiven) return;
    setIsGenerating(true);
    try {
      const doc = await KanoonAIService.generateDocument(formData, apiKey);
      setGeneratedDoc(doc);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplaceWithSaferClause = (clauseIndex: number, saferText?: string) => {
    if (!generatedDoc || !saferText) return;
    const updatedClauses = [...generatedDoc.clauses];
    updatedClauses[clauseIndex] = {
      ...updatedClauses[clauseIndex],
      plainLanguageText: saferText,
      recommendation: 'Replaced with balanced, safer clause alternative.'
    };

    setGeneratedDoc({
      ...generatedDoc,
      clauses: updatedClauses,
      riskScore: Math.min(100, generatedDoc.riskScore + 5)
    });
  };

  const handleCopyText = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    exportDocumentToPDF({
      title: generatedDoc.title,
      state: generatedDoc.state,
      draftText: generatedDoc.draftText
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl bg-white p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-stone-100 border border-stone-200 text-legal-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semantic Vector RAG-Grounded AI Legal Drafts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
              Draft Plain-Language Contracts <span className="text-legal-700">Grounded in Authentic Indian Law</span>
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
              Every document is grounded by supplying actual retrieved statutory sections from Indian law (Contract Act 1872, Transfer of Property Act 1882, IT Act 2000) directly to Gemini AI.
            </p>
          </div>

          {/* Stepper indicators */}
          <div className="flex items-center space-x-2 bg-stone-50 p-2 rounded-xl border border-stone-200 self-stretch md:self-auto justify-center">
            <button 
              onClick={() => setStep(1)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 1 ? 'bg-white border border-stone-200 text-legal-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>1. Template</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button 
              onClick={() => setStep(2)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 2 ? 'bg-white border border-stone-200 text-legal-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>2. Terms & Check</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button 
              disabled={!generatedDoc}
              onClick={() => generatedDoc && setStep(3)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${step === 3 ? 'bg-white border border-stone-200 text-legal-700 font-bold shadow-sm' : 'text-slate-500'}`}
            >
              <span>3. Workspace & Citations</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Legal Document Template */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Select Document Type</span>
            </h2>
            <span className="text-xs text-slate-600">Grounded in Indian Legal Frameworks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEGAL_TEMPLATES.map(template => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`cursor-pointer rounded-xl p-5 transition-all duration-200 bg-white relative flex flex-col justify-between border ${
                    isSelected
                      ? 'border-legal-600 ring-1 ring-legal-600 bg-legal-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-stone-50 shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-legal-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 inline-block mb-3 border border-slate-200">
                      {template.category}
                    </span>
                    <h3 className={`font-bold text-base mb-1.5 pr-6 ${isSelected ? 'text-legal-900' : 'text-slate-900'}`}>{template.name}</h3>
                    <p className={`text-xs line-clamp-2 mb-4 ${isSelected ? 'text-legal-700' : 'text-slate-600'}`}>{template.description}</p>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs ${isSelected ? 'border-legal-200 text-legal-700' : 'border-slate-200 text-slate-600'}`}>
                    <span>Target: <strong className={isSelected ? 'text-legal-900' : 'text-slate-700'}>{template.popularIn.split(',')[0]}</strong></span>
                    <span className="font-medium">⚡ {template.estimatedTime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-legal-600 text-white font-bold hover:bg-legal-700 transition-all shadow-sm"
            >
              <span>Next: Input Terms & Validate</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Guided Inputs & Completeness Detector */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Customizing: {selectedTemplate.name}</span>
              </h2>
              <p className="text-xs text-slate-600">Fill in key terms. Missing data is flagged prior to drafting.</p>
            </div>

            <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline">
              ← Change Template
            </button>
          </div>

          {/* MISSING INFO & COMPLETENESS VALIDATOR BANNER */}
          <div className={`p-4 rounded-xl border transition-all ${
            validationResult.isComplete
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-3 ${validationResult.isComplete ? 'border-emerald-200' : 'border-amber-200'}`}>
              <div className="flex items-center space-x-2">
                {validationResult.isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-bold text-sm">
                  Document Completeness Score: {validationResult.score}/100
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-white border border-stone-200 shadow-sm">
                {validationResult.isComplete ? 'Ready for AI Drafting' : 'Missing Information Detected'}
              </span>
            </div>

            {validationResult.missingFields.length > 0 && (
              <div className="space-y-2 mb-3">
                <span className="text-xs font-bold block">Required Input Corrections:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {validationResult.missingFields.map((mf, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-amber-100 text-xs space-y-1 shadow-sm">
                      <span className="font-bold text-red-600 flex items-center space-x-1">
                        <span>•</span>
                        <span>{mf.fieldName}</span>
                      </span>
                      <p className="text-slate-700 text-[11px]">{mf.message}</p>
                      <p className="text-amber-700 text-[10px] font-medium">💡 {mf.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResult.recommendations.length > 0 && (
              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold block text-indigo-600">Statutory Compliance Recommendations:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  {validationResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!isSupportedTemplate ? (
            <div className="bg-white shadow-sm p-8 rounded-xl border border-stone-200 text-center space-y-4 my-6">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-slate-400 flex items-center justify-center mx-auto border border-stone-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedTemplate.name}</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Statutory RAG grounding and legal draft templates for this category are currently under legal review and validation. Please select a supported document type.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-lg bg-white border border-stone-300 text-slate-700 font-bold hover:bg-stone-50 text-xs transition-colors shadow-sm"
              >
                ← Select Supported Template
              </button>
            </div>
          ) : (
            <>
          {/* STEP 2 SUB-TAB NAVIGATION */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setStep2SubTab('terms')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                step2SubTab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Basic Terms & Parties</span>
            </button>

            <button
              onClick={() => setStep2SubTab('clauses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                step2SubTab === 'clauses'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Clause Library & Custom Riders</span>
              {(formData.selectedClauseConfigs?.length || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-50 text-indigo-600 font-extrabold border border-indigo-600/30">
                  {formData.selectedClauseConfigs?.length}
                </span>
              )}
            </button>
          </div>

          {step2SubTab === 'clauses' ? (
            <ClauseCustomizer
              templateId={formData.templateId}
              selectedConfigs={formData.selectedClauseConfigs || []}
              customClauses={formData.customUserClauses || []}
              onChangeSelectedConfigs={(configs) => setFormData(prev => ({ ...prev, selectedClauseConfigs: configs }))}
              onChangeCustomClauses={(customs) => setFormData(prev => ({ ...prev, customUserClauses: customs }))}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Party A (First Party) Card */}
            <div className="bg-white shadow-sm p-5 rounded-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-extrabold">1</span>
                  <span>{meta.partyALabel}</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={formData.partyA.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyA: { ...prev.partyA, name: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={meta.partyAPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Entity Type</label>
                    <select
                      value={formData.partyA.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyA: { ...prev.partyA, type: e.target.value as 'individual' | 'business' }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="individual">Individual Citizen</option>
                      <option value="business">Company / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">PAN / GST (Optional)</label>
                    <input
                      type="text"
                      value={formData.partyA.panOrGst || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyA: { ...prev.partyA, panOrGst: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Address *</label>
                  <input
                    type="text"
                    value={formData.partyA.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyA: { ...prev.partyA, address: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Party B (Second Party) Card */}
            <div className="bg-white shadow-sm p-5 rounded-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-extrabold">2</span>
                  <span>{meta.partyBLabel}</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={formData.partyB.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyB: { ...prev.partyB, name: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={meta.partyBPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Entity Type</label>
                    <select
                      value={formData.partyB.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyB: { ...prev.partyB, type: e.target.value as 'individual' | 'business' }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="individual">Individual Citizen</option>
                      <option value="business">Company / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phone / Email</label>
                    <input
                      type="text"
                      value={formData.partyB.contact}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        partyB: { ...prev.partyB, contact: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Address *</label>
                  <input
                    type="text"
                    value={formData.partyB.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      partyB: { ...prev.partyB, address: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Financials & Jurisdiction Terms */}
          <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Document Commercial Terms & Indian Legal Jurisdiction</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Indian State Jurisdiction</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    state: e.target.value,
                    governingLawState: e.target.value
                  }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {meta.financialShow && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{meta.financialLabel}</label>
                  <input
                    type="number"
                    value={formData.financialAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, financialAmount: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {meta.depositShow && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{meta.depositLabel}</label>
                  <input
                    type="number"
                    value={formData.securityDeposit || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {meta.durationShow && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{meta.durationLabel}</label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {meta.noticeShow && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{meta.noticeLabel}</label>
                  <input
                    type="number"
                    value={formData.noticePeriodDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, noticePeriodDays: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {meta.lockInShow && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{meta.lockInLabel}</label>
                  <input
                    type="number"
                    value={formData.lockInPeriodMonths || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, lockInPeriodMonths: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-medium mb-1">Dispute Resolution</label>
                <select
                  value={formData.disputeResolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, disputeResolution: e.target.value as 'Arbitration' | 'Courts' | 'Mutual Conciliation' }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Arbitration">Fast Arbitration (Act 1996)</option>
                  <option value="Courts">Civil Court Jurisdiction</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Specific Terms */}
          <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Custom Specific Terms</span>
              </h3>
              <button
                type="button"
                onClick={handleAddClause}
                className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-600/30 px-3 py-1 rounded-lg hover:bg-indigo-100 font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
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
                    placeholder="Enter custom requirement e.g., 'No structural alterations without written consent'"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveClause(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
          )}

          {/* Privacy & AI Consent Box */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 font-bold">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Data Privacy & AI Processing Notice</span>
            </div>
            <label className="flex items-start space-x-2 cursor-pointer text-slate-600 text-[11px]">
              <input
                type="checkbox"
                checked={privacyConsentGiven}
                onChange={(e) => setPrivacyConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-legal-600 focus:ring-legal-500 focus:ring-offset-0 bg-white"
              />
              <span>
                I consent to sending contract parameter metadata to Kanoon AI API for statutory RAG grounding and legal drafting. Personal data is not stored or logged permanently.
              </span>
            </label>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-700 text-sm"
            >
              Back
            </button>

            <button
              disabled={isGenerating || !validationResult.isComplete || !privacyConsentGiven}
              onClick={handleGenerate}
              className="flex items-center space-x-2 px-8 py-3 rounded-lg bg-legal-600 text-white font-bold hover:bg-legal-700 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>AI Drafting & Semantic RAG Grounding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate RAG Grounded Draft</span>
                </>
              )}
            </button>
          </div>
          </>
          )}
        </div>
      )}

      {/* STEP 3: Generated Document Workspace, Citations & Clause Safety Workstation */}
      {step === 3 && generatedDoc && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Bar */}
          <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-slate-900">{generatedDoc.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-600/30 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Statutory Grounded Draft</span>
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Parties: <strong className="text-slate-700">{formData.partyA.name}</strong> & <strong className="text-slate-700">{formData.partyB.name}</strong> ({generatedDoc.state})
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <button
                onClick={handleCopyText}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-900 text-xs font-medium border border-slate-300"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-legal-600 hover:bg-legal-700 text-white text-xs font-bold shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => onOpenDocumentModal(generatedDoc)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-legal-700 text-xs font-medium border border-stone-300 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Full-Screen Print</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Statutory Citations, Plain Summary & Clause Replacer (5 cols) */}
            <div className="lg:col-span-5 space-y-6">

              {/* RAG Statutory Citations Panel */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Retrieved Statutory Citations (RAG)</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-slate-600 border border-stone-200">
                    India Code Verified
                  </span>
                </div>

                {generatedDoc.hasSufficientEvidence === false && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Insufficient Statutory Evidence Warning</strong>
                      <p className="text-[11px] text-indigo-500/80 mt-0.5">
                        {generatedDoc.evidenceWarning || 'Insufficient statutory evidence was retrieved to confidently support specific statutory section claims.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {(!generatedDoc.citations || generatedDoc.citations.length === 0) ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-600">
                      No directly relevant statutory references found
                    </div>
                  ) : (
                    generatedDoc.citations.map((cit, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-indigo-600 flex items-center space-x-1">
                          <span>{cit.actShortTitle}</span>
                          {cit.sourceUrl && (
                            <a
                              href={cit.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500 ml-1 inline-flex items-center"
                              title="View official statutory text on India Code"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </span>
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                            cit.jurisdiction === 'KARNATAKA' 
                              ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/40' 
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>
                            📍 {cit.jurisdiction || 'CENTRAL'}
                          </span>
                          {(cit.similarityScore !== undefined || cit.confidenceScore !== undefined) && (
                            <span className="text-[10px] font-mono bg-slate-100 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-300">
                              Similarity: {(cit.similarityScore || cit.confidenceScore || 0.85).toFixed(2)} | {cit.confidenceLevel || 'High'}
                            </span>
                          )}
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{cit.sectionNumber}</span>
                        </div>
                      </div>
                      <span className="font-semibold block text-slate-700">{cit.sectionTitle}</span>
                      {cit.chapter && (
                        <span className="text-[10px] text-slate-600 block font-mono">{cit.chapter} ({cit.actNumber || cit.year})</span>
                      )}
                      <p className="text-slate-600 text-[11px] font-serif italic border-l-2 border-indigo-600/30 pl-2">
                        "{cit.statuteText}"
                      </p>
                      <div className="pt-1 border-t border-slate-200 space-y-1 text-[10px] text-slate-600">
                        {cit.whyThisClause && (
                          <div className="bg-slate-50 p-2 rounded-md border border-slate-200 text-slate-700">
                            <span className="font-semibold text-indigo-600 block mb-0.5">💡 Why this clause?</span>
                            <p className="text-[10.5px] leading-relaxed text-slate-700">{cit.whyThisClause}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-0.5 flex-wrap gap-1">
                          <span className="text-indigo-600/90 font-mono">📌 {cit.relevanceExplanation}</span>
                          <div className="flex items-center space-x-2">
                            {cit.sourceTier && (
                              <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1 rounded">
                                {cit.sourceTier}
                              </span>
                            )}
                            {cit.sourceUrl && (
                              <a
                                href={cit.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500 underline font-mono flex items-center space-x-1 text-[10.5px]"
                              >
                                <span>View Official Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {(cit.pdfUrl || cit.sourceUrl) && (
                              <a
                                href={cit.pdfUrl || cit.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-800 underline font-mono flex items-center space-x-1 text-[10.5px]"
                              >
                                <span>View Official PDF</span>
                                <FileText className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>

              {/* Plain Language Summary */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Plain Language Summary</span>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {generatedDoc.plainSummaryText}
                </div>
              </div>

              {/* Clause Risk Workstation & Safer Replacement */}
              <div className="bg-white shadow-sm p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Clause Risk & Safer Clause Suggestions</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded">
                    Calculated Risk Score: {generatedDoc.riskScore}/100
                  </span>
                </div>

                <div className="space-y-3">
                  {generatedDoc.clauses.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{c.clauseTitle}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.riskLevel === 'high' || c.riskLevel === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : c.riskLevel === 'medium'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-600/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-200'
                        }`}>
                          {c.riskLevel} risk
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed">{c.plainLanguageText}</p>

                      <div className="text-[11px] text-indigo-600 italic">
                        💡 <strong>Advice:</strong> {c.recommendation}
                      </div>

                      {c.saferAlternative && (
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-400 block">Suggested Safer Alternative:</span>
                          <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                            "{c.saferAlternative}"
                          </p>
                          <button
                            onClick={() => handleReplaceWithSaferClause(i, c.saferAlternative)}
                            className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Replace with Safer Clause</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Grounded Legal Document Text Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-stone-100 p-4 sm:p-8 rounded-xl border border-stone-200 space-y-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Generated Draft</span>
                  <span className="text-xs text-slate-500">Created: {generatedDoc.createdAt}</span>
                </div>

                {/* THE DOCUMENT PAPER */}
                <div className="whitespace-pre-wrap font-serif text-slate-900 text-sm sm:text-base leading-relaxed bg-white p-8 sm:p-12 rounded border border-stone-300 shadow-md max-h-[600px] overflow-y-auto select-text mx-auto" style={{ maxWidth: '210mm' }}>
                  {generatedDoc.draftText}
                </div>

                {/* Responsible Disclaimer */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>{generatedDoc.disclaimer}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
