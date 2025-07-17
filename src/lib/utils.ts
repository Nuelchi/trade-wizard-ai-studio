import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pine Script prompt enhancer
type Language = "pine" | "mql4" | "mql5" | "python" | "none";

function enhancePinePrompt(prompt: string, messages: any[]): Language {
  const allText = [prompt, ...(messages || []).map(m => m.content)].join(" ").toLowerCase();

  if (/pine\s*script|tradingview|@version=5|plotshape|plot\s*\(|strategy\./.test(allText)) return "pine";
  if (/\bmql4\b|metatrader\s*4|mt4|ordersend|start\(\)|ima|irsi/.test(allText)) return "mql4";
  if (/\bmql5\b|metatrader\s*5|mt5|oncalculate|ontick|indicatorcreate|positionsend/.test(allText)) return "mql5";
  if (/python|pandas|ta-lib|backtrader|ccxt|bt\.strategy|def\s+next\(|zipline|alpaca|ib_insync/.test(allText)) return "python";
  return "none";
}

function enhancePrompt(prompt: string, language: Language): string {
  if (language === "pine") {
    return `You are generating Pine Script v5 code for TradingView.

User Prompt:
"${prompt}"

Enhanced Requirements:
- When generating Pine Script for technical indicators or chart overlays, default to using \`indicator()\` instead of \`strategy()\` unless explicitly told to create a backtesting strategy.
- Ensure that chart elements are dynamic and responsive to price movements by using \`plot()\` and \`plotshape()\` for visuals.
- Avoid using \`line.new()\` or persistent drawing objects unless tied to \`bar_index\` or \`time\`.
- Always aim to produce scripts that work dynamically with live chart candles.
- Use plot() for lines like EMAs, RSIs, etc.
- Use plotshape() for signals (e.g., crossovers).
- Include alertcondition() if alert logic is requested.
- Use strategy.* functions if a strategy is requested.
- Code must run in Pine Script v5 with no syntax errors.
- Show code only unless otherwise specified.
`;
  }

  if (language === "mql4") {
    return `You are generating MQL4 code for MetaTrader 4.

User Prompt:
"${prompt}"

Enhanced Requirements:
- Write code using the start() loop for logic execution.
- Use iRSI, iMA, etc., for technical indicators.
- Use OrderSend() to place trades, with proper SL/TP/lot size.
- Use Alert() or Comment() for signal feedback if needed.
- Code must be valid .mq4 and ready for MetaEditor.
- Show code only unless otherwise specified.
`;
  }

  if (language === "mql5") {
    return `You are generating MQL5 code for MetaTrader 5.

User Prompt:
"${prompt}"

Enhanced Requirements:
- Use OnInit(), OnTick(), OnCalculate() appropriately.
- Use PositionSend(), OrderSend(), etc., for trades.
- Use iRSI, iMA, IndicatorCreate() for indicators.
- Maintain correct buffer/plot structure for indicators.
- Code must be valid .mq5 and compile in MetaEditor.
- Show code only unless otherwise specified.
`;
  }

  if (language === "python") {
    return `You are generating Python code for algorithmic trading or technical analysis.

User Prompt:
"${prompt}"

Enhanced Requirements:
- Use appropriate libraries such as:
  - \`backtrader\` for backtesting
  - \`pandas\` and \`ta\` or \`TA-Lib\` for indicators
  - \`ccxt\` or \`alpaca\`, \`ib_insync\` for live trading
- For strategies:
  - Create a class that inherits from \`bt.Strategy\` if using \`backtrader\`
  - Implement \`__init__()\` and \`next()\` methods
- Use \`plot()\`, \`buy()\`, \`sell()\`, and SL/TP logic where relevant
- Output must be clean, readable Python with good variable naming
- Show code only unless otherwise specified
`;
  }

  return prompt;
}

export async function generateStrategyWithAI(prompt: string, imageBase64?: string, messages: any[] = []): Promise<{
  summary: string;
  pineScript: string;
  mql4?: string;
  mql5?: string;
  risk?: any;
  jsonLogic?: any;
}> {
  // Enhance prompt for Pine Script requests
  const enhancedPrompt = enhancePinePrompt(prompt, messages);
  // Use the Supabase Edge Function endpoint
  const res = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/image-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: enhancedPrompt, imageBase64, messages: messages || [] })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('AI API error response:', errorText);
    throw new Error(`AI API error: ${errorText}`);
  }
  return await res.json();
}
