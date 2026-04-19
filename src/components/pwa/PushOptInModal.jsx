import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Loader2, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const LS_KEY_PUSH_DISMISSED = 'znpcv_push_pre_dismissed_at';
const PUSH_COOLDOWN_DAYS = 14;

const TOPICS = [
  { key: 'setup_alerts', label: 'Setup Alerts', desc: 'Neue Trade-Setup Signale' },
  { key: 'reminders', label: 'Checkliste Reminder', desc: 'Tägliche Erinnerung zur Analyse' },
  { key: 'product_updates', label: 'Produkt Updates', desc: 'Neue Features & Verbesserungen' },
];

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function PushOptInModal({ darkMode, onClose }) {
  const [step, setStep] = useState('value'); // 'value' | 'requesting' | 'success' | 'denied' | 'ios_hint'
  const [selectedTopics, setSelectedTopics] = useState(['setup_alerts', 'reminders']);
  const [loading, setLoading] = useState(false);

  const trackEvent = (eventName, props = {}) => {
    try { base44.analytics.track({ eventName, properties: props }); } catch {}
  };

  useEffect(() => {
    trackEvent('push_pre_prompt_shown');
  }, []);

  const toggleTopic = (key) => {
    setSelectedTopics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    trackEvent('push_topic_selected', { topic: key });
  };

  const handleActivate = async () => {
    // iOS not installed → show hint
    if (isIOS() && !isInStandaloneMode()) {
      setStep('ios_hint');
      return;
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStep('denied');
      return;
    }

    setLoading(true);
    setStep('requesting');

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        trackEvent('push_permission_denied');
        setStep('denied');
        setLoading(false);
        return;
      }

      trackEvent('push_permission_granted');

      // Get VAPID key
      const { data } = await base44.functions.invoke('getVapidPublicKey');
      if (!data?.publicKey) throw new Error('No VAPID key');

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });
      }

      const deviceInfo = `${navigator.platform} · ${navigator.userAgent.slice(0, 60)}`;
      await base44.functions.invoke('subscribePush', {
        subscription: subscription.toJSON(),
        deviceInfo,
        topics: selectedTopics,
      });

      await base44.auth.updateMe({
        browser_notifications_enabled: true,
        push_topics: selectedTopics,
        push_opted_in_at: new Date().toISOString(),
      });

      setStep('success');
    } catch (err) {
      console.error('Push subscribe error:', err);
      setStep('denied');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY_PUSH_DISMISSED, String(Date.now()));
    onClose?.();
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className={cn('w-full max-w-sm rounded-2xl border-2 shadow-2xl overflow-hidden', theme.bg, theme.border)}
      >
        {/* Value Screen */}
        {(step === 'value' || step === 'requesting') && (
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold tracking-wider ${theme.text}`}>PUSH AKTIVIEREN</div>
                  <div className={`text-[10px] font-sans ${theme.textMuted}`}>Nur relevante Infos, kein Spam</div>
                </div>
              </div>
              <button onClick={handleDismiss} className={theme.textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Topics */}
            <div className="space-y-2 mb-4">
              {TOPICS.map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => toggleTopic(key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all',
                    selectedTopics.includes(key)
                      ? 'border-emerald-600 bg-emerald-600/10'
                      : cn(theme.border, theme.bgCard)
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${theme.text}`}>{label}</div>
                    <div className={`text-[10px] font-sans ${theme.textMuted}`}>{desc}</div>
                  </div>
                  <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                    selectedTopics.includes(key) ? 'bg-emerald-600 border-emerald-600' : theme.border
                  )}>
                    {selectedTopics.includes(key) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            {/* DSGVO note */}
            <div className={cn('flex items-start gap-2 p-2.5 rounded-lg mb-4', theme.bgCard)}>
              <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className={`text-[10px] font-sans leading-relaxed ${theme.textMuted}`}>
                Du kannst Push jederzeit in den Einstellungen deaktivieren.
                Keine Weitergabe deiner Daten. <span className="underline cursor-pointer">Datenschutz</span>
              </p>
            </div>

            <button
              onClick={handleActivate}
              disabled={loading || selectedTopics.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white text-xs font-bold tracking-wider hover:from-teal-700 hover:to-emerald-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              {loading ? 'Aktiviere…' : 'Push aktivieren'}
            </button>

            <button onClick={handleDismiss} className={`w-full mt-2 py-2 text-[10px] font-sans ${theme.textMuted} hover:underline`}>
              Nicht jetzt
            </button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className={`text-base font-bold tracking-wider mb-2 ${theme.text}`}>PUSH AKTIV!</div>
            <p className={`text-xs font-sans ${theme.textMuted} mb-4`}>
              Du erhältst ab jetzt Benachrichtigungen zu den gewählten Themen.
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-bold tracking-wider">
              FERTIG
            </button>
          </div>
        )}

        {/* Denied */}
        {step === 'denied' && (
          <div className="p-5">
            <div className={`text-sm font-bold tracking-wider mb-2 ${theme.text}`}>BENACHRICHTIGUNGEN BLOCKIERT</div>
            <p className={`text-xs font-sans ${theme.textSecondary} mb-4 leading-relaxed`}>
              Du hast Push-Benachrichtigungen blockiert. Um sie später zu aktivieren:
            </p>
            <ol className={`space-y-2 text-xs font-sans ${theme.textSecondary} mb-4`}>
              <li>1. Klicke auf das Schloss/Info-Symbol in der Adressleiste</li>
              <li>2. Wähle "Benachrichtigungen" → "Erlauben"</li>
              <li>3. Lade die Seite neu und versuche es erneut</li>
            </ol>
            <button onClick={handleDismiss} className={cn('w-full py-2.5 rounded-xl text-xs font-bold border-2', theme.border, theme.textSecondary)}>
              Verstanden
            </button>
          </div>
        )}

        {/* iOS hint */}
        {step === 'ios_hint' && (
          <div className="p-5">
            <div className={`text-sm font-bold tracking-wider mb-2 ${theme.text}`}>IOS PUSH HINWEIS</div>
            <p className={`text-xs font-sans ${theme.textSecondary} mb-4 leading-relaxed`}>
              Push-Benachrichtigungen auf iOS sind nur verfügbar, wenn die App auf deinem Home Screen installiert ist (iOS 16.4+).
            </p>
            <p className={`text-xs font-sans ${theme.textSecondary} mb-4`}>
              Installiere die App erst über Safari → Teilen → Zum Home-Bildschirm, dann kannst du Push aktivieren.
            </p>
            <button onClick={handleDismiss} className={cn('w-full py-2.5 rounded-xl text-xs font-bold border-2', theme.border, theme.textSecondary)}>
              Verstanden
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}