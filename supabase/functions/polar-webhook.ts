// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

const serve = globalThis.serve || function() {};
const createClient = globalThis.createClient || function() {};
const SUPABASE_URL = globalThis.Deno?.env?.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = globalThis.Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY");
const WEBHOOK_SECRET = globalThis.Deno?.env?.get("POLAR_WEBHOOK_SECRET");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  // Auth header check
  if (WEBHOOK_SECRET) {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth || auth !== `Bearer ${WEBHOOK_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401
      });
    }
  }
  const event = await req.json();
  // Log the event for debugging
  console.log("Polar webhook event:", JSON.stringify(event));
  if (event.type === "subscription.created" || event.type === "subscription.updated") {
    const sub = event.data;
    // Upsert into subscriptions table
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: sub.metadata?.user_id,
      tier: sub.product_name || sub.product_id,
      status: sub.status,
      provider: "polar",
      polar_subscription_id: sub.id,
      polar_customer_id: sub.customer_id,
      polar_checkout_id: sub.checkout_id,
      polar_product_id: sub.product_id,
      polar_price_id: sub.price_id,
      amount: sub.amount,
      billing_period: sub.billing_period,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      start_date: sub.start_date,
      end_date: sub.end_date,
      updated_at: new Date().toISOString()
    }, {
      onConflict: [
        "polar_subscription_id"
      ]
    });
    if (error) {
      console.error("Supabase upsert error:", error);
      return new Response("DB error", {
        status: 500
      });
    }
  }
  return new Response(JSON.stringify({
    received: true
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}); 