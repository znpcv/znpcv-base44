import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

export default function LivePriceTracker({ pair, onPriceUpdate }) {
  const { darkMode } = useLanguage();
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Convert pair format for OANDA (e.g., EUR/USD -> EUR_USD)
  const formatPairForOanda = (p) => {
    if (!p) return '';
    return p.replace('/', '_').toUpperCase();
  };

  const fetchLivePrice = async () => {
    if (!pair) return;
    
    setLoading(true);
    setError(null);
    
    const oandaPair = formatPairForOanda(pair);
    
    try {
      // Get live price from OANDA using LLM with internet context
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the CURRENT LIVE market price for ${pair} (${oandaPair}) from OANDA. 
        
IMPORTANT: Use OANDA as the data source - this is the industry standard for Forex traders worldwide.
Search for "OANDA ${pair} live rate" or check fxrates.oanda.com for the most accurate real-time data.

Return the exact current bid and ask prices from OANDA. Be precise to 5 decimal places for Forex pairs (or 3 for JPY pairs, 2 for Gold/XAU).

The data MUST be from OANDA - the world's most trusted Forex data source used by professional traders globally.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_price: { type: "number", description: "Mid price (average of bid and ask)" },
            bid: { type: "number", description: "OANDA bid price" },
            ask: { type: "number", description: "OANDA ask price" },
            spread: { type: "number", description: "Spread in pips" },
            change_percent: { type: "number", description: "24h change percentage" },
            high_24h: { type: "number", description: "24h high" },
            low_24h: { type: "number", description: "24h low" },
            source: { type: "string", description: "Data source (should be OANDA)" },
            timestamp: { type: "string", description: "Time of the quote" }
          },
          required: ["current_price", "bid", "ask"]
        }
      });

      setPriceData(result);
      setLastUpdate(new Date());
      
      if (onPriceUpdate && result.current_price) {
        onPriceUpdate(result.current_price);
      }
    } catch (err) {
      setError('OANDA Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pair) {
      fetchLivePrice();
      const interval = setInterval(fetchLivePrice, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [pair]);

  // Determine decimal places based on pair type
  const getDecimalPlaces = () => {
    if (!pair) return 5;
    const p = pair.toUpperCase();
    if (p.includes('JPY')) return 3;
    if (p.includes('XAU') || p.includes('GOLD')) return 2;
    if (p.includes('BTC') || p.includes('ETH')) return 2;
    return 5;
  };

  const decimals = getDecimalPlaces();

  if (!pair) {
    return (
      <div className={`border rounded-xl p-4 text-center ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
        <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-zinc-700' : 'text-zinc-400'}`} />
        <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Wähle zuerst ein Währungspaar</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
        <button 
          onClick={fetchLivePrice}
          className="mt-3 w-full px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (loading && !priceData) {
    return (
      <div className={`border rounded-xl p-6 text-center ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
        <RefreshCw className={`w-8 h-8 mx-auto mb-2 animate-spin ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
        <div className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>OANDA Live-Daten werden geladen...</div>
      </div>
    );
  }

  if (!priceData) return null;

  const isPositive = (priceData.change_percent || 0) >= 0;
  const spread = priceData.spread || (priceData.ask && priceData.bid ? ((priceData.ask - priceData.bid) * (pair.includes('JPY') ? 100 : 10000)).toFixed(1) : null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-4 sm:p-5 space-y-4"
    >
      {/* Header with OANDA branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">O</span>
          </div>
          <div>
            <span className={`font-bold tracking-widest text-sm ${darkMode ? 'text-white' : 'text-black'}`}>OANDA LIVE</span>
            <div className="text-[10px] text-blue-400">Globaler Forex Standard</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-xs font-bold">LIVE</span>
        </div>
      </div>

      {/* Current Price - Large Display */}
      <div className={`rounded-xl p-5 text-center ${darkMode ? 'bg-white/10 backdrop-blur' : 'bg-white/80 backdrop-blur border border-zinc-200'}`}>
        <div className={`text-xs mb-1 tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{pair}</div>
        <div className={`text-4xl sm:text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
          {priceData.current_price?.toFixed(decimals)}
        </div>
        {priceData.change_percent !== undefined && (
          <div className={cn("flex items-center justify-center gap-2 text-sm font-sans",
            isPositive ? "text-emerald-500" : "text-red-500")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-bold">{isPositive ? '+' : ''}{priceData.change_percent?.toFixed(2)}%</span>
            <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>(24h)</span>
          </div>
        )}
      </div>

      {/* Bid/Ask/Spread */}
      {priceData.bid && priceData.ask && (
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="text-[10px] text-red-300 mb-1 tracking-wider">BID</div>
            <div className="text-base sm:text-lg font-bold text-red-400">{priceData.bid.toFixed(decimals)}</div>
          </div>
          <div className={`text-center p-3 rounded-xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-200/50 border-zinc-300'}`}>
            <div className={`text-[10px] mb-1 tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>SPREAD</div>
            <div className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{spread} <span className="text-xs font-normal">pips</span></div>
          </div>
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="text-[10px] text-emerald-300 mb-1 tracking-wider">ASK</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">{priceData.ask.toFixed(decimals)}</div>
          </div>
        </div>
      )}

      {/* 24h High/Low */}
      {(priceData.high_24h || priceData.low_24h) && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-200/50'}`}>
            <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>24H HOCH</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{priceData.high_24h?.toFixed(decimals) || '—'}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-200/50'}`}>
            <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>24H TIEF</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{priceData.low_24h?.toFixed(decimals) || '—'}</div>
          </div>
        </div>
      )}

      {/* Footer with source and update */}
      <div className={`flex items-center justify-between text-xs pt-2 border-t ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-300 text-zinc-600'}`}>
        <div className="flex items-center gap-2">
          <span>Quelle: <span className="text-blue-400 font-bold">OANDA</span></span>
          <span>•</span>
          <span>{lastUpdate ? lastUpdate.toLocaleTimeString('de-DE') : '—'}</span>
        </div>
        <button
          onClick={fetchLivePrice}
          disabled={loading}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          <span>Aktualisieren</span>
        </button>
      </div>
    </motion.div>
  );
}