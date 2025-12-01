import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const FLAGS = {
  EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭', AUD: '🇦🇺', 
  CAD: '🇨🇦', NZD: '🇳🇿', CNY: '🇨🇳', HKD: '🇭🇰', SGD: '🇸🇬', SEK: '🇸🇪',
  BTC: '₿', ETH: 'Ξ', BNB: '⬡', XRP: '✕', SOL: '◎', ADA: '₳',
  DOGE: '🐕', DOT: '●', MATIC: '⬡', LTC: 'Ł', AVAX: '🔺', LINK: '⬡',
  XAU: '🥇', XAG: '🥈', XPT: '⚪', XPD: '⚫', WTI: '🛢️', BRENT: '🛢️', NGAS: '🔥',
};

const getFlag = (symbol) => {
  const base = symbol.split('/')[0];
  return FLAGS[base] || '📊';
};

const ASSET_CATEGORIES = {
  forex: {
    label: 'FOREX',
    icon: '💱',
    color: 'bg-blue-500',
    pairs: [
      { symbol: 'EUR/USD', flags: '🇪🇺🇺🇸' },
      { symbol: 'GBP/USD', flags: '🇬🇧🇺🇸' },
      { symbol: 'USD/JPY', flags: '🇺🇸🇯🇵' },
      { symbol: 'USD/CHF', flags: '🇺🇸🇨🇭' },
      { symbol: 'AUD/USD', flags: '🇦🇺🇺🇸' },
      { symbol: 'USD/CAD', flags: '🇺🇸🇨🇦' },
      { symbol: 'NZD/USD', flags: '🇳🇿🇺🇸' },
      { symbol: 'EUR/GBP', flags: '🇪🇺🇬🇧' },
      { symbol: 'EUR/JPY', flags: '🇪🇺🇯🇵' },
      { symbol: 'GBP/JPY', flags: '🇬🇧🇯🇵' },
      { symbol: 'EUR/AUD', flags: '🇪🇺🇦🇺' },
      { symbol: 'GBP/AUD', flags: '🇬🇧🇦🇺' },
      { symbol: 'EUR/CAD', flags: '🇪🇺🇨🇦' },
      { symbol: 'GBP/CAD', flags: '🇬🇧🇨🇦' },
      { symbol: 'AUD/JPY', flags: '🇦🇺🇯🇵' },
      { symbol: 'NZD/JPY', flags: '🇳🇿🇯🇵' },
      { symbol: 'CAD/JPY', flags: '🇨🇦🇯🇵' },
      { symbol: 'CHF/JPY', flags: '🇨🇭🇯🇵' },
      { symbol: 'EUR/CHF', flags: '🇪🇺🇨🇭' },
      { symbol: 'GBP/CHF', flags: '🇬🇧🇨🇭' },
      { symbol: 'AUD/CAD', flags: '🇦🇺🇨🇦' },
      { symbol: 'AUD/CHF', flags: '🇦🇺🇨🇭' },
      { symbol: 'AUD/NZD', flags: '🇦🇺🇳🇿' },
      { symbol: 'EUR/NZD', flags: '🇪🇺🇳🇿' },
    ]
  },
  crypto: {
    label: 'CRYPTO',
    icon: '₿',
    color: 'bg-orange-500',
    pairs: [
      { symbol: 'BTC/USD', flags: '₿💵' },
      { symbol: 'ETH/USD', flags: 'Ξ💵' },
      { symbol: 'BNB/USD', flags: '⬡💵' },
      { symbol: 'XRP/USD', flags: '✕💵' },
      { symbol: 'SOL/USD', flags: '◎💵' },
      { symbol: 'ADA/USD', flags: '₳💵' },
      { symbol: 'DOGE/USD', flags: '🐕💵' },
      { symbol: 'DOT/USD', flags: '●💵' },
      { symbol: 'MATIC/USD', flags: '⬡💵' },
      { symbol: 'LTC/USD', flags: 'Ł💵' },
      { symbol: 'AVAX/USD', flags: '🔺💵' },
      { symbol: 'LINK/USD', flags: '⬡💵' },
      { symbol: 'ETH/BTC', flags: 'Ξ₿' },
      { symbol: 'BNB/BTC', flags: '⬡₿' },
      { symbol: 'XRP/BTC', flags: '✕₿' },
      { symbol: 'SOL/BTC', flags: '◎₿' },
    ]
  },
  stocks: {
    label: 'STOCKS',
    icon: '📈',
    color: 'bg-green-500',
    pairs: [
      { symbol: 'AAPL', flags: '🍎🇺🇸' },
      { symbol: 'MSFT', flags: '🪟🇺🇸' },
      { symbol: 'GOOGL', flags: '🔍🇺🇸' },
      { symbol: 'AMZN', flags: '📦🇺🇸' },
      { symbol: 'NVDA', flags: '🎮🇺🇸' },
      { symbol: 'META', flags: '👤🇺🇸' },
      { symbol: 'TSLA', flags: '🚗🇺🇸' },
      { symbol: 'JPM', flags: '🏦🇺🇸' },
      { symbol: 'V', flags: '💳🇺🇸' },
      { symbol: 'WMT', flags: '🛒🇺🇸' },
      { symbol: 'DIS', flags: '🏰🇺🇸' },
      { symbol: 'NFLX', flags: '🎬🇺🇸' },
      { symbol: 'AMD', flags: '💻🇺🇸' },
      { symbol: 'NKE', flags: '👟🇺🇸' },
      { symbol: 'MCD', flags: '🍔🇺🇸' },
      { symbol: 'KO', flags: '🥤🇺🇸' },
      { symbol: 'SBUX', flags: '☕🇺🇸' },
      { symbol: 'BA', flags: '✈️🇺🇸' },
    ]
  },
  commodities: {
    label: 'COMMODITIES',
    icon: '🥇',
    color: 'bg-yellow-500',
    pairs: [
      { symbol: 'XAU/USD', flags: '🥇💵' },
      { symbol: 'XAG/USD', flags: '🥈💵' },
      { symbol: 'XPT/USD', flags: '⚪💵' },
      { symbol: 'XPD/USD', flags: '⚫💵' },
      { symbol: 'WTI/USD', flags: '🛢️💵' },
      { symbol: 'BRENT/USD', flags: '🛢️💵' },
      { symbol: 'NGAS/USD', flags: '🔥💵' },
      { symbol: 'COPPER', flags: '🔶' },
      { symbol: 'WHEAT', flags: '🌾' },
      { symbol: 'CORN', flags: '🌽' },
      { symbol: 'COFFEE', flags: '☕' },
      { symbol: 'SUGAR', flags: '🍬' },
    ]
  },
  indices: {
    label: 'INDICES',
    icon: '📊',
    color: 'bg-purple-500',
    pairs: [
      { symbol: 'US30', flags: '🇺🇸📊' },
      { symbol: 'US500', flags: '🇺🇸📈' },
      { symbol: 'US100', flags: '🇺🇸💻' },
      { symbol: 'DE40', flags: '🇩🇪📊' },
      { symbol: 'UK100', flags: '🇬🇧📊' },
      { symbol: 'FR40', flags: '🇫🇷📊' },
      { symbol: 'JP225', flags: '🇯🇵📊' },
      { symbol: 'AU200', flags: '🇦🇺📊' },
      { symbol: 'HK50', flags: '🇭🇰📊' },
      { symbol: 'EU50', flags: '🇪🇺📊' },
    ]
  }
};

export default function AssetSelector({ selectedPair, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('forex');

  const getSelectedPairData = () => {
    for (const [key, cat] of Object.entries(ASSET_CATEGORIES)) {
      const found = cat.pairs.find(p => p.symbol === selectedPair);
      if (found) return { ...found, category: key, color: cat.color };
    }
    return null;
  };

  const selectedData = getSelectedPairData();

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              "px-4 py-2 text-sm tracking-widest transition-all border rounded-lg flex items-center gap-2",
              activeCategory === key
                ? `${cat.color} text-white border-transparent`
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Pairs Grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {ASSET_CATEGORIES[activeCategory].pairs.map((pair) => (
          <button
            key={pair.symbol}
            onClick={() => onSelect(pair.symbol)}
            className={cn(
              "py-4 px-3 border rounded-xl text-center transition-all",
              selectedPair === pair.symbol
                ? "bg-white border-white text-black"
                : "border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white bg-zinc-900/30"
            )}
          >
            <div className="text-2xl mb-1">{pair.flags}</div>
            <div className="text-sm tracking-wider font-bold">{pair.symbol}</div>
          </button>
        ))}
      </motion.div>

      {/* Selected Display */}
      {selectedPair && selectedData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 border border-emerald-500/50 bg-emerald-500/10 rounded-xl"
        >
          <div className="text-4xl">{selectedData.flags}</div>
          <div>
            <div className="text-xs text-emerald-400 tracking-widest mb-1">AUSGEWÄHLT</div>
            <div className="text-2xl text-white tracking-wider font-bold">{selectedPair}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}