/**
 * createCheckoutSession — Creates a Stripe Checkout session for ZNPCV Full Access (99 EUR).
 * User must be authenticated. Returns { url } to redirect to Stripe.
 * Idempotency: if user already has active entitlement, returns { already_entitled: true }.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20'
});

// Price ID for ZNPCV Full Access — injected via env after product creation
const PRICE_ID = Deno.env.get('ZNPCV_PRICE_ID');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });
    }

    // Guard: already entitled?
    if (user.role !== 'admin') {
      const existing = await base44.asServiceRole.entities.UserEntitlement.filter({
        user_email: user.email,
        entitlement_key: 'full_app_access',
        status: 'active'
      });
      if (existing.length > 0) {
        return Response.json({ already_entitled: true, message: 'Du hast bereits vollen Zugriff.' });
      }
    }

    const body = await req.json().catch(() => ({}));
    const successUrl = body.success_url || `${body.origin || 'https://app.znpcv.com'}/PaymentSuccess`;
    const cancelUrl  = body.cancel_url  || `${body.origin || 'https://app.znpcv.com'}/Upgrade`;

    // Create a pending BillingEvent before session
    const billingEvent = await base44.asServiceRole.entities.BillingEvent.create({
      user_email: user.email,
      user_id: user.id,
      event_type: 'checkout_created',
      amount: 9900,
      currency: 'eur',
      provider: 'stripe',
      payment_status: 'pending'
    });

    // Audit log
    await base44.asServiceRole.entities.AccessAuditLog.create({
      user_email: user.email,
      action: 'checkout_initiated',
      actor_type: 'user',
      actor_id: user.email,
      billing_event_id: billingEvent.id,
      reason: 'User initiated checkout for full_app_access'
    }).catch(() => {});

    const sessionParams = {
      mode: 'payment',
      customer_email: user.email,
      line_items: PRICE_ID
        ? [{ price: PRICE_ID, quantity: 1 }]
        : [{
            price_data: {
              currency: 'eur',
              unit_amount: 9900,
              product_data: {
                name: 'ZNPCV Full Access',
                description: 'Einmaliger Vollzugriff auf alle ZNPCV Premium-Funktionen'
              }
            },
            quantity: 1
          }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        user_id: user.id,
        billing_event_id: billingEvent.id,
        entitlement_key: 'full_app_access'
      },
      payment_intent_data: {
        metadata: {
          user_email: user.email,
          entitlement_key: 'full_app_access'
        }
      }
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update BillingEvent with session ID
    await base44.asServiceRole.entities.BillingEvent.update(billingEvent.id, {
      provider_session_id: session.id,
      idempotency_key: session.id
    }).catch(() => {});

    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('[createCheckoutSession] error:', error.message);
    return Response.json({ error: 'Checkout konnte nicht erstellt werden.' }, { status: 500 });
  }
});