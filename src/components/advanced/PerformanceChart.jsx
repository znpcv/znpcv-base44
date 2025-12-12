import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function PerformanceChart({ checklists, darkMode }) {
  const chartData = useMemo(() => {
    const data = [];
    let cumulativePnL = 0;
    
    for (let i = 60; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTrades = checklists.filter(c => 
        c.exit_date === dateStr || format(new Date(c.created_date), 'yyyy-MM-dd') === dateStr
      );
      
      const dayPnL = dayTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
      cumulativePnL += dayPnL;
      
      data.push({
        date: format(date, 'dd.MM'),
        pnl: parseFloat(cumulativePnL.toFixed(2)),
        trades: dayTrades.length,
      });
    }
    
    return data;
  }, [checklists]);

  const theme = {
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const finalPnL = chartData[chartData.length - 1]?.pnl || 0;
  const isProfit = finalPnL >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 ${theme.border} rounded-2xl p-5 sm:p-6 md:p-7 ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'} mb-6 sm:mb-8`}
    >
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h3 className={`text-lg sm:text-xl tracking-widest flex items-center gap-2 ${theme.text}`}>
          {isProfit ? <TrendingUp className="w-5 h-5 text-teal-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
          CUMULATIVE P&L (60 DAYS)
        </h3>
        <div className={`px-4 py-1.5 rounded-full ${isProfit ? 'bg-teal-600' : 'bg-rose-600'} text-white text-sm font-bold`}>
          {isProfit ? '+' : ''}${finalPnL.toFixed(2)}
        </div>
      </div>
      
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isProfit ? "#0d9488" : "#e11d48"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isProfit ? "#0d9488" : "#e11d48"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#27272a" : "#e4e4e7"} />
            <XAxis dataKey="date" stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={10} />
            <YAxis stroke={darkMode ? "#52525b" : "#a1a1aa"} fontSize={10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#18181b' : '#ffffff', 
                border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`, 
                borderRadius: 12 
              }}
              formatter={(value) => [`$${value}`, 'P&L']}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke={isProfit ? "#0d9488" : "#e11d48"} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#pnlGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}