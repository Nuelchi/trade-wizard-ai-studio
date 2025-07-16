import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const systemPrompt = `You are TradeFlow AI — an expert trading assistant that helps users build winning trading strategies for crypto, forex, and stocks.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageBase64, messages = [] } = await req.json();
    const chatMessages = Array.isArray(messages) ? messages : [];
    if (!prompt && chatMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing prompt or messages' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Always ensure the system prompt is the first message
    let finalMessages = chatMessages.length > 0 ? [...chatMessages] : [];
    if (!finalMessages.length || finalMessages[0].role !== 'system') {
      finalMessages.unshift({ role: 'system', content: systemPrompt });
    }
    // If only a prompt is provided, add it as a user message
    if (prompt && (!messages || messages.length === 0)) {
      finalMessages.push({ role: 'user', content: prompt });
    }

    // Defensive: ensure finalMessages is always an array of {role, content}
    if (!Array.isArray(finalMessages) || !finalMessages.every(m => m && typeof m === 'object' && 'role' in m && 'content' in m)) {
      finalMessages = [{ role: 'user', content: prompt || 'Hello' }];
    }
    console.log('finalMessages type:', Array.isArray(finalMessages), finalMessages);

    // Use Groq endpoint and model for testing
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: finalMessages,
        temperature: 0.4,
        max_tokens: 1024,
      })
    });
    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      return new Response(JSON.stringify({ error: 'Groq API error', details: errorText }), { status: 500, headers: corsHeaders });
    }
    const aiResponse: any = await groqRes.json();
    const message = aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message ? aiResponse.choices[0].message : {};
    return new Response(JSON.stringify({
      summary: message.content || '',
      pineScript: message.pineScript || '',
      mql4: message.mql4 || '',
      mql5: message.mql5 || '',
      risk: message.risk || null,
      jsonLogic: message.jsonLogic || null,
    }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 