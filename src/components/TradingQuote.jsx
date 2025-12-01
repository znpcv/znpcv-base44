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
  const { t } = useLanguage();
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
            <p className="text-zinc-600 text-sm italic font-sans">{t(QUOTES[currentIndex].key)}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative py-12 border-y border-zinc-800/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl text-white italic font-sans leading-relaxed max-w-2xl mx-auto mb-4">
            {t(QUOTES[currentIndex].key)}
          </p>
          <p className="text-zinc-600 text-sm tracking-widest">— {QUOTES[currentIndex].author}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {QUOTES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}