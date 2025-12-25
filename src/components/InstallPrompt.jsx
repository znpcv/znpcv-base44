import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const { darkMode } = useLanguage();

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Show prompt after 3 seconds
    setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    // Listen for install prompt (Android/Desktop)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className={`${theme.bg} ${theme.border} border-2 rounded-2xl p-4 shadow-2xl relative`}>
            <button
              onClick={handleDismiss}
              className={`absolute top-3 right-3 ${theme.textSecondary} hover:${theme.text} transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-wider ${theme.text} mb-1`}>
                  APP INSTALLIEREN
                </h3>
                <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                  Installiere ZNPCV auf deinem {isIOS ? 'iPhone' : 'Gerät'} für schnellen Zugriff
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100'} rounded-xl p-3 text-xs ${theme.text}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>1. Tippe auf</span>
                  <Share className="w-4 h-4 text-blue-500" />
                  <span>(Teilen-Button)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>2. Wähle "Zum Home-Bildschirm"</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-xl font-bold text-sm tracking-wider hover:from-teal-700 hover:to-emerald-800 transition-all"
              >
                <Download className="w-4 h-4" />
                Jetzt installieren
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}