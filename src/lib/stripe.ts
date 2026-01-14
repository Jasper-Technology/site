import { supabase } from './supabase';

// Pro plan price ID
export const PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_1SpKgqPJTsZmnx8zf2e7GWOn';

export async function redirectToCheckout(priceId: string): Promise<void> {
  console.log('Invoking create-checkout function with priceId:', priceId);

  // Get current session to verify auth
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session ? 'exists' : 'none', session?.access_token ? 'has token' : 'no token');

  if (!session) {
    throw new Error('You must be signed in to upgrade. Please sign in first.');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId }
  });

  console.log('Checkout response:', { data, error });

  if (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    console.error('No checkout URL in response:', data);
    throw new Error(data?.error || 'No checkout URL returned from server');
  }

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

export async function redirectToBillingPortal(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {});

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Failed to redirect to billing portal:', err);
    throw err;
  }
}
