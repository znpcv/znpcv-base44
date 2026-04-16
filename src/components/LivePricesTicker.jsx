import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ASSETS = [
  // Forex — via exchangerate-api (free, no key)
  { id: 'EURUSD', label: 'EUR/USD', type: 'forex', base: 'EUR', quote: 'USD' },
  { id: 'GBPUSD', label: 'GBP/USD', type: 'forex', base: 'GBP', quote: 'USD' },
  { id: 'USDJPY', label: 'USD/JPY', type: 'forex', base: 'USD', quote: 'JPY' },
  { id: 'USDCHF', label: 'USD/CHF', type: 'forex', base: 'USD', quote: 'CHF' },
  { id: 'AUDUSD', label: 'AUD/USD', type: 'forex', base: 'AUD', quote: 'USD' },
  // Crypto — via CoinGecko (free, no key)
  { id: 'BTC',   label: 'BTC/USD', type: 'crypto', coingeckoId: 'bitcoin' },
  { id: 'ETH',   label: 'ETH/USD', type: 'crypto', coingeckoId: 'ethereum' },
  { id: 'SOL',   label: 'SOL/USD', type: 'crypto', coingeckoId: 'solana' },
  // Metals/Commodities — via Metals-API free tier or Frankfurter XAU
  { id: 'XAUUSD', label: 'GOLD/USD', type: 'commodity', base: 'XAU', quote: 'USD' },
  { id: 'XAGUSD', label: 'SILVER/USD', type: 'commodity', base: 'XAG', quote: 'USD' },
];

const TYPE_COLOR = {
  forex: 'text-blue-400',
  crypto: 'text-amber-400',
  commodity: 'text-yellow-500',
  stock: 'text-purple-400',
};

async function fetchForexRates() {
  // Frankfurter.app — gratis, kein API-Key
  const pairs = ['EUR', 'GBP', 'AUD', 'CHF'];
  const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${pairs.join(',')}`);
  const data = await res.json();
  // data.rates = { EUR: 0.92, GBP: 0.78, ... }
  return data.rates;
}

async function fetchCryptoPrices() {
  const ids = 'bitcoin,ethereum,solana';
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  );
  return await res.json();
}

async function fetchGoldSilver() {
  // Frankfurter doesn't support XAU/XAG — use metals.live (free CORS proxy)
  try {
    const res = await fetch('https://metals.live/api/spot');
    const data = await res.json();
    // [{symbol:'XAU',price:...},{symbol:'XAG',...}]
    const map = {};
    data.forEach(m => { map[m.symbol] = m.price; });
    return map;
  } catch {
    return {};
  }
}

export default function LivePricesTicker({ darkMode }) {
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const tickerRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [forexRates, cryptoData, metalData] = await Promise.all([
        fetchForexRates().catch(() => ({})),
        fetchCryptoPrices().catch(() => ({})),
        fetchGoldSilver().catch(() => ({})),
      ]);

      setPrevPrices(prev => ({ ...prev, ...prices }));

      const newPrices = {};

      // Forex (rates are USD-based, invert for EUR/USD, GBP/USD, AUD/USD)
      if (forexRates.EUR) newPrices['EURUSD'] = { price: (1 / forexRates.EUR), change: null };
      if (forexRates.GBP) newPrices['GBPUSD'] = { price: (1 / forexRates.GBP), change: null };
      if (forexRates.AUD) newPrices['AUDUSD'] = { price: (1 / forexRates.AUD), change: null };
      if (forexRates.CHF) newPrices['USDCHF'] = { price: forexRates.CHF, change: null };
      // USD/JPY: we need JPY rate — fetch separately
      try {
        const jpyRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY');
        const jpyData = await jpyRes.json();
        if (jpyData.rates?.JPY) newPrices['USDJPY'] = { price: jpyData.rates.JPY, change: null };
      } catch {}

      // Crypto
      if (cryptoData.bitcoin) newPrices['BTC'] = { price: cryptoData.bitcoin.usd, change: cryptoData.bitcoin.usd_24h_change };
      if (cryptoData.ethereum) newPrices['ETH'] = { price: cryptoData.ethereum.usd, change: cryptoData.ethereum.usd_24h_change };
      if (cryptoData.solana) newPrices['SOL'] = { price: cryptoData.solana.usd, change: cryptoData.solana.usd_24h_change };

      // Metals
      if (metalData.XAU) newPrices['XAUUSD'] = { price: metalData.XAU, change: null };
      if (metalData.XAG) newPrices['XAGUSD'] = { price: metalData.XAG, change: null };

      setPrices(newPrices);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (asset, price) => {
    if (!price) return '—';
    if (asset.type === 'crypto') {
      if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (asset.id === 'USDJPY') return price.toFixed(3);
    if (asset.type === 'commodity') return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(5);
  };

  const getFlash = (id) => {
    if (!prevPrices[id] || !prices[id]) return '';
    if (prices[id].price > prevPrices[id].price) return 'text-emerald-500';
    if (prices[id].price < prevPrices[id].price) return 'text-rose-500';
    return '';
  };

  if (loading) {
    return (
      <div className={`w-full overflow-hidden border-b ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="py-2 px-4 flex items-center gap-4 justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className={`text-[10px] tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>LIVE PRICES LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden border-b ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
      <div className="relative flex overflow-hidden">
        {/* Scrolling ticker */}
        <div
          ref={tickerRef}
          className="flex animate-[ticker_40s_linear_infinite] whitespace-nowrap"
          style={{ animationTimingFunction: 'linear' }}
        >
          {[...ASSETS, ...ASSETS].map((asset, idx) => {
            const data = prices[asset.id];
            const change = data?.change;
            const flash = getFlash(asset.id);

            return (
              <div
                key={`${asset.id}-${idx}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border-r border-zinc-800/30"
              >
                <span className={`text-[9px] font-bold tracking-widest ${TYPE_COLOR[asset.type] || 'text-zinc-400'}`}>
                  {asset.label}
                </span>
                <span className={`text-[11px] font-mono font-bold tabular-nums ${flash || (darkMode ? 'text-white' : 'text-zinc-900')} transition-colors duration-300`}>
                  {formatPrice(asset, data?.price)}
                </span>
                {change != null && (
                  <span className={cn(
                    'text-[9px] font-bold flex items-center gap-0.5',
                    change >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {change >= 0
                      ? <TrendingUp className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />
                    }
                    {Math.abs(change).toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}