import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TRADING_QUOTES = [
  { quote: "Die Börse ist ein Ort, an dem Erfahrung wichtiger ist als Intelligenz.", author: "Peter Lynch" },
  { quote: "Risikomanagement ist wichtiger als Gewinnmaximierung.", author: "Warren Buffett" },
  { quote: "Der Markt kann länger irrational bleiben, als du liquide bleiben kannst.", author: "John Maynard Keynes" },
  { quote: "Erfolgreiche Trader haben einen Plan. Verlierer haben Hoffnung.", author: "Larry Williams" },
  { quote: "Das Ziel des Trading ist nicht, perfekt zu sein, sondern profitabel.", author: "Alexander Elder" },
  { quote: "Verluste sind Teil des Spiels. Akzeptiere sie und ziehe weiter.", author: "Jesse Livermore" },
  { quote: "Die größten Gewinne kommen, wenn man die Trends reitet.", author: "Paul Tudor Jones" },
  { quote: "Trading ist zu 90% Psychologie und zu 10% Technik.", author: "Mark Douglas" },
  { quote: "Planung und Disziplin schlagen Emotionen im Trading.", author: "Van K. Tharp" },
  { quote: "Der Trend ist dein Freund - bis er endet.", author: "Börsenweisheit" },
  { quote: "Erfolgreiche Trader schneiden Verluste kurz und lassen Gewinne laufen.", author: "William J. O'Neil" },
  { quote: "Im Trading gewinnt derjenige, der am längsten im Spiel bleibt.", author: "Jim Rogers" },
  { quote: "Niemals aufgrund von Hoffnung oder Angst handeln, sondern auf Basis der Analyse.", author: "Benjamin Graham" },
  { quote: "Das Geheimnis erfolgreichen Tradings liegt in der Konsistenz.", author: "Steve Nison" },
  { quote: "Märkte belohnen Geduld und bestrafen Gier.", author: "Ray Dalio" }
];

export default function NotificationPrompt({ darkMode }) {
  const [show, setShow] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) return;
    
    const permission = Notification.permission;
    setNotificationsEnabled(permission === 'granted');
    
    // Show prompt if user is logged in and hasn't decided yet
    if (permission === 'default') {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          setShow(true);
        }
      } catch (err) {
        console.error('Auth check failed');
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser unterstützt keine Benachrichtigungen');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    
    if (permission === 'granted') {
      setShow(false);
      // Send welcome notification
      sendNotification();
      // Schedule daily notifications
      scheduleDailyNotifications();
    }
  };

  const sendNotification = () => {
    const randomQuote = TRADING_QUOTES[Math.floor(Math.random() * TRADING_QUOTES.length)];
    
    if (Notification.permission === 'granted') {
      new Notification('ZNPCV Trading Tipp', {
        body: `${randomQuote.quote}\n\n— ${randomQuote.author}`,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
        badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
        tag: 'daily-quote',
        requireInteraction: false
      });
    }
  };

  const scheduleDailyNotifications = () => {
    // Send notification once per day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const timeUntilTomorrow = tomorrow - now;
    
    setTimeout(() => {
      sendNotification();
      // Repeat daily
      setInterval(sendNotification, 24 * 60 * 60 * 1000);
    }, timeUntilTomorrow);
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
                  ERINNERUNGEN
                </h3>
                <p className={`text-xs ${theme.textSecondary} font-sans leading-relaxed`}>
                  Erhalte täglich motivierende Trading-Sprüche als Browser-Benachrichtigung
                </p>
              </div>
            </div>

            <button
              onClick={requestNotificationPermission}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-xl font-bold text-sm tracking-wider hover:from-teal-700 hover:to-emerald-800 transition-all"
            >
              <Bell className="w-4 h-4" />
              Erinnerungen aktivieren
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}