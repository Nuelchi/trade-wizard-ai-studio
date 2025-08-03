import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Activity, Target, Zap, ExternalLink, RefreshCw } from 'lucide-react';

interface AdvancedTradingTesterProps {
  strategy?: any;
}

const AdvancedTradingTester: React.FC<AdvancedTradingTesterProps> = ({ strategy }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // Simulate loading time for the iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleOpenInNewTab = () => {
    window.open('/advanced-trading-tester.html', '_blank');
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <Tabs defaultValue="tester" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="tester" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Strategy Tester
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Features
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Screen
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <TabsContent value="tester" className="h-full m-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading Advanced Trading Tester...</p>
                  </div>
                </div>
              )}
              
              <iframe
                key={iframeKey}
                src="/advanced-trading-tester.html"
                className={`w-full h-full border-0 ${isLoading ? 'hidden' : 'block'}`}
                onLoad={() => setIsLoading(false)}
                title="Advanced Trading Strategy Tester"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </TabsContent>

          <TabsContent value="info" className="h-full m-0 overflow-hidden">
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Advanced Trading Strategy Tester
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      A comprehensive trading strategy testing platform with real-time data from Binance API.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Chart Features
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            Real-time candlestick charts
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            EMA 20 & 200 indicators
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            Live WebSocket data feed
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            Interactive buy/sell markers
                          </li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Trading Strategies
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            Moving Average Crossover
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            RSI Strategy
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            MACD Strategy
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                            High Frequency Trading
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Win Rate</span>
                            <Badge variant="outline">Calculated</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Return</span>
                            <Badge variant="outline">Real-time</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Drawdown</span>
                            <Badge variant="outline">Tracked</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Profit Factor</span>
                            <Badge variant="outline">Dynamic</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Trading Pairs
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>BTC/USDT</span>
                            <Badge variant="outline">Default</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>ETH/USDT</span>
                            <Badge variant="outline">Available</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>BNB/USDT</span>
                            <Badge variant="outline">Available</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>+7 More</span>
                            <Badge variant="outline">Supported</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-semibold mb-2">How to Use:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Select a trading pair from the dropdown</li>
                        <li>Choose a strategy (MA Crossover, RSI, MACD, etc.)</li>
                        <li>Set your account size for position sizing</li>
                        <li>Click "Run Strategy" to see backtest results</li>
                        <li>View detailed trade history and performance metrics</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdvancedTradingTester; 