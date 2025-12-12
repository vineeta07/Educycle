import React, { useState, useEffect } from 'react';

interface VoiceInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
  onVoiceInput?: (value: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ label, isTextArea, onVoiceInput, className, ...props }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US'; // Default to English, could be dynamic

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [onVoiceInput]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const baseInputClasses = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all pr-12 bg-white text-black placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-300";

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <div className="relative">
        {isTextArea ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`${baseInputClasses} min-h-[100px] ${className || ''}`}
          />
        ) : (
          <input
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            className={`${baseInputClasses} ${className || ''}`}
          />
        )}
        
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-1.5 rounded-full transition-colors ${
            isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-brand-900 dark:hover:text-brand-400'
          }`}
          title="Click to speak"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;