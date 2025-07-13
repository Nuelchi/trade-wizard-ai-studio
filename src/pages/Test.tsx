import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Scatter, ScatterChart, Legend } from 'recharts';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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

const mockOHLCV = [
  { time: '2024-01-15 09:00', open: 1.2500, high: 1.2550, low: 1.2490, close: 1.2520 },
  { time: '2024-01-15 10:00', open: 1.2520, high: 1.2580, low: 1.2510, close: 1.2580 },
  { time: '2024-01-15 11:00', open: 1.2580, high: 1.2590, low: 1.2530, close: 1.2535 },
  { time: '2024-01-15 12:00', open: 1.2535, high: 1.2560, low: 1.2520, close: 1.2545 },
];
const mockEquityCurve = [
  { time: '2024-01-15 09:00', equity: 10000 },
  { time: '2024-01-15 10:00', equity: 10045.2 },
  { time: '2024-01-15 11:00', equity: 10022.7 },
  { time: '2024-01-15 12:00', equity: 10089.5 },
];

const Test = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [currentPrice, setCurrentPrice] = useState(1.2545);
  const [step, setStep] = useState(mockOHLCV.length); // Show all by default
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [customOHLCV, setCustomOHLCV] = useState<any[] | null>(null);
  const [customEquity, setCustomEquity] = useState<any[] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const location = useLocation();
  const passedStrategy = location.state?.strategy || '';
  const passedCode = location.state?.code || '';

  const toggleBacktest = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev < mockOHLCV.length) {
            setProgress(Math.round(((prev + 1) / mockOHLCV.length) * 100));
            return prev + 1;
          } else {
            setIsRunning(false);
            setProgress(100);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setStep(1);
    setProgress(0);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data;
        if (file.name.endsWith('.json')) {
          data = JSON.parse(event.target?.result as string);
        } else if (file.name.endsWith('.csv')) {
          const parsed = Papa.parse(event.target?.result as string, { header: true });
          data = parsed.data;
        } else {
          setUploadError('Unsupported file type. Please upload a CSV or JSON file.');
          return;
        }
        // Expecting array of { time, open, high, low, close, equity? }
        if (!Array.isArray(data) || !data[0]?.time) {
          setUploadError('Invalid file format.');
          return;
        }
        setCustomOHLCV(data.map((d: any) => ({
          time: d.time,
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close)
        })));
        if (data[0]?.equity) {
          setCustomEquity(data.map((d: any) => ({ time: d.time, equity: parseFloat(d.equity) })));
        } else {
          setCustomEquity(null);
        }
        setStep(1);
        setProgress(0);
        toast.success('File uploaded and parsed successfully!');
      } catch (err) {
        setUploadError('Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  // Use custom data if uploaded, else fallback to mock
  const ohlcvData = customOHLCV || mockOHLCV;
  const equityData = customEquity || mockEquityCurve;
  const visibleOHLCV = ohlcvData.slice(0, step);
  const visibleEquity = equityData.slice(0, step);
  const visibleTrades = mockTrades.filter((t, i) => i < step);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {(passedStrategy || passedCode) && (
        <div className="trading-card p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Testing Strategy</h2>
          {passedStrategy && <div className="mb-2 text-muted-foreground"><b>Description:</b> {passedStrategy}</div>}
          {passedCode && <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto"><b>Code:</b>\n{passedCode}</pre>}
        </div>
      )}
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

          <Button variant="outline" className="flex items-center space-x-2" onClick={handleReset}>
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
        <div className="w-full h-2 bg-muted/30 rounded mt-4 mb-2">
          <div className="h-2 bg-primary rounded" style={{ width: `${progress}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Above the chart area, add file upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-foreground">Upload OHLCV Data (CSV or JSON):</label>
        <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="mb-2" />
        {uploadError && <div className="text-danger text-sm mb-2">{uploadError}</div>}
        <div className="text-xs text-muted-foreground">Format: time, open, high, low, close[, equity]</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={visibleOHLCV} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value, name) => [
                  `${value}`,
                  typeof name === 'string' ? name.toUpperCase() : name
                ]} />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#3b82f6" dot={false} name="Close Price" />
                {/* Buy/Sell markers as scatter points */}
                <Scatter data={visibleTrades.filter(t => t.type === 'buy').map(t => ({ time: t.time, price: t.price }))} fill="#22c55e" name="Buy Signal" />
                <Scatter data={visibleTrades.filter(t => t.type === 'sell').map(t => ({ time: t.time, price: t.price }))} fill="#ef4444" name="Sell Signal" />
              </LineChart>
            </ResponsiveContainer>

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
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <CardTitle className="text-sm text-muted-foreground">Total P&L</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary cursor-help">[?]</span>
                  </TooltipTrigger>
                  <TooltipContent>Total profit or loss from all trades in this backtest.</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold ${performanceMetrics.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>${performanceMetrics.totalPnL}</div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary cursor-help">[?]</span>
                  </TooltipTrigger>
                  <TooltipContent>Percentage of trades that were profitable.</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-foreground">{performanceMetrics.winRate}%</div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <CardTitle className="text-sm text-muted-foreground">Equity</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary cursor-help">[?]</span>
                  </TooltipTrigger>
                  <TooltipContent>Current account balance including open trades.</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-foreground">${performanceMetrics.equity}</div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <CardTitle className="text-sm text-muted-foreground">Drawdown</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary cursor-help">[?]</span>
                  </TooltipTrigger>
                  <TooltipContent>Maximum observed loss from a peak to a trough during the backtest.</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-danger">{performanceMetrics.drawdown}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <div className="trading-card p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Trades</h3>
            <div className="space-y-3">
              {visibleTrades.map((trade) => (
                <Tooltip key={trade.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-help">
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
                  </TooltipTrigger>
                  <TooltipContent>
                    Type: {trade.type.toUpperCase()}<br />
                    Profit: ${trade.profit}<br />
                    Status: {trade.status}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Equity Curve Placeholder */}
          <div className="trading-card p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Equity Curve</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={visibleEquity} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value, name) => [
                  `${value}`,
                  typeof name === 'string' ? name.toUpperCase() : name
                ]} />
                <Line type="monotone" dataKey="equity" stroke="#3b82f6" dot={false} name="Equity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <style>{`
@keyframes fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
}
`}</style>
    </div>
  );
};

export default Test;