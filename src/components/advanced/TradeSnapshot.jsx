import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeSnapshot({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const score = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + 
    (trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
    (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0) +
    (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + 
    (trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
    (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0) +
    (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + 
    (trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0) +
    (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
    (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

  const isLong = trade.direction === 'long';

  const captureAndShare = async () => {
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: darkMode ? '#000000' : '#FFFFFF',
        scale: 3,
        width: 1080,
        height: 1080,
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `ZNPCV - ${trade.pair}`,
            text: `${isLong ? 'LONG' : 'SHORT'} Setup | Score: ${score}%`
          });
        } else {
          const link = document.createElement('a');
          link.download = `ZNPCV_${trade.pair}_${format(new Date(), 'ddMMyyyy')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
        setIsSharing(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Share error:', error);
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        onClick={captureAndShare}
        disabled={isSharing}
        className={cn(
          "w-full h-12 text-base font-black tracking-wider border-2 shadow-2xl rounded-xl mb-6 relative overflow-hidden group",
          darkMode 
            ? "bg-white text-black border-white hover:bg-zinc-100" 
            : "bg-black text-white border-black hover:bg-zinc-900"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Share2 className="w-5 h-5 mr-3" />
        <span className="relative z-10">
          {isSharing ? 'WIRD ERSTELLT...' : 'FÜR SOCIAL MEDIA TEILEN'}
        </span>
        <Sparkles className="w-5 h-5 ml-3" />
      </Button>

      {/* Preview Card - Perfect Square for Social Media */}
      <div
        ref={cardRef}
        className={cn(
          "w-full aspect-square rounded-3xl relative overflow-hidden shadow-2xl",
          darkMode ? "bg-black" : "bg-white"
        )}
        style={{ width: '540px', height: '540px', maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: darkMode 
              ? 'radial-gradient(circle, white 1px, transparent 1px)'
              : 'radial-gradient(circle, black 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-16">
          {/* Top - Logo */}
          <div>
            <img
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-20 w-auto opacity-90"
            />
          </div>

          {/* Center - Main Content */}
          <div className="text-center">
            {/* Pair Name */}
            <motion.h1 
              className="text-7xl font-black tracking-tight mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {trade.pair}
            </motion.h1>

            {/* Direction Badge */}
            <div className="flex justify-center mb-10">
              <div className={cn(
                "px-10 py-4 rounded-2xl font-black text-3xl tracking-wider shadow-2xl",
                isLong 
                  ? "bg-emerald-700 text-white" 
                  : "bg-rose-600 text-white"
              )}>
                {isLong ? '↑ LONG' : '↓ SHORT'}
              </div>
            </div>

            {/* Score - Massive */}
            <div className="mb-10">
              <div className="text-[120px] font-black tracking-tighter leading-none">
                {score}<span className="text-7xl opacity-70">%</span>
              </div>
              <div className={cn(
                "text-lg tracking-[0.4em] font-bold mt-4",
                darkMode ? "text-zinc-500" : "text-zinc-600"
              )}>
                SCORE
              </div>
            </div>

            {/* Trade Levels - Clean Layout */}
            {trade.entry_price && (
              <div className="space-y-5">
                <div className="flex items-center justify-between px-4">
                  <span className={cn(
                    "text-base font-bold tracking-[0.3em]",
                    darkMode ? "text-zinc-500" : "text-zinc-600"
                  )}>
                    ENTRY
                  </span>
                  <span className="font-mono text-4xl font-black">
                    {trade.entry_price}
                  </span>
                </div>

                {trade.stop_loss && (
                  <div className="flex items-center justify-between px-4">
                    <span className="text-base font-bold tracking-[0.3em] text-rose-600">
                      SL
                    </span>
                    <span className="font-mono text-4xl font-black text-rose-600">
                      {trade.stop_loss}
                    </span>
                  </div>
                )}

                {trade.take_profit && (
                  <div className="flex items-center justify-between px-4">
                    <span className="text-base font-bold tracking-[0.3em] text-emerald-700">
                      TP
                    </span>
                    <span className="font-mono text-4xl font-black text-emerald-700">
                      {trade.take_profit}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom - Footer */}
          <div className={cn(
            "flex items-center justify-between pt-8 border-t-2",
            darkMode ? "border-white/10" : "border-black/10"
          )}>
            <div className={cn(
              "text-sm font-bold tracking-[0.3em]",
              darkMode ? "text-zinc-600" : "text-zinc-500"
            )}>
              ZNPCV TRADE
            </div>
            <div className={cn(
              "text-sm font-mono font-bold",
              darkMode ? "text-zinc-600" : "text-zinc-500"
            )}>
              {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}