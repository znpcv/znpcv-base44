import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Send, Instagram, Copy, Download, Check, MessageCircle, Sparkles, Award } from 'lucide-react';
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const shareCardRef = React.useRef(null);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const calculateScore = () => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + 
      (trade.w_candlestick ? 10 : 0) + (trade.w_psp_rejection ? 10 : 0) + 
      (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 5 : 0) + 
      (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + 
      (trade.d_candlestick ? 10 : 0) + (trade.d_psp_rejection ? 10 : 0) + 
      (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
      (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    
    const h = (trade.h4_ema_touch ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + 
      (trade.h4_psp_rejection ? 5 : 0) + (trade.h4_swing ? 5 : 0) + 
      (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
      (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

    return { weekly: w, daily: d, h4: h, entry: e, total: w + d + h + e };
  };

  const scores = calculateScore();

  const generateShareImage = async () => {
    setGenerating(true);
    try {
      const element = shareCardRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: darkMode ? '#000000' : '#ffffff',
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      const file = new File([blob], `ZNPCV-${trade.pair}-${format(new Date(), 'yyyy-MM-dd')}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `ZNPCV Trade Analysis: ${trade.pair}`,
          text: shareText,
        });
      } else {
        const url = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `ZNPCV-${trade.pair}-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = url;
        link.click();
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Screenshot konnte nicht erstellt werden. Bitte versuche es erneut.');
    } finally {
      setGenerating(false);
    }
  };

  const shareText = `🎯 ZNPCV TRADE ANALYSIS

━━━━━━━━━━━━━━━━━━━
📊 ${trade.pair} • ${trade.direction?.toUpperCase()}
━━━━━━━━━━━━━━━━━━━

📈 MULTI-TIMEFRAME CONFLUENCE:
   ├─ Weekly: ${scores.weekly}%
   ├─ Daily: ${scores.daily}%
   ├─ 4H: ${scores.h4}%
   └─ Entry: ${scores.entry}%

⚡ ZNPCV SCORE: ${scores.total}%
${scores.total >= 85 ? '✅ A+++ TRADE SETUP' : '⚠️ BELOW A+++ STANDARD'}

${trade.outcome ? `📊 OUTCOME: ${trade.outcome.toUpperCase()}` : '⏳ STATUS: PENDING'}
${trade.actual_pnl ? `💰 P&L: ${parseFloat(trade.actual_pnl) > 0 ? '+' : ''}$${trade.actual_pnl}` : ''}
${trade.entry_price ? `📍 Entry: ${trade.entry_price}` : ''}
${trade.stop_loss ? `🛡️ SL: ${trade.stop_loss}` : ''}
${trade.take_profit ? `🎯 TP: ${trade.take_profit}` : ''}

━━━━━━━━━━━━━━━━━━━
Discipline beats talent. Every day.

🌐 www.znpcv.com
#ZNPCV #TradingDiscipline #ForexTrading`;

  const shareTextInstagram = `🎯 ZNPCV TRADE

${trade.pair} • ${trade.direction?.toUpperCase()}
SCORE: ${scores.total}% ${scores.total >= 85 ? '✅' : '⚠️'}

${trade.outcome ? `${trade.outcome.toUpperCase()} ${trade.actual_pnl ? `• ${parseFloat(trade.actual_pnl) > 0 ? '+' : ''}$${trade.actual_pnl}` : ''}` : 'PENDING'}

Discipline beats talent.
www.znpcv.com

#ZNPCV #Trading #Forex #PriceAction #TechnicalAnalysis #DayTrading #SwingTrading #TradingStrategy #ForexTrader #A+++`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=https://www.znpcv.com&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToTikTok = async () => {
    await generateShareImage();
    alert('Bild wurde heruntergeladen! Öffne TikTok und lade das Bild hoch.');
  };

  const shareToInstagram = async () => {
    await generateShareImage();
    navigator.clipboard.writeText(shareTextInstagram);
    alert('Bild heruntergeladen & Caption kopiert! Öffne Instagram und poste dein Trade Setup.');
  };

  return (
    <div className={`w-full border-2 rounded-2xl overflow-hidden ${theme.border} ${theme.bgSecondary}`}>
      {/* Share Card Preview - Optimized for Social Media */}
      <div ref={shareCardRef} className={`relative p-8 sm:p-10 md:p-12 ${darkMode ? 'bg-gradient-to-br from-black via-zinc-950 to-black' : 'bg-gradient-to-br from-white via-zinc-50 to-white'}`} style={{ aspectRatio: '9/16', maxWidth: '600px', margin: '0 auto' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
        </div>

        {/* Header with Logo */}
        <div className="relative z-10 flex flex-col items-center text-center mb-6 sm:mb-8">
          <img 
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV" 
            className="h-14 sm:h-16 md:h-20 w-auto mb-3"
          />
          <div className={`text-xs sm:text-sm tracking-[0.25em] mb-3 ${theme.textSecondary} uppercase`}>Ultimate Trading Checklist</div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-teal-600 text-white text-xs rounded-full">
            <Award className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider">VERIFIED ANALYSIS</span>
          </div>
        </div>

        {/* Main Trade Info */}
        <div className="relative z-10 mb-6 sm:mb-8 text-center">
          <div className={`text-xs tracking-[0.25em] mb-2 ${theme.textSecondary} uppercase`}>
            {format(new Date(trade.created_date), 'dd.MM.yyyy')}
          </div>
          <div className={`text-5xl sm:text-6xl md:text-7xl tracking-wider font-bold mb-4 sm:mb-5 ${theme.text}`}>
            {trade.pair}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className={cn("px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold tracking-[0.2em] text-base sm:text-lg border-2",
              trade.direction === 'long' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-rose-600 border-rose-500 text-white')}>
              {trade.direction?.toUpperCase()}
            </div>
            {trade.outcome && (
              <div className={cn("px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold tracking-[0.2em] text-base sm:text-lg border-2",
                trade.outcome === 'win' ? 'bg-teal-600 border-teal-500 text-white' :
                trade.outcome === 'loss' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-zinc-600 border-zinc-500 text-white')}>
                {trade.outcome.toUpperCase()}
              </div>
            )}
            {trade.actual_pnl && (
              <div className={cn("px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg border-2",
                parseFloat(trade.actual_pnl) > 0 
                  ? 'bg-teal-600 border-teal-500 text-white' 
                  : 'bg-rose-600 border-rose-500 text-white')}>
                {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Timeframe Analysis */}
        <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 p-4 sm:p-5 md:p-6 rounded-2xl border-2 ${theme.border} ${darkMode ? 'bg-zinc-950/50' : 'bg-zinc-100/50'}`}>
          <div className="text-center">
            <div className={`text-[10px] sm:text-xs tracking-[0.15em] mb-1.5 sm:mb-2 ${theme.textSecondary} uppercase`}>Weekly</div>
            <div className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{scores.weekly}</div>
            <div className={`text-[10px] sm:text-xs ${theme.textSecondary}`}>/ 60</div>
          </div>
          <div className="text-center">
            <div className={`text-[10px] sm:text-xs tracking-[0.15em] mb-1.5 sm:mb-2 ${theme.textSecondary} uppercase`}>Daily</div>
            <div className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{scores.daily}</div>
            <div className={`text-[10px] sm:text-xs ${theme.textSecondary}`}>/ 60</div>
          </div>
          <div className="text-center">
            <div className={`text-[10px] sm:text-xs tracking-[0.15em] mb-1.5 sm:mb-2 ${theme.textSecondary} uppercase`}>4H</div>
            <div className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{scores.h4}</div>
            <div className={`text-[10px] sm:text-xs ${theme.textSecondary}`}>/ 35</div>
          </div>
          <div className="text-center">
            <div className={`text-[10px] sm:text-xs tracking-[0.15em] mb-1.5 sm:mb-2 ${theme.textSecondary} uppercase`}>Entry</div>
            <div className={`text-2xl sm:text-3xl font-bold ${theme.text}`}>{scores.entry}</div>
            <div className={`text-[10px] sm:text-xs ${theme.textSecondary}`}>/ 25</div>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className={cn("relative z-10 p-6 sm:p-8 md:p-10 rounded-2xl text-center border-4 shadow-2xl",
          scores.total >= 85 
            ? "bg-gradient-to-br from-teal-600 to-teal-700 border-teal-400" 
            : "bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700")}>
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className={`text-xs sm:text-sm tracking-[0.2em] uppercase ${scores.total >= 85 ? 'text-teal-100' : 'text-zinc-400'}`}>
              ZNPCV Score
            </div>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-3 sm:mb-4" style={{ letterSpacing: '0.05em' }}>
            {scores.total}%
          </div>
          <div className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-[0.15em] ${
            scores.total >= 85 
              ? 'bg-white text-teal-700' 
              : 'bg-zinc-950 text-zinc-300'
          }`}>
            {scores.total >= 85 ? '✓ A+++ SETUP' : '⚠ BELOW 85%'}
          </div>
        </div>

        {/* Trade Details */}
        {(trade.entry_price || trade.stop_loss || trade.take_profit) && (
          <div className={`relative z-10 mt-5 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 ${theme.border} ${darkMode ? 'bg-zinc-950/30' : 'bg-zinc-100/30'}`}>
            {trade.entry_price && (
              <div className="text-center">
                <div className={`text-[10px] sm:text-xs tracking-wider mb-1 ${theme.textSecondary} uppercase`}>Entry</div>
                <div className={`text-sm sm:text-base font-bold ${theme.text}`}>{trade.entry_price}</div>
              </div>
            )}
            {trade.stop_loss && (
              <div className="text-center">
                <div className={`text-[10px] sm:text-xs tracking-wider mb-1 ${theme.textSecondary} uppercase`}>Stop Loss</div>
                <div className={`text-sm sm:text-base font-bold text-rose-600`}>{trade.stop_loss}</div>
              </div>
            )}
            {trade.take_profit && (
              <div className="text-center">
                <div className={`text-[10px] sm:text-xs tracking-wider mb-1 ${theme.textSecondary} uppercase`}>Take Profit</div>
                <div className={`text-sm sm:text-base font-bold text-teal-600`}>{trade.take_profit}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer Branding */}
        <div className="relative z-10 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t-2 border-zinc-800/20 text-center">
          <div className={`text-xs sm:text-sm tracking-[0.2em] mb-2 ${theme.text} font-light italic`}>
            "Discipline beats talent. Every day."
          </div>
          <div className={`text-base sm:text-lg md:text-xl tracking-[0.3em] font-bold ${theme.text}`}>
            WWW.ZNPCV.COM
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <div className={`p-5 sm:p-6 md:p-7 border-t-2 ${theme.border} ${theme.bg}`}>
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className={`p-2.5 sm:p-3 rounded-xl ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
            <Share2 className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-black' : 'text-white'}`} />
          </div>
          <div className="flex-1">
            <div className={`font-bold tracking-widest text-base sm:text-lg ${theme.text}`}>TRADE TEILEN</div>
            <div className={`text-xs sm:text-sm ${theme.textSecondary} font-sans`}>Teile deine Analyse auf Social Media</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={shareToWhatsApp}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              darkMode ? 'border-zinc-800 hover:border-green-500 bg-zinc-900 hover:bg-green-500/10' : 'border-zinc-300 hover:border-green-600 bg-zinc-50 hover:bg-green-50')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              darkMode ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-green-100 group-hover:bg-green-200')}>
              <MessageCircle className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-green-400' : 'text-green-600')} />
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${theme.text}`}>WHATSAPP</span>
          </button>

          <button
            type="button"
            onClick={shareToTwitter}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              darkMode ? 'border-zinc-800 hover:border-blue-400 bg-zinc-900 hover:bg-blue-400/10' : 'border-zinc-300 hover:border-blue-500 bg-zinc-50 hover:bg-blue-50')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200')}>
              <Twitter className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-blue-400' : 'text-blue-500')} />
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${theme.text}`}>X / TWITTER</span>
          </button>

          <button
            type="button"
            onClick={shareToTelegram}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              darkMode ? 'border-zinc-800 hover:border-blue-500 bg-zinc-900 hover:bg-blue-500/10' : 'border-zinc-300 hover:border-blue-600 bg-zinc-50 hover:bg-blue-50')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200')}>
              <Send className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-blue-400' : 'text-blue-600')} />
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${theme.text}`}>TELEGRAM</span>
          </button>

          <button
            type="button"
            onClick={shareToInstagram}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              darkMode ? 'border-zinc-800 hover:border-pink-500 bg-zinc-900 hover:bg-pink-500/10' : 'border-zinc-300 hover:border-pink-600 bg-zinc-50 hover:bg-pink-50')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              darkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30' : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200')}>
              <Instagram className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-pink-400' : 'text-pink-600')} />
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${theme.text}`}>INSTAGRAM</span>
          </button>

          <button
            type="button"
            onClick={shareToTikTok}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              darkMode ? 'border-zinc-800 hover:border-white bg-zinc-900 hover:bg-white/10' : 'border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              darkMode ? 'bg-white/20 group-hover:bg-white/30' : 'bg-black/10 group-hover:bg-black/20')}>
              <svg className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-white' : 'text-black')} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${theme.text}`}>TIKTOK</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className={cn("p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-2.5 group hover:scale-105 active:scale-95",
              copied 
                ? "bg-teal-600 border-teal-600 text-white"
                : darkMode ? 'border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100')}>
            <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
              copied ? 'bg-white/20' : darkMode ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-zinc-200 group-hover:bg-zinc-300')}>
              {copied ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Copy className={cn("w-5 h-5 sm:w-6 sm:h-6", darkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600')} />}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${copied ? 'text-white' : theme.text}`}>
              {copied ? '✓ KOPIERT' : 'TEXT'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={generateShareImage}
          disabled={generating}
          className={cn("w-full p-4 sm:p-5 rounded-xl border-2 transition-all font-bold tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 hover:scale-[1.02] active:scale-95",
            generating 
              ? darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-200 border-zinc-300 text-zinc-500 cursor-not-allowed'
              : darkMode 
                ? 'bg-white border-white text-black hover:bg-zinc-100' 
                : 'bg-black border-black text-white hover:bg-zinc-900')}>
          {generating ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              <span>BILD WIRD ERSTELLT...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>SCREENSHOT HERUNTERLADEN</span>
            </>
          )}
        </button>

        <div className={`mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl ${darkMode ? 'bg-zinc-950/50' : 'bg-zinc-100/50'} border ${theme.border}`}>
          <div className={`text-xs sm:text-sm ${theme.textSecondary} font-sans leading-relaxed text-center`}>
            <span className="text-base sm:text-lg">💡</span> <strong className={theme.text}>Tipp:</strong> Für Instagram & TikTok - Screenshot herunterladen, dann als Story/Post hochladen
          </div>
        </div>
      </div>
    </div>
  );
}