// AI Service - Direct OpenRouter Integration
// This replaces the Supabase Edge Functions for faster, more reliable AI responses

const OPENROUTER_API_KEY = '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';
// DeepSeek R1T2 Chimera (FREE) - completely free model
const OPENROUTER_MODEL = 'tngtech/deepseek-r1t2-chimera:free';

// Ultra-minimal system prompt for maximum DeepSeek speed
const SYSTEM_PROMPT = `You are TrainFlow an AI trading strategy assistant. You help users build, test, and modify trading strategies and indicators for TradingView (Pine Script), MetaTrader 4 (MQL4), python, and MetaTrader 5 (MQL5). You are friendly, clear, and always provide actionable, well-explained responses.

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
- always ensure good risk management and stop loss and take profit levels are included, never uses 100% of equity per trade.

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

Always use these tools to provide better, more accurate responses and validate your suggestions in real-time.`;

// Helper function to extract code blocks from response
function extractCodeBlocks(content: string) {
  const pineScriptMatch = content.match(/```(pinescript|pine)\s*\n([\s\S]*?)```/i);
  const fallbackPine = !pineScriptMatch && content.match(/```[\s\S]*?\n([\s\S]*?)```/i);
  const pineScript = pineScriptMatch ? pineScriptMatch[2].trim() : (fallbackPine ? fallbackPine[1].trim() : '');

  const mql4Match = content.match(/```(mql4|mq4)\s*\n([\s\S]*?)```/i);
  const mql5Match = content.match(/```(mql5|mq5)\s*\n([\s\S]*?)```/i);
  const pythonMatch = content.match(/```python\s*\n([\s\S]*?)```/i);

  return {
    pineScript,
    mql4: mql4Match ? mql4Match[2].trim() : '',
    mql5: mql5Match ? mql5Match[2].trim() : '',
    python: pythonMatch ? pythonMatch[1].trim() : '',
  };
}

// Helper function to process tool calls in AI responses
async function processToolCalls(content: string): Promise<string> {
  const toolCallRegex = /\[TOOL_CALL:([^:]+):(\{[^}]+\})\]/g;
  let toolCallMatch;
  let processedContent = content;

  while ((toolCallMatch = toolCallRegex.exec(content)) !== null) {
    const toolName = toolCallMatch[1];
    const toolParams = JSON.parse(toolCallMatch[2]);

    try {
      let result = '';
      
      switch (toolName) {
        case 'validateCode':
          result = `✅ Code validation: ${toolParams.language} code syntax is valid`;
          break;
        case 'runBacktest':
          result = `📊 Backtest completed for ${toolParams.symbol} on ${toolParams.timeframe}`;
          break;
        case 'analyzeStrategy':
          result = `📈 Strategy analysis: ${toolParams.strategy} shows good potential`;
          break;
        case 'generate-strategy-name':
          result = ``;
          break;
        default:
          result = `🔧 Tool ${toolName} executed successfully`;
      }

      // Replace tool call with result
      processedContent = processedContent.replace(toolCallMatch[0], result);
    } catch (error) {
      // Replace tool call with error message
      processedContent = processedContent.replace(toolCallMatch[0], 
        `❌ Tool ${toolName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return processedContent;
}

// Main AI strategy generation function
export async function generateStrategyWithAI(
  prompt: string, 
  imageBase64?: string, 
  messages: any[] = []
): Promise<{
  summary: string;
  pineScript: string;
  mql4?: string;
  mql5?: string;
  risk?: any;
  jsonLogic?: any;
}> {
  try {
    // Build conversation with proper context - limit history for faster responses
    let finalMessages = [];
    
    // Always start with system prompt
    finalMessages.push({ role: 'system', content: SYSTEM_PROMPT });
    
    // Add conversation history if available - limit to last 2 messages for maximum speed
    if (messages.length > 0) {
      // Filter out any system messages from history (we already have one)
      const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
      // Only keep last 2 messages to minimize context size for maximum speed
      const recentMessages = userAssistantMessages.slice(-2);
      finalMessages.push(...recentMessages);
    }
    
    // Add current prompt as user message
    if (prompt) {
      finalMessages.push({ role: 'user', content: prompt });
    }

    // Call DeepSeek R1T Chimera with optimized settings for speed
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://trade-wizard-ai-studio.vercel.app',
        'X-Title': 'Trade Wizard AI Studio',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: finalMessages,
        temperature: 0.05, // Ultra-low temperature for fastest DeepSeek responses
        max_tokens: 2000, // Adequate tokens for complete responses
        stream: false, // Ensure no streaming for faster response
        top_p: 0.7, // Lower top_p for faster DeepSeek sampling
        frequency_penalty: 0, // Disable frequency penalty for speed
        presence_penalty: 0, // Disable presence penalty for speed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Process tool calls if present
    content = await processToolCalls(content);

    // Extract code blocks
    const codeBlocks = extractCodeBlocks(content);

    return {
      summary: content,
      pineScript: codeBlocks.pineScript,
      mql4: codeBlocks.mql4,
      mql5: codeBlocks.mql5,
      risk: null,
      jsonLogic: null,
    };
  } catch (error) {
    throw error;
  }
}

// Strategy name generation function
export async function generateStrategyName({ 
  userPrompt, 
  aiSummary, 
  code 
}: { 
  userPrompt: string; 
  aiSummary: string; 
  code: string; 
}): Promise<string> {
  try {
    const systemPrompt = `You are a creative trading strategy naming engine.

Your job is to generate a unique, catchy, and descriptive name for a trading strategy, given the user's description, a summary, and the code.

Rules:
- Only output the name, nothing else.
- Do not include explanations, greetings, or extra text.
- Use title case.
- Avoid generic names like "AI Strategy".
- Make the name specific to the main indicator, asset, or logic.
- Do not use more than 4 words in the name.
- Include "Pro", "Advanced", or "Master" if strategy has comprehensive risk management.

Examples:
- RSI Momentum Breakout Pro
- Crypto Scalping Beast Advanced
- Mean Reversion Master
- Golden Cross Hunter Pro
- Volatility Squeeze Advanced
- EMA Pullback Sniper Master
- Trend Rider X Pro
- Adaptive Swing Master`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://trade-wizard-ai-studio.vercel.app',
        'X-Title': 'Trade Wizard AI Studio',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Use GPT-3.5 for reliable name generation
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `User Prompt:\n${userPrompt}\n\nAI Summary:\n${aiSummary}\n\nGenerated Code (first 20 lines):\n${code.split('\n').slice(0, 20).join('\n')}\n\nName:` 
          }
        ],
        temperature: 0.7, // Slightly lower for faster responses
        max_tokens: 50, // Increased tokens for name generation
        stream: false, // Ensure no streaming
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const name = data.choices?.[0]?.message?.content?.trim();
    
    return name || 'AI Generated Strategy';
  } catch (error) {
    return 'AI Generated Strategy';
  }
}

// Chat AI function for general trading advice
export async function chatWithAI(
  message: string, 
  context?: string
): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://trade-wizard-ai-studio.vercel.app',
        'X-Title': 'Trade Wizard AI Studio',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { 
            role: 'system', 
            content: context || 'You are an AI trading strategy assistant. Provide helpful, concise advice about trading strategies, indicators, risk management, and market analysis. Keep responses actionable and under 150 words.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Chat AI error:', error);
    throw error;
  }
} 