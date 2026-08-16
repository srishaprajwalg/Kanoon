import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Scale, ShieldCheck, ExternalLink, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { LegalRAGEngine } from '../services/ragEngine';
import type { LegalStatuteCitation } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citations?: LegalStatuteCitation[];
  isLoading?: boolean;
}

interface LegalChatbotProps {
  apiKey?: string;
}

const QUICK_PROMPTS = [
  "What stamp duty applies to a rental agreement in Bengaluru under Karnataka Stamp Act?",
  "What is the penalty for contract breach under Section 73 of the Indian Contract Act 1872?",
  "What eviction protections exist for tenants under Section 22 of Karnataka Rent Act 1999?",
  "Is an employee non-compete agreement valid under Section 27 of the Indian Contract Act?",
  "When is registration mandatory under Section 17 of the Registration Act 1908?"
];

const formatMatchScore = (citation: LegalStatuteCitation): number => {
  const scoreRaw = citation.confidenceScore ?? citation.similarityScore ?? citation.matchScore ?? 0;
  let percent = scoreRaw > 1 ? scoreRaw : scoreRaw * 100;
  percent = Math.min(100, Math.max(0, percent));
  return Math.round(percent);
};

export const LegalChatbot: React.FC<LegalChatbotProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! I am Kanoon AI Unified Legal Chatbot. Ask me any legal query—I search across both Central (Union) Laws and Karnataka State Statutes with verifiable citations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedStatuteIds, setExpandedStatuteIds] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isProcessing) return;

    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botLoadingId = (Date.now() + 1).toString();
    const botLoadingMsg: ChatMessage = {
      id: botLoadingId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, botLoadingMsg]);
    if (!queryText) setInputQuery('');
    setIsProcessing(true);

    try {
      // 1. Retrieve grounded legal statutory citations & evidence-grounded LLM synthesis via /api/chat-explain
      let citations: LegalStatuteCitation[] = [];
      let explanation = '';

      try {
        const resp = await fetch('http://localhost:5000/api/chat-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryText: textToSend })
        });
        if (resp.ok) {
          const data = await resp.json();
          citations = data.citations || [];
          explanation = data.explanation || '';
        } else {
          citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(textToSend, undefined, 4, 0.4);
          explanation = LegalRAGEngine.generateGroundedExplanation(textToSend, citations);
        }
      } catch (_err) {
        citations = await LegalRAGEngine.retrieveRelevantStatutesAsync(textToSend, undefined, 4, 0.4);
        explanation = LegalRAGEngine.generateGroundedExplanation(textToSend, citations);
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? {
          ...msg,
          text: explanation,
          citations: citations,
          isLoading: false
        } : msg
      ));
    } catch (err) {
      console.error('Legal Chatbot processing error:', err);
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? {
          ...msg,
          text: 'Apologies, an error occurred while searching statutory databases. Please check your query or retry.',
          isLoading: false
        } : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Scale className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-slate-100 text-lg tracking-tight">Kanoon Unified Legal Chatbot</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                Union + Karnataka RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">Verifiable statutory grounding with 384D dense semantic vector retrieval</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Zero-Hallucination Grounded
          </span>
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-start space-x-3 max-w-3xl">
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              )}

              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-amber-600/10'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}>
                {msg.isLoading ? (
                  <div className="flex items-center space-x-3 text-slate-400 py-1">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-xs">Searching Union & Karnataka statutory databases...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}

                {/* Statutory Citations Section */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Verified Statutory Citations ({msg.citations.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {msg.citations.map((citation, idx) => {
                        const citKey = citation.id || `cit_${idx}`;
                        const isExpanded = !!expandedStatuteIds[citKey];
                        return (
                          <div key={citKey} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all text-xs">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                citation.jurisdiction === 'KARNATAKA' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {citation.jurisdiction || 'CENTRAL'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Match Score: {formatMatchScore(citation)}%
                              </span>
                            </div>
                            
                            <div className="font-semibold text-slate-200 truncate">
                              {citation.actShortTitle} {citation.sectionNumber}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mb-2">
                              {citation.sectionTitle}
                            </div>

                            <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                              <button
                                type="button"
                                onClick={() => setExpandedStatuteIds(prev => ({ ...prev, [citKey]: !prev[citKey] }))}
                                className="inline-flex items-center text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-medium"
                              >
                                <BookOpen className="w-2.5 h-2.5 mr-1" />
                                <span>{isExpanded ? 'Hide Statutory Text' : 'View Statutory Text'}</span>
                              </button>

                              {citation.sourceUrl && (
                                <a
                                  href={citation.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-medium ml-auto"
                                >
                                  <span>View Official Source</span>
                                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                </a>
                              )}
                            </div>

                            {isExpanded && (
                              <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                <div className="text-[9px] text-amber-400 font-sans uppercase tracking-wider mb-1 font-bold">Verbatim Statutory Text:</div>
                                {citation.statuteText}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-11">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/50 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">Quick Queries:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isProcessing}
            className="px-3 py-1 text-xs rounded-full bg-slate-800/80 hover:bg-amber-500/10 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/30 text-slate-300 transition-all flex-shrink-0 whitespace-nowrap disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any Central or Karnataka legal question (e.g., stamp duty, rent control, breach of contract)..."
          disabled={isProcessing}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 flex-shrink-0"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
