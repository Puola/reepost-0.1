"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createPortalSession = exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const cors = require("cors");
admin.initializeApp();
const stripe = new stripe_1.default(functions.config().stripe.secret_key, {
    apiVersion: '2023-10-16'
});
const corsHandler = cors({
    origin: ['https://reepost.co', 'http://localhost:5173'],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});
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
    return corsHandler(req, res, async () => {
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
            if (userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId) {
                // Use existing customer
                customer = await stripe.customers.retrieve(userData.stripeCustomerId);
            }
            else {
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
        }
        catch (error) {
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
exports.createPortalSession = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
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
        }
        catch (error) {
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
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b;
    let event;
    try {
        // Get the webhook secret from Firebase config
        const webhookSecret = functions.config().stripe.webhook_secret;
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
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    try {
        // Handle subscription events
        if (event.type.startsWith('customer.subscription.')) {
            const subscription = event.data.object;
            const price = subscription.items.data[0].price;
            const plan = getPlanFromPrice(price);
            const firebaseUserId = subscription.metadata.firebaseUserId;
            if (!firebaseUserId) {
                console.error('No Firebase user ID in subscription metadata', subscription);
                return res.status(400).send('No Firebase user ID found');
            }
            const userRef = admin.firestore().collection('users').doc(firebaseUserId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                console.error('User document not found', { userId: firebaseUserId });
                return res.status(404).send('User not found');
            }
            // Get current subscription plan data
            const currentPlanData = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.subscriptionPlan;
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    console.log('Processing subscription update', {
                        userId: firebaseUserId,
                        subscriptionId: subscription.id,
                        oldPlan: currentPlanData === null || currentPlanData === void 0 ? void 0 : currentPlanData.currentPlan,
                        newPlan: plan
                    });
                    // Update subscription plan data
                    const newPlanData = {
                        currentPlan: plan,
                        startDate: admin.firestore.Timestamp.fromDate(new Date()),
                        lastModified: admin.firestore.Timestamp.fromDate(new Date()),
                        planHistory: [
                            ...((currentPlanData === null || currentPlanData === void 0 ? void 0 : currentPlanData.planHistory) || []),
                            {
                                plan: plan,
                                startDate: admin.firestore.Timestamp.fromDate(new Date()),
                                endDate: null
                            }
                        ]
                    };
                    // Close previous plan in history
                    if (((_b = currentPlanData === null || currentPlanData === void 0 ? void 0 : currentPlanData.planHistory) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                        const lastPlan = currentPlanData.planHistory[currentPlanData.planHistory.length - 1];
                        lastPlan.endDate = admin.firestore.Timestamp.fromDate(new Date());
                    }
                    await userRef.update({
                        subscription: {
                            id: subscription.id,
                            status: subscription.status,
                            plan: plan,
                            currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000))
                        },
                        subscriptionPlan: newPlanData
                    });
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
                    const updatedHistory = (currentPlanData === null || currentPlanData === void 0 ? void 0 : currentPlanData.planHistory) || [];
                    if (updatedHistory.length > 0) {
                        updatedHistory[updatedHistory.length - 1].endDate = admin.firestore.Timestamp.fromDate(new Date());
                    }
                    await userRef.update({
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
                    });
                    console.log('Successfully cancelled subscription', {
                        userId: firebaseUserId,
                        subscriptionId: subscription.id
                    });
                    break;
            }
        }
        // Handle payment method events
        if (event.type.startsWith('payment_method.')) {
            const paymentMethod = event.data.object;
            const customerId = paymentMethod.customer;
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
                    if (!paymentMethod.card)
                        break;
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
                        paymentMethods: admin.firestore.FieldValue.arrayRemove(paymentMethod.id)
                    });
                    break;
            }
        }
        // Handle invoice events
        if (event.type.startsWith('invoice.')) {
            const invoice = event.data.object;
            const customerId = invoice.customer;
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
                            date: admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000))
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
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
    }
});
//# sourceMappingURL=index.js.map