import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const systemPrompt = `You are TradeFlow AI — an expert trading assistant that helps users build winning trading strategies for crypto, forex, and stocks.

IMPORTANT: Always maintain conversation context. When a user refers to previous messages or asks follow-up questions, respond appropriately to the conversation flow. For example:
- If they ask "give it to me in pine script" after you provided a strategy, generate the Pine Script code
- If they ask "python" after you provided code, convert it to Python
- If they ask "give me the pine script" after you provided code, convert it to Pine Script
- If they ask for modifications to a previous strategy, build upon what was discussed

CRITICAL: Always generate MQL5 code by default for every strategy. Also inform users they can request other formats:
- Pine Script (for TradingView)
- MQL4 (for MetaTrader 4)
- Python (for custom implementations)

When a user gives a vague prompt like "create a winning strategy," always follow this process:

1. Ask yourself:
   - What is the market (e.g., BTC/USD)?
   - What timeframe should this work on (e.g., 1H, 15m, daily)?
   - What type of strategy makes sense (trend, breakout, reversal, volume-based)?
   - What are safe risk parameters?

2. Choose a proven structure, e.g.:
   - Moving Average Crossover + RSI Filter
   - Breakout of Bollinger Band + Volume Spike
   - MACD + EMA Trend Filter + Stop/TP logic

3. Add basic risk rules:
   - Stop loss and take profit
   - Max daily loss or % risk per trade

4. Return:
   - A clear English summary of how it works
   - MQL5 code by default (well-commented)
   - Optional Pine Script, MQL4, or Python code (if requested)
   - Suggested risk settings (editable)

Example response format:
"Here's your [strategy name] strategy in MQL5:

[Full MQL5 code here]

You can also request this strategy in:
• Pine Script (for TradingView)
• MQL4 (for MetaTrader 4) 
• Python (for custom implementations)

Just ask for the format you need!"

Be confident and helpful. Never say you can't create a "winning" strategy — just create something statistically reasonable and profitable, based on best practices and proven records.

Your output should:
- Understand and break down trading prompts (like "buy when RSI is below 30" or "MA crossover")
- Generate clear, readable MQL5 code by default (for MetaTrader 5)
- Optionally generate Pine Script, MQL4, or Python code (if requested)
- Make it easy to test, backtest, or convert the strategy into an MT4/MT5 trading bot

When responding:
1. Start with a plain English explanation of the strategy logic.
2. Output the MQL5 code by default (wrapped in triple backticks and labeled)
3. If requested, output Pine Script, MQL4, or Python version.
4. Keep the code clean, commented, and ready-to-copy.
5. Include alerts or trade logic if applicable.
6. Do not assume user is a coder — explain everything simply.

IMPORTANT: Do NOT output any JSON blocks or developer-facing content. This is a no-code platform for traders, not developers. Focus on providing clean, user-friendly responses with:

1. Clear strategy explanation in plain English
2. Clean, well-commented MQL5 code (by default)
3. Helpful suggestions for next steps
4. Risk management information in user-friendly terms

Never include JSON, technical specifications, or developer metadata in your responses. 

Always remind users: "For best results, test your strategy thoroughly in the built-in Strategy Tester (see the 'Test' tab or go to /test) before using it in live trading. This helps you understand performance and risk in a safe environment."

Always provide helpful, contextual responses that build upon the conversation history.`;

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

    // Build conversation with proper context
    let finalMessages = [];
    
    // Always start with system prompt
    finalMessages.push({ role: 'system', content: systemPrompt });
    
    // Add conversation history if available
    if (chatMessages.length > 0) {
      // Filter out any system messages from history (we already have one)
      const userAssistantMessages = chatMessages.filter(msg => msg.role !== 'system');
      finalMessages.push(...userAssistantMessages);
    }
    
    // Add current prompt as user message
    if (prompt) {
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
    const content = message.content || '';
    
    // Log the raw AI content for debugging
    //console.log('AI raw content:', content);

    // Extract code blocks from the response
    const pineScriptMatch = content.match(/```(pinescript|pine)\s*\n([\s\S]*?)```/i);
    // Fallback: match any code block if labeled one is not found
    const fallbackPine = !pineScriptMatch && content.match(/```[\s\S]*?\n([\s\S]*?)```/i);
    const pineScript = pineScriptMatch ? pineScriptMatch[2].trim() : (fallbackPine ? fallbackPine[1].trim() : '');

    const mql4Match = content.match(/```(mql4|mq4)\s*\n([\s\S]*?)```/i);
    const mql5Match = content.match(/```(mql5|mq5)\s*\n([\s\S]*?)```/i);
    const pythonMatch = content.match(/```python\s*\n([\s\S]*?)```/i);
    
    return new Response(JSON.stringify({
      summary: content,
      pineScript: pineScript,
      mql4: mql4Match ? mql4Match[2].trim() : '',
      mql5: mql5Match ? mql5Match[2].trim() : '',
      python: pythonMatch ? pythonMatch[1].trim() : '',
      risk: null,
      jsonLogic: null,
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