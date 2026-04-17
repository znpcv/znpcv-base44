/**
 * stripeWebhook
 *
 * Liest metadata.product aus dem Stripe-Event:
 *   product = "checklist"  → setzt checklist_lifetime_access = true
 *   product = "strategy"   → setzt strategy_access = true
 *   (kein product / legacy) → setzt checklist_lifetime_access = true (Rückwärtskompatibilität)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: 'Signaturprüfung fehlgeschlagen.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.metadata?.user_email || session.customer_email;
    const product = session.metadata?.product; // "checklist" | "strategy" | undefined

    if (!userEmail) {
      return Response.json({ error: 'No user email in session' }, { status: 400 });
    }

    try {
      const base44 = createClientFromRequest(req);
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });

      if (users && users.length > 0) {
        const updateData = {
          stripe_customer_id: session.customer || '',
          stripe_session_id: session.id,
        };

        if (product === 'strategy') {
          // Nur Strategie-Zugang freischalten
          updateData.strategy_access = true;
        } else {
          // checklist oder legacy → Checkliste freischalten
          updateData.checklist_lifetime_access = true;
          updateData.stripe_subscription_active = true; // Legacy-Feld mitführen
        }

        await base44.asServiceRole.entities.User.update(users[0].id, updateData);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ received: true });
});