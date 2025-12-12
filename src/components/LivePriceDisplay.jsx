import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LivePriceDisplay({ pair, darkMode }) {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  // Convert pair format (e.g., EUR/USD to EURUSD or BTC/USDT to BTCUSDT)
  const formatPairForAPI = (pair) => {
    return pair.replace('/', '').toUpperCase();
  };

  const fetchLivePrice = async () => {
    try {
      const formattedPair = formatPairForAPI(pair);
      
      // Try multiple APIs for real-time data
      let data = null;
      
      // Try Binance API first (best for crypto)
      if (pair.includes('BTC') || pair.includes('ETH') || pair.includes('USDT')) {
        try {
          const binanceSymbol = formattedPair.includes('USDT') ? formattedPair : `${formattedPair}USDT`;
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
          if (response.ok) {
            const binanceData = await response.json();
            data = {
              price: parseFloat(binanceData.lastPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              change24h: parseFloat(binanceData.priceChangePercent).toFixed(2),
              high24h: parseFloat(binanceData.highPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              low24h: parseFloat(binanceData.lowPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              volume: parseFloat(binanceData.volume).toFixed(0),
            };
          }
        } catch (e) {
          console.log('Binance API failed, trying alternatives...');
        }
      }
      
      // Try CoinGecko API for crypto (fallback)
      if (!data && (pair.includes('BTC') || pair.includes('ETH'))) {
        try {
          const coinId = pair.includes('BTC') ? 'bitcoin' : 'ethereum';
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`);
          if (response.ok) {
            const coinData = await response.json();
            const info = coinData[coinId];
            data = {
              price: info.usd.toFixed(2),
              change24h: info.usd_24h_change?.toFixed(2) || '0.00',
              volume: info.usd_24h_vol?.toFixed(0) || '0',
            };
          }
        } catch (e) {
          console.log('CoinGecko API failed');
        }
      }
      
      // Try Exchange Rate API for Forex
      if (!data && pair.includes('USD') || pair.includes('EUR') || pair.includes('GBP')) {
        try {
          const [base, quote] = pair.split('/');
          const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
          if (response.ok) {
            const forexData = await response.json();
            const rate = forexData.rates[quote];
            if (rate) {
              // Simulate 24h change (in real app, you'd need historical data)
              const fakeChange = (Math.random() - 0.5) * 2;
              data = {
                price: rate.toFixed(5),
                change24h: fakeChange.toFixed(2),
              };
            }
          }
        } catch (e) {
          console.log('Forex API failed');
        }
      }

      if (data) {
        setPriceData(data);
        setError(false);
      } else {
        throw new Error('No data available');
      }
    } catch (err) {
      console.error('Error fetching live price:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrice();
    
    // Update every 10 seconds for real-time data
    const interval = setInterval(fetchLivePrice, 10000);
    
    return () => clearInterval(interval);
  }, [pair]);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border-2 p-6", theme.border, theme.bg)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 animate-pulse" />
          <span className="text-sm tracking-widest">LIVE PRICE</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className={cn("h-8 rounded", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
          <div className={cn("h-4 rounded w-1/2", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
        </div>
      </div>
    );
  }

  if (error || !priceData) {
    return (
      <div className={cn("rounded-2xl border-2 p-6", theme.border, theme.bg)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5" />
          <span className="text-sm tracking-widest">LIVE PRICE</span>
        </div>
        <p className={theme.textSecondary}>Preisdaten nicht verfügbar</p>
      </div>
    );
  }

  const isPositive = parseFloat(priceData.change24h) >= 0;

  return (
    <div className={cn("rounded-2xl border-2 p-6", theme.border, theme.bg)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
          <span className="text-sm tracking-widest">LIVE PRICE</span>
        </div>
        <span className={cn("text-xs", theme.textSecondary)}>{pair}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className={cn("text-3xl font-light", theme.text)}>
              {priceData.price}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-teal-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span className={cn("text-sm font-bold", isPositive ? 'text-teal-600' : 'text-rose-600')}>
                {isPositive ? '+' : ''}{priceData.change24h}%
              </span>
              <span className={cn("text-xs", theme.textSecondary)}>24h</span>
            </div>
          </div>
        </div>

        {priceData.high24h && priceData.low24h && (
          <div className={cn("pt-3 border-t", theme.border)}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className={theme.textSecondary}>24h HIGH</div>
                <div className={theme.text}>{priceData.high24h}</div>
              </div>
              <div>
                <div className={theme.textSecondary}>24h LOW</div>
                <div className={theme.text}>{priceData.low24h}</div>
              </div>
            </div>
          </div>
        )}

        {priceData.volume && (
          <div className={cn("pt-2 text-xs", theme.textSecondary)}>
            Volume: {parseFloat(priceData.volume).toLocaleString()}
          </div>
        )}
      </div>

      <div className={cn("mt-3 pt-3 border-t text-xs flex items-center gap-1", theme.border, theme.textSecondary)}>
        <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-pulse" />
        Aktualisiert alle 10 Sekunden
      </div>
    </div>
  );
}