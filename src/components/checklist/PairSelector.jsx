import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const FOREX_PAIRS = [
  { pair: 'EUR/USD', name: 'Euro / US Dollar', volatility: 'high' },
  { pair: 'GBP/USD', name: 'Pound / US Dollar', volatility: 'high' },
  { pair: 'USD/JPY', name: 'US Dollar / Yen', volatility: 'high' },
  { pair: 'USD/CHF', name: 'US Dollar / Swiss Franc', volatility: 'medium' },
  { pair: 'AUD/USD', name: 'Australian / US Dollar', volatility: 'high' },
  { pair: 'USD/CAD', name: 'US Dollar / Canadian', volatility: 'medium' },
  { pair: 'NZD/USD', name: 'New Zealand / US Dollar', volatility: 'medium' },
  { pair: 'EUR/GBP', name: 'Euro / Pound', volatility: 'medium' },
  { pair: 'EUR/JPY', name: 'Euro / Yen', volatility: 'high' },
  { pair: 'GBP/JPY', name: 'Pound / Yen', volatility: 'high' },
  { pair: 'EUR/AUD', name: 'Euro / Australian', volatility: 'medium' },
  { pair: 'GBP/AUD', name: 'Pound / Australian', volatility: 'high' },
];

export default function PairSelector({ selectedPair, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-zinc-500 uppercase tracking-wider">
        Währungspaar auswählen
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {FOREX_PAIRS.map((item, index) => (
          <motion.button
            key={item.pair}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onSelect(item.pair)}
            className={cn(
              "p-3 rounded-lg border text-center transition-all duration-200",
              selectedPair === item.pair
                ? "bg-[#4A5D23] border-[#4A5D23] text-white"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
            )}
          >
            <div className="font-bold text-sm tracking-wide">{item.pair}</div>
            <div className={cn(
              "text-xs mt-1",
              item.volatility === 'high' ? 'text-red-400' : 'text-yellow-500'
            )}>
              {item.volatility === 'high' ? '⚡ High' : '◐ Medium'}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}