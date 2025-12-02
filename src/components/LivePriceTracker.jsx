import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LivePriceTracker({ pair, onPriceUpdate }) {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLivePrice = async () => {
    if (!pair) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get live price using LLM with internet context
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the current live market price for ${pair}. Return ONLY the current price data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_price: { type: "number" },
            bid: { type: "number" },
            ask: { type: "number" },
            change_24h: { type: "number" },
            change_percent: { type: "number" }
          },
          required: ["current_price"]
        }
      });

      setPriceData(result);
      setLastUpdate(new Date());
      
      if (onPriceUpdate && result.current_price) {
        onPriceUpdate(result.current_price);
      }
    } catch (err) {
      setError('Preis konnte nicht geladen werden');
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

  if (!pair) {
    return (
      <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950 text-center">
        <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <div className="text-zinc-500 text-xs">Wähle zuerst ein Währungspaar</div>
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
      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950 text-center">
        <RefreshCw className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-spin" />
        <div className="text-zinc-500 text-sm">Live-Daten werden geladen...</div>
      </div>
    );
  }

  if (!priceData) return null;

  const isPositive = (priceData.change_percent || 0) >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-4 sm:p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <span className="text-white font-bold tracking-widest text-sm">LIVE MARKTDATEN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-xs">LIVE</span>
        </div>
      </div>

      {/* Current Price - Large Display */}
      <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
        <div className="text-xs text-zinc-500 mb-1 tracking-widest">{pair} - AKTUELLER PREIS</div>
        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
          {priceData.current_price?.toFixed(5)}
        </div>
        {priceData.change_percent !== undefined && (
          <div className={cn("flex items-center justify-center gap-2 text-sm font-sans",
            isPositive ? "text-emerald-400" : "text-red-400")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{priceData.change_percent?.toFixed(2)}%</span>
          </div>
        )}
      </div>

      {/* Bid/Ask Spread */}
      {priceData.bid && priceData.ask && (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="text-[10px] text-red-300 mb-1">BID (VERKAUFEN)</div>
            <div className="text-lg font-bold text-red-400">{priceData.bid.toFixed(5)}</div>
          </div>
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="text-[10px] text-emerald-300 mb-1">ASK (KAUFEN)</div>
            <div className="text-lg font-bold text-emerald-400">{priceData.ask.toFixed(5)}</div>
          </div>
        </div>
      )}

      {/* Last Update Time */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Letzte Aktualisierung: {lastUpdate ? lastUpdate.toLocaleTimeString('de-DE') : '—'}</span>
        <button
          onClick={fetchLivePrice}
          disabled={loading}
          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          <span>Aktualisieren</span>
        </button>
      </div>
    </motion.div>
  );
}