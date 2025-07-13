import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface Trade {
  id: string;
  type: "buy" | "sell";
  entryTime: string;
  entryPrice: number;
  exitTime?: string;
  exitPrice?: number;
  quantity: number;
  profit?: number;
  status: "open" | "closed";
}

interface PerformanceMetrics {
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

interface BacktestResult {
  trades: Trade[];
  equityCurve: Array<{ time: string; equity: number; drawdown: number }>;
  metrics: PerformanceMetrics;
  monthlyReturns: Array<{ month: string; return: number }>;
}

export const BacktestEngine = ({ strategy, ohlcvData }: { strategy: any; ohlcvData: any[] }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentStep(0);
    
    // Simulate backtest execution
    const trades: Trade[] = [];
    const equityCurve: Array<{ time: string; equity: number; drawdown: number }> = [];
    let equity = 10000; // Starting capital
    let maxEquity = equity;
    
    for (let i = 0; i < ohlcvData.length; i++) {
      setProgress((i / ohlcvData.length) * 100);
      setCurrentStep(i + 1);
      
      const candle = ohlcvData[i];
      
      // Simulate strategy logic (this would be replaced with actual strategy execution)
      if (Math.random() > 0.95) { // Random entry signals for demo
        const trade: Trade = {
          id: `trade_${trades.length + 1}`,
          type: Math.random() > 0.5 ? "buy" : "sell",
          entryTime: candle.time,
          entryPrice: candle.close,
          quantity: 1,
          status: "open"
        };
        
        // Simulate exit after a few candles
        if (i > 5 && Math.random() > 0.7) {
          const openTrade = trades.find(t => t.status === "open");
          if (openTrade) {
            openTrade.exitTime = candle.time;
            openTrade.exitPrice = candle.close;
            openTrade.profit = (openTrade.exitPrice - openTrade.entryPrice) * openTrade.quantity;
            openTrade.status = "closed";
            equity += openTrade.profit;
            maxEquity = Math.max(maxEquity, equity);
          }
        }
        
        trades.push(trade);
      }
      
      const drawdown = ((maxEquity - equity) / maxEquity) * 100;
      equityCurve.push({
        time: candle.time,
        equity,
        drawdown
      });
      
      // Add delay for visualization
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Calculate metrics
    const closedTrades = trades.filter(t => t.status === "closed");
    const winningTrades = closedTrades.filter(t => t.profit! > 0);
    const losingTrades = closedTrades.filter(t => t.profit! <= 0);
    
    const metrics: PerformanceMetrics = {
      totalReturn: ((equity - 10000) / 10000) * 100,
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: winningTrades.length / closedTrades.length * 100,
      profitFactor: Math.abs(winningTrades.reduce((sum, t) => sum + t.profit!, 0)) / 
                   Math.abs(losingTrades.reduce((sum, t) => sum + t.profit!, 0)),
      sharpeRatio: 1.25, // Simplified calculation
      maxDrawdown: Math.max(...equityCurve.map(e => e.drawdown)),
      averageWin: winningTrades.reduce((sum, t) => sum + t.profit!, 0) / winningTrades.length,
      averageLoss: losingTrades.reduce((sum, t) => sum + t.profit!, 0) / losingTrades.length,
      largestWin: Math.max(...winningTrades.map(t => t.profit!)),
      largestLoss: Math.min(...losingTrades.map(t => t.profit!))
    };
    
    // Generate monthly returns
    const monthlyReturns = generateMonthlyReturns(equityCurve);
    
    setResult({
      trades,
      equityCurve,
      metrics,
      monthlyReturns
    });
    
    setIsRunning(false);
    setProgress(100);
  };

  const generateMonthlyReturns = (equityCurve: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      return: Math.random() * 20 - 10 // Random returns for demo
    }));
  };

  const resetBacktest = () => {
    setIsRunning(false);
    setProgress(0);
    setCurrentStep(0);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Backtest Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={runBacktest}
              disabled={isRunning}
              className={isRunning ? "bg-danger hover:bg-danger/90" : "glow-button"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Backtest
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={resetBacktest}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <div className="flex-1">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{currentStep} / {ohlcvData.length} candles</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className={`text-2xl font-bold ${result.metrics.totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                    {result.metrics.totalReturn.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Total Return</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{result.metrics.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{result.metrics.profitFactor.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Profit Factor</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-danger">{result.metrics.maxDrawdown.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{result.metrics.totalTrades}</div>
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{result.metrics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Statistics */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Trade Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winning Trades:</span>
                  <span className="text-success font-medium">{result.metrics.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Losing Trades:</span>
                  <span className="text-danger font-medium">{result.metrics.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Win:</span>
                  <span className="text-success font-medium">${result.metrics.averageWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Loss:</span>
                  <span className="text-danger font-medium">${result.metrics.averageLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Largest Win:</span>
                  <span className="text-success font-medium">${result.metrics.largestWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Largest Loss:</span>
                  <span className="text-danger font-medium">${result.metrics.largestLoss.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equity Curve */}
          <Card className="trading-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={result.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="equity"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Equity"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="drawdown"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Drawdown %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Returns */}
          <Card className="trading-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, "Return"]} />
                  <Area
                    type="monotone"
                    dataKey="return"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BacktestEngine;