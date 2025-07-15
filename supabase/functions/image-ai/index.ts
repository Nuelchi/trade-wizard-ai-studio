import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageBase64 } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read system prompt from the project root (relative to Edge function root)
    let systemPrompt = '';
    try {
      systemPrompt = await Deno.readTextFile('../../../../prompts/systemPrompt.txt');
    } catch (e) {
      return new Response(JSON.stringify({ error: 'System prompt file not found', details: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: imageBase64
          ? [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          : prompt
      }
    ];

    // Use OpenRouter for testing
    const model = imageBase64 ? 'openai/gpt-4-vision-preview' : 'openai/gpt-4-1106-preview';
    const openaiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://yourdomain.com', // Replace with your domain for production
        'X-Title': 'TradeFlow AI Test',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    /*
    // --- To revert to OpenAI, uncomment this block and comment out the OpenRouter block above ---
    // const model = imageBase64 ? 'gpt-4-vision-preview' : 'gpt-4-1106-preview';
    // const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${openAIApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model,
    //     messages,
    //     temperature: 0.4,
    //     max_tokens: 1024,
    //   }),
    // });
    */

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(JSON.stringify({ error: 'OpenRouter API error', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openaiRes.json();
    const output = data.choices?.[0]?.message?.content || '';
    // Try to extract the JSON block at the end
    let jsonBlock = null;
    const jsonMatch = output.match(/```json[\s\S]*?({[\s\S]*?})[\s\S]*?```/i);
    if (jsonMatch) {
      try {
        jsonBlock = JSON.parse(jsonMatch[1]);
      } catch (e) {
        jsonBlock = null;
      }
    }
    let responseBody;
    if (jsonBlock) {
      responseBody = {
        summary: jsonBlock.summary || '',
        pineScript: jsonBlock.pineScript || '',
        mql4: jsonBlock.mql4 || '',
        mql5: jsonBlock.mql5 || '',
        risk: jsonBlock.risk || {},
        jsonLogic: jsonBlock.jsonLogic || {},
        raw: output
      };
    } else {
      responseBody = {
        summary: output,
        pineScript: output.match(/```pine.*?([\s\S]*?)```/i)?.[1] || '',
        mql4: output.match(/```mql4.*?([\s\S]*?)```/i)?.[1] || '',
        mql5: output.match(/```mql5.*?([\s\S]*?)```/i)?.[1] || '',
        risk: {},
        jsonLogic: {},
        raw: output
      };
    }
    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 