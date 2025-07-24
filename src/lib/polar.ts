import { supabase } from '@/integrations/supabase/client';

// Hardcoded production Supabase Edge Function URL for Polar checkout
export async function createPolarCheckout(product_id: string, email: string) {
  const url = 'https://kgfzbkwyepchbysaysky.functions.supabase.co/polar-checkout'; // Hardcoded production URL
  // Get the current user's access token
  const session = (await supabase.auth.getSession()).data.session;
  const accessToken = session?.access_token;
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ product_id, email }),
  });
  if (res.status === 404) {
    throw new Error('Checkout function not found. Please check your deployment and URL.');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create Polar checkout');
  }
  const data = await res.json();
  if (!data.url) throw new Error('No checkout URL returned from server.');
  return data.url;
} 