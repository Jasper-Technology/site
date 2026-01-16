import { supabase } from './supabase';

// Pro plan price ID
export const PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_1SpKgqPJTsZmnx8zf2e7GWOn';

export async function redirectToCheckout(priceId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Authentication is not configured. Upgrade is not available in demo mode.');
  }

  // Get current session to verify auth
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be signed in to upgrade. Please sign in first.');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId }
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    throw new Error(data?.error || 'No checkout URL returned from server');
  }

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

export async function redirectToBillingPortal(): Promise<void> {
  if (!supabase) {
    throw new Error('Authentication is not configured. Billing portal is not available in demo mode.');
  }

  const { data, error } = await supabase.functions.invoke('create-portal-session', {});

  if (error) {
    throw error;
  }

  if (data?.url) {
    window.location.href = data.url;
  }
}
