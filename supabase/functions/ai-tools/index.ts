import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool definitions that the AI can call
const AVAILABLE_TOOLS = {
  validateCode: {
    name: "validateCode",
    description: "Validate Pine Script, MQL4, or MQL5 code for syntax errors and best practices",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "The code to validate" },
        language: { type: "string", enum: ["pinescript", "mql4", "mql5"], description: "Programming language" }
      },
      required: ["code", "language"]
    }
  },
  runBacktest: {
    name: "runBacktest", 
    description: "Run a backtest on a strategy with historical data",
    parameters: {
      type: "object",
      properties: {
        strategy: { type: "string", description: "Strategy description or code" },
        symbol: { type: "string", description: "Trading symbol (e.g., EURUSD, BTCUSDT)" },
        timeframe: { type: "string", description: "Timeframe (1m, 5m, 1h, 1d)" },
        startDate: { type: "string", description: "Start date for backtest (YYYY-MM-DD)" },
        endDate: { type: "string", description: "End date for backtest (YYYY-MM-DD)" }
      },
      required: ["strategy", "symbol", "timeframe"]
    }
  },
  getMarketData: {
    name: "getMarketData",
    description: "Get real-time or historical market data for a symbol",
    parameters: {
      type: "object", 
      properties: {
        symbol: { type: "string", description: "Trading symbol" },
        timeframe: { type: "string", description: "Timeframe" },
        limit: { type: "number", description: "Number of candles to fetch", default: 100 }
      },
      required: ["symbol", "timeframe"]
    }
  },
  analyzeStrategy: {
    name: "analyzeStrategy",
    description: "Analyze strategy performance and provide insights",
    parameters: {
      type: "object",
      properties: {
        strategy: { type: "string", description: "Strategy description or code" },
        backtestResults: { type: "object", description: "Backtest results to analyze" }
      },
      required: ["strategy"]
    }
  },
  optimizeCode: {
    name: "optimizeCode",
    description: "Suggest optimizations for trading code",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code to optimize" },
        language: { type: "string", enum: ["pinescript", "mql4", "mql5"], description: "Programming language" },
        focus: { type: "string", enum: ["performance", "readability", "safety"], description: "Optimization focus" }
      },
      required: ["code", "language"]
    }
  }
};

// Mock market data for demonstration
const MOCK_MARKET_DATA = {
  "EURUSD": [
    { timestamp: "2024-01-15T09:00:00Z", open: 1.0850, high: 1.0870, low: 1.0840, close: 1.0865, volume: 1000 },
    { timestamp: "2024-01-15T10:00:00Z", open: 1.0865, high: 1.0890, low: 1.0855, close: 1.0880, volume: 1200 },
    { timestamp: "2024-01-15T11:00:00Z", open: 1.0880, high: 1.0900, low: 1.0870, close: 1.0895, volume: 1100 },
    { timestamp: "2024-01-15T12:00:00Z", open: 1.0895, high: 1.0910, low: 1.0885, close: 1.0900, volume: 1300 },
    { timestamp: "2024-01-15T13:00:00Z", open: 1.0900, high: 1.0920, low: 1.0890, close: 1.0915, volume: 1400 }
  ],
  "BTCUSDT": [
    { timestamp: "2024-01-15T09:00:00Z", open: 42000, high: 42200, low: 41900, close: 42150, volume: 100 },
    { timestamp: "2024-01-15T10:00:00Z", open: 42150, high: 42400, low: 42000, close: 42300, volume: 120 },
    { timestamp: "2024-01-15T11:00:00Z", open: 42300, high: 42500, low: 42200, close: 42450, volume: 110 },
    { timestamp: "2024-01-15T12:00:00Z", open: 42450, high: 42600, low: 42350, close: 42500, volume: 130 },
    { timestamp: "2024-01-15T13:00:00Z", open: 42500, high: 42700, low: 42400, close: 42650, volume: 140 }
  ]
};

// Pine Script validation rules
const PINE_SCRIPT_RULES = {
  required: ["@version=5", "strategy(", "indicator("],
  forbidden: ["hline(", "line.new(", "label.new("],
  bestPractices: [
    "Use meaningful variable names",
    "Include proper error handling",
    "Add comments for complex logic",
    "Use input() for user parameters"
  ]
};

// MQL4/MQL5 validation rules
const MQL_RULES = {
  required: ["OnTick()", "OnInit()"],
  forbidden: ["Sleep(", "while(true)"],
  bestPractices: [
    "Use proper order management",
    "Include risk controls",
    "Handle errors gracefully",
    "Use proper variable types"
  ]
};

function validatePineScript(code: string) {
  const errors = [];
  const warnings = [];
  
  // Check for required elements
  if (!code.includes("@version=5")) {
    errors.push("Missing @version=5 declaration");
  }
  
  if (!code.includes("strategy(") && !code.includes("indicator(")) {
    errors.push("Missing strategy() or indicator() declaration");
  }
  
  // Check for forbidden patterns
  if (code.includes("hline(")) {
    warnings.push("Avoid hline() with dynamic values - use plot() instead");
  }
  
  if (code.includes("line.new(")) {
    warnings.push("Avoid line.new() - use plot() for continuous lines");
  }
  
  // Check for best practices
  if (!code.includes("input(")) {
    warnings.push("Consider adding input() parameters for user customization");
  }
  
  if (!code.includes("//")) {
    warnings.push("Add comments to explain complex logic");
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

function validateMQL(code: string, language: "mql4" | "mql5") {
  const errors = [];
  const warnings = [];
  
  // Check for required elements
  if (!code.includes("OnTick()")) {
    errors.push("Missing OnTick() function");
  }
  
  if (!code.includes("OnInit()")) {
    warnings.push("Consider adding OnInit() for initialization");
  }
  
  // Check for forbidden patterns
  if (code.includes("Sleep(")) {
    errors.push("Avoid Sleep() - use proper event handling");
  }
  
  if (code.includes("while(true)")) {
    errors.push("Avoid infinite loops - use proper event-driven approach");
  }
  
  // Check for best practices
  if (!code.includes("OrderSend(") && !code.includes("OrderOpen(")) {
    warnings.push("No order management functions found");
  }
  
  if (!code.includes("StopLoss") && !code.includes("TakeProfit")) {
    warnings.push("Consider adding stop-loss and take-profit logic");
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

function runMockBacktest(strategy: string, symbol: string, timeframe: string) {
  // Simulate backtest results
  const totalTrades = Math.floor(Math.random() * 50) + 10;
  const winRate = Math.random() * 40 + 50; // 50-90%
  const profitFactor = Math.random() * 2 + 0.5; // 0.5-2.5
  const maxDrawdown = Math.random() * 20 + 5; // 5-25%
  const totalReturn = (Math.random() * 100 - 20); // -20% to +80%
  
  return {
    totalTrades,
    winRate: Math.round(winRate * 10) / 10,
    profitFactor: Math.round(profitFactor * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    totalReturn: Math.round(totalReturn * 10) / 10,
    sharpeRatio: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    averageWin: Math.round((Math.random() * 200 + 50) * 10) / 10,
    averageLoss: Math.round((Math.random() * -150 - 50) * 10) / 10
  };
}

function analyzeStrategy(strategy: string, backtestResults?: any) {
  const analysis = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
    riskLevel: "medium"
  };
  
  if (backtestResults) {
    if (backtestResults.winRate > 60) {
      analysis.strengths.push("Good win rate");
    } else {
      analysis.weaknesses.push("Low win rate - consider improving entry conditions");
    }
    
    if (backtestResults.profitFactor > 1.5) {
      analysis.strengths.push("Strong profit factor");
    } else {
      analysis.weaknesses.push("Low profit factor - review risk management");
    }
    
    if (backtestResults.maxDrawdown > 15) {
      analysis.weaknesses.push("High maximum drawdown");
      analysis.recommendations.push("Consider reducing position size or adding stop-loss");
    }
    
    if (backtestResults.totalReturn < 0) {
      analysis.weaknesses.push("Negative total return");
      analysis.recommendations.push("Strategy needs optimization");
    }
  }
  
  // Analyze strategy description
  if (strategy.toLowerCase().includes("rsi")) {
    analysis.strengths.push("Uses RSI - good for identifying overbought/oversold conditions");
  }
  
  if (strategy.toLowerCase().includes("moving average")) {
    analysis.strengths.push("Uses moving averages - good for trend following");
  }
  
  if (!strategy.toLowerCase().includes("stop loss")) {
    analysis.weaknesses.push("No stop-loss mentioned");
    analysis.recommendations.push("Add stop-loss for risk management");
  }
  
  return analysis;
}

function optimizeCode(code: string, language: string, focus: string = "performance") {
  const optimizations = [];
  
  if (language === "pinescript") {
    if (focus === "performance") {
      optimizations.push("Use ta.sma() instead of sma() for better performance");
      optimizations.push("Avoid repainting indicators - use historical data functions");
      optimizations.push("Use var keyword for variables that don't need recalculation");
    } else if (focus === "readability") {
      optimizations.push("Add more descriptive variable names");
      optimizations.push("Include comments for complex calculations");
      optimizations.push("Group related logic into functions");
    } else if (focus === "safety") {
      optimizations.push("Add input validation for user parameters");
      optimizations.push("Include error handling for edge cases");
      optimizations.push("Use proper risk management functions");
    }
  } else if (language === "mql4" || language === "mql5") {
    if (focus === "performance") {
      optimizations.push("Use proper variable types (double, int)");
      optimizations.push("Avoid unnecessary calculations in OnTick()");
      optimizations.push("Use static variables for expensive calculations");
    } else if (focus === "readability") {
      optimizations.push("Add descriptive function and variable names");
      optimizations.push("Include comments for complex logic");
      optimizations.push("Structure code into logical functions");
    } else if (focus === "safety") {
      optimizations.push("Add proper error handling with GetLastError()");
      optimizations.push("Include position size validation");
      optimizations.push("Use proper order management functions");
    }
  }
  
  return { optimizations };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, parameters } = await req.json();
    
    if (!tool || !AVAILABLE_TOOLS[tool]) {
      return new Response(JSON.stringify({ 
        error: 'Invalid tool', 
        availableTools: Object.keys(AVAILABLE_TOOLS) 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let result;
    
    switch (tool) {
      case 'validateCode':
        const { code, language } = parameters;
        if (language === 'pinescript') {
          result = validatePineScript(code);
        } else if (language === 'mql4' || language === 'mql5') {
          result = validateMQL(code, language);
        } else {
          result = { error: 'Unsupported language' };
        }
        break;
        
      case 'runBacktest':
        const { strategy, symbol, timeframe, startDate, endDate } = parameters;
        result = runMockBacktest(strategy, symbol, timeframe);
        break;
        
      case 'getMarketData':
        const { symbol: dataSymbol, timeframe: dataTimeframe, limit } = parameters;
        const data = MOCK_MARKET_DATA[dataSymbol] || [];
        result = {
          symbol: dataSymbol,
          timeframe: dataTimeframe,
          data: data.slice(0, limit || 100)
        };
        break;
        
      case 'analyzeStrategy':
        const { strategy: analysisStrategy, backtestResults } = parameters;
        result = analyzeStrategy(analysisStrategy, backtestResults);
        break;
        
      case 'optimizeCode':
        const { code: optCode, language: optLanguage, focus } = parameters;
        result = optimizeCode(optCode, optLanguage, focus);
        break;
        
      default:
        result = { error: 'Unknown tool' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 