import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trades = await base44.entities.TradeChecklist.list('-created_date', 100);

  // CSV Header
  const headers = [
    'Date', 'Pair', 'Direction', 'Weekly Score', 'Daily Score', '4H Score', 'Entry Score',
    'Total Score', 'Entry Price', 'Stop Loss', 'Take Profit', 'Risk %', 'Outcome', 'P&L', 'Exit Date', 'Notes'
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

    return [
      new Date(trade.created_date).toLocaleDateString('de-DE'),
      trade.pair || '',
      trade.direction || '',
      weeklyScore,
      dailyScore,
      h4Score,
      entryScore,
      Math.round(trade.completion_percentage || 0),
      trade.entry_price || '',
      trade.stop_loss || '',
      trade.take_profit || '',
      trade.risk_percent || '',
      trade.outcome || 'pending',
      trade.actual_pnl || '',
      trade.exit_date || '',
      (trade.notes || '').replace(/"/g, '""')
    ];
  });

  // Build CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=ZNPCV_Trades_${new Date().toISOString().split('T')[0]}.csv`
    }
  });
});