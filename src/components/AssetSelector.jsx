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
  const isForex = activeCategory === 'forex';

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => {
          const Icon = cat.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "px-4 py-2.5 text-sm tracking-widest transition-all rounded-xl flex items-center gap-2",
                activeCategory === key
                  ? "bg-white text-black"
                  : "bg-zinc-950 border border-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Pairs Grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {ASSET_CATEGORIES[activeCategory].pairs.map((pair) => {
          const Icon = ASSET_CATEGORIES[activeCategory].icon;
          return (
            <button
              key={pair.symbol}
              onClick={() => onSelect(pair.symbol)}
              className={cn(
                "py-4 px-3 border rounded-2xl text-center transition-all",
                selectedPair === pair.symbol
                  ? "bg-white border-white text-black"
                  : "border-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-950"
              )}
            >
              {isForex && pair.flags ? (
                <div className="text-2xl mb-2 tracking-wider">{pair.flags}</div>
              ) : (
                <div className={cn(
                  "w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center",
                  selectedPair === pair.symbol ? "bg-black/10" : "bg-zinc-800"
                )}>
                  <Icon className={cn("w-5 h-5", selectedPair === pair.symbol ? "text-black" : "text-zinc-400")} />
                </div>
              )}
              <div className="text-sm tracking-wider font-bold">{pair.symbol}</div>
            </button>
          );
        })}
      </motion.div>

      {/* Selected Display */}
      {selectedPair && selectedData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 p-6 bg-white text-black rounded-2xl"
        >
          {selectedData.flags ? (
            <div className="text-4xl">{selectedData.flags}</div>
          ) : (
            <div className="w-14 h-14 bg-black/10 rounded-xl flex items-center justify-center">
              {React.createElement(ASSET_CATEGORIES[selectedData.category].icon, { className: "w-7 h-7 text-black" })}
            </div>
          )}
          <div>
            <div className="text-xs text-zinc-500 tracking-widest mb-1">SELECTED</div>
            <div className="text-2xl tracking-wider font-bold">{selectedPair}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}