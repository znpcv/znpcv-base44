import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Bitcoin, DollarSign, TrendingUp, Gem, BarChart3 } from 'lucide-react';

const ASSET_CATEGORIES = {
  forex: {
    label: 'FOREX',
    icon: DollarSign,
    pairs: [
      // Major Pairs
      { symbol: 'EUR/USD', flags: '🇪🇺🇺🇸' },
      { symbol: 'GBP/USD', flags: '🇬🇧🇺🇸' },
      { symbol: 'USD/JPY', flags: '🇺🇸🇯🇵' },
      { symbol: 'USD/CHF', flags: '🇺🇸🇨🇭' },
      { symbol: 'AUD/USD', flags: '🇦🇺🇺🇸' },
      { symbol: 'USD/CAD', flags: '🇺🇸🇨🇦' },
      { symbol: 'NZD/USD', flags: '🇳🇿🇺🇸' },
      // EUR Crosses
      { symbol: 'EUR/GBP', flags: '🇪🇺🇬🇧' },
      { symbol: 'EUR/JPY', flags: '🇪🇺🇯🇵' },
      { symbol: 'EUR/CHF', flags: '🇪🇺🇨🇭' },
      { symbol: 'EUR/AUD', flags: '🇪🇺🇦🇺' },
      { symbol: 'EUR/CAD', flags: '🇪🇺🇨🇦' },
      { symbol: 'EUR/NZD', flags: '🇪🇺🇳🇿' },
      // GBP Crosses
      { symbol: 'GBP/JPY', flags: '🇬🇧🇯🇵' },
      { symbol: 'GBP/CHF', flags: '🇬🇧🇨🇭' },
      { symbol: 'GBP/AUD', flags: '🇬🇧🇦🇺' },
      { symbol: 'GBP/CAD', flags: '🇬🇧🇨🇦' },
      { symbol: 'GBP/NZD', flags: '🇬🇧🇳🇿' },
      // Other Crosses
      { symbol: 'AUD/JPY', flags: '🇦🇺🇯🇵' },
      { symbol: 'AUD/CAD', flags: '🇦🇺🇨🇦' },
      { symbol: 'AUD/NZD', flags: '🇦🇺🇳🇿' },
      { symbol: 'NZD/JPY', flags: '🇳🇿🇯🇵' },
      { symbol: 'CAD/JPY', flags: '🇨🇦🇯🇵' },
      { symbol: 'CHF/JPY', flags: '🇨🇭🇯🇵' },
    ]
  },
  crypto: {
    label: 'CRYPTO',
    icon: Bitcoin,
    pairs: [
      { symbol: 'BTC/USD' },
      { symbol: 'ETH/USD' },
      { symbol: 'BNB/USD' },
      { symbol: 'XRP/USD' },
      { symbol: 'SOL/USD' },
      { symbol: 'ADA/USD' },
      { symbol: 'DOGE/USD' },
      { symbol: 'DOT/USD' },
      { symbol: 'MATIC/USD' },
      { symbol: 'LTC/USD' },
      { symbol: 'AVAX/USD' },
      { symbol: 'LINK/USD' },
      { symbol: 'ETH/BTC' },
      { symbol: 'BNB/BTC' },
    ]
  },
  stocks: {
    label: 'STOCKS',
    icon: TrendingUp,
    pairs: [
      { symbol: 'AAPL' },
      { symbol: 'MSFT' },
      { symbol: 'GOOGL' },
      { symbol: 'AMZN' },
      { symbol: 'NVDA' },
      { symbol: 'META' },
      { symbol: 'TSLA' },
      { symbol: 'JPM' },
      { symbol: 'V' },
      { symbol: 'WMT' },
      { symbol: 'DIS' },
      { symbol: 'NFLX' },
      { symbol: 'AMD' },
      { symbol: 'NKE' },
      { symbol: 'MCD' },
      { symbol: 'KO' },
    ]
  },
  commodities: {
    label: 'COMMODITIES',
    icon: Gem,
    pairs: [
      { symbol: 'XAU/USD' },
      { symbol: 'XAG/USD' },
      { symbol: 'XPT/USD' },
      { symbol: 'WTI/USD' },
      { symbol: 'BRENT/USD' },
      { symbol: 'NGAS/USD' },
      { symbol: 'COPPER' },
      { symbol: 'WHEAT' },
      { symbol: 'CORN' },
      { symbol: 'COFFEE' },
    ]
  },
  indices: {
    label: 'INDICES',
    icon: BarChart3,
    pairs: [
      { symbol: 'US30' },
      { symbol: 'US500' },
      { symbol: 'US100' },
      { symbol: 'DE40' },
      { symbol: 'UK100' },
      { symbol: 'FR40' },
      { symbol: 'JP225' },
      { symbol: 'AU200' },
      { symbol: 'HK50' },
      { symbol: 'EU50' },
    ]
  }
};

export default function AssetSelector({ selectedPair, onSelect, darkMode = true }) {
  const [activeCategory, setActiveCategory] = useState('forex');

  const getSelectedPairData = () => {
    for (const [key, cat] of Object.entries(ASSET_CATEGORIES)) {
      const found = cat.pairs.find(p => p.symbol === selectedPair);
      if (found) return { ...found, category: key };
    }
    return null;
  };

  const selectedData = getSelectedPairData();
  const isForex = activeCategory === 'forex';

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-300',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => {
          const Icon = cat.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-[10px] sm:text-xs md:text-sm tracking-widest transition-all rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 font-bold",
                activeCategory === key
                  ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                  : `${theme.bg} border ${theme.border} ${theme.textMuted} hover:${theme.text}`
              )}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pairs Grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3"
      >
        {ASSET_CATEGORIES[activeCategory].pairs.map((pair) => {
          const Icon = ASSET_CATEGORIES[activeCategory].icon;
          return (
            <button
              key={pair.symbol}
              onClick={() => onSelect(pair.symbol)}
              className={cn(
                "py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-3 border rounded-lg sm:rounded-xl md:rounded-2xl text-center transition-all",
                selectedPair === pair.symbol
                  ? darkMode ? "bg-white border-white text-black" : "bg-zinc-900 border-zinc-900 text-white"
                  : `border-zinc-800/50 ${theme.textMuted} hover:border-zinc-600 hover:${theme.text} ${theme.bg}`
              )}
            >
              {isForex && pair.flags ? (
                <div className="text-base sm:text-xl md:text-2xl mb-1 sm:mb-2 tracking-wider">{pair.flags}</div>
              ) : (
                <div className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-2 rounded-md sm:rounded-lg flex items-center justify-center",
                  selectedPair === pair.symbol 
                    ? darkMode ? "bg-black/10" : "bg-white/10"
                    : "bg-zinc-800"
                )}>
                  <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5", selectedPair === pair.symbol ? (darkMode ? "text-black" : "text-white") : "text-zinc-400")} />
                </div>
              )}
              <div className="text-[10px] sm:text-xs md:text-sm tracking-wider font-bold">{pair.symbol}</div>
            </button>
          );
        })}
      </motion.div>


    </div>
  );
}