import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Layers, Copy, Check, Calendar, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Score Calculation
  const calculateScores = () => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + 
              (trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
              (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + 
              (trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
              (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + 
              (trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
              (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);
    return { w, d, h, e, total: w + d + h + e };
  };

  const scores = calculateScores();
  const hasConfluence = trade.w_trend && trade.d_trend && trade.h4_trend &&
                        trade.w_trend === trade.d_trend && trade.d_trend === trade.h4_trend;

  // Risk Reward Calculation
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

  // Generate Canvas from Card
  const generateCanvas = async () => {
    if (!cardRef.current) return null;
    return await html2canvas(cardRef.current, {
      backgroundColor: darkMode ? '#000000' : '#FFFFFF',
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
  };

  // Download Handler
  const handleDownload = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        const link = document.createElement('a');
        link.download = `ZNPCV_Trade_${trade.pair}_${format(new Date(), 'dd-MM-yyyy')}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to Clipboard Handler
  const handleCopy = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            } catch (err) {
              console.error('Clipboard write failed:', err);
            }
          }
          setIsLoading(false);
        }, 'image/png', 1.0);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Copy error:', error);
      setIsLoading(false);
    }
  };

  // Native Share Handler
  const handleNativeShare = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });
            
            // Check if native share is supported
            if (navigator.share && navigator.canShare) {
              try {
                // Try sharing with file
                if (navigator.canShare({ files: [file] })) {
                  await navigator.share({
                    files: [file],
                    title: `ZNPCV Trade Analysis`,
                    text: `${trade.pair} ${trade.direction?.toUpperCase()} | Score: ${scores.total}%`
                  });
                } else {
                  // Fallback to URL share
                  await navigator.share({
                    title: `ZNPCV Trade Analysis`,
                    text: `${trade.pair} ${trade.direction?.toUpperCase()} | Score: ${scores.total}%`,
                    url: window.location.href
                  });
                }
              } catch (err) {
                if (err.name !== 'AbortError') {
                  setShowShareModal(true);
                }
              }
            } else {
              setShowShareModal(true);
            }
          }
          setIsLoading(false);
        }, 'image/png', 1.0);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Share error:', error);
      setIsLoading(false);
      setShowShareModal(true);
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className={cn(
          "text-sm sm:text-base font-black tracking-[0.25em] flex items-center gap-2.5",
          darkMode ? "text-white" : "text-black"
        )}>
          <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          TRADE TEILEN
        </h3>

        <div className="flex gap-2 sm:gap-2.5">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className={cn(
              "h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 transition-all rounded-lg",
              darkMode 
                ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800" 
                : "bg-white text-black border-zinc-200 hover:bg-zinc-50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline sm:ml-1.5">Download</span>
          </Button>

          <Button
            onClick={handleCopy}
            disabled={isLoading}
            className={cn(
              "h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 transition-all rounded-lg",
              darkMode 
                ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800" 
                : "bg-white text-black border-zinc-200 hover:bg-zinc-50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span className="hidden sm:inline sm:ml-1.5">Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline sm:ml-1.5">Kopieren</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleNativeShare}
            disabled={isLoading}
            className={cn(
              "h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold border-2 shadow-lg transition-all rounded-lg",
              darkMode 
                ? "bg-white text-black border-white hover:bg-zinc-100" 
                : "bg-black text-white border-black hover:bg-zinc-900",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:ml-1.5">Teilen</span>
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[90%] max-w-md p-6 rounded-2xl shadow-2xl",
                darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
              )}
            >
              <button
                onClick={() => setShowShareModal(false)}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-lg transition-colors",
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                )}
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl sm:text-2xl font-black mb-5 sm:mb-6">Trade teilen</h3>

              <div className="space-y-2.5 sm:space-y-3">
                <button
                  onClick={async () => {
                    await handleDownload();
                    setShowShareModal(false);
                  }}
                  className={cn(
                    "w-full p-3.5 sm:p-4 rounded-xl border-2 font-bold transition-all hover:scale-[1.02] text-sm",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                  Download als PNG
                </button>

                <button
                  onClick={async () => {
                    await handleCopy();
                  }}
                  className={cn(
                    "w-full p-3.5 sm:p-4 rounded-xl border-2 font-bold transition-all hover:scale-[1.02] text-sm",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-emerald-700" />
                      In Zwischenablage kopiert!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                      In Zwischenablage kopieren
                    </>
                  )}
                </button>
              </div>

              <p className={cn(
                "text-xs text-center mt-4 leading-relaxed",
                darkMode ? "text-zinc-500" : "text-zinc-600"
              )}>
                Füge das Bild direkt in Instagram, WhatsApp, Telegram oder andere Apps ein
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trade Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "w-full p-6 sm:p-8 md:p-10 rounded-2xl relative overflow-hidden",
          darkMode ? "bg-black" : "bg-white"
        )}
      >
        {/* Minimal Grid Pattern */}
        <div 
          className={cn("absolute inset-0", darkMode ? "opacity-[0.02]" : "opacity-[0.03]")}
          style={{
            backgroundImage: darkMode 
              ? 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)'
              : 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative space-y-6 sm:space-y-7 md:space-y-8">
          {/* Logo & Header */}
          <div className={cn(
            "pb-5 sm:pb-6 border-b-2",
            darkMode ? "border-white/10" : "border-black/10"
          )}>
            <img
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-10 sm:h-12 md:h-14 w-auto mb-5 sm:mb-6"
            />

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2">
                  {trade.pair}
                </h2>
                <div className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm",
                  darkMode ? "text-zinc-500" : "text-zinc-600"
                )}>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
                </div>
              </div>

              <div className={cn(
                "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-black shadow-lg",
                trade.direction === 'long' 
                  ? "bg-emerald-700 text-white" 
                  : "bg-rose-600 text-white"
              )}>
                {trade.direction === 'long' ? (
                  <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <TrendingDown className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
                <span className="text-sm sm:text-base tracking-wider">
                  {trade.direction === 'long' ? 'LONG' : 'SHORT'}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-center py-4 sm:py-5">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-2 sm:mb-3">
              {scores.total}<span className="text-4xl sm:text-5xl md:text-6xl">%</span>
            </div>
            <div className={cn(
              "text-xs sm:text-sm tracking-[0.25em] font-bold",
              darkMode ? "text-zinc-500" : "text-zinc-600"
            )}>
              ANALYSE SCORE
            </div>
          </div>

          {/* Trade Levels */}
          {trade.entry_price && (
            <div className="space-y-3 sm:space-y-3.5">
              <div className="flex items-center justify-between py-1.5">
                <span className={cn(
                  "text-xs sm:text-sm font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-500" : "text-zinc-600"
                )}>
                  ENTRY
                </span>
                <span className="font-mono text-lg sm:text-xl md:text-2xl font-black">
                  {trade.entry_price}
                </span>
              </div>

              {trade.stop_loss && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-rose-600">
                    STOP LOSS
                  </span>
                  <span className="font-mono text-lg sm:text-xl md:text-2xl font-black text-rose-600">
                    {trade.stop_loss}
                  </span>
                </div>
              )}

              {trade.take_profit && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-emerald-700">
                    TAKE PROFIT
                  </span>
                  <span className="font-mono text-lg sm:text-xl md:text-2xl font-black text-emerald-700">
                    {trade.take_profit}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Meta Info */}
          {(hasConfluence || rr) && (
            <div className="flex items-center justify-center gap-4 sm:gap-5 py-3">
              {hasConfluence && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span className="text-xs sm:text-sm font-black tracking-wider">CONFLUENCE</span>
                </div>
              )}
              {rr && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Target className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <span className="text-xs sm:text-sm font-black">R:R 1:{rr}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={cn(
            "flex items-center justify-between pt-5 sm:pt-6 border-t-2",
            darkMode ? "border-white/10" : "border-black/10"
          )}>
            <div className={cn(
              "text-[10px] sm:text-xs font-bold tracking-[0.2em]",
              darkMode ? "text-zinc-600" : "text-zinc-500"
            )}>
              ZNPCV TRADE JOURNAL
            </div>
            <div className={cn(
              "text-[10px] sm:text-xs font-mono font-bold",
              darkMode ? "text-zinc-600" : "text-zinc-500"
            )}>
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}