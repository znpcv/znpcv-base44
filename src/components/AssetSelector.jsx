import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const ASSET_CATEGORIES = {
  forex: {
    label: 'FOREX',
    icon: '💱',
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
      { symbol: 'AUD/NZD', flags: '🇦🇺🇳🇿' },
      { symbol: 'EUR/NZD', flags: '🇪🇺🇳🇿' },
      { symbol: 'GBP/NZD', flags: '🇬🇧🇳🇿' },
    ]
  },
  crypto: {
    label: 'CRYPTO',
    icon: '₿',
    pairs: [
      { symbol: 'BTC/USD', flags: '₿ 💵' },
      { symbol: 'ETH/USD', flags: 'Ξ 💵' },
      { symbol: 'BNB/USD', flags: '⬡ 💵' },
      { symbol: 'XRP/USD', flags: '✕ 💵' },
      { symbol: 'SOL/USD', flags: '◎ 💵' },
      { symbol: 'ADA/USD', flags: '₳ 💵' },
      { symbol: 'DOGE/USD', flags: '🐕 💵' },
      { symbol: 'DOT/USD', flags: '● 💵' },
      { symbol: 'MATIC/USD', flags: '⬡ 💵' },
      { symbol: 'LTC/USD', flags: 'Ł 💵' },
      { symbol: 'AVAX/USD', flags: '🔺 💵' },
      { symbol: 'LINK/USD', flags: '⬡ 💵' },
      { symbol: 'ETH/BTC', flags: 'Ξ ₿' },
      { symbol: 'BNB/BTC', flags: '⬡ ₿' },
    ]
  },
  stocks: {
    label: 'STOCKS',
    icon: '📈',
    pairs: [
      { symbol: 'AAPL', flags: '🍎 🇺🇸' },
      { symbol: 'MSFT', flags: '🪟 🇺🇸' },
      { symbol: 'GOOGL', flags: '🔍 🇺🇸' },
      { symbol: 'AMZN', flags: '📦 🇺🇸' },
      { symbol: 'NVDA', flags: '🎮 🇺🇸' },
      { symbol: 'META', flags: '👤 🇺🇸' },
      { symbol: 'TSLA', flags: '🚗 🇺🇸' },
      { symbol: 'JPM', flags: '🏦 🇺🇸' },
      { symbol: 'V', flags: '💳 🇺🇸' },
      { symbol: 'WMT', flags: '🛒 🇺🇸' },
      { symbol: 'DIS', flags: '🏰 🇺🇸' },
      { symbol: 'NFLX', flags: '🎬 🇺🇸' },
      { symbol: 'AMD', flags: '💻 🇺🇸' },
      { symbol: 'NKE', flags: '👟 🇺🇸' },
      { symbol: 'MCD', flags: '🍔 🇺🇸' },
      { symbol: 'KO', flags: '🥤 🇺🇸' },
    ]
  },
  commodities: {
    label: 'COMMODITIES',
    icon: '🥇',
    pairs: [
      { symbol: 'XAU/USD', flags: '🥇 💵' },
      { symbol: 'XAG/USD', flags: '🥈 💵' },
      { symbol: 'XPT/USD', flags: '⚪ 💵' },
      { symbol: 'WTI/USD', flags: '🛢️ 💵' },
      { symbol: 'BRENT/USD', flags: '🛢️ 💵' },
      { symbol: 'NGAS/USD', flags: '🔥 💵' },
      { symbol: 'COPPER', flags: '🔶' },
      { symbol: 'WHEAT', flags: '🌾' },
      { symbol: 'CORN', flags: '🌽' },
      { symbol: 'COFFEE', flags: '☕' },
    ]
  },
  indices: {
    label: 'INDICES',
    icon: '📊',
    pairs: [
      { symbol: 'US30', flags: '🇺🇸 📊' },
      { symbol: 'US500', flags: '🇺🇸 📈' },
      { symbol: 'US100', flags: '🇺🇸 💻' },
      { symbol: 'DE40', flags: '🇩🇪 📊' },
      { symbol: 'UK100', flags: '🇬🇧 📊' },
      { symbol: 'FR40', flags: '🇫🇷 📊' },
      { symbol: 'JP225', flags: '🇯🇵 📊' },
      { symbol: 'AU200', flags: '🇦🇺 📊' },
      { symbol: 'HK50', flags: '🇭🇰 📊' },
      { symbol: 'EU50', flags: '🇪🇺 📊' },
    ]
  }
};

export default function AssetSelector({ selectedPair, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('forex');

  const getSelectedPairData = () => {
    for (const [key, cat] of Object.entries(ASSET_CATEGORIES)) {
      const found = cat.pairs.find(p => p.symbol === selectedPair);
      if (found) return { ...found, category: key };
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
              "px-5 py-3 text-sm tracking-widest transition-all rounded-xl flex items-center gap-2",
              activeCategory === key
                ? "bg-white text-black"
                : "bg-zinc-950 border border-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-white"
            )}
          >
            <span className="text-lg">{cat.icon}</span>
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
              "py-5 px-4 border rounded-2xl text-center transition-all",
              selectedPair === pair.symbol
                ? "bg-white border-white text-black"
                : "border-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950"
            )}
          >
            <div className="text-2xl mb-2 tracking-wider">{pair.flags}</div>
            <div className="text-sm tracking-wider font-bold">{pair.symbol}</div>
          </button>
        ))}
      </motion.div>

      {/* Selected Display */}
      {selectedPair && selectedData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 p-6 bg-white text-black rounded-2xl"
        >
          <div className="text-4xl">{selectedData.flags}</div>
          <div>
            <div className="text-xs text-zinc-500 tracking-widest mb-1">SELECTED</div>
            <div className="text-2xl tracking-wider font-bold">{selectedPair}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}