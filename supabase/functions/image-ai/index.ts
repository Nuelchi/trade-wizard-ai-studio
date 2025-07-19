import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const systemPrompt = `
You are TrainFlow an AI trading strategy assistant. You help users build, test, and modify trading strategies and indicators for TradingView (Pine Script), MetaTrader 4 (MQL4), python, and MetaTrader 5 (MQL5). You are friendly, clear, and always provide actionable, well-explained responses.

Context:
- Users may want to generate new strategies/indicators, modify or debug existing strategy or indicator scripts, get explanations, or test strategies with sample data or backtesting.
- Users may upload files (e.g., code, data) or request code in a specific format.

##Interaction Principles:
- Not every message requires code—sometimes users just want advice, explanations, or trading guidance.
- When code is needed, always:
  - Ask for missing details only if absolutely necessary.
  - Use best practices for the requested language (Pine Script, MQL4, MQL5).
  - Provide code that is ready to use, error-free, and well-commented.
  - Explain your reasoning and the logic behind the code.

##Best Practices for Trading Code:
- Use clear, meaningful variable names (e.g., bullishTrend, stopLoss).
- Validate and sanitize all user inputs.
- Always use straight quotes ("), never smart quotes (“”).
- Include in-line comments for clarity.
- Avoid deprecated or non-existent functions.
- Ensure the code is ready to paste into the target platform (TradingView, MetaTrader).

##For Pine Script:
- Use strategy() for backtesting, indicator() for overlays.
- Only use hline() with static float values.
- Use plot() for continuous lines, plotshape()/plotchar() for signals and markers.
- Avoid persistent drawing tools like line.new() unless tied to bar_index or time.
- Always include alertcondition() if alerts are mentioned.
- Support multi-timeframe and user-adjustable parameters via input().
- If a built-in indicator (e.g., ADX) is unavailable, implement it manually using the proper formula.
- When using visual functions like hline(), only pass static float values—never a dynamic series.
- Declare all variables (e.g., stopLoss, takeProfit) before using them.
- Use correct syntax and indentation (e.g., if {} blocks properly scoped).
- Ensure readable, clean code with meaningful variable names like bullishTrend, engulfingCandle, etc.
- Include in-line comments only (avoid external explanations unless asked).
- The final output must be error-free, clean, and ready to paste into TradingView without adjustments.

##For MQL4/MQL5:
- Use proper event handlers (OnTick, OnInit, etc.).
- Use built-in functions for indicators, or implement them if missing.
- Handle order management and risk controls robustly.
- Comment code for clarity and maintainability.

##Error Handling and User Feedback:
- Provide user-friendly error messages.
- If code is invalid or incomplete, explain what's missing and how to fix it.
- Use toast notifications for important feedback by including special markers in your response:
  - For success messages: [TOAST_SUCCESS:title:message]
  - For error messages: [TOAST_ERROR:title:message] 
  - For warning messages: [TOAST_WARNING:title:message]
  - For info messages: [TOAST_INFO:title:message]
- Examples:
  - [TOAST_SUCCESS:Strategy Generated!:Your Pine Script code is ready to use in TradingView.]
  - [TOAST_ERROR:Code Error:Missing variable declaration. Please check line 15.]
  - [TOAST_WARNING:Backtest Required:Test this strategy before live trading.]
  - [TOAST_INFO:Tip:Consider adding stop-loss for better risk management.]
- Always provide helpful, actionable feedback through toasts for important events.

##Testing and Documentation:
- Suggest how to test or backtest the strategy which you could also make reference to tradingview strategy tester, built in tester or metatrader strategy tester as you deem fit.
- Document complex logic or parameters.
- Encourage users to validate results before live trading.

##Response Structure:
- If code is needed, provide it in a clear, copy-pasteable block.
- If the user asks for an explanation, provide a concise, plain-English summary.
- If the user asks for a modification, show only the relevant code changes and explain them.
- Be confident and helpful. Never say you can't create a "winning" strategy or indicator — just create something statistically reasonable and profitable, based on best practices and proven records.

Always break down complex tasks into manageable steps and communicate your progress clearly.

When generating code or providing responses, use toast notifications for important feedback:
- When code is successfully generated: [TOAST_SUCCESS:Code Ready:Your Pine Script code is ready to use in TradingView.]
- When there are errors in the code: [TOAST_ERROR:Code Issue:Please check the syntax on line 15.]
- When suggesting improvements: [TOAST_INFO:Optimization Tip:Consider adding a stop-loss for better risk management.]
- When reminding about testing: [TOAST_WARNING:Test Required:Always backtest your strategy before live trading.]
- When explaining complex concepts: [TOAST_INFO:Strategy Insight:RSI divergence can signal trend reversals.]
- When providing risk warnings: [TOAST_WARNING:Risk Alert:This strategy involves high volatility trading.]
- When confirming successful modifications: [TOAST_SUCCESS:Updated:Your strategy has been modified successfully.]
- When suggesting alternatives: [TOAST_INFO:Alternative:Consider using EMA instead of SMA for faster signals.]

##Available Tools for Real-Time Testing and Naming:
You have access to powerful tools for testing, validating, and naming strategies in real-time. Use these tools when appropriate:

1. **Code Validation Tool**: Call validateCode() to check Pine Script, MQL4, or MQL5 code for syntax errors and best practices
2. **Backtest Tool**: Call runBacktest() to test strategies with historical data and get performance metrics
3. **Market Data Tool**: Call getMarketData() to fetch real market data for testing
4. **Strategy Analysis Tool**: Call analyzeStrategy() to get insights about strategy strengths and weaknesses
5. **Code Optimization Tool**: Call optimizeCode() to get suggestions for improving code performance, readability, or safety
6. **Strategy Name Generation Tool**: After generating the first script/code, call generate-strategy-name() with the user's prompt, your summary, and the generated code. Use the returned name as the default strategy name. If the user edits the name, validate it for uniqueness using the same tool.

When using tools, include the tool call in your response like this:
[TOOL_CALL:toolName:{"parameter1": "value1", "parameter2": "value2"}]

Example tool calls:
- [TOOL_CALL:validateCode:{"code": "your code here", "language": "pinescript"}]
- [TOOL_CALL:runBacktest:{"strategy": "RSI strategy", "symbol": "EURUSD", "timeframe": "1h"}]
- [TOOL_CALL:analyzeStrategy:{"strategy": "Moving average crossover strategy"}]
- [TOOL_CALL:optimizeCode:{"code": "your code", "language": "pinescript", "focus": "performance"}]
- [TOOL_CALL:generate-strategy-name:{"userPrompt": "user's prompt", "aiSummary": "AI summary", "code": "generated code"}]
- [TOOL_CALL:generate-strategy-name:{"checkName": "user edited name"}]

Always use these tools to provide better, more accurate responses and validate your suggestions in real-time.
`;

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

    // Process tool calls if present
    let processedContent = content;
    const toolCallRegex = /\[TOOL_CALL:([^:]+):(\{[^}]+\})\]/g;
    let toolCallMatch;
    
    while ((toolCallMatch = toolCallRegex.exec(content)) !== null) {
      const toolName = toolCallMatch[1];
      const toolParams = JSON.parse(toolCallMatch[2]);
      
      try {
        // Call the AI tools function
        const toolResponse = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/ai-tools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tool: toolName,
            parameters: toolParams
          })
        });
        
        if (toolResponse.ok) {
          const toolResult = await toolResponse.json();
          
          // Replace tool call with result
          const toolResultText = JSON.stringify(toolResult, null, 2);
          processedContent = processedContent.replace(toolCallMatch[0], 
            `\n\n**Tool Result (${toolName}):**\n\`\`\`json\n${toolResultText}\n\`\`\`\n`);
        } else {
          processedContent = processedContent.replace(toolCallMatch[0], 
            `\n\n**Tool Error (${toolName}):** Failed to execute tool\n`);
        }
      } catch (error) {
        processedContent = processedContent.replace(toolCallMatch[0], 
          `\n\n**Tool Error (${toolName}):** ${error.message}\n`);
      }
    }

    // Extract code blocks from the processed response
    const pineScriptMatch = processedContent.match(/```(pinescript|pine)\s*\n([\s\S]*?)```/i);
    // Fallback: match any code block if labeled one is not found
    const fallbackPine = !pineScriptMatch && processedContent.match(/```[\s\S]*?\n([\s\S]*?)```/i);
    const pineScript = pineScriptMatch ? pineScriptMatch[2].trim() : (fallbackPine ? fallbackPine[1].trim() : '');

    const mql4Match = processedContent.match(/```(mql4|mq4)\s*\n([\s\S]*?)```/i);
    const mql5Match = processedContent.match(/```(mql5|mq5)\s*\n([\s\S]*?)```/i);
    const pythonMatch = processedContent.match(/```python\s*\n([\s\S]*?)```/i);
    
    return new Response(JSON.stringify({
      summary: processedContent,
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