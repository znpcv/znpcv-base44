import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const priceId = Deno.env.get('ZNPCV_PRICE_ID');
    if (!priceId) {
      return Response.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const appUrl = req.headers.get('origin') || 'https://znpcv.base44.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { user_email: user.email, user_id: user.id },
      success_url: `${appUrl}/Checklist?payment=success`,
      cancel_url: `${appUrl}/Checklist?payment=cancelled`,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});