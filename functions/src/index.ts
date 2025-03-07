import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { defineString } from 'firebase-functions/params';
import Stripe from 'stripe'; 
import cors from 'cors';

initializeApp();

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');
const appUrl = defineString('APP_URL');

const stripe = new Stripe(stripeSecretKey.value(), {
  apiVersion: '2023-10-16'
});

const db = getFirestore();

const corsHandler = cors({
  origin: ['https://reepost.co', 'http://localhost:5173'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helper function to get plan ID from Stripe price
function getPlanFromPrice(price: Stripe.Price): string {
  const planMap: Record<string, string> = {
    'price_starter': 'starter',
    'price_pro': 'pro',
    'price_influencer_plus': 'influencerPlus'
  };
  return planMap[price.id] || 'free';
}

// Create Stripe checkout session with CORS support
export const createCheckoutSession = onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Verify authentication
      if (!req.headers.authorization) {
        return res.status(401).json({ error: { message: 'No authorization token provided' } });
      }

      const token = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);
      if (!decodedToken) {
        return res.status(401).json({ error: { message: 'Invalid authorization token' } });
      }

      const { priceId } = req.body;
      const userId = decodedToken.uid;

      if (!priceId) {
        return res.status(400).json({ error: { message: 'Price ID is required' } });
      }

      // Get user data
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      let customer;
      if (userData?.stripeCustomerId) {
        // Use existing customer
        customer = await stripe.customers.retrieve(userData.stripeCustomerId);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: {
            firebaseUserId: userId
          }
        });

        // Save Stripe customer ID
        await userRef.update({
          stripeCustomerId: customer.id
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        success_url: `${appUrl.value()}/settings?tab=subscription&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl.value()}/settings?tab=subscription`,
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            firebaseUserId: userId
          }
        }
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ 
        error: {
          message: error instanceof Error ? error.message : 'An internal error occurred',
          code: error instanceof Error ? error.name : 'internal'
        }
      });
    }
  });
});

// Create Stripe customer portal session
export const createPortalSession = onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Verify authentication
      if (!req.headers.authorization) {
        throw new Error('No authorization token provided');
      }

      const token = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);
      if (!decodedToken) {
        throw new Error('Invalid authorization token');
      }

      const { customerId } = req.body;
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl.value()}/settings?tab=subscription`,
      });

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ 
        error: {
          message: error instanceof Error ? error.message : 'An internal error occurred',
          code: error instanceof Error ? error.name : 'internal'
        }
      });
    }
  });
});

// Handle Stripe webhook events
export const stripeWebhook = onRequest(async (req, res) => {
  let event: Stripe.Event;

  try {
    // Get the webhook secret from Firebase config
    const webhookSecret = stripeWebhookSecret.value();

    // Verify webhook signature
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Ensure raw body is available
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('No raw body available');
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  try {
    // Handle subscription events
    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription;
      const price = subscription.items.data[0].price;
      const plan = getPlanFromPrice(price);
      const customerId = subscription.customer;

      // Get user by Stripe customer ID
      const userSnapshot = await db.collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (userSnapshot.empty) {
        console.error('No user found for customer:', customerId);
        return res.status(400).send('No user found');
      }

      const userDoc = userSnapshot.docs[0];
      const userRef = userDoc.ref;
      const userData = userDoc.data();

      // Get current subscription plan data
      const currentPlanData = userData.subscriptionPlan || {
        currentPlan: 'free',
        planHistory: []
      };

      const now = Timestamp.fromDate(new Date());
      const periodEnd = Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          console.log('Processing subscription update', {
            userId: userDoc.id,
            subscriptionId: subscription.id,
            oldPlan: currentPlanData.currentPlan,
            newPlan: plan
          });

          // Update subscription plan data
          const newPlanData = {
            currentPlan: plan,
            startDate: now,
            lastModified: now,
            planHistory: [
              ...currentPlanData.planHistory,
              {
                plan: plan,
                startDate: now,
                endDate: null
              }
            ]
          };

          // Close previous plan in history
          if (currentPlanData.planHistory.length > 0) {
            const lastPlan = currentPlanData.planHistory[currentPlanData.planHistory.length - 1];
            lastPlan.endDate = now;
          }

          await userRef.update({
            subscription: {
              id: subscription.id,
              status: subscription.status,
              plan: plan,
              currentPeriodEnd: periodEnd
            },
            subscriptionPlan: newPlanData
          });

          console.log('Successfully updated subscription', {
            userId: userDoc.id,
            subscriptionId: subscription.id,
            plan: plan
          });
          break;

        case 'customer.subscription.deleted':
          console.log('Processing subscription deletion', {
            userId: userDoc.id,
            subscriptionId: subscription.id
          });

          // Update plan history
          const updatedHistory = currentPlanData.planHistory;
          if (updatedHistory.length > 0) {
            updatedHistory[updatedHistory.length - 1].endDate = now;
          }

          await userRef.update({
            'subscription.status': 'canceled',
            subscriptionPlan: {
              currentPlan: 'free',
              startDate: now,
              lastModified: now,
              planHistory: [
                ...updatedHistory,
                {
                  plan: 'free',
                  startDate: now,
                  endDate: null
                }
              ]
            }
          });

          console.log('Successfully cancelled subscription', {
            userId: userDoc.id,
            subscriptionId: subscription.id
          });
          break;
      }
    }

    // Handle payment method events
    if (event.type.startsWith('payment_method.')) {
      const paymentMethod = event.data.object as Stripe.PaymentMethod;
      const customerId = paymentMethod.customer as string;

      const userSnapshot = await getFirestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (userSnapshot.empty) {
        console.error('No user found for customer:', customerId);
        return res.status(400).send('No user found');
      }

      const userDoc = userSnapshot.docs[0];

      switch (event.type) {
        case 'payment_method.attached':
          if (!paymentMethod.card) break;
          
          await userDoc.ref.update({
            paymentMethods: FieldValue.arrayUnion({
              id: paymentMethod.id,
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year
            })
          });
          break;

        case 'payment_method.detached':
          await userDoc.ref.update({
            paymentMethods: FieldValue.arrayRemove(paymentMethod.id)
          });
          break;
      }
    }

    // Handle invoice events
    if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const userSnapshot = await getFirestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (userSnapshot.empty) {
        console.error('No user found for customer:', customerId);
        return res.status(400).send('No user found');
      }

      const userDoc = userSnapshot.docs[0];

      switch (event.type) {
        case 'invoice.paid':
          await userDoc.ref.update({
            invoices: FieldValue.arrayUnion({
              id: invoice.id,
              number: invoice.number,
              amount: invoice.amount_paid,
              status: invoice.status,
              date: Timestamp.fromDate(
                new Date(invoice.created * 1000)
              )
            })
          });
          break;

        case 'invoice.payment_failed':
          await userDoc.ref.update({
            'subscription.status': 'past_due'
          });
          break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});