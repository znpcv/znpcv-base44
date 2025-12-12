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
    
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + 
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
    alert('✅ Screenshot gespeichert! Öffne TikTok → Erstellen → Bild hochladen');
  };

  const shareToInstagram = async () => {
    await generateShareImage();
    navigator.clipboard.writeText(shareTextInstagram);
    alert('✅ Screenshot gespeichert & Caption kopiert!\n\nÖffne Instagram → Erstellen → Post → Bild hochladen → Caption einfügen');
  };

  return (
    <div className={`w-full overflow-hidden rounded-2xl ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      {/* Share Card Preview - Ultra Modern */}
      <div ref={shareCardRef} className={`relative ${darkMode ? 'bg-black' : 'bg-white'}`} style={{ width: '600px', maxWidth: '100%', margin: '0 auto' }}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 via-transparent to-rose-600/5" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{backgroundImage: `linear-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '20px 20px'}} />
        </div>

        <div className="relative z-10 p-8 sm:p-10">
          {/* Logo & Date */}
          <div className="flex items-start justify-between mb-8">
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV" 
              className="h-12 w-auto"
            />
            <div className="text-right">
              <div className={`text-[10px] tracking-widest mb-1 ${theme.textSecondary}`}>
                {format(new Date(trade.created_date), 'dd.MM.yyyy')}
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white text-[9px] rounded-full">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                <span className="font-bold">VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Pair & Direction */}
          <div className="mb-8">
            <div className={`text-5xl tracking-wider font-bold mb-4 ${theme.text}`}>
              {trade.pair}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("px-4 py-2 rounded-lg font-bold tracking-widest text-sm",
                trade.direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
                {trade.direction?.toUpperCase()}
              </div>
              {trade.outcome && (
                <div className={cn("px-4 py-2 rounded-lg font-bold tracking-widest text-sm",
                  trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                  trade.outcome === 'loss' ? 'bg-rose-600 text-white' : 'bg-zinc-600 text-white')}>
                  {trade.outcome.toUpperCase()}
                </div>
              )}
              {trade.actual_pnl && (
                <div className={cn("px-4 py-2 rounded-lg font-bold text-sm",
                  parseFloat(trade.actual_pnl) > 0 ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
                  {parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}
                </div>
              )}
            </div>
          </div>

          {/* Score Grid */}
          <div className={`grid grid-cols-4 gap-3 mb-8 p-5 rounded-xl ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
            <div className="text-center">
              <div className={`text-[9px] tracking-wider mb-1 ${theme.textSecondary}`}>W</div>
              <div className={`text-xl font-bold ${theme.text}`}>{scores.weekly}</div>
            </div>
            <div className="text-center">
              <div className={`text-[9px] tracking-wider mb-1 ${theme.textSecondary}`}>D</div>
              <div className={`text-xl font-bold ${theme.text}`}>{scores.daily}</div>
            </div>
            <div className="text-center">
              <div className={`text-[9px] tracking-wider mb-1 ${theme.textSecondary}`}>4H</div>
              <div className={`text-xl font-bold ${theme.text}`}>{scores.h4}</div>
            </div>
            <div className="text-center">
              <div className={`text-[9px] tracking-wider mb-1 ${theme.textSecondary}`}>E</div>
              <div className={`text-xl font-bold ${theme.text}`}>{scores.entry}</div>
            </div>
          </div>

          {/* Main Score */}
          <div className={cn("p-8 rounded-xl text-center border-2",
            scores.total >= 85 ? "bg-teal-600 border-teal-500" : "bg-zinc-900 border-zinc-800")}>
            <div className={`text-[10px] tracking-widest mb-2 ${scores.total >= 85 ? 'text-teal-100' : 'text-zinc-500'}`}>
              ZNPCV SCORE
            </div>
            <div className="text-6xl font-bold text-white mb-2">{scores.total}%</div>
            <div className={`text-xs font-bold ${scores.total >= 85 ? 'text-white' : 'text-zinc-400'}`}>
              {scores.total >= 85 ? '✓ A+++ TRADE' : '⚠ BELOW 85%'}
            </div>
          </div>

          {/* Trade Levels */}
          {(trade.entry_price || trade.stop_loss || trade.take_profit) && (
            <div className={`mt-6 grid grid-cols-3 gap-3 p-4 rounded-lg ${darkMode ? 'bg-zinc-950/50' : 'bg-zinc-100/50'}`}>
              {trade.entry_price && (
                <div className="text-center">
                  <div className={`text-[9px] tracking-wider mb-0.5 ${theme.textSecondary}`}>ENTRY</div>
                  <div className={`text-xs font-bold ${theme.text}`}>{trade.entry_price}</div>
                </div>
              )}
              {trade.stop_loss && (
                <div className="text-center">
                  <div className={`text-[9px] tracking-wider mb-0.5 ${theme.textSecondary}`}>SL</div>
                  <div className="text-xs font-bold text-rose-600">{trade.stop_loss}</div>
                </div>
              )}
              {trade.take_profit && (
                <div className="text-center">
                  <div className={`text-[9px] tracking-wider mb-0.5 ${theme.textSecondary}`}>TP</div>
                  <div className="text-xs font-bold text-teal-600">{trade.take_profit}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-800/20 text-center">
            <div className={`text-xs tracking-wider mb-1 ${theme.text} italic`}>
              "Discipline beats talent. Every day."
            </div>
            <div className={`text-sm tracking-widest font-bold ${theme.text}`}>
              WWW.ZNPCV.COM
            </div>
          </div>
        </div>
      </div>

      {/* Share Actions - Ultra Modern */}
      <div className={`p-4 sm:p-5 ${theme.bg}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
            <Share2 className={`w-4 h-4 ${darkMode ? 'text-black' : 'text-white'}`} />
          </div>
          <div>
            <div className={`font-bold tracking-widest text-sm ${theme.text}`}>SHARE</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Social Media</div>
          </div>
        </div>
        
        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button type="button" onClick={shareToWhatsApp}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-green-500' : 'border-zinc-300 bg-zinc-100 hover:border-green-600')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
              darkMode ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-green-100 group-hover:bg-green-200')}>
              <MessageCircle className={cn("w-5 h-5", darkMode ? 'text-green-400' : 'text-green-600')} />
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${theme.text}`}>WHATSAPP</div>
          </button>

          <button type="button" onClick={shareToTwitter}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-blue-400' : 'border-zinc-300 bg-zinc-100 hover:border-blue-500')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
              darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200')}>
              <Twitter className={cn("w-5 h-5", darkMode ? 'text-blue-400' : 'text-blue-500')} />
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${theme.text}`}>X</div>
          </button>

          <button type="button" onClick={shareToTelegram}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-blue-500' : 'border-zinc-300 bg-zinc-100 hover:border-blue-600')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
              darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200')}>
              <Send className={cn("w-5 h-5", darkMode ? 'text-blue-400' : 'text-blue-600')} />
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${theme.text}`}>TELEGRAM</div>
          </button>

          <button type="button" onClick={shareToInstagram}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-pink-500' : 'border-zinc-300 bg-zinc-100 hover:border-pink-600')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors bg-gradient-to-br",
              darkMode ? 'from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30' : 'from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200')}>
              <Instagram className={cn("w-5 h-5", darkMode ? 'text-pink-400' : 'text-pink-600')} />
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${theme.text}`}>INSTAGRAM</div>
          </button>

          <button type="button" onClick={shareToTikTok}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-white' : 'border-zinc-300 bg-zinc-100 hover:border-black')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
              darkMode ? 'bg-white/20 group-hover:bg-white/30' : 'bg-black/10 group-hover:bg-black/20')}>
              <svg className={cn("w-5 h-5", darkMode ? 'text-white' : 'text-black')} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${theme.text}`}>TIKTOK</div>
          </button>

          <button type="button" onClick={handleCopyText}
            className={cn("p-3 rounded-lg border transition-all group hover:-translate-y-0.5 active:translate-y-0",
              copied ? "bg-teal-600 border-teal-600" : darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-600' : 'border-zinc-300 bg-zinc-100 hover:border-zinc-400')}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
              copied ? 'bg-white/20' : darkMode ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-zinc-200 group-hover:bg-zinc-300')}>
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className={cn("w-5 h-5", darkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600')} />}
            </div>
            <div className={`text-[9px] font-bold tracking-wider ${copied ? 'text-white' : theme.text}`}>
              {copied ? 'KOPIERT' : 'TEXT'}
            </div>
          </button>
        </div>

        {/* Download Button */}
        <button type="button" onClick={generateShareImage} disabled={generating}
          className={cn("w-full p-4 rounded-lg transition-all font-bold tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]",
            generating 
              ? darkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-600' : 'bg-zinc-200 border border-zinc-300 text-zinc-500'
              : darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800')}>
          {generating ? (
            <><div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />ERSTELLE BILD...</>
          ) : (
            <><Download className="w-4 h-4" />SCREENSHOT</>
          )}
        </button>

        {/* Tip */}
        <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-zinc-200'} text-center`}>
          <div className={`text-[10px] ${theme.textSecondary} leading-relaxed`}>
            💡 <strong>Tipp:</strong> Screenshot-Button nutzen für Instagram/TikTok Posts
          </div>
        </div>
      </div>
    </div>
  );
}