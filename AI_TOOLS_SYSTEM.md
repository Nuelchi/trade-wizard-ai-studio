# AI Tools System for Real-Time Strategy Testing

## Overview
The AI Tools System provides the AI assistant with powerful capabilities to test, validate, and analyze trading strategies in real-time. This system enables the AI to provide more accurate, data-driven responses and validate its suggestions before presenting them to users.

## Available Tools

### 1. Code Validation Tool (`validateCode`)
**Purpose**: Validates Pine Script, MQL4, or MQL5 code for syntax errors and best practices.

**Parameters**:
- `code` (string): The code to validate
- `language` (string): Programming language (`pinescript`, `mql4`, `mql5`)

**Returns**:
```json
{
  "errors": ["Missing @version=5 declaration"],
  "warnings": ["Consider adding input() parameters"],
  "isValid": false
}
```

**Example Usage**:
```javascript
[TOOL_CALL:validateCode:{"code": "@version=5\nstrategy('Test')", "language": "pinescript"}]
```

### 2. Backtest Tool (`runBacktest`)
**Purpose**: Runs backtests on strategies with historical data to get performance metrics.

**Parameters**:
- `strategy` (string): Strategy description or code
- `symbol` (string): Trading symbol (e.g., EURUSD, BTCUSDT)
- `timeframe` (string): Timeframe (1m, 5m, 1h, 1d)
- `startDate` (string, optional): Start date for backtest (YYYY-MM-DD)
- `endDate` (string, optional): End date for backtest (YYYY-MM-DD)

**Returns**:
```json
{
  "totalTrades": 45,
  "winRate": 67.5,
  "profitFactor": 1.84,
  "maxDrawdown": 12.3,
  "totalReturn": 847.56,
  "sharpeRatio": 1.67,
  "averageWin": 156.34,
  "averageLoss": -89.12
}
```

**Example Usage**:
```javascript
[TOOL_CALL:runBacktest:{"strategy": "RSI strategy", "symbol": "EURUSD", "timeframe": "1h"}]
```

### 3. Market Data Tool (`getMarketData`)
**Purpose**: Fetches real-time or historical market data for analysis.

**Parameters**:
- `symbol` (string): Trading symbol
- `timeframe` (string): Timeframe
- `limit` (number, optional): Number of candles to fetch (default: 100)

**Returns**:
```json
{
  "symbol": "EURUSD",
  "timeframe": "1h",
  "data": [
    {
      "timestamp": "2024-01-15T09:00:00Z",
      "open": 1.0850,
      "high": 1.0870,
      "low": 1.0840,
      "close": 1.0865,
      "volume": 1000
    }
  ]
}
```

**Example Usage**:
```javascript
[TOOL_CALL:getMarketData:{"symbol": "EURUSD", "timeframe": "1h", "limit": 100}]
```

### 4. Strategy Analysis Tool (`analyzeStrategy`)
**Purpose**: Analyzes strategy performance and provides insights about strengths and weaknesses.

**Parameters**:
- `strategy` (string): Strategy description or code
- `backtestResults` (object, optional): Backtest results to analyze

**Returns**:
```json
{
  "strengths": ["Uses RSI - good for identifying overbought/oversold conditions"],
  "weaknesses": ["No stop-loss mentioned"],
  "recommendations": ["Add stop-loss for risk management"],
  "riskLevel": "medium"
}
```

**Example Usage**:
```javascript
[TOOL_CALL:analyzeStrategy:{"strategy": "Moving average crossover strategy"}]
```

### 5. Code Optimization Tool (`optimizeCode`)
**Purpose**: Suggests optimizations for trading code based on different focus areas.

**Parameters**:
- `code` (string): Code to optimize
- `language` (string): Programming language (`pinescript`, `mql4`, `mql5`)
- `focus` (string): Optimization focus (`performance`, `readability`, `safety`)

**Returns**:
```json
{
  "optimizations": [
    "Use ta.sma() instead of sma() for better performance",
    "Avoid repainting indicators - use historical data functions"
  ]
}
```

**Example Usage**:
```javascript
[TOOL_CALL:optimizeCode:{"code": "your code", "language": "pinescript", "focus": "performance"}]
```

## How the AI Uses Tools

### Automatic Tool Integration
The AI automatically detects when tools should be used and includes tool calls in its responses. For example:

1. **When generating code**: The AI will validate the code it generates
2. **When suggesting strategies**: The AI will run backtests to verify performance
3. **When analyzing strategies**: The AI will use market data and analysis tools
4. **When optimizing code**: The AI will suggest improvements based on best practices

### Tool Call Format
The AI includes tool calls in its responses using this format:
```
[TOOL_CALL:toolName:{"parameter1": "value1", "parameter2": "value2"}]
```

### Response Processing
The system automatically:
1. Detects tool calls in AI responses
2. Executes the tools with the specified parameters
3. Replaces tool calls with formatted results
4. Presents the results to users in a readable format

## Frontend Integration

### AI Tools Utility (`src/lib/ai-tools.ts`)
Provides easy-to-use functions for calling AI tools:

```typescript
import { validateCode, runBacktest, analyzeStrategy } from '@/lib/ai-tools';

// Validate code
const result = await validateCode(pineScriptCode, 'pinescript');

// Run backtest
const backtest = await runBacktest(strategy, 'EURUSD', '1h');

// Analyze strategy
const analysis = await analyzeStrategy(strategyDescription);
```

### Demo Component (`src/components/AIToolsDemo.tsx`)
A comprehensive demo component that showcases all AI tools with interactive examples.

## Benefits

### For Users
1. **Real-Time Validation**: Code is validated before being presented
2. **Performance Insights**: Get actual backtest results for strategies
3. **Market Data**: Access to real market data for testing
4. **Optimization Suggestions**: Get specific improvement recommendations
5. **Risk Analysis**: Understand strategy strengths and weaknesses

### For AI
1. **Data-Driven Responses**: AI can validate its suggestions
2. **Better Accuracy**: Tools provide real data instead of assumptions
3. **Comprehensive Analysis**: AI can provide detailed insights
4. **Error Prevention**: Code validation catches issues early
5. **Performance Verification**: Backtests confirm strategy viability

## Technical Implementation

### Backend (Supabase Edge Functions)
- **`ai-tools`**: Main tools function with all tool implementations
- **`image-ai`**: Enhanced AI function that processes tool calls

### Frontend
- **`ai-tools.ts`**: Utility functions for tool calls
- **`AIToolsDemo.tsx`**: Interactive demo component
- **Toast Integration**: Real-time feedback for tool execution

### Tool Processing Flow
1. AI generates response with tool calls
2. System detects tool calls using regex
3. Tools are executed in parallel
4. Results are formatted and integrated
5. Final response is presented to user

## Future Enhancements

### Planned Tools
1. **Real Market Data Integration**: Connect to live market data feeds
2. **Advanced Backtesting**: More sophisticated backtesting engine
3. **Risk Management Tools**: Position sizing and risk calculation
4. **Portfolio Analysis**: Multi-strategy portfolio optimization
5. **Market Sentiment Analysis**: News and sentiment integration

### Performance Improvements
1. **Caching**: Cache frequently used data
2. **Parallel Processing**: Execute multiple tools simultaneously
3. **Real-time Updates**: Live market data streaming
4. **Advanced Analytics**: More sophisticated analysis algorithms

## Usage Examples

### Example 1: Code Generation with Validation
```
User: "Create a Pine Script RSI strategy"

AI Response:
[TOOL_CALL:validateCode:{"code": "@version=5\nstrategy('RSI Strategy')", "language": "pinescript"}]

✅ Code validation passed!
⚠️ Warnings: Consider adding input() parameters

Here's your validated Pine Script strategy...
```

### Example 2: Strategy Testing
```
User: "Test my moving average crossover strategy"

AI Response:
[TOOL_CALL:runBacktest:{"strategy": "MA crossover", "symbol": "EURUSD", "timeframe": "1h"}]

📊 Backtest Results:
• Total Trades: 45
• Win Rate: 67.5%
• Profit Factor: 1.84
• Total Return: 847.56%

Your strategy shows good performance with a 67.5% win rate...
```

### Example 3: Code Optimization
```
User: "Optimize my Pine Script for performance"

AI Response:
[TOOL_CALL:optimizeCode:{"code": "your code", "language": "pinescript", "focus": "performance"}]

⚡ Optimization Suggestions:
• Use ta.sma() instead of sma() for better performance
• Avoid repainting indicators - use historical data functions
• Use var keyword for variables that don't need recalculation

Here are the optimized improvements...
```

This AI Tools System transforms the trading assistant from a simple code generator into a comprehensive strategy development and testing platform, providing users with validated, tested, and optimized trading solutions. 