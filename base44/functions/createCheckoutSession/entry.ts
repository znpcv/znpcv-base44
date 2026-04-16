/**
 * createCheckoutSession
 *
 * Erwartet: { product: "checklist" | "strategy" }
 *
 * checklist → ZNPCV_PRICE_ID            ($99  Lifetime)
 * strategy  → ZNPCV_STRATEGY_PRICE_ID   ($2,499 einmalig)
 *
 * Rückgabe: { url, session_id }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const product = body.product === 'strategy' ? 'strategy' : 'checklist';

    let priceId;
    if (product === 'strategy') {
      priceId = Deno.env.get('ZNPCV_STRATEGY_PRICE_ID');
      if (!priceId) {
        return Response.json({ error: 'Strategie Preis nicht konfiguriert. Bitte ZNPCV_STRATEGY_PRICE_ID in den App-Secrets setzen.' }, { status: 500 });
      }
    } else {
      priceId = Deno.env.get('ZNPCV_PRICE_ID');
      if (!priceId) {
        return Response.json({ error: 'Checkliste Preis nicht konfiguriert.' }, { status: 500 });
      }
    }

    const appUrl = req.headers.get('origin') || 'https://znpcv.base44.app';
    const successPath = product === 'strategy' ? '/Checklist?payment=success' : '/FreeChecklist?payment=success';
    const cancelPath = product === 'strategy' ? '/Checklist' : '/FreeChecklist';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: {
        user_email: user.email,
        user_id: user.id,
        product,
      },
      success_url: `${appUrl}${successPath}`,
      cancel_url: `${appUrl}${cancelPath}`,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});