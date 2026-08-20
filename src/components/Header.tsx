import React from 'react';
import type { ActiveTab } from '../types';
import { Scale, FileText, Sparkles, BookOpen, UserCheck, Shield, FileSearch, Moon, Sun, Accessibility, Type, Contrast, MonitorPlay } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isAccessibilityOpen, setIsAccessibilityOpen] = React.useState(false);
  const [textSize, setTextSize] = React.useState<'default' | 'large' | 'xlarge'>(() => localStorage.getItem('a11y-text-size') as any || 'default');
  const [highContrast, setHighContrast] = React.useState(() => localStorage.getItem('a11y-high-contrast') === 'true');
  const [reducedMotion, setReducedMotion] = React.useState(() => localStorage.getItem('a11y-reduced-motion') === 'true');
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close accessibility menu on outside click or Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccessibilityOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsAccessibilityOpen(false);
      }
    };
    if (isAccessibilityOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccessibilityOpen]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Apply Accessibility classes
    root.classList.remove('text-size-lg', 'text-size-xl');
    if (textSize === 'large') root.classList.add('text-size-lg');
    if (textSize === 'xlarge') root.classList.add('text-size-xl');
    localStorage.setItem('a11y-text-size', textSize);

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('a11y-high-contrast', String(highContrast));

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    localStorage.setItem('a11y-reduced-motion', String(reducedMotion));

  }, [isDarkMode, textSize, highContrast, reducedMotion]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button 
            onClick={() => setActiveTab('drafter')} 
            className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 rounded p-1"
            aria-label="Kanoon AI Home - Smart Drafter"
          >
            <div className="w-10 h-10 rounded-xl bg-legal-600 flex items-center justify-center shadow-md shadow-legal-600/20 group-hover:bg-legal-700 transition-colors duration-200">
              <Scale className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-extrabold text-xl tracking-tight text-slate-900">Kanoon</span>
                <span className="text-legal-600 font-sans font-black text-xl">AI</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-stone-100 text-slate-600 border border-stone-200">India</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Plain-Language Legal Documentation</p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-50 p-1.5 rounded-xl border border-stone-200" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('drafter')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'drafter'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'drafter' ? 'page' : undefined}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Smart Drafter</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'review'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'review' ? 'page' : undefined}
            >
              <FileSearch className="w-4 h-4" aria-hidden="true" />
              <span>Review Document</span>
            </button>

            <button
              onClick={() => setActiveTab('simplifier')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'simplifier'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'simplifier' ? 'page' : undefined}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Jargon Simplifier</span>
            </button>

            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'chatbot'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'chatbot' ? 'page' : undefined}
            >
              <Scale className="w-4 h-4" aria-hidden="true" />
              <span>Legal Chatbot</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'database'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'database' ? 'page' : undefined}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Legal DB</span>
            </button>

            <button
              onClick={() => setActiveTab('experts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${
                activeTab === 'experts'
                  ? 'bg-white text-legal-700 shadow-sm border border-stone-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
              aria-current={activeTab === 'experts' ? 'page' : undefined}
            >
              <UserCheck className="w-4 h-4" aria-hidden="true" />
              <span>Advice Hub</span>
            </button>
          </nav>

          {/* Right: DPDP badge, Theme & A11y Toggles */}
          <div className="flex items-center space-x-2 relative" ref={menuRef}>
            <button
              onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
              className={`p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-secondary dark:hover:bg-surface-elevated dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 dark:focus:ring-accent ${isAccessibilityOpen ? 'bg-slate-100 dark:bg-surface-elevated text-slate-800 dark:text-primary' : ''}`}
              aria-label="Accessibility Menu"
              aria-expanded={isAccessibilityOpen}
            >
              <Accessibility className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-secondary dark:hover:bg-surface-elevated dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 dark:focus:ring-accent"
              aria-label="Toggle Dark Mode"
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden lg:flex items-center space-x-1.5 text-slate-700 text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 font-medium shadow-sm dark:bg-surface dark:border-border dark:text-primary">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-success" aria-hidden="true" />
              <span>DPDP Compliant</span>
            </div>

            {/* Accessibility Dropdown Panel */}
            {isAccessibilityOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-xl shadow-xl z-50 p-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-primary mb-4 flex items-center border-b border-slate-100 dark:border-border pb-2">
                  <Accessibility className="w-4 h-4 mr-2 text-legal-600 dark:text-accent" />
                  Accessibility Preferences
                </h3>
                
                <div className="space-y-5">
                  {/* Text Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-secondary flex items-center">
                        <Type className="w-3.5 h-3.5 mr-1.5" />
                        Text Size
                      </span>
                    </div>
                    <div className="flex bg-stone-100 dark:bg-background rounded-lg p-1">
                      <button 
                        onClick={() => setTextSize('default')}
                        aria-pressed={textSize === 'default'}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 dark:focus:ring-accent ${textSize === 'default' ? 'bg-white dark:bg-surface-elevated text-slate-900 dark:text-primary shadow-sm' : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-secondary'}`}
                      >
                        A-
                      </button>
                      <button 
                        onClick={() => setTextSize('large')}
                        aria-pressed={textSize === 'large'}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 dark:focus:ring-accent ${textSize === 'large' ? 'bg-white dark:bg-surface-elevated text-slate-900 dark:text-primary shadow-sm' : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-secondary'}`}
                      >
                        A
                      </button>
                      <button 
                        onClick={() => setTextSize('xlarge')}
                        aria-pressed={textSize === 'xlarge'}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 dark:focus:ring-accent ${textSize === 'xlarge' ? 'bg-white dark:bg-surface-elevated text-slate-900 dark:text-primary shadow-sm' : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-secondary'}`}
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Contrast className="w-3.5 h-3.5 text-slate-700 dark:text-secondary" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-secondary">High Contrast</span>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      aria-pressed={highContrast}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 focus:ring-offset-2 dark:focus:ring-accent dark:ring-offset-surface ${highContrast ? 'bg-legal-600 dark:bg-accent' : 'bg-slate-300 dark:bg-border'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MonitorPlay className="w-3.5 h-3.5 text-slate-700 dark:text-secondary" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-secondary">Reduced Motion</span>
                    </div>
                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      aria-pressed={reducedMotion}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-legal-600 focus:ring-offset-2 dark:focus:ring-accent dark:ring-offset-surface ${reducedMotion ? 'bg-legal-600 dark:bg-accent' : 'bg-slate-300 dark:bg-border'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <nav className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 text-xs overflow-x-auto" aria-label="Mobile Navigation">
          <button
            onClick={() => setActiveTab('drafter')}
            className={`flex flex-col items-center py-1.5 px-3 min-w-[70px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${activeTab === 'drafter' ? 'text-legal-700 font-bold bg-legal-50' : 'text-slate-500 hover:text-slate-800'}`}
            aria-current={activeTab === 'drafter' ? 'page' : undefined}
          >
            <FileText className="w-5 h-5 mb-1" aria-hidden="true" />
            <span>Draft</span>
          </button>

          <button
            onClick={() => setActiveTab('simplifier')}
            className={`flex flex-col items-center py-1.5 px-3 min-w-[70px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${activeTab === 'simplifier' ? 'text-legal-700 font-bold bg-legal-50' : 'text-slate-500 hover:text-slate-800'}`}
            aria-current={activeTab === 'simplifier' ? 'page' : undefined}
          >
            <Sparkles className="w-5 h-5 mb-1" aria-hidden="true" />
            <span>Simplify</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex flex-col items-center py-1.5 px-3 min-w-[70px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${activeTab === 'database' ? 'text-legal-700 font-bold bg-legal-50' : 'text-slate-500 hover:text-slate-800'}`}
            aria-current={activeTab === 'database' ? 'page' : undefined}
          >
            <BookOpen className="w-5 h-5 mb-1" aria-hidden="true" />
            <span>Database</span>
          </button>

          <button
            onClick={() => setActiveTab('experts')}
            className={`flex flex-col items-center py-1.5 px-3 min-w-[70px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 ${activeTab === 'experts' ? 'text-legal-700 font-bold bg-legal-50' : 'text-slate-500 hover:text-slate-800'}`}
            aria-current={activeTab === 'experts' ? 'page' : undefined}
          >
            <UserCheck className="w-5 h-5 mb-1" aria-hidden="true" />
            <span>Experts</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
