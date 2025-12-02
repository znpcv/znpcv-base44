import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';

const QUOTES = [
  { key: 'quote1', author: 'ZNPCV' },
  { key: 'quote2', author: 'ZNPCV' },
  { key: 'quote3', author: 'ZNPCV STANDARD' },
  { key: 'quote4', author: 'ZNPCV' },
  { key: 'quote5', author: 'ZNPCV' },
];

export default function TradingQuote({ variant = 'default' }) {
  const { t, darkMode } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="text-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className={`text-sm italic font-sans ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{t(QUOTES[currentIndex].key)}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`relative py-12 border-y ${darkMode ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className={`text-xl md:text-2xl italic font-sans leading-relaxed max-w-2xl mx-auto mb-4 ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
            {t(QUOTES[currentIndex].key)}
          </p>
          <p className={`text-sm tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>— {QUOTES[currentIndex].author}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {QUOTES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? (darkMode ? 'bg-white' : 'bg-zinc-900') + ' w-6' 
                : darkMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-300 hover:bg-zinc-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}