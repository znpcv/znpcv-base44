import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileDown, Download, ArrowLeft, Home, Calendar, TrendingUp, 
  DollarSign, BarChart3, Filter, FileText, Table
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle, LanguageToggle } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [periodType, setPeriodType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [generating, setGenerating] = useState(false);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const { data: allTrades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.TradeChecklist.list(),
  });

  // Filter trades by selected period
  const filteredTrades = useMemo(() => {
    if (!selectedPeriod) return allTrades;
    
    const [year, monthOrQuarter] = selectedPeriod.split('-');
    let startDate, endDate;

    if (periodType === 'monthly') {
      const date = new Date(parseInt(year), parseInt(monthOrQuarter) - 1, 1);
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    } else if (periodType === 'quarterly') {
      const quarter = parseInt(monthOrQuarter);
      const date = new Date(parseInt(year), (quarter - 1) * 3, 1);
      startDate = startOfQuarter(date);
      endDate = endOfQuarter(date);
    } else {
      startDate = startOfYear(new Date(parseInt(year), 0, 1));
      endDate = endOfYear(new Date(parseInt(year), 0, 1));
    }

    return allTrades.filter(trade => {
      const tradeDate = new Date(trade.created_date);
      return isWithinInterval(tradeDate, { start: startDate, end: endDate });
    });
  }, [allTrades, selectedPeriod, periodType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const executed = filteredTrades.filter(t => t.outcome && t.outcome !== 'pending');
    const wins = executed.filter(t => t.outcome === 'win');
    const losses = executed.filter(t => t.outcome === 'loss');
    
    const totalPnL = executed.reduce((sum, t) => {
      const pnl = parseFloat(t.actual_pnl || 0);
      return sum + pnl;
    }, 0);

    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + Math.abs(parseFloat(t.actual_pnl || 0)), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(parseFloat(t.actual_pnl || 0)), 0) / losses.length : 0;

    return {
      total: filteredTrades.length,
      executed: executed.length,
      wins: wins.length,
      losses: losses.length,
      winRate: executed.length > 0 ? ((wins.length / executed.length) * 100).toFixed(1) : 0,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 0,
      avgScore: filteredTrades.length > 0 ? (filteredTrades.reduce((sum, t) => sum + (t.completion_percentage || 0), 0) / filteredTrades.length).toFixed(1) : 0,
    };
  }, [filteredTrades]);

  // Chart data - Performance over time
  const chartData = useMemo(() => {
    const grouped = {};
    
    filteredTrades.forEach(trade => {
      if (trade.outcome && trade.outcome !== 'pending') {
        const date = format(new Date(trade.exit_date || trade.created_date), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = { date, pnl: 0, trades: 0 };
        }
        grouped[date].pnl += parseFloat(trade.actual_pnl || 0);
        grouped[date].trades += 1;
      }
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredTrades]);

  // Cumulative P&L data
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return chartData.map(item => {
      cumulative += item.pnl;
      return { ...item, cumulative };
    });
  }, [chartData]);

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('ZNPCV TRADING REPORT', 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Period: ${selectedPeriod} (${periodType})`, 20, 30);
      doc.text(`Generated: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 20, 36);
      
      // Statistics
      doc.setFontSize(14);
      doc.text('PERFORMANCE OVERVIEW', 20, 50);
      
      doc.setFontSize(10);
      let y = 60;
      doc.text(`Total Analyses: ${stats.total}`, 20, y);
      doc.text(`Executed Trades: ${stats.executed}`, 20, y + 6);
      doc.text(`Win Rate: ${stats.winRate}%`, 20, y + 12);
      doc.text(`Total P&L: $${stats.totalPnL.toFixed(2)}`, 20, y + 18);
      doc.text(`Average Win: $${stats.avgWin.toFixed(2)}`, 20, y + 24);
      doc.text(`Average Loss: $${stats.avgLoss.toFixed(2)}`, 20, y + 30);
      doc.text(`Profit Factor: ${stats.profitFactor}`, 20, y + 36);
      doc.text(`Average Score: ${stats.avgScore}%`, 20, y + 42);

      // Trade List
      doc.setFontSize(14);
      doc.text('TRADE HISTORY', 20, 110);
      
      doc.setFontSize(9);
      y = 120;
      filteredTrades.slice(0, 15).forEach((trade, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const line = `${format(new Date(trade.created_date), 'dd.MM.yyyy')} | ${trade.pair} | ${trade.direction?.toUpperCase()} | ${trade.outcome || 'PENDING'} | ${trade.actual_pnl ? `$${trade.actual_pnl}` : '-'}`;
        doc.text(line, 20, y);
        y += 6;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`ZNPCV-Report-${selectedPeriod}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Pair', 'Direction', 'Score', 'Entry', 'SL', 'TP', 'Outcome', 'P&L'];
    const rows = filteredTrades.map(trade => [
      format(new Date(trade.created_date), 'yyyy-MM-dd'),
      trade.pair,
      trade.direction,
      trade.completion_percentage || 0,
      trade.entry_price || '',
      trade.stop_loss || '',
      trade.take_profit || '',
      trade.outcome || 'pending',
      trade.actual_pnl || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZNPCV-Data-${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const periods = useMemo(() => {
    if (periodType === 'monthly') {
      const months = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(format(date, 'yyyy-MM'));
      }
      return months;
    } else if (periodType === 'quarterly') {
      const quarters = [];
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (i * 3));
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        quarters.push(`${date.getFullYear()}-Q${quarter}`);
      }
      return [...new Set(quarters)];
    } else {
      const years = [];
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        years.push(`${currentYear - i}`);
      }
      return years;
    }
  }, [periodType]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <div className={`${theme.text} text-xl tracking-widest`}>LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(createPageUrl('Home'))} className={`p-2 ${theme.textSecondary} hover:${theme.text} transition-colors rounded-lg`}>
                <Home className="w-5 h-5" />
              </button>
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`p-2 ${theme.textSecondary} hover:${theme.text} transition-colors rounded-lg`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <button onClick={() => navigate(createPageUrl('Home'))}>
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-10 md:h-12 w-auto" />
            </button>

            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl tracking-widest mb-2">REPORTS</h1>
          <p className={`${theme.textSecondary} text-sm tracking-wider`}>Performance Analytics & Export</p>
        </div>

        {/* Filters */}
        <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className={`w-4 h-4 ${theme.textSecondary}`} />
            <span className={`text-xs tracking-widest ${theme.textSecondary}`}>FILTER</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className={`text-xs tracking-wider ${theme.textSecondary} block mb-1.5`}>PERIOD TYPE</label>
              <Select value={periodType} onValueChange={(v) => { setPeriodType(v); setSelectedPeriod(periods[0]); }}>
                <SelectTrigger className={cn("w-full", darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`text-xs tracking-wider ${theme.textSecondary} block mb-1.5`}>SELECT PERIOD</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className={cn("w-full", darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>{period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <Button onClick={generatePDF} disabled={generating || filteredTrades.length === 0}
            className={cn("h-12 tracking-widest font-bold", 
              darkMode ? "bg-white hover:bg-zinc-200 text-black" : "bg-black hover:bg-zinc-800 text-white")}>
            <FileText className="w-4 h-4 mr-2" />
            {generating ? 'GENERATING...' : 'EXPORT PDF REPORT'}
          </Button>

          <Button onClick={exportCSV} disabled={filteredTrades.length === 0} variant="outline"
            className={cn("h-12 tracking-widest font-bold border-2", 
              darkMode ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-300 hover:bg-zinc-100")}>
            <Table className="w-4 h-4 mr-2" />
            EXPORT CSV DATA
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="TOTAL" value={stats.total} icon={BarChart3} darkMode={darkMode} />
          <StatCard label="WIN RATE" value={`${stats.winRate}%`} icon={TrendingUp} darkMode={darkMode} color="teal" />
          <StatCard label="TOTAL P&L" value={`$${stats.totalPnL.toFixed(0)}`} icon={DollarSign} darkMode={darkMode} 
            color={stats.totalPnL >= 0 ? 'teal' : 'rose'} />
          <StatCard label="AVG SCORE" value={`${stats.avgScore}%`} icon={Calendar} darkMode={darkMode} />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Cumulative P&L */}
          <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
            <h3 className={`text-sm tracking-widest mb-4 ${theme.text}`}>CUMULATIVE P&L</h3>
            {cumulativeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3f3f46' : '#e4e4e7'} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: darkMode ? '#a1a1aa' : '#71717a' }} />
                  <YAxis tick={{ fontSize: 10, fill: darkMode ? '#a1a1aa' : '#71717a' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#18181b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#3f3f46' : '#e4e4e7'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="cumulative" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`${theme.textSecondary} text-center py-12 text-sm`}>No data available</div>
            )}
          </div>

          {/* Daily P&L */}
          <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
            <h3 className={`text-sm tracking-widest mb-4 ${theme.text}`}>DAILY P&L</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3f3f46' : '#e4e4e7'} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: darkMode ? '#a1a1aa' : '#71717a' }} />
                  <YAxis tick={{ fontSize: 10, fill: darkMode ? '#a1a1aa' : '#71717a' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#18181b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#3f3f46' : '#e4e4e7'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="pnl" fill={darkMode ? '#14b8a6' : '#0d9488'} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`${theme.textSecondary} text-center py-12 text-sm`}>No data available</div>
            )}
          </div>
        </div>

        {/* Trade List */}
        <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm tracking-widest ${theme.text}`}>TRADE LIST</h3>
            <span className={`text-xs ${theme.textSecondary}`}>{filteredTrades.length} trades</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  <th className={`text-left py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>DATE</th>
                  <th className={`text-left py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>PAIR</th>
                  <th className={`text-left py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>DIR</th>
                  <th className={`text-right py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>SCORE</th>
                  <th className={`text-left py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>OUTCOME</th>
                  <th className={`text-right py-2 px-3 text-[10px] tracking-wider ${theme.textSecondary}`}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.slice(0, 20).map((trade) => (
                  <tr key={trade.id} className={`border-b ${theme.border} hover:${theme.bgSecondary} transition-colors cursor-pointer`}
                    onClick={() => navigate(createPageUrl('TradeDetail') + '?id=' + trade.id)}>
                    <td className={`py-2.5 px-3 text-xs ${theme.text}`}>{format(new Date(trade.created_date), 'dd.MM.yy')}</td>
                    <td className={`py-2.5 px-3 text-xs font-bold ${theme.text}`}>{trade.pair}</td>
                    <td className={`py-2.5 px-3 text-xs`}>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold",
                        trade.direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white')}>
                        {trade.direction?.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-xs text-right ${theme.text}`}>{trade.completion_percentage || 0}%</td>
                    <td className={`py-2.5 px-3 text-xs`}>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold",
                        trade.outcome === 'win' ? 'bg-teal-600 text-white' :
                        trade.outcome === 'loss' ? 'bg-rose-600 text-white' :
                        'bg-zinc-600 text-white')}>
                        {trade.outcome?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className={cn("py-2.5 px-3 text-xs text-right font-bold",
                      parseFloat(trade.actual_pnl || 0) >= 0 ? 'text-teal-600' : 'text-rose-600')}>
                      {trade.actual_pnl ? `$${trade.actual_pnl}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, darkMode, color }) {
  const theme = {
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const colorClasses = {
    teal: 'text-teal-600',
    rose: 'text-rose-600',
  };

  return (
    <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${theme.textSecondary}`} />
      </div>
      <div className={cn("text-2xl font-bold tracking-tight mb-1", color ? colorClasses[color] : theme.text)}>
        {value}
      </div>
      <div className={`text-[10px] tracking-wider ${theme.textSecondary}`}>{label}</div>
    </div>
  );
}