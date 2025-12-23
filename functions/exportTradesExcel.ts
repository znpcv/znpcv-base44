import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allTrades = await base44.entities.TradeChecklist.list('-created_date', 100);
  const trades = allTrades.filter(t => !t.deleted);

  // Performance Summary
  const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending');
  const wins = executedTrades.filter(t => t.outcome === 'win').length;
  const losses = executedTrades.filter(t => t.outcome === 'loss').length;
  const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
  const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : '0.0';

  const avgWin = wins > 0 ? (executedTrades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / wins).toFixed(2) : '0.00';
  const avgLoss = losses > 0 ? Math.abs(executedTrades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / losses).toFixed(2) : '0.00';
  const profitFactor = losses > 0 && avgLoss > 0 ? ((wins * parseFloat(avgWin)) / (losses * parseFloat(avgLoss))).toFixed(2) : '-';

  const summaryRows = [
    ['═══════════════════════════════════════════════════════════════════════════════'],
    ['ZNPCV - PROFESSIONAL TRADING REPORT'],
    ['Ultimate Checklist Analysis'],
    ['═══════════════════════════════════════════════════════════════════════════════'],
    [''],
    ['REPORT INFORMATION'],
    ['Generated:', new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
    ['Trader:', user.full_name || user.email],
    ['Total Trades:', trades.length],
    [''],
    ['PERFORMANCE METRICS'],
    ['Total P&L:', `$${totalPnL.toFixed(2)}`],
    ['Win Rate:', `${winRate}%`],
    ['Wins / Losses:', `${wins} / ${losses}`],
    ['Average Win:', `$${avgWin}`],
    ['Average Loss:', `$${avgLoss}`],
    ['Profit Factor:', profitFactor],
    ['Executed Trades:', executedTrades.length],
    ['Pending Trades:', trades.length - executedTrades.length],
    ['Best Trade:', `$${Math.max(...executedTrades.map(t => parseFloat(t.actual_pnl) || 0), 0).toFixed(2)}`],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════'],
    ['']
  ];

  // CSV Header
  const headers = [
    'Date', 'Pair', 'Direction', 'Weekly', 'Daily', '4H', 'Entry',
    'Total Score', 'Entry', 'SL', 'TP', 'Risk%', 'Leverage', 'Outcome', 'P&L', 'Exit Date', 'R:R', 'Notes'
  ];

  // CSV Rows
  const rows = trades.map(trade => {
    const weeklyScore = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + 
      (trade.w_candlestick ? 10 : 0) + (trade.w_psp_rejection ? 10 : 0) + 
      (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
      (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    
    const dailyScore = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + 
      (trade.d_candlestick ? 10 : 0) + (trade.d_psp_rejection ? 10 : 0) + 
      (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
      (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    
    const h4Score = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + 
      (trade.h4_psp_rejection ? 5 : 0) + (trade.h4_swing ? 5 : 0) + 
      (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    
    const entryScore = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
      (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

    // Calculate R:R
    let rr = '';
    if (trade.entry_price && trade.stop_loss && trade.take_profit) {
      const entry = parseFloat(trade.entry_price);
      const sl = parseFloat(trade.stop_loss);
      const tp = parseFloat(trade.take_profit);
      const isLong = trade.direction === 'long';
      const slDist = isLong ? entry - sl : sl - entry;
      const tpDist = isLong ? tp - entry : entry - tp;
      rr = slDist > 0 ? (tpDist / slDist).toFixed(2) : '';
    }

    return [
      new Date(trade.created_date).toLocaleDateString('de-DE'),
      trade.pair || '',
      (trade.direction || '').toUpperCase(),
      weeklyScore,
      dailyScore,
      h4Score,
      entryScore,
      Math.round(trade.completion_percentage || 0),
      trade.entry_price || '',
      trade.stop_loss || '',
      trade.take_profit || '',
      trade.risk_percent || '',
      trade.leverage || '',
      (trade.outcome || 'pending').toUpperCase(),
      trade.actual_pnl || '',
      trade.exit_date || '',
      rr ? `1:${rr}` : '',
      (trade.notes || '').replace(/"/g, '""').substring(0, 100)
    ];
  });

  // Build CSV with professional formatting
  const csvContent = [
    ...summaryRows.map(row => row.join(',')),
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    '',
    '',
    '═══════════════════════════════════════════════════════════════════════════════',
    'ZNPCV - Ultimate Trading Checklist',
    '"Discipline beats talent. Every. Single. Day."',
    'www.znpcv.com',
    '© ' + new Date().getFullYear() + ' ZNPCV. All rights reserved.'
  ].join('\n');

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=ZNPCV_Trades_${new Date().toISOString().split('T')[0]}.csv`
    }
  });
});