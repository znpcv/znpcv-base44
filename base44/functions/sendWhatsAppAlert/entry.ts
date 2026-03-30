import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, trade } = await req.json();
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappPhone = user.whatsapp_phone;

    if (!whatsappApiKey || !whatsappPhone) {
      return Response.json({ error: 'WhatsApp not configured' }, { status: 400 });
    }

    const text = `🎯 *ZNPCV Alert*\n\n${message}\n\n${trade ? `*Pair:* ${trade.pair}\n*Direction:* ${trade.direction}\n*Score:* ${trade.completion_percentage}%` : ''}`;

    // Using Twilio WhatsApp API
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`YOUR_ACCOUNT_SID:${whatsappApiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886',
        To: `whatsapp:${whatsappPhone}`,
        Body: text
      })
    });

    const result = await response.json();
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});