import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const ASSET_CATEGORIES = {
  forex: {
    label: 'FOREX',
    color: 'bg-blue-500',
    pairs: [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
      'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/AUD', 'GBP/AUD', 'EUR/CAD', 'GBP/CAD',
      'AUD/JPY', 'NZD/JPY', 'CAD/JPY', 'CHF/JPY', 'EUR/CHF', 'GBP/CHF',
      'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'EUR/NZD', 'GBP/NZD', 'NZD/CAD', 'NZD/CHF',
    ]
  },
  crypto: {
    label: 'KRYPTO',
    color: 'bg-orange-500',
    pairs: [
      'BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD', 'SOL/USD', 'ADA/USD',
      'DOGE/USD', 'DOT/USD', 'MATIC/USD', 'LTC/USD', 'AVAX/USD', 'LINK/USD',
      'UNI/USD', 'ATOM/USD', 'XLM/USD', 'ALGO/USD', 'VET/USD', 'FTM/USD',
      'BTC/EUR', 'ETH/EUR', 'ETH/BTC', 'BNB/BTC', 'XRP/BTC', 'SOL/BTC',
    ]
  },
  stocks: {
    label: 'STOCKS',
    color: 'bg-green-500',
    pairs: [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
      'JPM', 'V', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'DIS', 'PYPL', 'NFLX',
      'INTC', 'AMD', 'CRM', 'ADBE', 'ORCL', 'IBM', 'CSCO', 'QCOM',
      'BA', 'GE', 'CAT', 'MMM', 'NKE', 'MCD', 'KO', 'PEP', 'SBUX',
    ]
  },
  commodities: {
    label: 'COMMODITIES',
    color: 'bg-yellow-500',
    pairs: [
      'XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD',
      'WTI/USD', 'BRENT/USD', 'NGAS/USD',
      'COPPER', 'WHEAT', 'CORN', 'SOYBEAN', 'COFFEE', 'SUGAR', 'COTTON',
    ]
  },
  indices: {
    label: 'INDICES',
    color: 'bg-purple-500',
    pairs: [
      'US30', 'US500', 'US100', 'DE40', 'UK100', 'FR40', 'JP225',
      'AU200', 'HK50', 'CN50', 'EU50', 'VIX',
    ]
  }
};

export default function AssetSelector({ selectedPair, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('forex');

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              "px-4 py-2 text-sm tracking-widest transition-all border",
              activeCategory === key
                ? `${cat.color} text-white border-transparent`
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Pairs Grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
      >
        {ASSET_CATEGORIES[activeCategory].pairs.map((pair) => (
          <button
            key={pair}
            onClick={() => onSelect(pair)}
            className={cn(
              "py-3 px-2 border text-sm tracking-wider transition-all",
              selectedPair === pair
                ? "bg-white border-white text-black"
                : "border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white"
            )}
          >
            {pair}
          </button>
        ))}
      </motion.div>

      {/* Selected Display */}
      {selectedPair && (
        <div className="flex items-center gap-3 p-4 border border-zinc-800 bg-zinc-900/50">
          <div className={cn("w-3 h-3 rounded-full", ASSET_CATEGORIES[activeCategory].color)} />
          <span className="text-zinc-400 tracking-wider">AUSGEWÄHLT:</span>
          <span className="text-xl text-white tracking-wider">{selectedPair}</span>
        </div>
      )}
    </div>
  );
}