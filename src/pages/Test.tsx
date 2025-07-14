import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Calendar, Settings, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Scatter, ScatterChart, Legend } from 'recharts';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ChatInterface from '@/components/ChatInterface';
import AuthGuard from '@/components/AuthGuard';

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
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("tester");

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

  const handleStrategyGenerated = (strategy: any) => {
    setSelectedStrategy(strategy);
    setActiveTab("tester");
  };

  const handleCodeGenerated = (code: any) => {
    setGeneratedCode(code);
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
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Strategy Tester</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Test your strategies with live charts and detailed analytics
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleBacktest}
              className={isRunning ? "bg-red-600 hover:bg-red-700" : ""}
              variant={isRunning ? "destructive" : "default"}
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border bg-muted/20">
              <TabsList className="ml-4">
                <TabsTrigger value="builder">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Strategy Builder
                </TabsTrigger>
                <TabsTrigger value="tester">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Strategy Tester
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="builder" className="h-full m-0">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full border-r border-border flex flex-col bg-background">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">AI Strategy Builder</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Create or modify strategies
                        </div>
                      </div>
                      
                      <ChatInterface 
                        onStrategyGenerated={handleStrategyGenerated}
                        onCodeGenerated={handleCodeGenerated}
                      />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col bg-background">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Strategy Preview</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Strategy details and code
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        {selectedStrategy ? (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                {selectedStrategy.name}
                                <Button 
                                  onClick={() => setActiveTab("tester")}
                                  size="sm"
                                >
                                  Test Strategy
                                </Button>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Type</h4>
                                <p className="text-sm text-muted-foreground">{selectedStrategy.type}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{selectedStrategy.description}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Indicators</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedStrategy.indicators?.map((ind: any, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-muted rounded text-xs">
                                      {ind.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium mb-2">No Strategy Selected</h3>
                              <p className="text-sm text-muted-foreground">
                                Use the AI builder to create a strategy
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="tester" className="h-full m-0">
                <div className="h-full flex flex-col">
                  {/* Strategy Selection & Controls */}
                  <div className="border-b border-border p-4 bg-muted/20">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Strategy:</label>
                        <Select 
                          value={selectedStrategy?.id || ""} 
                          onValueChange={(value) => {
                            if (value === "upload") {
                              // Handle file upload
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pine,.mq4,.json';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  toast.success(`Strategy file ${file.name} loaded`);
                                }
                              };
                              input.click();
                            }
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedStrategy && (
                              <SelectItem value={selectedStrategy.id}>
                                {selectedStrategy.name}
                              </SelectItem>
                            )}
                            <SelectItem value="upload">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Strategy File
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

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

                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          EUR/USD ${currentPrice}
                        </span>
                      </div>

                      {isRunning && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-600 font-medium">Live Testing</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full h-2 bg-muted/30 rounded mt-4">
                      <div 
                        className="h-2 bg-primary rounded transition-all duration-500" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Chart and Analytics */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-auto">
                    {/* Chart Area */}
                    <div className="lg:col-span-2">
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>EUR/USD Chart</CardTitle>
                            <div className="text-sm text-muted-foreground">
                              {timeframes.find(tf => tf.value === timeframe)?.label}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                              <Scatter data={visibleTrades.filter(t => t.type === 'buy').map(t => ({ time: t.time, price: t.price }))} fill="#22c55e" name="Buy Signal" />
                              <Scatter data={visibleTrades.filter(t => t.type === 'sell').map(t => ({ time: t.time, price: t.price }))} fill="#ef4444" name="Sell Signal" />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Upload Data */}
                          <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium">Upload OHLCV Data:</label>
                            <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="mb-2" />
                            {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Panel */}
                    <div className="space-y-6">
                      {/* Metrics Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Total P&L</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-lg font-bold ${performanceMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${performanceMetrics.totalPnL}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold">{performanceMetrics.winRate}%</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Equity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold">${performanceMetrics.equity}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Drawdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold text-red-600">{performanceMetrics.drawdown}%</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Trades */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Recent Trades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {visibleTrades.map((trade) => (
                              <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                                  }`} />
                                  <div>
                                    <div className="text-sm font-medium">
                                      {trade.type.toUpperCase()} @ {trade.price}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{trade.time}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${
                                    trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ${trade.profit}
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    trade.status === 'open' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {trade.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Equity Curve */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Equity Curve</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Test;