import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LineChart, ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import TradingViewWidget from '@/components/chart/TradingViewWidget';

const PRESET_SYMBOLS = [
  // Crypto
  { label: 'BTC/USDT', value: 'BINANCE:BTCUSDT', group: 'CRYPTO' },
  { label: 'ETH/USDT', value: 'BINANCE:ETHUSDT', group: 'CRYPTO' },
  { label: 'SOL/USDT', value: 'BINANCE:SOLUSDT', group: 'CRYPTO' },
  { label: 'BNB/USDT', value: 'BINANCE:BNBUSDT', group: 'CRYPTO' },
  { label: 'XRP/USDT', value: 'BINANCE:XRPUSDT', group: 'CRYPTO' },
  // Forex
  { label: 'EUR/USD',  value: 'FX:EURUSD',  group: 'FOREX' },
  { label: 'GBP/USD',  value: 'FX:GBPUSD',  group: 'FOREX' },
  { label: 'USD/JPY',  value: 'FX:USDJPY',  group: 'FOREX' },
  { label: 'EUR/JPY',  value: 'FX:EURJPY',  group: 'FOREX' },
  { label: 'GBP/JPY',  value: 'FX:GBPJPY',  group: 'FOREX' },
  { label: 'USD/CHF',  value: 'FX:USDCHF',  group: 'FOREX' },
  { label: 'AUD/USD',  value: 'FX:AUDUSD',  group: 'FOREX' },
  // Commodities
  { label: 'Gold',     value: 'OANDA:XAUUSD',  group: 'COMMODITIES' },
  { label: 'Silber',   value: 'OANDA:XAGUSD',  group: 'COMMODITIES' },
  { label: 'Öl (WTI)', value: 'NYMEX:CL1!',    group: 'COMMODITIES' },
  { label: 'Öl (Brent)',value: 'ICEEUR:B1!',   group: 'COMMODITIES' },
  { label: 'Nat. Gas', value: 'NYMEX:NG1!',    group: 'COMMODITIES' },
  // Indizes
  { label: 'S&P 500',  value: 'SP:SPX',         group: 'INDICES' },
  { label: 'NASDAQ',   value: 'NASDAQ:NDX',      group: 'INDICES' },
  { label: 'DAX',      value: 'XETR:DAX',        group: 'INDICES' },
  { label: 'DOW',      value: 'DJ:DJI',          group: 'INDICES' },
  { label: 'FTSE 100', value: 'SPREADEX:FTSE',   group: 'INDICES' },
  // Aktien
  { label: 'Apple',    value: 'NASDAQ:AAPL',     group: 'STOCKS' },
  { label: 'Tesla',    value: 'NASDAQ:TSLA',     group: 'STOCKS' },
  { label: 'NVIDIA',   value: 'NASDAQ:NVDA',     group: 'STOCKS' },
  { label: 'Amazon',   value: 'NASDAQ:AMZN',     group: 'STOCKS' },
  { label: 'Microsoft',value: 'NASDAQ:MSFT',     group: 'STOCKS' },
];

const TIMEFRAMES = [
  { label: '1m',  value: '1' },
  { label: '5m',  value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h',  value: '60' },
  { label: '4h',  value: '240' },
  { label: 'D',   value: 'D' },
  { label: 'W',   value: 'W' },
];

const DEFAULT_SYMBOL = 'BINANCE:BTCUSDT';
const DEFAULT_INTERVAL = '60';

export default function ChartsPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();

  const [activeSymbol, setActiveSymbol] = useState(DEFAULT_SYMBOL);
  const [activeInterval, setActiveInterval] = useState(DEFAULT_INTERVAL);
  const [customInput, setCustomInput] = useState('');
  const [showSymbolMenu, setShowSymbolMenu] = useState(false);

  const inputDebounce = useRef(null);

  const handleCustomSymbol = useCallback((e) => {
    const val = e.target.value.toUpperCase().trim();
    setCustomInput(val);
    clearTimeout(inputDebounce.current);
    inputDebounce.current = setTimeout(() => {
      if (val.length >= 2) setActiveSymbol(val);
    }, 500);
  }, []);

  const handlePresetSelect = (sym) => {
    setActiveSymbol(sym);
    setCustomInput('');
    setShowSymbolMenu(false);
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const activeLabel = PRESET_SYMBOLS.find(s => s.value === activeSymbol)?.label || activeSymbol;

  return (
    <div className={`flex flex-col h-screen ${theme.bg} ${theme.text}`} style={{ overflow: 'hidden' }}>

      {/* Header */}
      <header className={`flex-shrink-0 ${theme.bg} border-b ${theme.border} px-3 sm:px-4 md:px-6 py-2 sm:py-3`}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2">
              <LineChart className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
              <span className="text-sm sm:text-base tracking-widest font-bold">LIVE CHART</span>
            </div>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Controls Bar */}
      <div className={`flex-shrink-0 ${theme.bgSecondary} border-b ${theme.border} px-3 sm:px-4 md:px-6 py-2 sm:py-2.5`}>
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Symbol Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSymbolMenu(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold tracking-wider transition-all',
                darkMode
                  ? 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                  : 'bg-white border-zinc-300 text-black hover:border-zinc-400'
              )}
            >
              <span className="max-w-[90px] sm:max-w-none truncate">{activeLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSymbolMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSymbolMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSymbolMenu(false)} />
                <div className={cn(
                  'absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-2xl overflow-y-auto',
                  darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'
                )} style={{ minWidth: '160px', maxHeight: '70vh' }}>
                  {['CRYPTO','FOREX','COMMODITIES','INDICES','STOCKS'].map(group => {
                    const items = PRESET_SYMBOLS.filter(s => s.group === group);
                    return (
                      <div key={group}>
                        <div className={cn('px-3 py-1 text-[9px] tracking-widest font-bold border-b', darkMode ? 'text-zinc-500 border-zinc-800 bg-zinc-950' : 'text-zinc-400 border-zinc-100 bg-zinc-50')}>
                          {group}
                        </div>
                        {items.map(s => (
                          <button
                            key={s.value}
                            onClick={() => handlePresetSelect(s.value)}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs font-bold tracking-wider transition-colors',
                              activeSymbol === s.value
                                ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                                : darkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Custom Symbol Input */}
          <input
            type="text"
            value={customInput}
            onChange={handleCustomSymbol}
            placeholder="Eigenes Symbol…"
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono tracking-wider outline-none transition-all w-28 sm:w-36',
              darkMode
                ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-zinc-500'
                : 'bg-white border-zinc-300 text-black placeholder-zinc-400 focus:border-zinc-500'
            )}
          />

          {/* Divider */}
          <div className={`hidden sm:block w-px h-5 ${darkMode ? 'bg-zinc-700' : 'bg-zinc-300'}`} />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setActiveInterval(tf.value)}
                className={cn(
                  'px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold tracking-wider transition-all',
                  activeInterval === tf.value
                    ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                    : darkMode ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200'
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Active indicator */}
          <div className={`ml-auto hidden sm:flex items-center gap-1.5 text-[10px] tracking-widest ${theme.textMuted}`}>
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      {/* Chart — fills remaining viewport */}
      <div
        className="flex-1 relative"
        style={{ minHeight: 0 }}
        onClick={() => showSymbolMenu && setShowSymbolMenu(false)}
      >
        <TradingViewWidget
          symbol={activeSymbol}
          interval={activeInterval}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}