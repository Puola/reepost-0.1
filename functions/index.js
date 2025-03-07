const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({
  origin: ['https://reepost.co', 'http://localhost:5173'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

admin.initializeApp();

// Helper function to get plan ID from Stripe price
function getPlanFromPrice(price) {
  const planMap = {
    'price_starter': 'starter',
    'price_pro': 'pro',
    'price_influencer_plus': 'influencerPlus'
  };
  return planMap[price.id] || 'free';
}

// Create Stripe checkout session with CORS support
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      if (!req.headers.authorization) {
        return res.status(401).json({ error: { message: 'No authorization token provided' } });
      }

      const token = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) {
        return res.status(401).json({ error: { message: 'Invalid authorization token' } });
      }

      const { priceId } = req.body;
      const userId = decodedToken.uid;

      if (!priceId) {
        return res.status(400).json({ error: { message: 'Price ID is required' } });
      }

      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      let customer;
      if (userData.stripeCustomerId) {
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
        await admin.firestore().collection('users').doc(userId).update({
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
        success_url: `${functions.config().app.url}/settings?tab=subscription&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${functions.config().app.url}/settings?tab=subscription`,
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
          message: error.message || 'An internal error occurred',
          code: error.code || 'internal'
        }
      });
    }
  });
});

// Create Stripe customer portal session
exports.createPortalSession = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      if (!req.headers.authorization) {
        throw new functions.https.HttpsError('unauthenticated', 'No authorization token provided');
      }

      const token = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) {
        throw new functions.https.HttpsError('unauthenticated', 'Invalid authorization token');
      }

      const { customerId } = req.body;
      if (!customerId) {
        throw new functions.https.HttpsError('invalid-argument', 'Customer ID is required');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${functions.config().app.url}/settings?tab=subscription`,
      });

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ 
        error: {
          message: error.message || 'An internal error occurred',
          code: error.code || 'internal'
        }
      });
    }
  });
});

// Handle Stripe webhook events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    // Ensure raw body is available
    const rawBody = req.rawBody || req.body;
    if (!rawBody) {
      throw new Error('No raw body available');
    }

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', {
      error: err.message,
      signature: sig,
      hasBody: !!req.rawBody,
      hasRegularBody: !!req.body
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  if (event.type.startsWith('customer.subscription.')) {
    const subscription = event.data.object;
    const price = subscription.items.data[0].price;
    const plan = getPlanFromPrice(price);
    const firebaseUserId = subscription.metadata.firebaseUserId;

    if (!firebaseUserId) {
      console.error('No Firebase user ID in subscription metadata', {
        subscription: subscription.id,
        metadata: subscription.metadata
      });
      return res.status(400).send('No Firebase user ID found');
    }

    try {
      const userRef = admin.firestore().collection('users').doc(firebaseUserId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.error('User document not found', { userId: firebaseUserId });
        return res.status(404).send('User not found');
      }

      // Get current subscription plan data
      const currentPlanData = userDoc.data().subscriptionPlan;

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          console.log('Processing subscription update', {
            userId: firebaseUserId,
            subscriptionId: subscription.id,
            oldPlan: currentPlanData.currentPlan,
            newPlan: plan
          });

          // Update subscription plan data
          const newPlanData = {
            currentPlan: plan,
            startDate: admin.firestore.Timestamp.fromDate(new Date()),
            lastModified: admin.firestore.Timestamp.fromDate(new Date()),
            planHistory: [
              ...currentPlanData.planHistory,
              {
                plan: plan,
                startDate: admin.firestore.Timestamp.fromDate(new Date()),
                endDate: null
              }
            ]
          };

          // Close previous plan in history
          if (currentPlanData.planHistory.length > 0) {
            const lastPlan = currentPlanData.planHistory[currentPlanData.planHistory.length - 1];
            lastPlan.endDate = admin.firestore.Timestamp.fromDate(new Date());
          }

          const updateData = {
            subscription: {
              id: subscription.id,
              status: subscription.status,
              plan: plan,
              currentPeriodEnd: admin.firestore.Timestamp.fromDate(
                new Date(subscription.current_period_end * 1000)
              )
            },
            subscriptionPlan: newPlanData
          };

          await userRef.update(updateData);
          console.log('Successfully updated subscription', {
            userId: firebaseUserId,
            subscriptionId: subscription.id,
            plan: plan
          });
          break;

        case 'customer.subscription.deleted':
          console.log('Processing subscription deletion', {
            userId: firebaseUserId,
            subscriptionId: subscription.id
          });

          // Update plan history
          const updatedHistory = currentPlanData.planHistory;
          if (updatedHistory.length > 0) {
            updatedHistory[updatedHistory.length - 1].endDate = admin.firestore.Timestamp.fromDate(new Date());
          }

          const cancelData = {
            'subscription.status': 'canceled',
            subscriptionPlan: {
              currentPlan: 'free',
              startDate: admin.firestore.Timestamp.fromDate(new Date()),
              lastModified: admin.firestore.Timestamp.fromDate(new Date()),
              planHistory: [
                ...updatedHistory,
                {
                  plan: 'free',
                  startDate: admin.firestore.Timestamp.fromDate(new Date()),
                  endDate: null
                }
              ]
            }
          };

          await userRef.update(cancelData);
          console.log('Successfully cancelled subscription', {
            userId: firebaseUserId,
            subscriptionId: subscription.id
          });
          break;
      }
    } catch (error) {
      console.error('Error updating user subscription:', {
        error: error.message,
        userId: firebaseUserId,
        subscriptionId: subscription.id,
        event: event.type
      });
      return res.status(500).send('Error updating user subscription');
    }
  }

  // Handle payment method events
  if (event.type.startsWith('payment_method.')) {
    const paymentMethod = event.data.object;
    const customerId = paymentMethod.customer;

    try {
      const userSnapshot = await admin.firestore()
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
          await userDoc.ref.update({
            paymentMethods: admin.firestore.FieldValue.arrayUnion({
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
            paymentMethods: admin.firestore.FieldValue.arrayRemove(
              paymentMethod.id
            )
          });
          break;
      }
    } catch (error) {
      console.error('Error updating payment methods:', error);
      return res.status(500).send('Error updating payment methods');
    }
  }

  // Handle invoice events
  if (event.type.startsWith('invoice.')) {
    const invoice = event.data.object;
    const customerId = invoice.customer;

    try {
      const userSnapshot = await admin.firestore()
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
            invoices: admin.firestore.FieldValue.arrayUnion({
              id: invoice.id,
              number: invoice.number,
              amount: invoice.amount_paid,
              status: invoice.status,
              date: admin.firestore.Timestamp.fromDate(
                new Date(invoice.created * 1000)
              )
            })
          });
          break;

        case 'invoice.payment_failed':
          // Handle failed payment
          await userDoc.ref.update({
            'subscription.status': 'past_due'
          });
          break;
      }
    } catch (error) {
      console.error('Error updating invoices:', error);
      return res.status(500).send('Error updating invoices');
    }
  }

  res.json({ received: true });
});