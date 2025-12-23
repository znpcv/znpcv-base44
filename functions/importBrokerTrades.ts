import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { broker, startDate, endDate } = await req.json();
    
    let trades = [];
    
    if (broker === 'mt4' || broker === 'mt5') {
      // MetaTrader API integration
      const mtApiKey = user.mt_api_key;
      const mtAccountId = user.mt_account_id;
      
      if (!mtApiKey || !mtAccountId) {
        return Response.json({ error: 'MetaTrader not configured' }, { status: 400 });
      }
      
      // Fetch from MetaTrader API
      const response = await fetch(`https://mt-api.example.com/history`, {
        headers: { 'Authorization': `Bearer ${mtApiKey}` },
        method: 'POST',
        body: JSON.stringify({ 
          account: mtAccountId,
          from: startDate,
          to: endDate
        })
      });
      
      const mtTrades = await response.json();
      
      trades = mtTrades.map(trade => ({
        pair: trade.symbol,
        direction: trade.type === 0 ? 'long' : 'short',
        entry_price: trade.open_price.toString(),
        stop_loss: trade.sl?.toString(),
        take_profit: trade.tp?.toString(),
        actual_pnl: trade.profit?.toString(),
        outcome: trade.profit > 0 ? 'win' : trade.profit < 0 ? 'loss' : 'breakeven',
        status: 'executed',
        trade_date: new Date(trade.open_time * 1000).toISOString().split('T')[0],
        exit_date: new Date(trade.close_time * 1000).toISOString().split('T')[0],
        notes: `Auto-imported from ${broker.toUpperCase()}\nTicket: ${trade.ticket}`
      }));
      
    } else if (broker === 'oanda') {
      // OANDA API integration
      const oandaToken = user.oanda_token;
      const oandaAccountId = user.oanda_account_id;
      
      if (!oandaToken || !oandaAccountId) {
        return Response.json({ error: 'OANDA not configured' }, { status: 400 });
      }
      
      const response = await fetch(
        `https://api-fxpractice.oanda.com/v3/accounts/${oandaAccountId}/transactions`,
        {
          headers: { 'Authorization': `Bearer ${oandaToken}` }
        }
      );
      
      const oandaTrades = await response.json();
      
      trades = oandaTrades.transactions
        .filter(t => t.type === 'ORDER_FILL')
        .map(trade => ({
          pair: trade.instrument,
          direction: trade.units > 0 ? 'long' : 'short',
          entry_price: trade.price,
          actual_pnl: trade.pl,
          outcome: parseFloat(trade.pl) > 0 ? 'win' : 'loss',
          status: 'executed',
          trade_date: trade.time.split('T')[0],
          notes: `Auto-imported from OANDA\nID: ${trade.id}`
        }));
    }

    // Bulk create checklists
    if (trades.length > 0) {
      await base44.entities.TradeChecklist.bulkCreate(trades);
    }

    return Response.json({ 
      success: true, 
      imported: trades.length,
      trades 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});