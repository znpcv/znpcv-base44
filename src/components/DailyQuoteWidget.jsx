import React, { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function DailyQuoteWidget({ darkMode }) {
  const [dailyQuote, setDailyQuote] = useState(null);

  useEffect(() => {
    // Get quote based on day of year for consistency
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const quoteIndex = dayOfYear % TRADING_QUOTES.length;
    setDailyQuote(TRADING_QUOTES[quoteIndex]);
  }, []);

  if (!dailyQuote) return null;

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-gradient-to-br from-teal-50 to-blue-50',
    border: darkMode ? 'border-zinc-800' : 'border-teal-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    accent: darkMode ? 'text-teal-400' : 'text-teal-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme.bg} ${theme.border} border-2 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-5">
        <Quote className="w-24 h-24 sm:w-32 sm:h-32" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 relative">
        <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accent}`} />
        <span className={`text-xs sm:text-sm font-bold tracking-widest ${theme.accent}`}>
          TÄGLICHE MOTIVATION
        </span>
      </div>

      {/* Quote */}
      <div className="relative">
        <p className={`text-sm sm:text-base md:text-lg ${theme.text} font-sans leading-relaxed mb-3 sm:mb-4 italic`}>
          "{dailyQuote.quote}"
        </p>
        <p className={`text-xs sm:text-sm ${theme.textSecondary} text-right font-bold`}>
          — {dailyQuote.author}
        </p>
      </div>
    </motion.div>
  );
}