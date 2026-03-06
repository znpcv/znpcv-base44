import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Zap, WifiOff, Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

const INSTALL_COOLDOWN_DAYS = 7;
const LS_KEY_DISMISSED = 'znpcv_install_dismissed_at';
const LS_KEY_INSTALLED = 'znpcv_pwa_installed';
const LS_KEY_SESSION = 'znpcv_session_count';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

export default function PWAInstallBanner({ darkMode }) {
  const { } = useLanguage();
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('android'); // 'android' | 'ios'
  const [step, setStep] = useState('banner'); // 'banner' | 'ios_guide'
  const deferredPrompt = useRef(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(LS_KEY_INSTALLED)) return;

    // Session count gate (show after 2nd session)
    let sessions = parseInt(localStorage.getItem(LS_KEY_SESSION) || '0');
    sessions++;
    localStorage.setItem(LS_KEY_SESSION, String(sessions));
    if (sessions < 2) return;

    // Frequency cap
    const dismissedAt = localStorage.getItem(LS_KEY_DISMISSED);
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < INSTALL_COOLDOWN_DAYS) return;
    }

    if (isIOS()) {
      setMode('ios');
      setTimeout(() => setShow(true), 3000);
      trackEvent('pwa_eligible_shown', { platform: 'ios' });
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setMode('android');
      setTimeout(() => setShow(true), 3000);
      trackEvent('pwa_eligible_shown', { platform: 'android' });
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(LS_KEY_INSTALLED, '1');
      setShow(false);
      trackEvent('pwa_installed');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const trackEvent = async (eventName, properties = {}) => {
    try {
      base44.analytics.track({ eventName, properties });
    } catch {}
  };

  const handleInstall = async () => {
    trackEvent('pwa_install_clicked', { platform: mode });
    if (mode === 'ios') {
      setStep('ios_guide');
      return;
    }
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === 'accepted') {
      localStorage.setItem(LS_KEY_INSTALLED, '1');
      trackEvent('pwa_installed');
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY_DISMISSED, String(Date.now()));
    setShow(false);
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
  };

  const BENEFITS = [
    { icon: Zap, text: '1-Tap Zugriff vom Home Screen' },
    { icon: Smartphone, text: 'Schnellere Ladezeiten' },
    { icon: WifiOff, text: 'Offline-Basis verfügbar' },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={cn('fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 rounded-2xl border-2 shadow-2xl overflow-hidden', theme.bg, theme.border)}
        >
          {step === 'banner' && (
            <div className="p-4">
              <button onClick={handleDismiss} className={`absolute top-3 right-3 ${theme.textMuted} hover:${theme.text}`}>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                    alt="ZNPCV"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className={`text-sm font-bold tracking-wider ${theme.text}`}>APP INSTALLIEREN</div>
                  <div className={`text-[10px] font-sans ${theme.textMuted}`}>ZNPCV Trading Checklist</div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className={`text-xs font-sans ${theme.textSecondary}`}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  INSTALLIEREN
                </button>
                <button
                  onClick={handleDismiss}
                  className={cn('px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-colors', theme.border, theme.textSecondary)}
                >
                  SPÄTER
                </button>
              </div>
              <p className={`text-[9px] font-sans text-center mt-2 ${theme.textMuted}`}>
                Nicht erneut fragen für 7 Tage
              </p>
            </div>
          )}

          {step === 'ios_guide' && (
            <div className="p-4">
              <button onClick={() => setStep('banner')} className={`absolute top-3 right-3 ${theme.textMuted}`}>
                <X className="w-4 h-4" />
              </button>
              <div className={`text-sm font-bold tracking-wider mb-3 ${theme.text}`}>AUF IOS INSTALLIEREN</div>
              <ol className={`space-y-2 text-xs font-sans ${theme.textSecondary}`}>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>Tippe auf das <strong>Teilen-Symbol</strong> (Quadrat mit Pfeil) in der Safari-Navigationsleiste unten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>Scrolle und tippe auf <strong>"Zum Home-Bildschirm"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>Tippe auf <strong>"Hinzufügen"</strong> – fertig!</span>
                </li>
              </ol>
              <button onClick={handleDismiss} className={cn('w-full mt-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-colors', theme.border, theme.textSecondary)}>
                Verstanden
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}