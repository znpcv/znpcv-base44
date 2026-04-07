/**
 * verifyPaymentSession — After Stripe redirects back, verify the session and
 * grant entitlement if payment succeeded but webhook hasn't fired yet.
 * Used as a fallback / immediate confirmation on the success page.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20'
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });
    }

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return Response.json({ error: 'session_id fehlt.' }, { status: 400 });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return Response.json({ success: false, status: session.payment_status });
    }

    // Verify email matches
    const sessionEmail = session.metadata?.user_email || session.customer_email;
    if (sessionEmail && sessionEmail.toLowerCase() !== user.email.toLowerCase()) {
      console.error('[verifyPaymentSession] Email mismatch:', sessionEmail, user.email);
      return Response.json({ error: 'Session gehört nicht zu diesem Nutzer.' }, { status: 403 });
    }

    // Check if entitlement already exists (webhook may have fired)
    const existing = await base44.asServiceRole.entities.UserEntitlement.filter({
      user_email: user.email,
      entitlement_key: 'full_app_access',
      status: 'active'
    });

    if (existing.length > 0) {
      return Response.json({ success: true, already_granted: true, entitlement: existing[0] });
    }

    // Webhook hasn't fired yet — grant entitlement now (idempotent via source_reference)
    const byRef = await base44.asServiceRole.entities.UserEntitlement.filter({
      source_reference: session_id
    });
    if (byRef.length > 0) {
      return Response.json({ success: true, already_granted: true, entitlement: byRef[0] });
    }

    const billingEventId = session.metadata?.billing_event_id;
    const entitlement = await base44.asServiceRole.entities.UserEntitlement.create({
      user_email: user.email,
      entitlement_key: 'full_app_access',
      status: 'active',
      granted_at: new Date().toISOString(),
      source: 'stripe_payment',
      source_reference: session_id,
      billing_event_id: billingEventId || null
    });

    // Update BillingEvent
    if (billingEventId) {
      await base44.asServiceRole.entities.BillingEvent.update(billingEventId, {
        event_type: 'payment_succeeded',
        payment_status: 'succeeded',
        provider_payment_intent: session.payment_intent,
        provider_customer_id: session.customer,
        verified_at: new Date().toISOString(),
        entitlement_id: entitlement.id
      }).catch(() => {});
    }

    await base44.asServiceRole.entities.AccessAuditLog.create({
      user_email: user.email,
      action: 'payment_confirmed',
      actor_type: 'system',
      actor_id: 'verifyPaymentSession',
      entitlement_id: entitlement.id,
      reason: `Entitlement granted via session verification (webhook fallback)`
    }).catch(() => {});

    return Response.json({ success: true, entitlement });

  } catch (error) {
    console.error('[verifyPaymentSession] error:', error.message);
    return Response.json({ error: 'Verifizierung fehlgeschlagen.' }, { status: 500 });
  }
});