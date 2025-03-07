import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db, functions, app, auth } from './firebase';
import { useAuth } from './auth';
import { httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Base URL for Firebase Functions
const FUNCTIONS_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001/reepost-f6b39/us-central1'
  : 'https://us-central1-reepost-f6b39.cloudfunctions.net';

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  priceId: string;
}

// Connect to Functions emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Qy1IkC0oKrKKK9utHGbXh3c1flyjmXM6h2jGkF1YoraZOtbOtNyxHeGCHKGt9DyT1susAv2Ac5vBrFjisBDkqSh00mc8v2nHW');

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '1 réseau social',
      'Publication manuelle',
      'Analytics basiques',
      'Support communautaire'
    ],
    priceId: 'free'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 20,
    features: [
      '3 réseaux sociaux',
      'Publication automatique',
      'Analytics basiques',
      'Support par email'
    ],
    priceId: 'price_starter',
    stripeUrl: 'https://buy.stripe.com/test_00g5n49odeGV6lieUU'
  },
  pro: {
    id: 'pro', 
    name: 'Pro',
    price: 40,
    features: [
      '7 réseaux sociaux',
      'Publication automatique',
      'Analytics avancés',
      'Support prioritaire',
      'Personnalisation avancée'
    ],
    priceId: 'price_pro',
    stripeUrl: 'https://buy.stripe.com/test_00g8zgdEt42h6liaEF'
  },
  influencerPlus: {
    id: 'influencerPlus',
    name: 'Influencer Plus',
    price: 120,
    features: [
      'Réseaux sociaux illimités',
      'Publication automatique',
      'Analytics personnalisés',
      'Support 24/7',
      'API access',
      'Fonctionnalités exclusives',
      'Manager dédié'
    ],
    priceId: 'price_influencer_plus',
    stripeUrl: 'https://buy.stripe.com/test_eVaeXE1VL42h10YdQS'
  }
};

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  plan: keyof typeof PLANS;
  currentPeriodEnd: Date;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: Date;
}

export async function createCheckoutSession(priceId: string) {
  try {
    if (!priceId) {
      throw new Error('Plan non trouvé');
    }

    // Get current user's ID token
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Non authentifié');
    }

    // Make direct HTTP request with CORS headers
    const response = await fetch(`${FUNCTIONS_BASE_URL}/createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ priceId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur lors de la création de la session');
    }

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement';
    console.error('Error creating checkout session:', message);
    throw new Error(message);
  }
}

export async function createPortalSession(customerId: string) {
  try {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Get current user's ID token
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Non authentifié');
    }

    // Make direct HTTP request with CORS headers
    const response = await fetch(`${FUNCTIONS_BASE_URL}/createPortalSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ customerId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur lors de la création de la session du portail');
    }

    const data = await response.json();

    if (!data || typeof data !== 'object' || !('url' in data)) {
      throw new Error('Invalid response from portal session creation');
    }

    const { url } = data as { url: string };
    window.location.href = url;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred accessing the customer portal';
    console.error('Error creating portal session:', message);
    throw new Error(message);
  }
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.subscription) {
            setSubscription({
              ...userData.subscription,
              currentPeriodEnd: userData.subscription.currentPeriodEnd.toDate()
            });
          }
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  return { subscription, loading, error };
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().paymentMethods) {
        setPaymentMethods(doc.data().paymentMethods);
      } else {
        setPaymentMethods([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { paymentMethods, loading };
}

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().invoices) {
        setInvoices(doc.data().invoices.map((invoice: any) => ({
          ...invoice,
          date: invoice.date.toDate()
        })));
      } else {
        setInvoices([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { invoices, loading };
}