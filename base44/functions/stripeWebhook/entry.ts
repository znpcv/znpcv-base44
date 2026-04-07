/**
 * stripeWebhook — Handles Stripe webhook events.
 * Verifies signature, processes payment events, grants/revokes entitlements.
 * IMPORTANT: Set STRIPE_WEBHOOK_SECRET in env.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20'
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    if (!webhookSecret || !sig) {
      // In production, missing secret = reject. Never bypass in silence.
      console.error('[stripeWebhook] Missing STRIPE_WEBHOOK_SECRET or stripe-signature header — request rejected');
      return new Response('Webhook configuration error', { status: 400 });
    }
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripeWebhook] Signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('[stripeWebhook] Event received:', event.type);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email || session.customer_email;
      const billingEventId = session.metadata?.billing_event_id;

      if (!userEmail) {
        console.error('[stripeWebhook] No user_email in session metadata');
        return Response.json({ received: true });
      }

      // Idempotency check — don't process same session twice
      if (billingEventId) {
        const existing = await base44.asServiceRole.entities.UserEntitlement.filter({
          source_reference: session.id,
          status: 'active'
        });
        if (existing.length > 0) {
          console.log('[stripeWebhook] Already processed session:', session.id);
          return Response.json({ received: true, already_processed: true });
        }
      }

      // Update BillingEvent
      if (billingEventId) {
        await base44.asServiceRole.entities.BillingEvent.update(billingEventId, {
          event_type: 'payment_succeeded',
          payment_status: 'succeeded',
          provider_payment_intent: session.payment_intent,
          provider_customer_id: session.customer,
          verified_at: new Date().toISOString()
        }).catch(e => console.error('[stripeWebhook] BillingEvent update failed:', e.message));
      } else {
        // Create new BillingEvent if webhook fires without prior checkout_created
        await base44.asServiceRole.entities.BillingEvent.create({
          user_email: userEmail,
          event_type: 'payment_succeeded',
          amount: session.amount_total,
          currency: session.currency,
          provider: 'stripe',
          provider_session_id: session.id,
          provider_payment_intent: session.payment_intent,
          provider_customer_id: session.customer,
          payment_status: 'succeeded',
          verified_at: new Date().toISOString(),
          idempotency_key: session.id
        }).catch(e => console.error('[stripeWebhook] BillingEvent create failed:', e.message));
      }

      // Grant entitlement
      const entitlement = await base44.asServiceRole.entities.UserEntitlement.create({
        user_email: userEmail,
        entitlement_key: 'full_app_access',
        status: 'active',
        granted_at: new Date().toISOString(),
        source: 'stripe_payment',
        source_reference: session.id,
        billing_event_id: billingEventId || null
      });

      // Update BillingEvent with entitlement ID
      if (billingEventId) {
        await base44.asServiceRole.entities.BillingEvent.update(billingEventId, {
          entitlement_id: entitlement.id
        }).catch(() => {});
      }

      // Audit log
      await base44.asServiceRole.entities.AccessAuditLog.create({
        user_email: userEmail,
        action: 'entitlement_granted',
        actor_type: 'stripe_webhook',
        actor_id: event.id,
        entitlement_id: entitlement.id,
        billing_event_id: billingEventId,
        reason: `Payment confirmed via Stripe session ${session.id}`,
        metadata: { session_id: session.id, amount: session.amount_total, currency: session.currency }
      }).catch(() => {});

      console.log('[stripeWebhook] Entitlement granted for:', userEmail);
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntent = charge.payment_intent;

      // Find related BillingEvent
      const billingEvents = await base44.asServiceRole.entities.BillingEvent.filter({
        provider_payment_intent: paymentIntent
      });

      for (const be of billingEvents) {
        // Find and revoke entitlement
        if (be.entitlement_id) {
          await base44.asServiceRole.entities.UserEntitlement.update(be.entitlement_id, {
            status: 'refunded',
            revoked_at: new Date().toISOString()
          }).catch(() => {});

          await base44.asServiceRole.entities.AccessAuditLog.create({
            user_email: be.user_email,
            action: 'refund_processed',
            actor_type: 'stripe_webhook',
            actor_id: event.id,
            entitlement_id: be.entitlement_id,
            reason: `Refund processed for payment intent ${paymentIntent}`
          }).catch(() => {});
        }

        await base44.asServiceRole.entities.BillingEvent.update(be.id, {
          payment_status: 'refunded',
          event_type: 'refunded'
        }).catch(() => {});
      }
    }

  } catch (err) {
    console.error('[stripeWebhook] Processing error:', err.message);
    // Return 200 to Stripe so it doesn't retry — log the error
    return Response.json({ received: true, error: err.message });
  }

  return Response.json({ received: true });
});