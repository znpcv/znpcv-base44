import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function TradeCard({ trade, onClick, index }) {
  const isReady = trade.status === 'ready_to_trade';
  const isCompleted = trade.status === 'completed';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg",
        "hover:border-zinc-700 transition-all duration-300",
        isReady && "border-[#4A5D23]/50 bg-[#4A5D23]/5"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Direction Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            trade.direction === 'long' ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            {trade.direction === 'long' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">{trade.pair}</span>
              {isReady && (
                <span className="px-2 py-0.5 bg-[#4A5D23] text-white text-xs rounded-full tracking-wider">
                  READY
                </span>
              )}
              {isCompleted && (
                <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full tracking-wider">
                  DONE
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-zinc-500">
                {format(new Date(trade.created_date), 'dd.MM.yyyy HH:mm')}
              </span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">
                {Math.round(trade.completion_percentage || 0)}% complete
              </span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${trade.completion_percentage || 0}%` }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className={cn(
            "h-full rounded-full",
            isReady ? "bg-[#4A5D23]" : "bg-zinc-600"
          )}
        />
      </div>
    </motion.div>
  );
}