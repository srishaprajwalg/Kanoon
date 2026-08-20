import React, { useState } from 'react';
import type {
  ClauseLibraryItem,
  SelectedClauseConfig,
  CustomUserClause
} from '../types';
import { CLAUSE_LIBRARY } from '../data/clauseLibrary';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Edit3
} from 'lucide-react';

interface ClauseCustomizerProps {
  templateId: string;
  selectedConfigs: SelectedClauseConfig[];
  customClauses: CustomUserClause[];
  onChangeSelectedConfigs: (configs: SelectedClauseConfig[]) => void;
  onChangeCustomClauses: (customs: CustomUserClause[]) => void;
}

export const ClauseCustomizer: React.FC<ClauseCustomizerProps> = ({
  templateId,
  selectedConfigs,
  customClauses,
  onChangeSelectedConfigs,
  onChangeCustomClauses
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  // Custom clause input state
  const [newCustomTitle, setNewCustomTitle] = useState<string>('');
  const [newCustomCategory, setNewCustomCategory] = useState<string>('Custom Protection');
  const [newCustomText, setNewCustomText] = useState<string>('');
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);

  const categories = ['all', 'recommended', 'Confidentiality', 'IP', 'Liability', 'Dispute', 'Termination', 'Payment', 'General'];

  // Filter clauses by search, category, and recommendation
  const filteredLibrary = CLAUSE_LIBRARY.filter((item) => {
    const isRecommended = item.applicableDocumentTypes.includes(templateId);
    
    if (activeCategory === 'recommended' && !isRecommended) return false;
    if (activeCategory !== 'all' && activeCategory !== 'recommended' && item.category !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.plainEnglishExplanation.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isClauseSelected = (clauseId: string) => {
    return selectedConfigs.some((c) => c.clauseId === clauseId);
  };

  const getSelectedConfig = (clauseId: string) => {
    return selectedConfigs.find((c) => c.clauseId === clauseId);
  };

  const handleToggleClause = (item: ClauseLibraryItem) => {
    if (isClauseSelected(item.id)) {
      // Remove
      onChangeSelectedConfigs(selectedConfigs.filter((c) => c.clauseId !== item.id));
    } else {
      // Add with default parameter values
      const initialParams: Record<string, string | number> = {};
      if (item.parameters) {
        item.parameters.forEach((p) => {
          initialParams[p.key] = p.defaultValue;
        });
      }

      // Format text with default params
      let formattedText = item.defaultClauseText;
      Object.entries(initialParams).forEach(([k, v]) => {
        formattedText = formattedText.replace(`{${k}}`, String(v));
      });

      const newConfig: SelectedClauseConfig = {
        clauseId: item.id,
        isCustom: false,
        title: item.name,
        category: item.category,
        clauseText: formattedText,
        paramValues: initialParams,
        sourceType: item.applicableDocumentTypes.includes(templateId) ? 'statutory' : 'recommended'
      };

      onChangeSelectedConfigs([...selectedConfigs, newConfig]);
    }
  };

  const handleParamChange = (item: ClauseLibraryItem, paramKey: string, value: string | number) => {
    const existing = getSelectedConfig(item.id);
    if (!existing) return;

    const updatedParams = {
      ...(existing.paramValues || {}),
      [paramKey]: value
    };

    // Reformat clause text with updated parameters
    let formattedText = item.defaultClauseText;
    Object.entries(updatedParams).forEach(([k, v]) => {
      formattedText = formattedText.replace(`{${k}}`, String(v));
    });

    const updatedConfigs = selectedConfigs.map((c) =>
      c.clauseId === item.id
        ? {
            ...c,
            paramValues: updatedParams,
            clauseText: formattedText
          }
        : c
    );

    onChangeSelectedConfigs(updatedConfigs);
  };

  const handleAddCustomClause = () => {
    if (!newCustomTitle.trim() || !newCustomText.trim()) return;

    const customId = `custom_clause_${Date.now()}`;
    const newCustom: CustomUserClause = {
      id: customId,
      title: newCustomTitle.trim(),
      category: newCustomCategory,
      clauseText: newCustomText.trim()
    };

    onChangeCustomClauses([...customClauses, newCustom]);

    // Also add to selectedConfigs as user_custom
    const customConfig: SelectedClauseConfig = {
      clauseId: customId,
      isCustom: true,
      title: newCustom.title,
      category: newCustom.category,
      clauseText: newCustom.clauseText,
      sourceType: 'user_custom'
    };

    onChangeSelectedConfigs([...selectedConfigs, customConfig]);

    setNewCustomTitle('');
    setNewCustomText('');
    setShowCustomForm(false);
  };

  const handleRemoveCustomClause = (id: string) => {
    onChangeCustomClauses(customClauses.filter((c) => c.id !== id));
    onChangeSelectedConfigs(selectedConfigs.filter((c) => c.clauseId !== id));
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL RISK</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-600/30">HIGH RISK</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MEDIUM RISK</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-200">LOW RISK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Clause Library & Custom Rider Customizer</span>
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-600/30">
              RAG Grounded
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Select recommended legal riders, customize parameter parameters (notice days, liability caps), or add custom user clauses.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
          <div className="text-right">
            <span className="text-slate-600 block text-[11px]">Selected Clauses</span>
            <strong className="text-indigo-600 font-mono text-sm">{selectedConfigs.length} Active</strong>
          </div>
          <button
            onClick={() => setShowCustomForm(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Clause</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const label = cat === 'all' ? 'All Clauses' : cat === 'recommended' ? '⭐ Recommended' : cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clause library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Custom Clause Add Modal / Form Overlay */}
      {showCustomForm && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-indigo-600/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-600 flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Create Custom User Rider / Clause</span>
            </h4>
            <button
              onClick={() => setShowCustomForm(false)}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Clause Title *</label>
              <input
                type="text"
                placeholder="e.g. Special Parking Facility Rights"
                value={newCustomTitle}
                onChange={(e) => setNewCustomTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Category / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Commercial Covenant"
                value={newCustomCategory}
                onChange={(e) => setNewCustomCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 text-xs">Clause Content Text *</label>
            <textarea
              rows={3}
              placeholder="Enter the full text of your custom clause..."
              value={newCustomText}
              onChange={(e) => setNewCustomText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCustomForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-700"
            >
              Discard
            </button>
            <button
              disabled={!newCustomTitle.trim() || !newCustomText.trim()}
              onClick={handleAddCustomClause}
              className="px-4 py-1.5 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
            >
              Add to Selected Clause Set
            </button>
          </div>
        </div>
      )}

      {/* User Custom Clauses List (if any added) */}
      {customClauses.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>User Custom Riders ({customClauses.length})</span>
          </h4>
          <div className="space-y-2">
            {customClauses.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white border border-indigo-600/30 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{c.title}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-semibold">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px]">"{c.clauseText}"</p>
                </div>
                <button
                  onClick={() => handleRemoveCustomClause(c.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove custom clause"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLibrary.map((item) => {
          const selected = isClauseSelected(item.id);
          const config = getSelectedConfig(item.id);
          const isExpanded = expandedClauseId === item.id;
          const isRecommended = item.applicableDocumentTypes.includes(templateId);

          return (
            <div
              key={item.id}
              className={`bg-white shadow-sm p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                selected
                  ? 'border-indigo-600/30 bg-indigo-600 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-2">
                {/* Clause Title & Risk */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{item.shortDescription}</p>
                  </div>
                  <div>{getRiskBadge(item.riskLevel)}</div>
                </div>

                {/* Plain English Toggle & Preview */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-indigo-600 font-bold flex items-center space-x-1">
                      <BookOpen className="w-3 h-3" />
                      <span>In Plain English:</span>
                    </span>
                    <button
                      onClick={() => setExpandedClauseId(isExpanded ? null : item.id)}
                      className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 text-[10px]"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Full Text'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{item.plainEnglishExplanation}</p>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-850 space-y-2 text-[11px] animate-fadeIn">
                      <div>
                        <strong className="text-slate-600 block">Why It Matters:</strong>
                        <p className="text-slate-700">{item.whyItMatters}</p>
                      </div>
                      <div>
                        <strong className="text-slate-600 block">Default Legal Text:</strong>
                        <p className="text-slate-700 font-mono text-[10px] bg-white p-2 rounded border border-slate-200">
                          "{config ? config.clauseText : item.defaultClauseText}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Parameter Selection (if clause is selected & has parameters) */}
                {selected && item.parameters && item.parameters.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-indigo-600/30 space-y-2 text-xs">
                    <span className="text-indigo-600 font-bold text-[11px] block flex items-center space-x-1">
                      <Sliders className="w-3 h-3" />
                      <span>Customize Clause Parameters:</span>
                    </span>
                    {item.parameters.map((p) => {
                      const currentValue = config?.paramValues?.[p.key] ?? p.defaultValue;

                      return (
                        <div key={p.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <label className="text-slate-700 text-[11px]">{p.label}</label>
                          {p.type === 'select' && p.options ? (
                            <select
                              value={String(currentValue)}
                              onChange={(e) => handleParamChange(item, p.key, e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded-lg text-xs text-indigo-500 p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            >
                              {p.options.map((opt) => (
                                <option key={String(opt.value)} value={String(opt.value)}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={p.type}
                              value={String(currentValue)}
                              onChange={(e) => handleParamChange(item, p.key, e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded-lg text-xs text-indigo-500 p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono w-28"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Toggle Button */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Category: {item.category}</span>
                <button
                  onClick={() => handleToggleClause(item)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors ${
                    selected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-700 text-slate-900 border border-slate-300'
                  }`}
                >
                  {selected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clause Included</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Include Clause</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
