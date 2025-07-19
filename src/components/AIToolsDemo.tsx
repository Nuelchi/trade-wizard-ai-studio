import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, TrendingUp, Code, Zap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  validateCode, 
  runBacktest, 
  getMarketData, 
  analyzeStrategy, 
  optimizeCode,
  formatToolResult 
} from '@/lib/ai-tools';

const AIToolsDemo = () => {
  const [activeTab, setActiveTab] = useState('validate');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Sample code for testing
  const samplePineScript = `@version=5
strategy("RSI Strategy", overlay=true)

rsi = ta.rsi(close, 14)
oversold = 30
overbought = 70

longCondition = ta.crossover(rsi, oversold)
shortCondition = ta.crossunder(rsi, overbought)

if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.entry("Short", strategy.short)`;

  const sampleMQL4 = `void OnTick()
{
    double rsi = iRSI(Symbol(), 0, 14, PRICE_CLOSE, 0);
    
    if(rsi < 30)
    {
        OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0, "RSI Buy", 0, 0, clrGreen);
    }
    
    if(rsi > 70)
    {
        OrderSend(Symbol(), OP_SELL, 0.1, Bid, 3, 0, 0, "RSI Sell", 0, 0, clrRed);
    }
}`;

  const handleToolCall = async (toolName: string, parameters: any) => {
    setLoading(true);
    try {
      let result;
      
      switch (toolName) {
        case 'validateCode':
          result = await validateCode(parameters.code, parameters.language);
          break;
        case 'runBacktest':
          result = await runBacktest(parameters.strategy, parameters.symbol, parameters.timeframe);
          break;
        case 'getMarketData':
          result = await getMarketData(parameters.symbol, parameters.timeframe, parameters.limit);
          break;
        case 'analyzeStrategy':
          result = await analyzeStrategy(parameters.strategy, parameters.backtestResults);
          break;
        case 'optimizeCode':
          result = await optimizeCode(parameters.code, parameters.language, parameters.focus);
          break;
        default:
          throw new Error('Unknown tool');
      }
      
      setResults(prev => ({ ...prev, [toolName]: result }));
      toast({
        title: 'Tool executed successfully',
        description: `${toolName} completed`,
      });
    } catch (error: any) {
      toast({
        title: 'Tool execution failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI Tools Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Test the AI tools for real-time strategy validation, backtesting, and analysis.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="validate">Validate Code</TabsTrigger>
              <TabsTrigger value="backtest">Backtest</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="analyze">Analyze</TabsTrigger>
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
            </TabsList>

            <TabsContent value="validate" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select defaultValue="pinescript">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinescript">Pine Script</SelectItem>
                      <SelectItem value="mql4">MQL4</SelectItem>
                      <SelectItem value="mql5">MQL5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sample Code</label>
                  <Select defaultValue="pine">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pine">Pine Script Sample</SelectItem>
                      <SelectItem value="mql">MQL4 Sample</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Textarea 
                placeholder="Enter code to validate..."
                defaultValue={samplePineScript}
                className="min-h-[200px]"
              />
              
              <Button 
                onClick={() => handleToolCall('validateCode', { 
                  code: samplePineScript, 
                  language: 'pinescript' 
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Validate Code
              </Button>
              
              {results.validateCode && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Validation Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap">{formatToolResult('validateCode', results.validateCode)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="backtest" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Strategy</label>
                  <Textarea 
                    placeholder="Describe your strategy..."
                    defaultValue="RSI oversold/overbought strategy with moving average filter"
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Symbol</label>
                  <Select defaultValue="EURUSD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                      <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select defaultValue="1h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={() => handleToolCall('runBacktest', { 
                  strategy: "RSI oversold/overbought strategy with moving average filter",
                  symbol: "EURUSD",
                  timeframe: "1h"
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                Run Backtest
              </Button>
              
              {results.runBacktest && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Backtest Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap">{formatToolResult('runBacktest', results.runBacktest)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Symbol</label>
                  <Select defaultValue="EURUSD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select defaultValue="1h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Limit</label>
                  <Select defaultValue="100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 candles</SelectItem>
                      <SelectItem value="100">100 candles</SelectItem>
                      <SelectItem value="200">200 candles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={() => handleToolCall('getMarketData', { 
                  symbol: "EURUSD",
                  timeframe: "1h",
                  limit: 100
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Get Market Data
              </Button>
              
              {results.getMarketData && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Market Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap">{formatToolResult('getMarketData', results.getMarketData)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Strategy Description</label>
                <Textarea 
                  placeholder="Describe your strategy for analysis..."
                  defaultValue="RSI oversold/overbought strategy with moving average filter and stop-loss at 2%"
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={() => handleToolCall('analyzeStrategy', { 
                  strategy: "RSI oversold/overbought strategy with moving average filter and stop-loss at 2%",
                  backtestResults: results.runBacktest
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                Analyze Strategy
              </Button>
              
              {results.analyzeStrategy && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Strategy Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap">{formatToolResult('analyzeStrategy', results.analyzeStrategy)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="optimize" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select defaultValue="pinescript">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinescript">Pine Script</SelectItem>
                      <SelectItem value="mql4">MQL4</SelectItem>
                      <SelectItem value="mql5">MQL5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Focus</label>
                  <Select defaultValue="performance">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="readability">Readability</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Textarea 
                placeholder="Enter code to optimize..."
                defaultValue={samplePineScript}
                className="min-h-[200px]"
              />
              
              <Button 
                onClick={() => handleToolCall('optimizeCode', { 
                  code: samplePineScript,
                  language: 'pinescript',
                  focus: 'performance'
                })}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
                Optimize Code
              </Button>
              
              {results.optimizeCode && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Optimization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap">{formatToolResult('optimizeCode', results.optimizeCode)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIToolsDemo; 