// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

const serve = globalThis.serve || function() {};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { product_id, email } = await req.json();
    console.log("[Polar Checkout API] Received request:", {
      product_id,
      email
    });
    if (!product_id || !email) {
      return new Response(JSON.stringify({
        error: "Missing product_id or email"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Creating Polar checkout for product_id:", product_id, "email:", email);
    const polarRes = await fetch("https://api.polar.sh/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${globalThis.Deno?.env?.get("POLAR_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_id,
        customer_email: email
      })
    });
    const data = await polarRes.json();
    console.log("Polar API response status:", polarRes.status);
    console.log("Polar API response data:", JSON.stringify(data, null, 2));
    if (!polarRes.ok || !data.url) {
      return new Response(JSON.stringify({
        error: data.error || "Failed to create checkout",
        details: data,
        status: polarRes.status
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      url: data.url
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Polar checkout error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
}); 