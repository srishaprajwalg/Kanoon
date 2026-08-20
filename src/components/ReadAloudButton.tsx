import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Square } from 'lucide-react';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('a11y-read-aloud') === 'true');

  useEffect(() => {
    // Listen for changes to the global read aloud setting
    const handleStorage = () => {
      setIsEnabled(localStorage.getItem('a11y-read-aloud') === 'true');
    };
    
    // We can also listen for a custom event dispatched from the Header
    const handleCustomEvent = () => handleStorage();
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('a11y-read-aloud-changed', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('a11y-read-aloud-changed', handleCustomEvent);
    };
  }, []);

  // Sync state with speechSynthesis
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSpeaking) {
      interval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
    return () => {
      // Unmount cleanup
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const toggleSpeech = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Stop anything else playing
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [isSpeaking, text]);

  if (!isEnabled) return null;

  return (
    <button
      onClick={toggleSpeech}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
      title={isSpeaking ? "Stop reading aloud" : "Read aloud"}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-600 focus-visible:ring-offset-1 border shadow-sm ${
        isSpeaking 
          ? 'bg-legal-100 text-legal-700 border-legal-300 dark:bg-legal-700/30 dark:text-legal-300 dark:border-legal-500/50' 
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-surface dark:text-secondary dark:border-border dark:hover:bg-surface-elevated'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span>Read aloud</span>
        </>
      )}
    </button>
  );
};
