import { supabase } from '@/integrations/supabase/client';

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalReturn: number;
  sharpeRatio: number;
  averageWin: number;
  averageLoss: number;
}

export interface MarketData {
  symbol: string;
  timeframe: string;
  data: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface StrategyAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
}

export interface OptimizationResult {
  optimizations: string[];
}

// Call AI tools function
export async function callAITool(tool: string, parameters: Record<string, any>) {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const accessToken = session?.access_token;
    
    const response = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/ai-tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({ tool, parameters })
    });

    if (!response.ok) {
      throw new Error(`Tool call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI Tool call error:', error);
    throw error;
  }
}

// Specific tool functions for easier use
export async function validateCode(code: string, language: 'pinescript' | 'mql4' | 'mql5'): Promise<ValidationResult> {
  return await callAITool('validateCode', { code, language });
}

export async function runBacktest(
  strategy: string, 
  symbol: string, 
  timeframe: string, 
  startDate?: string, 
  endDate?: string
): Promise<BacktestResult> {
  return await callAITool('runBacktest', { strategy, symbol, timeframe, startDate, endDate });
}

export async function getMarketData(
  symbol: string, 
  timeframe: string, 
  limit: number = 100
): Promise<MarketData> {
  return await callAITool('getMarketData', { symbol, timeframe, limit });
}

export async function analyzeStrategy(
  strategy: string, 
  backtestResults?: BacktestResult
): Promise<StrategyAnalysis> {
  return await callAITool('analyzeStrategy', { strategy, backtestResults });
}

export async function optimizeCode(
  code: string, 
  language: 'pinescript' | 'mql4' | 'mql5', 
  focus: 'performance' | 'readability' | 'safety' = 'performance'
): Promise<OptimizationResult> {
  return await callAITool('optimizeCode', { code, language, focus });
}

// Helper function to format tool results for display
export function formatToolResult(toolName: string, result: any): string {
  switch (toolName) {
    case 'validateCode':
      const validation = result as ValidationResult;
      if (validation.isValid) {
        return `✅ Code validation passed!${validation.warnings.length > 0 ? `\n⚠️ Warnings: ${validation.warnings.join(', ')}` : ''}`;
      } else {
        return `❌ Code validation failed:\n${validation.errors.join('\n')}${validation.warnings.length > 0 ? `\n⚠️ Warnings: ${validation.warnings.join(', ')}` : ''}`;
      }
    
    case 'runBacktest':
      const backtest = result as BacktestResult;
      return `📊 Backtest Results:
• Total Trades: ${backtest.totalTrades}
• Win Rate: ${backtest.winRate}%
• Profit Factor: ${backtest.profitFactor}
• Total Return: ${backtest.totalReturn}%
• Max Drawdown: ${backtest.maxDrawdown}%
• Sharpe Ratio: ${backtest.sharpeRatio}`;
    
    case 'analyzeStrategy':
      const analysis = result as StrategyAnalysis;
      return `🔍 Strategy Analysis:
${analysis.strengths.length > 0 ? `✅ Strengths: ${analysis.strengths.join(', ')}\n` : ''}
${analysis.weaknesses.length > 0 ? `❌ Weaknesses: ${analysis.weaknesses.join(', ')}\n` : ''}
${analysis.recommendations.length > 0 ? `💡 Recommendations: ${analysis.recommendations.join(', ')}\n` : ''}
Risk Level: ${analysis.riskLevel}`;
    
    case 'optimizeCode':
      const optimization = result as OptimizationResult;
      return `⚡ Optimization Suggestions:\n${optimization.optimizations.map(opt => `• ${opt}`).join('\n')}`;
    
    case 'getMarketData':
      const marketData = result as MarketData;
      return `📈 Market Data for ${marketData.symbol} (${marketData.timeframe}):
• Data points: ${marketData.data.length}
• Latest price: ${marketData.data[marketData.data.length - 1]?.close || 'N/A'}`;
    
    default:
      return JSON.stringify(result, null, 2);
  }
} 