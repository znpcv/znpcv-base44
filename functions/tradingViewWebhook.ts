import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate webhook secret from query params
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const userId = url.searchParams.get('user');
    
    if (!secret || !userId) {
      return Response.json({ error: 'Missing secret or user' }, { status: 401 });
    }

    // Get user and verify secret
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const user = users[0];
    
    if (!user || user.webhook_secret !== secret) {
      return Response.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const data = await req.json();
    
    // Parse TradingView webhook format
    const tradeData = {
      pair: data.ticker || data.symbol,
      direction: data.strategy?.order_action === 'buy' ? 'long' : 'short',
      entry_price: data.strategy?.order_price?.toString(),
      stop_loss: data.strategy?.order_contracts?.toString(),
      take_profit: '',
      account_size: user.account_size || '10000',
      risk_percent: user.default_risk || '1',
      leverage: user.default_leverage || '100',
      status: 'executed',
      notes: `Auto-imported from TradingView\nStrategy: ${data.strategy?.order_id || 'N/A'}`,
      created_by: user.email,
      trade_date: new Date().toISOString().split('T')[0]
    };

    // Create checklist
    const checklist = await base44.asServiceRole.entities.TradeChecklist.create(tradeData);

    // Send alert if configured
    if (user.telegram_chat_id) {
      await base44.asServiceRole.functions.invoke('sendTelegramAlert', {
        message: `New trade signal received from TradingView!`,
        trade: checklist
      });
    }

    return Response.json({ success: true, trade: checklist });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});