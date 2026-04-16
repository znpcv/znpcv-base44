/**
 * LivePriceTag — Echtzeitpreise für Forex, Crypto, Aktien, Gold, Indizes
 * 
 * Strategie:
 * - Crypto  → Binance REST API (zuverlässig, kein Auth)
 * - Forex/Gold/Silber → frankfurter.app (ECB-Daten, kein Auth)
 * - Aktien/ETFs/Indizes → Yahoo Finance via allorigins proxy
 */
import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';

// ─── Bekannte Crypto-Bases ──────────────────────────────────────────────────
const CRYPTO_BASES = new Set([
  'BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX','DOT','LINK',
  'LTC','BCH','MATIC','ATOM','UNI','OP','ARB','SUI','TON','TRX',
  'SHIB','PEPE','NEAR','FTM','ALGO','VET','SAND','MANA','AXS','CRV',
  'AAVE','COMP','MKR','SNX','YFI','1INCH','ENJ','CHZ','HOT','IOTA',
  'EOS','XLM','DASH','ZEC','XMR','THETA','FIL','ICP','EGLD','FLOW',
  'HBAR','RUNE','KAVA','BAND','BAL','REN','LRC','SKL','CELO','ICX',
]);

// ─── Erkennung ───────────────────────────────────────────────────────────────
function detect(raw) {
  // Bereinigen: Sonderzeichen entfernen
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Crypto prüfen: wenn Base bekannt
  for (const base of CRYPTO_BASES) {
    if (s === base || s === `${base}USDT` || s === `${base}USD` || s === `${base}BTC`) {
      return { type: 'crypto', base };
    }
  }

  // Gold / Silber
  if (s === 'XAUUSD' || s === 'GOLD') return { type: 'gold', from: 'XAU', to: 'USD' };
  if (s === 'XAGUSD' || s === 'SILVER') return { type: 'gold', from: 'XAG', to: 'USD' };
  if (s === 'XAUEUR') return { type: 'gold', from: 'XAU', to: 'EUR' };

  // Forex: 6 Buchstaben, bekannte Quote-Währungen
  const FOREX_QUOTES = ['USD','EUR','GBP','JPY','CHF','AUD','NZD','CAD','SEK','NOK','DKK','HKD','SGD','CNY','MXN','ZAR','TRY','PLN','CZK','HUF'];
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
    const from = s.slice(0, 3);
    const to = s.slice(3, 6);
    if (FOREX_QUOTES.includes(from) && FOREX_QUOTES.includes(to)) {
      return { type: 'forex', from, to };
    }
  }

  // Alles andere → Aktie/ETF/Index (Yahoo Finance)
  return { type: 'stock', symbol: s.length > 0 ? s : raw.toUpperCase().trim() };
}

// ─── Fetch-Funktionen ─────────────────────────────────────────────────────────
async function getCrypto(base) {
  // Versuche USDT, dann USD
  const pairs = [`${base}USDT`, `${base}USD`, `${base}BUSD`];
  for (const sym of pairs) {
    try {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) continue;
      const d = await r.json();
      if (d.lastPrice) {
        return {
          price: parseFloat(d.lastPrice),
          change: parseFloat(d.priceChangePercent),
          currency: 'USD',
          source: 'Binance',
        };
      }
    } catch { /* try next */ }
  }
  throw new Error('Crypto not found');
}

async function getForex(from, to) {
  // frankfurter.app — ECB Kurse, täglich aktualisiert
  const r = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error('Forex API error');
  const d = await r.json();
  const price = d.rates?.[to];
  if (!price) throw new Error('No rate');
  return { price, change: null, currency: to, source: 'ECB' };
}

async function getGold(from, to) {
  // Für Gold/Silber: verwende open.er-api.com mit USD als Basis
  // XAU/XAG werden dort unterstützt
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${from}`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error();
    const d = await r.json();
    const price = d.rates?.[to];
    if (!price) throw new Error();
    return { price, change: null, currency: to, source: 'ER-API' };
  } catch {
    // Fallback: Frankfurter (unterstützt XAU nicht, aber Versuch)
    const r2 = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`, { signal: AbortSignal.timeout(5000) });
    if (!r2.ok) throw new Error('Gold API error');
    const d2 = await r2.json();
    const price2 = d2.rates?.[to];
    if (!price2) throw new Error('No gold rate');
    return { price: price2, change: null, currency: to, source: 'ECB' };
  }
}

async function getStock(symbol) {
  // Yahoo Finance via allorigins (CORS-Bypass)
  const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`;
  const r = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('Proxy error');
  const wrapper = await r.json();
  const data = JSON.parse(wrapper.contents);
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error('No stock data');
  const change = meta.previousClose
    ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
    : null;
  return {
    price: meta.regularMarketPrice,
    change,
    currency: meta.currency || 'USD',
    source: 'Yahoo',
  };
}

// ─── Formatierung ─────────────────────────────────────────────────────────────
function fmt(price, type, from) {
  if (price === null || price === undefined) return '—';
  // JPY-Paare: 3 Dezimalstellen
  if (type === 'forex' && from?.endsWith('JPY')) return price.toFixed(3);
  if (type === 'forex') return price.toFixed(5);
  if (type === 'gold') return price.toFixed(2);
  if (type === 'crypto') {
    if (price > 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (price > 1) return price.toFixed(2);
    return price.toFixed(6);
  }
  return price.toFixed(2);
}

// ─── Komponente ───────────────────────────────────────────────────────────────
export default function LivePriceTag({ instrument, darkMode }) {
  const [state, setState] = useState({ loading: false, price: null, change: null, currency: '', source: '', error: null, type: null, from: null });
  const debounceRef = useRef(null);

  const load = async (raw) => {
    if (!raw || raw.trim().length < 2) {
      setState({ loading: false, price: null, change: null, currency: '', source: '', error: null, type: null, from: null });
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    const info = detect(raw.trim());
    try {
      let result;
      if (info.type === 'crypto') result = await getCrypto(info.base);
      else if (info.type === 'gold') result = await getGold(info.from, info.to);
      else if (info.type === 'forex') result = await getForex(info.from, info.to);
      else result = await getStock(info.symbol);

      setState({ loading: false, price: result.price, change: result.change, currency: result.currency, source: result.source, error: null, type: info.type, from: info.from || null });
    } catch (e) {
      setState(s => ({ ...s, loading: false, price: null, error: 'Kein Preis verfügbar', type: info.type }));
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(instrument), 700);
    return () => clearTimeout(debounceRef.current);
  }, [instrument]);

  const { loading, price, change, currency, source, error, type, from } = state;

  if (!instrument || instrument.trim().length < 2) return null;

  const isPos = change !== null && change >= 0;
  const priceStr = price !== null ? fmt(price, type, from) : null;

  return (
    <div className="flex items-center gap-2 mt-1.5 min-h-[20px] flex-wrap">
      {loading && (
        <Loader2 className={`w-3 h-3 animate-spin ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
      )}

      {!loading && priceStr && (
        <>
          <span className={`text-xs font-mono font-bold tabular-nums ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            {priceStr}
          </span>
          {currency && (
            <span className={`text-[9px] font-sans ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {currency}
            </span>
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
          <span className={`text-[9px] font-sans ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {source}
          </span>
        </>
      )}

      {!loading && error && (
        <span className={`text-[10px] font-sans italic ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {error}
        </span>
      )}
    </div>
  );
}