/**
 * LivePriceTag — Universeller Echtzeit-Preis-Badge
 *
 * Unterstützt: Crypto, Forex, Gold, Silber, Öl, Aktien, Indizes, Futures, ETFs
 * Kein Fake-Fallback! Fehlermeldung wenn keine Daten.
 *
 * APIs:
 * - Crypto → Binance (primär), CoinGecko (fallback)
 * - Forex  → Frankfurter.app (ECB), ExchangeRate-API (fallback)
 * - Alles andere (Gold, Öl, Aktien, Indizes, Futures) → Yahoo via CORS-Proxy
 */
import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';

const CRYPTO_BASES = new Set([
  'BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX','DOT','LINK',
  'LTC','BCH','MATIC','ATOM','UNI','OP','ARB','SUI','TON','TRX',
  'SHIB','PEPE','NEAR','FTM','ALGO','VET','SAND','MANA','AXS','CRV',
  'AAVE','COMP','MKR','SNX','YFI','EGLD','FLOW','HBAR','RUNE','FIL','ICP',
]);

const FOREX_QUOTES = new Set([
  'USD','EUR','GBP','JPY','CHF','AUD','NZD','CAD','SEK','NOK',
  'DKK','HKD','SGD','CNY','MXN','ZAR','TRY','PLN','CZK','HUF',
]);

const INDEX_MAP = {
  'DAX': '^GDAXI','GER40': '^GDAXI','GER30': '^GDAXI',
  'SP500': '^GSPC','SPX': '^GSPC','US500': '^GSPC',
  'NASDAQ': '^IXIC','NAS100': '^NDX','NDX': '^NDX',
  'DOW': '^DJI','US30': '^DJI','DJIA': '^DJI','DJ30': '^DJI',
  'FTSE': '^FTSE','FTSE100': '^FTSE','UK100': '^FTSE',
  'NIKKEI': '^N225','JP225': '^N225',
  'CAC': '^FCHI','CAC40': '^FCHI','FR40': '^FCHI',
  'VIX': '^VIX',
  'OIL': 'CL=F','USOIL': 'CL=F','WTI': 'CL=F','CRUDE': 'CL=F',
  'BRENT': 'BZ=F','BRENTOIL': 'BZ=F','UKOIL': 'BZ=F',
  'NATGAS': 'NG=F','GAS': 'NG=F',
  'GOLD': 'GC=F','XAUUSD': 'GC=F',
  'SILVER': 'SI=F','XAGUSD': 'SI=F',
  'COPPER': 'HG=F',
  'WHEAT': 'ZW=F','CORN': 'ZC=F',
};

function detect(raw) {
  const s = raw.toUpperCase().replace(/[\s/\\-]/g, '');
  const rawUp = raw.toUpperCase().trim();
  if (INDEX_MAP[rawUp]) return { type: 'yahoo', ticker: INDEX_MAP[rawUp] };
  if (INDEX_MAP[s]) return { type: 'yahoo', ticker: INDEX_MAP[s] };
  for (const base of CRYPTO_BASES) {
    if (s === base || s === `${base}USDT` || s === `${base}USD` || s === `${base}EUR`) {
      return { type: 'crypto', base };
    }
  }
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
    const from = s.slice(0, 3), to = s.slice(3);
    if (FOREX_QUOTES.has(from) && FOREX_QUOTES.has(to)) return { type: 'forex', from, to };
  }
  const parts = raw.split(/[/\\]/).map(x => x.trim().toUpperCase());
  if (parts.length === 2 && FOREX_QUOTES.has(parts[0]) && FOREX_QUOTES.has(parts[1])) {
    return { type: 'forex', from: parts[0], to: parts[1] };
  }
  return { type: 'yahoo', ticker: rawUp };
}

async function getPrice(raw) {
  const info = detect(raw);

  if (info.type === 'crypto') {
    const pairs = [`${info.base}USDT`, `${info.base}BUSD`, `${info.base}USD`];
    for (const sym of pairs) {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) continue;
        const d = await r.json();
        if (!d.lastPrice) continue;
        return { price: parseFloat(d.lastPrice), change: parseFloat(d.priceChangePercent), currency: 'USD', source: 'Binance', info };
      } catch { /* next */ }
    }
    // CoinGecko fallback
    const cgMap = { BTC:'bitcoin',ETH:'ethereum',SOL:'solana',BNB:'binancecoin',XRP:'ripple',ADA:'cardano',DOGE:'dogecoin',AVAX:'avalanche-2',LINK:'chainlink',DOT:'polkadot',MATIC:'matic-network',UNI:'uniswap' };
    const cgId = cgMap[info.base];
    if (cgId) {
      try {
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(7000) });
        if (r.ok) {
          const d = await r.json();
          if (d[cgId]?.usd) return { price: d[cgId].usd, change: d[cgId].usd_24h_change ?? null, currency: 'USD', source: 'CoinGecko', info };
        }
      } catch { /* fail */ }
    }
    throw new Error('Crypto unavailable');
  }

  if (info.type === 'forex') {
    try {
      const r = await fetch(`https://api.frankfurter.app/latest?from=${info.from}&to=${info.to}`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const d = await r.json();
        if (d.rates?.[info.to]) return { price: d.rates[info.to], change: null, currency: info.to, source: 'ECB', info };
      }
    } catch { /* fallback */ }
    const r2 = await fetch(`https://api.exchangerate-api.com/v4/latest/${info.from}`, { signal: AbortSignal.timeout(5000) });
    if (!r2.ok) throw new Error('Forex unavailable');
    const d2 = await r2.json();
    if (!d2.rates?.[info.to]) throw new Error('No rate');
    return { price: d2.rates[info.to], change: null, currency: info.to, source: 'ExchangeRate', info };
  }

  if (info.type === 'yahoo') {
    const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(info.ticker)}?interval=1d&range=1d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`;
    const r = await fetch(proxy, { signal: AbortSignal.timeout(9000) });
    if (!r.ok) throw new Error('Proxy error');
    const wrapper = await r.json();
    const data = JSON.parse(wrapper.contents);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) throw new Error('No data');
    const change = meta.previousClose
      ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
      : null;
    return { price: meta.regularMarketPrice, change, currency: meta.currency || 'USD', source: 'Yahoo', info };
  }

  throw new Error('Unknown');
}

function fmt(price, info) {
  if (price === null || price === undefined) return '—';
  if (info?.type === 'forex') {
    if (info.from?.includes('JPY') || info.to?.includes('JPY')) return price.toFixed(3);
    return price.toFixed(5);
  }
  if (info?.type === 'crypto') {
    if (price > 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price > 1) return price.toFixed(2);
    return price.toFixed(6);
  }
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

export default function LivePriceTag({ instrument, darkMode }) {
  const [state, setState] = useState({ loading: false, price: null, change: null, currency: '', source: '', error: null, info: null });
  const debounceRef = useRef(null);

  const load = async (raw) => {
    if (!raw || raw.trim().length < 2) {
      setState({ loading: false, price: null, change: null, currency: '', source: '', error: null, info: null });
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const result = await getPrice(raw.trim());
      setState({ loading: false, price: result.price, change: result.change, currency: result.currency, source: result.source, error: null, info: result.info });
    } catch {
      setState(s => ({ ...s, loading: false, price: null, error: 'Kein Preis verfügbar' }));
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(instrument), 700);
    return () => clearTimeout(debounceRef.current);
  }, [instrument]);

  const { loading, price, change, currency, source, error, info } = state;
  if (!instrument || instrument.trim().length < 2) return null;

  const isPos = change !== null && change >= 0;

  return (
    <div className="flex items-center gap-2 mt-1.5 min-h-[20px] flex-wrap">
      {loading && <Loader2 className={`w-3 h-3 animate-spin ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />}

      {!loading && price !== null && (
        <>
          <span className={`text-xs font-mono font-bold tabular-nums ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            {fmt(price, info)}
          </span>
          {currency && (
            <span className={`text-[9px] font-sans ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{currency}</span>
          )}
          {change !== null && (
            <span className={`flex items-center gap-0.5 text-[10px] font-bold font-sans ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {isPos ? '+' : ''}{change.toFixed(2)}%
            </span>
          )}
          <button
            onClick={() => load(instrument)}
            className={`p-0.5 rounded transition-colors ${darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-300 hover:text-zinc-500'}`}
            title="Preis aktualisieren"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
          <span className={`text-[9px] font-sans ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{source}</span>
        </>
      )}

      {!loading && error && (
        <span className={`text-[10px] font-sans italic ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{error}</span>
      )}
    </div>
  );
}