import React, { useState } from 'react';
import { Key, Shield, Check, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-base">
            <Key className="w-5 h-5 text-amber-400" />
            <span>Google Gemini AI Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Kanoon AI operates with a high-performance built-in Indian legal engine. Optionally enter a <strong>Google Gemini API Key</strong> for enhanced real-time LLM translations.
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Gemini API Key</label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Your key is stored strictly in client-side localStorage.</span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save API Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
