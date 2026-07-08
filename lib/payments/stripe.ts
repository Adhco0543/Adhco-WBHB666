import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {});

/**
 * Create a payment intent for an invoice
 */
export async function createPaymentIntent(invoiceId: string, amount: number, currency: string = 'usd', metadata?: Record<string, any>) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      invoiceId,
      ...metadata,
    },
  });

  return paymentIntent;
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
}

/**
 * Confirm payment intent (server-side)
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
  return paymentIntent;
}

/**
 * Create a customer
 */
export async function createStripeCustomer(email: string, name: string, metadata?: Record<string, any>) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}

/**
 * Add payment method to customer
 */
export async function addPaymentMethod(customerId: string, paymentMethodId: string) {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  return paymentMethod;
}

/**
 * Create a charge
 */
export async function createCharge(customerId: string, amount: number, currency: string = 'usd', description?: string) {
  const charge = await stripe.charges.create({
    customer: customerId,
    amount: Math.round(amount * 100),
    currency,
    description,
  });

  return charge;
}

/**
 * List charges
 */
export async function getCharges(customerId: string) {
  const charges = await stripe.charges.list({
    customer: customerId,
  });

  return charges;
}

/**
 * Refund a charge
 */
export async function refundCharge(chargeId: string, amount?: number) {
  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });

  return refund;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string, webhookSecret: string) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (err) {
    throw err;
  }
}

/**
 * Handle payment.intent.succeeded webhook
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // This will be called from the webhook handler
  // Invoice ID is in paymentIntent.metadata.invoiceId
  return paymentIntent.metadata;
}

/**
 * Handle payment.intent.payment_failed webhook
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Log payment failure
  console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error);
  return paymentIntent;
}

/**
 * Create a subscription
 */
export async function createSubscription(customerId: string, priceId: string, metadata?: Record<string, any>) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
  });

  return subscription;
}

/**
 * Update subscription
 */
export async function updateSubscription(subscriptionId: string, updates: Stripe.SubscriptionUpdateParams) {
  const subscription = await stripe.subscriptions.update(subscriptionId, updates);
  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await (stripe.subscriptions as any).cancel(subscriptionId);
  return subscription;
}
