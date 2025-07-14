import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ChatInterface from "@/components/ChatInterface";
import AuthGuard from "@/components/AuthGuard";
import CodeCompiler from "@/components/CodeCompiler";
import { Play, Pause, Square, Upload, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Percent, Target, MessageSquare, Code, Download, Settings, FileText } from 'lucide-react';
import { toast } from "sonner";

const EnhancedTest = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [strategyCode, setStrategyCode] = useState('');
  const [pineScript, setPineScript] = useState('');
  const [mql4Code, setMql4Code] = useState('');
  const [mql5Code, setMql5Code] = useState('');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const [backtestResults, setBacktestResults] = useState({
    totalTrades: 234,
    winRate: 67.5,
    profitFactor: 1.84,
    maxDrawdown: 12.3,
    totalReturn: 847.56,
    avgWin: 156.34,
    avgLoss: -89.12,
    sharpeRatio: 1.67
  });

  const [performanceData, setPerformanceData] = useState([
    { date: '2024-01', value: 10000, trades: 12 },
    { date: '2024-02', value: 10500, trades: 15 },
    { date: '2024-03', value: 11200, trades: 18 },
    { date: '2024-04', value: 10800, trades: 14 },
    { date: '2024-05', value: 12100, trades: 22 },
    { date: '2024-06', value: 11900, trades: 19 },
    { date: '2024-07', value: 13200, trades: 25 },
  ]);

  const [priceData, setPriceData] = useState([
    { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103, volume: 1000 },
    { time: '2024-01-02', open: 103, high: 108, low: 101, close: 106, volume: 1200 },
    { time: '2024-01-03', open: 106, high: 109, low: 104, close: 107, volume: 900 },
    { time: '2024-01-04', open: 107, high: 112, low: 105, close: 110, volume: 1500 },
    { time: '2024-01-05', open: 110, high: 115, low: 108, close: 113, volume: 1100 },
    { time: '2024-01-06', open: 113, high: 116, low: 111, close: 114, volume: 950 },
    { time: '2024-01-07', open: 114, high: 118, low: 112, close: 117, volume: 1300 },
  ]);

  const availableStrategies = [
    'Moving Average Crossover',
    'RSI Reversal',
    'Bollinger Bands Breakout',
    'MACD Momentum',
    'Support & Resistance'
  ];

  // Chart data for display
  const chartData = priceData.map(item => ({
    time: item.time,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume
  }));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`Uploaded ${file.name}`);
      
      // Read file content for strategy testing
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setStrategyCode(content);
        
        // Parse different file types
        if (file.name.endsWith('.pine')) {
          setPineScript(content);
        } else if (file.name.endsWith('.mq4')) {
          setMql4Code(content);
        } else if (file.name.endsWith('.mq5')) {
          setMql5Code(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const runBacktest = () => {
    if (!selectedStrategy && !uploadedFile) {
      toast.error('Please select a strategy or upload a file');
      return;
    }
    
    setBacktestRunning(true);
    toast.info('Starting backtest...');
    
    setTimeout(() => {
      setBacktestRunning(false);
      toast.success('Backtest completed!');
      
      // Simulate updating results
      setBacktestResults(prev => ({
        ...prev,
        totalTrades: Math.floor(Math.random() * 300) + 100,
        winRate: Math.floor(Math.random() * 30) + 55,
        profitFactor: +(Math.random() * 2 + 0.5).toFixed(2),
        totalReturn: +(Math.random() * 1000 + 200).toFixed(2),
      }));
    }, 3000);
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Strategy Tester</h1>
                  <p className="text-sm text-muted-foreground">Professional trading strategy backtesting platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Resizable Chat */}
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-73px)]">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full border-r border-border bg-background">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              
              <ChatInterface 
                onStrategyGenerated={(strategy) => {
                  setSelectedStrategy(strategy.name || '');
                  setPineScript(strategy.pineScript || '');
                  setMql4Code(strategy.mql4Code || '');
                  setMql5Code(strategy.mql5Code || '');
                }}
                onCodeGenerated={(code) => {
                  setStrategyCode(code.content || '');
                  setPineScript(code.pineScript || '');
                  setMql4Code(code.mql4Code || '');
                  setMql5Code(code.mql5Code || '');
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full flex flex-col">
              {/* Strategy Selection */}
              <div className="border-b border-border p-4 bg-muted/20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Strategy</label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStrategies.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Strategy File</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pine,.mq4,.mq5,.txt"
                        onChange={handleFileUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {uploadedFile && (
                      <Badge variant="outline" className="text-xs">
                        {uploadedFile.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backtest Controls</label>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={runBacktest}
                        disabled={backtestRunning}
                        size="sm"
                        className="glow-button flex-1"
                      >
                        {backtestRunning ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run
                          </>
                        )}
                      </Button>
                      
                      <Button variant="outline" size="sm" disabled={!backtestRunning}>
                        <Pause className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm" disabled={!backtestRunning}>
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol & Timeframe</label>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="EURUSD">
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EURUSD">EUR/USD</SelectItem>
                          <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                          <SelectItem value="USDJPY">USD/JPY</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="1H">
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1M">1M</SelectItem>
                          <SelectItem value="5M">5M</SelectItem>
                          <SelectItem value="15M">15M</SelectItem>
                          <SelectItem value="1H">1H</SelectItem>
                          <SelectItem value="4H">4H</SelectItem>
                          <SelectItem value="1D">1D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="border-b border-border bg-muted/20">
                    <TabsList className="ml-4">
                      <TabsTrigger value="chart" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Chart & Signals
                      </TabsTrigger>
                      <TabsTrigger value="performance" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Performance
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Strategy Code
                      </TabsTrigger>
                      <TabsTrigger value="export" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-auto">
                    {/* Chart Tab */}
                    <TabsContent value="chart" className="h-full m-0 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                        {/* TradingView-style Chart */}
                        <Card className="trading-card lg:col-span-3">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                EURUSD • 1H
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Badge variant="outline">Live</Badge>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[500px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis 
                                    dataKey="time" 
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                  />
                                  <YAxis 
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--background))', 
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px'
                                    }}
                                    formatter={(value, name) => [
                                      typeof value === 'number' ? value.toFixed(4) : value,
                                      name
                                    ]}
                                  />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="close" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={2}
                                    name="Close Price"
                                    dot={false}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="high" 
                                    stroke="hsl(var(--success))" 
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    name="High"
                                    dot={false}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="low" 
                                    stroke="hsl(var(--danger))" 
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    name="Low"
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Performance Metrics Sidebar */}
                        <Card className="trading-card">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-success" />
                              Live Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                <div className="text-center p-3 bg-success/10 rounded-lg">
                                  <div className="text-lg font-bold text-success">{backtestResults.winRate}%</div>
                                  <div className="text-xs text-muted-foreground">Win Rate</div>
                                </div>
                                <div className="text-center p-3 bg-primary/10 rounded-lg">
                                  <div className="text-lg font-bold text-primary">${backtestResults.totalReturn}</div>
                                  <div className="text-xs text-muted-foreground">Total Return</div>
                                </div>
                                <div className="text-center p-3 bg-warning/10 rounded-lg">
                                  <div className="text-lg font-bold text-warning">{backtestResults.profitFactor}</div>
                                  <div className="text-xs text-muted-foreground">Profit Factor</div>
                                </div>
                                <div className="text-center p-3 bg-danger/10 rounded-lg">
                                  <div className="text-lg font-bold text-danger">{backtestResults.maxDrawdown}%</div>
                                  <div className="text-xs text-muted-foreground">Max Drawdown</div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Total Trades</span>
                                  <span className="font-medium">{backtestResults.totalTrades}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Avg Win</span>
                                  <span className="font-medium text-success">${backtestResults.avgWin}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Avg Loss</span>
                                  <span className="font-medium text-danger">${backtestResults.avgLoss}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Sharpe Ratio</span>
                                  <span className="font-medium">{backtestResults.sharpeRatio}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="h-full m-0 p-6">
                      <Card className="trading-card">
                        <CardHeader>
                          <CardTitle>Strategy Performance Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-96 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="date" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="hsl(var(--primary))" 
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.2}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                              <div className="text-2xl font-bold text-success">{backtestResults.winRate}%</div>
                              <div className="text-sm text-muted-foreground">Win Rate</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                              <div className="text-2xl font-bold text-primary">{backtestResults.totalTrades}</div>
                              <div className="text-sm text-muted-foreground">Total Trades</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                              <div className="text-2xl font-bold text-warning">{backtestResults.profitFactor}</div>
                              <div className="text-sm text-muted-foreground">Profit Factor</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                              <div className="text-2xl font-bold text-danger">{backtestResults.maxDrawdown}%</div>
                              <div className="text-sm text-muted-foreground">Max Drawdown</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Code Tab */}
                    <TabsContent value="code" className="h-full m-0 p-6">
                      <Card className="trading-card">
                        <CardHeader>
                          <CardTitle>Strategy Code Editor</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="edit">
                            <TabsList>
                              <TabsTrigger value="edit">Edit Code</TabsTrigger>
                              <TabsTrigger value="view">View Generated</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="edit" className="space-y-4">
                              <Textarea
                                placeholder="Paste your strategy code here or edit the uploaded file..."
                                value={strategyCode}
                                onChange={(e) => setStrategyCode(e.target.value)}
                                className="min-h-[400px] font-mono text-sm"
                              />
                            </TabsContent>
                            
                            <TabsContent value="view" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Pine Script</label>
                                  <pre className="bg-muted/30 rounded p-3 text-xs overflow-auto h-40">
                                    {pineScript || '// Pine Script will appear here after compilation'}
                                  </pre>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">MQL4</label>
                                  <pre className="bg-muted/30 rounded p-3 text-xs overflow-auto h-40">
                                    {mql4Code || '// MQL4 code will appear here after compilation'}
                                  </pre>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">MQL5</label>
                                  <pre className="bg-muted/30 rounded p-3 text-xs overflow-auto h-40">
                                    {mql5Code || '// MQL5 code will appear here after compilation'}
                                  </pre>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Export Tab */}
                    <TabsContent value="export" className="h-full m-0 p-6">
                      <CodeCompiler 
                        pineScript={pineScript || strategyCode}
                        mql4Code={mql4Code || strategyCode}
                        mql5Code={mql5Code || strategyCode}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AuthGuard>
  );
};

export default EnhancedTest;