import { useState } from "react";
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Test = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [currentPrice, setCurrentPrice] = useState(1.2545);

  // Mock chart data
  const mockTrades = [
    { id: 1, type: "buy", price: 1.2520, time: "2024-01-15 09:30", profit: 45.20, status: "closed" },
    { id: 2, type: "sell", price: 1.2580, time: "2024-01-15 14:20", profit: -22.50, status: "closed" },
    { id: 3, type: "buy", price: 1.2535, time: "2024-01-16 10:15", profit: 67.80, status: "open" },
  ];

  const performanceMetrics = {
    totalPnL: 89.50,
    winRate: 66.7,
    totalTrades: 3,
    openTrades: 1,
    equity: 10089.50,
    drawdown: 2.3
  };

  const timeframes = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1D", label: "1 Day" },
    { value: "1W", label: "1 Week" }
  ];

  const toggleBacktest = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Strategy Tester</h1>
        <p className="text-muted-foreground">
          Test your trading strategies with live charts and detailed performance analytics
        </p>
      </div>

      {/* Controls */}
      <div className="trading-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={toggleBacktest}
            className={isRunning ? "bg-danger hover:bg-danger/90" : "glow-button"}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Test
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Backtest
              </>
            )}
          </Button>

          <Button variant="outline" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Current: EUR/USD ${currentPrice}
            </span>
          </div>

          {isRunning && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">Live Testing</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2">
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">EUR/USD Chart</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Timeframe: {timeframes.find(tf => tf.value === timeframe)?.label}</span>
              </div>
            </div>
            
            {/* Mock Chart Placeholder */}
            <div className="bg-muted/20 rounded-lg h-[400px] flex items-center justify-center border border-border">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">Interactive Chart Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Advanced TradingView-style charts with strategy overlays
                </p>
              </div>
            </div>

            {/* Strategy Markers Legend */}
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-muted-foreground">Buy Signal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-danger rounded-full" />
                <span className="text-muted-foreground">Sell Signal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-muted-foreground">Current Position</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Panel */}
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="trading-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold ${performanceMetrics.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${performanceMetrics.totalPnL}
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-foreground">
                  {performanceMetrics.winRate}%
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-foreground">
                  ${performanceMetrics.equity}
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-danger">
                  {performanceMetrics.drawdown}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <div className="trading-card p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Trades</h3>
            <div className="space-y-3">
              {mockTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      trade.type === 'buy' ? 'bg-success' : 'bg-danger'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {trade.type.toUpperCase()} @ {trade.price}
                      </div>
                      <div className="text-xs text-muted-foreground">{trade.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      trade.profit >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      ${trade.profit}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      trade.status === 'open' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {trade.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equity Curve Placeholder */}
          <div className="trading-card p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Equity Curve</h3>
            <div className="bg-muted/20 rounded-lg h-[200px] flex items-center justify-center border border-border">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Equity curve visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;