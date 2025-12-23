import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { darkMode } = useLanguage();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 z-50 max-w-sm ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'} border-2 rounded-2xl p-5 shadow-2xl`}
      >
        <button
          onClick={() => setShowPrompt(false)}
          className={`absolute top-3 right-3 ${darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-teal-600' : 'bg-teal-600'} flex items-center justify-center`}>
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
              Install ZNPCV App
            </h3>
            <p className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Offline access + faster
            </p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
        >
          Install Now
        </button>
      </motion.div>
    </AnimatePresence>
  );
}