import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function fetchExistingNames(baseName: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/strategies?select=name&name=ilike.*${encodeURIComponent(baseName)}*`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((row: any) => row.name);
}

function makeUniqueName(baseName: string, existing: string[]): string {
  if (!existing.some(name => name.toLowerCase() === baseName.toLowerCase())) return baseName;
  const modifiers = ['v2', 'Pro', 'Max', 'Elite', 'Plus', 'X', 'v3', 'v4'];
  for (const mod of modifiers) {
    const candidate = `${baseName} ${mod}`;
    if (!existing.some(name => name.toLowerCase() === candidate.toLowerCase())) {
      return candidate;
    }
  }
  let i = 2;
  while (true) {
    const candidate = `${baseName} v${i}`;
    if (!existing.some(name => name.toLowerCase() === candidate.toLowerCase())) {
      return candidate;
    }
    i++;
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

serve(async (req) => {
  console.log('generate-strategy-name function called');
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));

    // 1. Name uniqueness check for user-edited names
    if (body.checkName) {
      const existing = await fetchExistingNames(body.checkName);
      if (existing.some(name => name.toLowerCase() === body.checkName.toLowerCase())) {
        return new Response(JSON.stringify({ available: false }), { headers: { ...corsHeaders(), "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ available: true }), { headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    }

    // 2. Name generation after code is generated
    const { userPrompt, aiSummary, code } = body;
    if (!userPrompt || !aiSummary || !code) {
      console.log('Missing required fields:', { userPrompt, aiSummary, code });
      return new Response(JSON.stringify({ error: "Missing required fields: userPrompt, aiSummary, code" }), { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    }

    // Call OpenRouter DeepSeek R1T Chimera (free) API for name generation
    let aiName = 'AI Strategy';
    try {
      console.log('Calling OpenRouter DeepSeek for name generation...');
      const systemPrompt = `You are a creative trading strategy naming engine.\n\nYour job is to generate a unique, catchy, and descriptive name for a trading strategy, given the user's description, a summary, and the code.\n\nRules:\n- Only output the name, nothing else.\n- Do not include explanations, greetings, or extra text.\n- Use title case.\n- Avoid generic names like \"AI Strategy\".\n- Make the name specific to the main indicator, asset, or logic.\n- Do not use more than 4 words in the name.\n\nExamples:\n- RSI Momentum Breakout v1\n- Crypto Scalping Beast Pro\n- Mean Reversion Master\n- Golden Cross Hunter\n- Volatility Squeeze Pro\n- EMA Pullback Sniper\n- Trend Rider X\n- Adaptive Swing Pro\n`;
      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://trade-wizard-ai-studio.vercel.app',
          'X-Title': 'Trade Wizard AI Studio',
        },
        body: JSON.stringify({
          model: 'tngtech/deepseek-r1t-chimera:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `User Prompt:\n${userPrompt}\n\nAI Summary:\n${aiSummary}\n\nGenerated Code (first 20 lines):\n${code.split('\n').slice(0, 20).join('\n')}\n\nName:` }
          ],
          temperature: 0.8,
          max_tokens: 12,
        })
      });
      const openRouterData = await openRouterRes.json();
      console.log('OpenRouter response for naming:', JSON.stringify(openRouterData));
      aiName = openRouterData.choices && openRouterData.choices[0] && openRouterData.choices[0].message && openRouterData.choices[0].message.content.trim();
      if (!aiName) aiName = 'AI Strategy';
      // For debugging: return the raw OpenRouter output as well
      console.log('Returning name:', aiName);
      return new Response(JSON.stringify({ name: aiName, openRouterRaw: openRouterData }), { headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    } catch (err) {
      console.log('Error during OpenRouter call:', err);
      return new Response(JSON.stringify({ error: 'AI name generation failed', details: err.message }), { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    }

    // Ensure uniqueness globally
    const existing = await fetchExistingNames(aiName);
    const uniqueName = makeUniqueName(aiName, existing);
    return new Response(JSON.stringify({ name: uniqueName }), { headers: { ...corsHeaders(), "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
  }
}); 