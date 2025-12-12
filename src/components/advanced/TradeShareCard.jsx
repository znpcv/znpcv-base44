import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Send, Instagram, Copy, Download, Check, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';

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
        scale: 2,
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      const file = new File([blob], `znpcv-trade-${trade.pair}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `ZNPCV Trade: ${trade.pair}`,
          text: `${trade.pair} • ${trade.direction?.toUpperCase()} • Score: ${scores.total}%\n\nZNPCV Trading Checklist`,
        });
      } else {
        const url = canvas.toDataURL();
        const link = document.createElement('a');
        link.download = `znpcv-trade-${trade.pair}.png`;
        link.href = url;
        link.click();
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const shareText = `🎯 ZNPCV Trade Analysis

${trade.pair} • ${trade.direction?.toUpperCase()}
✅ Score: ${scores.total}%

${trade.outcome ? `Result: ${trade.outcome.toUpperCase()}` : 'Status: PENDING'}
${trade.actual_pnl ? `P&L: $${trade.actual_pnl}` : ''}

Trade with discipline. Trade with ZNPCV.
www.znpcv.com`;

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
    const url = `https://t.me/share/url?url=www.znpcv.com&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`border-2 rounded-2xl overflow-hidden ${theme.border} ${theme.bgSecondary}`}>
      {/* Share Card Preview */}
      <div ref={shareCardRef} className={`p-8 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <img 
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV" 
            className="h-12 w-auto"
          />
          <div className={`text-xs tracking-widest ${theme.textSecondary}`}>
            {new Date(trade.created_date).toLocaleDateString('de-DE')}
          </div>
        </div>

        <div className="mb-6">
          <div className={`text-4xl tracking-wider font-bold mb-2 ${theme.text}`}>
            {trade.pair}
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("px-4 py-2 rounded-xl font-bold tracking-wider",
              trade.direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
              {trade.direction?.toUpperCase()}
            </div>
            {trade.outcome && (
              <div className={cn("px-4 py-2 rounded-xl font-bold tracking-wider",
                trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                trade.outcome === 'loss' ? 'bg-rose-600 text-white' : 'bg-zinc-600 text-white')}>
                {trade.outcome.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-4 gap-3 mb-6 p-4 rounded-xl ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
          <div>
            <div className={`text-xs ${theme.textSecondary}`}>WEEKLY</div>
            <div className={`text-lg font-bold ${theme.text}`}>{scores.weekly}%</div>
          </div>
          <div>
            <div className={`text-xs ${theme.textSecondary}`}>DAILY</div>
            <div className={`text-lg font-bold ${theme.text}`}>{scores.daily}%</div>
          </div>
          <div>
            <div className={`text-xs ${theme.textSecondary}`}>4H</div>
            <div className={`text-lg font-bold ${theme.text}`}>{scores.h4}%</div>
          </div>
          <div>
            <div className={`text-xs ${theme.textSecondary}`}>ENTRY</div>
            <div className={`text-lg font-bold ${theme.text}`}>{scores.entry}%</div>
          </div>
        </div>

        <div className={cn("p-6 rounded-xl text-center border-2",
          scores.total >= 85 ? "bg-teal-600 border-teal-500" : "bg-zinc-900 border-zinc-800")}>
          <div className={`text-xs tracking-widest mb-1 ${scores.total >= 85 ? 'text-teal-100' : 'text-zinc-400'}`}>
            ZNPCV SCORE
          </div>
          <div className="text-5xl font-bold text-white mb-2">{scores.total}%</div>
          <div className="text-white/80 text-sm">
            {scores.total >= 85 ? '✓ A+++ TRADE' : '⚠ UNDER 85%'}
          </div>
        </div>

        <div className={`mt-6 text-center text-xs ${theme.textSecondary}`}>
          www.znpcv.com
        </div>
      </div>

      {/* Share Actions */}
      <div className={`p-5 border-t-2 ${theme.border} ${theme.bg}`}>
        <div className="flex items-center gap-2 mb-4">
          <Share2 className={`w-5 h-5 ${theme.text}`} />
          <span className={`font-bold tracking-widest text-sm ${theme.text}`}>TRADE TEILEN</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <button
            type="button"
            onClick={shareToWhatsApp}
            className={cn("p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group",
              darkMode ? 'border-zinc-800 hover:border-green-500 bg-zinc-900 hover:bg-green-500/10' : 'border-zinc-300 hover:border-green-600 bg-zinc-50 hover:bg-green-50')}>
            <MessageCircle className={cn("w-5 h-5", darkMode ? 'text-green-400 group-hover:text-green-500' : 'text-green-600')} />
            <span className={`text-[10px] font-bold tracking-wider ${theme.text}`}>WHATSAPP</span>
          </button>

          <button
            type="button"
            onClick={shareToTwitter}
            className={cn("p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group",
              darkMode ? 'border-zinc-800 hover:border-blue-400 bg-zinc-900 hover:bg-blue-400/10' : 'border-zinc-300 hover:border-blue-500 bg-zinc-50 hover:bg-blue-50')}>
            <Twitter className={cn("w-5 h-5", darkMode ? 'text-blue-400 group-hover:text-blue-500' : 'text-blue-500')} />
            <span className={`text-[10px] font-bold tracking-wider ${theme.text}`}>TWITTER</span>
          </button>

          <button
            type="button"
            onClick={shareToTelegram}
            className={cn("p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group",
              darkMode ? 'border-zinc-800 hover:border-blue-500 bg-zinc-900 hover:bg-blue-500/10' : 'border-zinc-300 hover:border-blue-600 bg-zinc-50 hover:bg-blue-50')}>
            <Send className={cn("w-5 h-5", darkMode ? 'text-blue-400 group-hover:text-blue-500' : 'text-blue-600')} />
            <span className={`text-[10px] font-bold tracking-wider ${theme.text}`}>TELEGRAM</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className={cn("p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group",
              copied 
                ? "bg-teal-600 border-teal-600 text-white"
                : darkMode ? 'border-zinc-800 hover:border-zinc-600 bg-zinc-900' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50')}>
            {copied ? <Check className="w-5 h-5" /> : <Copy className={cn("w-5 h-5", darkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600')} />}
            <span className={`text-[10px] font-bold tracking-wider ${copied ? 'text-white' : theme.text}`}>
              {copied ? 'KOPIERT!' : 'TEXT'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={generateShareImage}
          disabled={generating}
          className={cn("w-full p-4 rounded-xl border-2 transition-all font-bold tracking-widest text-sm flex items-center justify-center gap-2",
            generating 
              ? darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-zinc-200 border-zinc-300 text-zinc-500'
              : darkMode 
                ? 'bg-white border-white text-black hover:bg-zinc-200' 
                : 'bg-black border-black text-white hover:bg-zinc-800')}>
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              <span>GENERIERE...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>INSTAGRAM STORY ERSTELLEN</span>
            </>
          )}
        </button>

        <div className={`mt-3 text-center text-[10px] ${theme.textSecondary} font-sans`}>
          Teile deinen Trade mit der Community
        </div>
      </div>
    </div>
  );
}