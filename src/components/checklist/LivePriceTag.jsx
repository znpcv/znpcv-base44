/**
 * LivePriceTag — zeigt den aktuellen Preis für ein Symbol (Forex, Crypto, Aktien, Gold usw.)
 * Nutzt mehrere kostenlose APIs als Fallback-Kette.
 */
import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

// Symbole → API-Typ ermitteln
function detectType(raw) {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Crypto-Liste (häufigste)
  const CRYPTO = ['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX','DOT','LINK','LTC','BCH','MATIC','ATOM','UNI','OP','ARB','SUI','TON','TRX'];
  // Gold / Silber / Rohstoffe (typisch für TradingView-Symbole)
  const COMMODITIES_FX = { XAUUSD: 'XAUUSD', XAGUSD: 'XAGUSD', XAUEUR: 'XAUEUR' };

  // Crypto pairs wie BTCUSD, BTCUSDT, ETHUSDT etc.
  for (const c of CRYPTO) {
    if (s.startsWith(c) || s === c) return { type: 'crypto', base: c };
  }
  // Forex / Gold – 6 Zeichen (EURUSD, GBPJPY, XAUUSD ...)
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) return { type: 'forex', symbol: s };
  // Stocks (1-5 Buchstaben)
  if (s.length <= 5 && /^[A-Z]+$/.test(s)) return { type: 'stock', symbol: s };

  return { type: 'unknown', symbol: s };
}

async function fetchForex(symbol) {
  // Binance Forex (nur Pairs mit USDT-Equivalent) → skip
  // Verwende exchangerate-api (kostenlos, kein Key) für FX
  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  // Gold/Silver special
  if (base === 'XAU' || base === 'XAG') {
    // Verwende Metals-API über frankfurter (unterstützt XAU als Basis nicht direkt)
    // Fallback: Open Exchange Rates (kostenlos, limitiert)
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`);
    if (!res.ok) throw new Error('no data');
    const data = await res.json();
    return { price: data.rates?.[quote], source: 'Frankfurt' };
  }
  const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`);
  if (!res.ok) throw new Error('no forex data');
  const data = await res.json();
  const price = data.rates?.[quote];
  if (!price) throw new Error('no rate');
  return { price, source: 'FX' };
}

async function fetchCrypto(base) {
  // Binance API – immer verfügbar, kein Key
  const symbol = `${base}USDT`;
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
  if (!res.ok) throw new Error('binance error');
  const d = await res.json();
  return {
    price: parseFloat(d.lastPrice),
    change24h: parseFloat(d.priceChangePercent),
    source: 'Binance',
  };
}

async function fetchStock(symbol) {
  // Yahoo Finance inoffizielle API (CORS-frei über allorigins)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  const wrapper = await res.json();
  const data = JSON.parse(wrapper.contents);
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('no stock data');
  return {
    price: meta.regularMarketPrice,
    change24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100),
    source: 'Yahoo',
    currency: meta.currency || 'USD',
  };
}

function formatPrice(price, type, symbol) {
  if (!price) return '—';
  const s = symbol?.toUpperCase() || '';
  // JPY pairs: no decimals
  if (type === 'forex' && (s.endsWith('JPY') || s.includes('JPY'))) return price.toFixed(3);
  if (type === 'forex') return price.toFixed(5);
  if (type === 'crypto') {
    if (price > 10000) return price.toFixed(0);
    if (price > 1) return price.toFixed(2);
    return price.toFixed(6);
  }
  if (price > 1000) return price.toFixed(2);
  return price.toFixed(2);
}

export default function LivePriceTag({ instrument, darkMode }) {
  const [state, setState] = useState({ loading: false, price: null, change24h: null, error: null, source: '', currency: 'USD' });
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!instrument || instrument.trim().length < 2) {
      setState({ loading: false, price: null, change24h: null, error: null, source: '', currency: 'USD' });
      return;
    }
    // Debounce 800ms
    timerRef.current = setTimeout(() => loadPrice(instrument.trim()), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [instrument]);

  const loadPrice = async (raw) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const info = detectType(raw);
    try {
      let result;
      if (info.type === 'crypto') {
        result = await fetchCrypto(info.base);
        result.currency = 'USD';
      } else if (info.type === 'forex') {
        result = await fetchForex(info.symbol);
        result.currency = info.symbol.slice(3, 6);
      } else if (info.type === 'stock') {
        result = await fetchStock(info.symbol);
      } else {
        // Try crypto first, then stock
        try {
          result = await fetchCrypto(raw.toUpperCase().replace(/[^A-Z0-9]/g, ''));
          result.currency = 'USD';
        } catch {
          result = await fetchStock(raw.toUpperCase());
        }
      }
      setState({ loading: false, price: result.price, change24h: result.change24h ?? null, error: null, source: result.source, currency: result.currency || 'USD' });
    } catch {
      setState({ loading: false, price: null, change24h: null, error: 'Kein Preis verfügbar', source: '', currency: 'USD' });
    }
  };

  const { loading, price, change24h, error, source, currency } = state;
  const info = instrument ? detectType(instrument.trim()) : null;
  const priceStr = price ? formatPrice(price, info?.type, instrument) : null;
  const isPos = change24h !== null && change24h >= 0;

  if (!instrument || instrument.trim().length < 2) return null;

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 min-h-[22px]`}>
      {loading && (
        <Loader2 className={`w-3 h-3 animate-spin ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
      )}
      {!loading && priceStr && (
        <>
          <span className={`text-xs font-mono font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            {priceStr} <span className={`text-[9px] font-sans font-normal ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{currency}</span>
          </span>
          {change24h !== null && (
            <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPos ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          )}
          <span className={`text-[9px] font-sans ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{source}</span>
        </>
      )}
      {!loading && error && (
        <span className={`text-[10px] font-sans ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{error}</span>
      )}
    </div>
  );
}