export async function createPolarCheckout(productId: string, userEmail: string) {
  const apiKey = import.meta.env.VITE_POLAR_API_KEY || process.env.VITE_POLAR_API_KEY;
  if (!apiKey) throw new Error('Polar API key not set');

  const res = await fetch('https://api.polar.sh/v1/checkouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      product_id: productId,
      customer_email: userEmail,
      // Optionally, add more metadata here
    }),
  });
  if (!res.ok) throw new Error('Failed to create Polar checkout');
  const data = await res.json();
  return data.url;
} 