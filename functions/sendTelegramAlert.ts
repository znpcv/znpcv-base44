import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, trade } = await req.json();
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = user.telegram_chat_id;

    if (!telegramToken || !telegramChatId) {
      return Response.json({ error: 'Telegram not configured' }, { status: 400 });
    }

    const text = `🎯 ZNPCV Alert\n\n${message}\n\n${trade ? `Pair: ${trade.pair}\nDirection: ${trade.direction}\nScore: ${trade.completion_percentage}%` : ''}`;

    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});