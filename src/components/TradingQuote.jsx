import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageContext';

const QUOTES = [
  { key: 'quote1', author: 'Trading Wisdom' },
  { key: 'quote2', author: 'ZNPCV' },
  { key: 'quote3', author: 'ZNPCV Rule #1' },
  { key: 'quote4', author: 'Trading Wisdom' },
  { key: 'quote5', author: 'ZNPCV' },
];

export default function TradingQuote({ variant = 'default' }) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const quote = QUOTES[currentIndex];

  if (variant === 'minimal') {
    return (
      <div className="text-center py-4 border-t border-zinc-800">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-zinc-500 text-sm italic"
          >
            {t(quote.key)}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border-y border-emerald-500/20 py-6">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl md:text-2xl text-emerald-400 italic tracking-wide mb-2">
              {t(quote.key)}
            </p>
            <p className="text-zinc-500 text-sm tracking-widest">— {quote.author}</p>
          </motion.div>
        </AnimatePresence>
        
        {/* Quote indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {QUOTES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-emerald-500 w-6' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}