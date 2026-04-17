import React, { useState, useEffect } from 'react';
import { Bell, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// This prompt shows at most ONCE per device (permanent dismiss after shown)
const LS_KEY_SHOWN = 'znpcv_notif_prompt_shown';

export default function NotificationPrompt({ darkMode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Never show again if already shown or dismissed once
    if (localStorage.getItem(LS_KEY_SHOWN)) return;
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) return;

    const permission = Notification.permission;

    // Already decided — no need to prompt
    if (permission !== 'default') return;

    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const user = await base44.auth.me();
      // Don't show if already opted in
      if (user.push_opted_in_at || user.browser_notifications_enabled) return;
      setShow(true);
    } catch {
      // ignore
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY_SHOWN, '1');
    setShow(false);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    localStorage.setItem(LS_KEY_SHOWN, '1');
    setShow(false);

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await base44.auth.updateMe({ browser_notifications_enabled: true });
        // Subscribe to push if supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const { data } = await base44.functions.invoke('getVapidPublicKey');
            if (data?.publicKey) {
              const reg = await navigator.serviceWorker.ready;
              let sub = await reg.pushManager.getSubscription();
              if (!sub) {
                const padding = '='.repeat((4 - data.publicKey.length % 4) % 4);
                const base64 = (data.publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
                const raw = window.atob(base64);
                const key = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
                sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
              }
              await base44.functions.invoke('subscribePush', {
                subscription: sub.toJSON(),
                deviceInfo: navigator.platform,
              });
              await base44.auth.updateMe({ push_opted_in_at: new Date().toISOString() });
            }
          } catch { /* push optional */ }
        }
      }
    } catch { /* ignore */ }
  };

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className={`${theme.bg} ${theme.border} border-2 rounded-2xl p-5 shadow-2xl relative`}>
            <button
              onClick={() => setShow(false)}
              className={`absolute top-3 right-3 ${theme.textSecondary} hover:${theme.text} transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-wider ${theme.text} mb-1`}>
                  PUSH-BENACHRICHTIGUNGEN
                </h3>
                <p className={`text-xs ${theme.textSecondary} font-sans leading-relaxed`}>
                  Erhalte Trading-Sprüche auf allen Geräten - auch wenn App geschlossen
                </p>
              </div>
            </div>

            <button
              onClick={requestNotificationPermission}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-xl font-bold text-sm tracking-wider hover:from-teal-700 hover:to-emerald-800 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              Push aktivieren
            </button>
            <div className={`text-[10px] ${theme.textSecondary} font-sans text-center leading-relaxed`}>
              Benachrichtigungen auf allen Geräten - auch wenn App geschlossen
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}