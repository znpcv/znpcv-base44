import React, { useRef, useState } from 'react';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Score Calculation
  const calculateScore = () => {
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
    return w + d + h + e;
  };

  const score = calculateScore();
  const isLong = trade.direction === 'long';

  // Generate Canvas
  const generateCanvas = async () => {
    if (!cardRef.current) return null;
    return await html2canvas(cardRef.current, {
      backgroundColor: darkMode ? '#000000' : '#FFFFFF',
      scale: 2,
      width: 1080,
      height: 1080,
      logging: false,
      useCORS: true
    });
  };

  // Download
  const handleDownload = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        const link = document.createElement('a');
        link.download = `ZNPCV_${trade.pair}_${format(new Date(), 'ddMMyyyy')}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Copy
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
              setTimeout(() => setCopied(false), 2000);
            } catch (err) {
              console.error('Clipboard failed:', err);
            }
          }
          setIsLoading(false);
        }, 'image/png', 1.0);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Share
  const handleShare = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare) {
              try {
                if (navigator.canShare({ files: [file] })) {
                  await navigator.share({
                    files: [file],
                    title: `${trade.pair} ${isLong ? 'LONG' : 'SHORT'}`,
                    text: `ZNPCV Trade - Score: ${score}%`
                  });
                } else {
                  await navigator.share({
                    title: `${trade.pair} ${isLong ? 'LONG' : 'SHORT'}`,
                    text: `ZNPCV Trade - Score: ${score}%`,
                    url: window.location.href
                  });
                }
              } catch (err) {
                if (err.name !== 'AbortError') {
                  await handleCopy();
                }
              }
            } else {
              await handleCopy();
            }
          }
          setIsLoading(false);
        }, 'image/png', 1.0);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      await handleCopy();
    }
  };

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          className={cn(
            "flex-1 h-10 text-sm font-bold border-2 rounded-lg",
            darkMode 
              ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800" 
              : "bg-white text-black border-zinc-200 hover:bg-zinc-50"
          )}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>

        <Button
          onClick={handleShare}
          disabled={isLoading}
          className={cn(
            "flex-1 h-10 text-sm font-bold border-2 shadow-lg rounded-lg",
            darkMode 
              ? "bg-white text-black border-white hover:bg-zinc-100" 
              : "bg-black text-white border-black hover:bg-zinc-900"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-700" />
              Kopiert!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </>
          )}
        </Button>
      </div>

      {/* Share Card - Optimized for Social Media (1080x1080) */}
      <div
        ref={cardRef}
        className={cn(
          "w-full aspect-square flex flex-col justify-between p-12 rounded-2xl relative overflow-hidden",
          darkMode ? "bg-black" : "bg-white"
        )}
        style={{ maxWidth: '540px', margin: '0 auto' }}
      >
        {/* Logo */}
        <div>
          <img
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV"
            className="h-16 w-auto mb-8"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center text-center">
          {/* Pair */}
          <h2 className="text-6xl font-black tracking-tight mb-4">
            {trade.pair}
          </h2>

          {/* Direction Badge */}
          <div className="flex justify-center mb-8">
            <div className={cn(
              "px-8 py-3 rounded-xl font-black text-2xl tracking-wider shadow-xl",
              isLong 
                ? "bg-emerald-700 text-white" 
                : "bg-rose-600 text-white"
            )}>
              {isLong ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>

          {/* Score */}
          <div className="mb-8">
            <div className="text-8xl font-black tracking-tighter leading-none mb-2">
              {score}<span className="text-5xl">%</span>
            </div>
            <div className={cn(
              "text-sm tracking-[0.3em] font-bold",
              darkMode ? "text-zinc-500" : "text-zinc-600"
            )}>
              ANALYSE SCORE
            </div>
          </div>

          {/* Trade Levels */}
          {trade.entry_price && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-8">
                <span className={cn(
                  "text-sm font-bold tracking-wider",
                  darkMode ? "text-zinc-500" : "text-zinc-600"
                )}>
                  ENTRY
                </span>
                <span className="font-mono text-3xl font-black">
                  {trade.entry_price}
                </span>
              </div>

              {trade.stop_loss && (
                <div className="flex items-center justify-center gap-8">
                  <span className="text-sm font-bold tracking-wider text-rose-600">
                    SL
                  </span>
                  <span className="font-mono text-3xl font-black text-rose-600">
                    {trade.stop_loss}
                  </span>
                </div>
              )}

              {trade.take_profit && (
                <div className="flex items-center justify-center gap-8">
                  <span className="text-sm font-bold tracking-wider text-emerald-700">
                    TP
                  </span>
                  <span className="font-mono text-3xl font-black text-emerald-700">
                    {trade.take_profit}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between pt-8 border-t-2",
          darkMode ? "border-white/10" : "border-black/10"
        )}>
          <div className={cn(
            "text-xs font-bold tracking-[0.25em]",
            darkMode ? "text-zinc-600" : "text-zinc-500"
          )}>
            ZNPCV
          </div>
          <div className={cn(
            "text-xs font-mono font-bold",
            darkMode ? "text-zinc-600" : "text-zinc-500"
          )}>
            {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
          </div>
        </div>
      </div>
    </div>
  );
}