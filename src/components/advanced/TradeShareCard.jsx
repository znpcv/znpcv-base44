import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Layers, Copy, Check, Calendar, X, Instagram, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateScores = () => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + (
    trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + (
    trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + (
    trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + (
    trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + (
    trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + (
    trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);
    return { w, d, h, e, total: w + d + h + e };
  };

  const scores = calculateScores();
  const hasConfluence = trade.w_trend && trade.d_trend && trade.h4_trend &&
  trade.w_trend === trade.d_trend && trade.d_trend === trade.h4_trend;

  const calculateRR = () => {
    if (!trade.entry_price || !trade.stop_loss || !trade.take_profit) return null;
    const entry = parseFloat(trade.entry_price);
    const sl = parseFloat(trade.stop_loss);
    const tp = parseFloat(trade.take_profit);
    const isLong = trade.direction === 'long';
    const slDist = isLong ? entry - sl : sl - entry;
    const tpDist = isLong ? tp - entry : entry - tp;
    return slDist > 0 ? (tpDist / slDist).toFixed(2) : null;
  };

  const rr = calculateRR();

  const handleDownload = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: darkMode ? '#000000' : '#ffffff', 
        scale: 3,
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `ZNPCV_${trade.pair}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: darkMode ? '#000000' : '#ffffff', 
        scale: 3,
        logging: false,
        useCORS: true
      });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });

        if (navigator.share) {
          try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `ZNPCV Trade - ${trade.pair}`,
                text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}% | ZNPCV Trade Journal`
              });
              setIsGenerating(false);
            } else {
              await navigator.share({
                title: `ZNPCV Trade - ${trade.pair}`,
                text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}% | ZNPCV Trade Journal`,
                url: window.location.href
              });
              setIsGenerating(false);
            }
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Share failed:', err);
              setShowShare(true);
            }
            setIsGenerating(false);
          }
        } else {
          setShowShare(true);
          setIsGenerating(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share generation failed:', err);
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: darkMode ? '#000000' : '#ffffff', 
        scale: 3,
        logging: false,
        useCORS: true
      });
      
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          console.error('Copy failed:', err);
        } finally {
          setIsGenerating(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy generation failed:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <h3 className={cn("text-sm sm:text-base lg:text-lg tracking-widest flex items-center gap-2 sm:gap-3 font-black", 
          darkMode ? "text-white" : "text-zinc-900")}>
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          TRADE TEILEN
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button 
            onClick={handleDownload}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className={cn("flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm font-bold border-2 transition-all hover:scale-[1.02]",
              darkMode 
                ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700" 
                : "bg-white text-black border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400",
              isGenerating && "opacity-50 cursor-not-allowed")}>
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          
          <Button 
            onClick={handleCopyImage}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className={cn("flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm font-bold border-2 transition-all hover:scale-[1.02]",
              darkMode 
                ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700" 
                : "bg-white text-black border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400",
              isGenerating && "opacity-50 cursor-not-allowed")}>
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 sm:mr-2" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </Button>
          
          <Button 
            onClick={handleShare}
            disabled={isGenerating}
            size="sm"
            className={cn("flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-5 lg:px-6 text-xs sm:text-sm font-bold border-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]",
              darkMode 
                ? "bg-white text-black border-white hover:bg-zinc-100" 
                : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800",
              isGenerating && "opacity-50 cursor-not-allowed")}>
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Social Media</span>
            <span className="sm:hidden">Teilen</span>
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
              onClick={() => setShowShare(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg p-6 sm:p-8 rounded-2xl border-2 shadow-2xl",
                darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
              <button
                onClick={() => setShowShare(false)}
                className={cn("absolute top-4 right-4 p-2 rounded-lg transition-all hover:scale-110",
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <Share2 className="w-6 h-6" />
                <h3 className={cn("text-xl sm:text-2xl font-black", darkMode ? "text-white" : "text-black")}>
                  Trade Teilen
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <button
                  onClick={async () => {
                    await handleDownload();
                    setShowShare(false);
                  }}
                  className={cn("p-5 sm:p-6 rounded-xl border-2 font-bold text-sm transition-all hover:scale-105 active:scale-95",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-750" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                  <Download className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-3" />
                  <div>Download</div>
                  <div className={cn("text-[10px] mt-1", darkMode ? "text-zinc-500" : "text-zinc-600")}>Als PNG</div>
                </button>
                
                <button
                  onClick={async () => {
                    await handleCopyImage();
                    setTimeout(() => setShowShare(false), 1500);
                  }}
                  className={cn("p-5 sm:p-6 rounded-xl border-2 font-bold text-sm transition-all hover:scale-105 active:scale-95",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-750" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                  {copied ? (
                    <Check className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-3 text-emerald-700" />
                  ) : (
                    <Copy className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-3" />
                  )}
                  <div>{copied ? 'Kopiert!' : 'Kopieren'}</div>
                  <div className={cn("text-[10px] mt-1", darkMode ? "text-zinc-500" : "text-zinc-600")}>
                    {copied ? 'Erfolg!' : 'In Zwischenablage'}
                  </div>
                </button>
              </div>
              
              <div className={cn("p-4 rounded-lg border text-center", 
                darkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-100 border-zinc-200")}>
                <p className={cn("text-xs sm:text-sm", darkMode ? "text-zinc-400" : "text-zinc-600")}>
                  💡 <strong>Tipp:</strong> Kopiere das Bild und füge es direkt in Instagram, WhatsApp, Telegram oder anderen Apps ein
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trade Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("w-full p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl overflow-hidden relative shadow-2xl",
          darkMode ? "bg-black text-white" : "bg-white text-black")}>
        
        {/* Subtle Grid Pattern */}
        <div className={cn("absolute inset-0", darkMode ? "opacity-[0.02]" : "opacity-[0.04]")} style={{
          backgroundImage: darkMode 
            ? 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)' 
            : 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Header with Logo */}
          <div className={cn("pb-5 sm:pb-6 border-b-2", 
            darkMode ? "border-white/10" : "border-black/10")}>
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto mb-5 sm:mb-6"
            />
            
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 sm:mb-3">
                  {trade.pair}
                </div>
                <div className={cn("flex items-center gap-2 text-xs sm:text-sm", 
                  darkMode ? "text-zinc-500" : "text-zinc-600")}>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
                </div>
              </div>
              
              <div className={cn("inline-flex self-start sm:self-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black tracking-wider shadow-lg",
                trade.direction === 'long' 
                  ? "bg-emerald-700 text-white" 
                  : "bg-rose-600 text-white")}>
                <div className="flex items-center gap-2">
                  {trade.direction === 'long' 
                    ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="text-sm sm:text-base">
                    {trade.direction === 'long' ? 'LONG' : 'SHORT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center py-4 sm:py-6">
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-3 sm:mb-4 tracking-tighter leading-none">
              {scores.total}<span className="text-4xl sm:text-5xl md:text-6xl">%</span>
            </div>
            <div className={cn("text-sm sm:text-base tracking-[0.3em] font-bold", 
              darkMode ? "text-zinc-500" : "text-zinc-600")}>
              ANALYSE SCORE
            </div>
          </div>

          {/* Trade Levels */}
          {trade.entry_price && (
            <div className="space-y-3 sm:space-y-4 py-4 sm:py-6">
              <div className="flex items-center justify-between py-2">
                <span className={cn("text-xs sm:text-sm tracking-widest font-bold", 
                  darkMode ? "text-zinc-500" : "text-zinc-600")}>
                  ENTRY
                </span>
                <span className="font-mono text-lg sm:text-xl md:text-2xl font-black">
                  {trade.entry_price}
                </span>
              </div>
              
              {trade.stop_loss && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs sm:text-sm tracking-widest font-bold text-rose-600">
                    STOP LOSS
                  </span>
                  <span className="font-mono text-lg sm:text-xl md:text-2xl font-black text-rose-600">
                    {trade.stop_loss}
                  </span>
                </div>
              )}
              
              {trade.take_profit && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs sm:text-sm tracking-widest font-bold text-emerald-700">
                    TAKE PROFIT
                  </span>
                  <span className="font-mono text-lg sm:text-xl md:text-2xl font-black text-emerald-700">
                    {trade.take_profit}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confluence & RR */}
          {(hasConfluence || rr) && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
              {hasConfluence && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Layers className={cn("w-4 h-4 sm:w-5 sm:h-5", 
                    darkMode ? "text-white" : "text-black")} />
                  <span className="text-xs sm:text-sm font-black tracking-wider">
                    CONFLUENCE
                  </span>
                </div>
              )}
              
              {rr && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Target className={cn("w-4 h-4 sm:w-5 sm:h-5", 
                    darkMode ? "text-white" : "text-black")} />
                  <span className="text-xs sm:text-sm font-black">
                    R:R 1:{rr}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={cn("flex items-center justify-between pt-5 sm:pt-6 border-t-2", 
            darkMode ? "border-white/10" : "border-black/10")}>
            <div className={cn("text-[10px] sm:text-xs tracking-[0.2em] font-bold", 
              darkMode ? "text-zinc-600" : "text-zinc-500")}>
              ZNPCV TRADE JOURNAL
            </div>
            <div className={cn("text-[10px] sm:text-xs font-mono font-bold", 
              darkMode ? "text-zinc-600" : "text-zinc-500")}>
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}