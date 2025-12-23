import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, trade } = await req.json();
    const webhookUrl = user.discord_webhook_url;

    if (!webhookUrl) {
      return Response.json({ error: 'Discord webhook not configured' }, { status: 400 });
    }

    const embed = {
      title: '🎯 ZNPCV Trading Alert',
      description: message,
      color: trade?.completion_percentage >= 85 ? 0x0d9488 : 0x6b7280,
      fields: trade ? [
        { name: 'Pair', value: trade.pair, inline: true },
        { name: 'Direction', value: trade.direction, inline: true },
        { name: 'Score', value: `${trade.completion_percentage}%`, inline: true }
      ] : [],
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});