import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AuthGuard from "@/components/AuthGuard";
import CodeCompiler from "@/components/CodeCompiler";
import { Play, Pause, Square, Upload, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Percent, Target, MessageSquare, Code, Download, Settings, FileText, Send, X } from 'lucide-react';
import { toast } from "sonner";
import TradingChartRaw from '@/components/TradingChart';

const TradingChart = React.memo(TradingChartRaw);

const EnhancedTest = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [strategyCode, setStrategyCode] = useState('');
  const [pineScript, setPineScript] = useState('');
  const [mql4Code, setMql4Code] = useState('');
  const [mql5Code, setMql5Code] = useState('');
  // Restore local chat state
  const [miniChatMessages, setMiniChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [miniChatInput, setMiniChatInput] = useState('');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  
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
    { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103 },
    { time: '2024-01-02', open: 103, high: 108, low: 101, close: 106 },
    { time: '2024-01-03', open: 106, high: 109, low: 104, close: 107 },
    { time: '2024-01-04', open: 107, high: 112, low: 105, close: 110 },
    { time: '2024-01-05', open: 110, high: 115, low: 108, close: 113 },
    { time: '2024-01-06', open: 113, high: 116, low: 111, close: 114 },
    { time: '2024-01-07', open: 114, high: 118, low: 112, close: 117 },
  ]);

  const availableStrategies = [
    'Moving Average Crossover',
    'RSI Reversal',
    'Bollinger Bands Breakout',
    'MACD Momentum',
    'Support & Resistance'
  ];

  // Minimal local chat send handler
  const handleMiniChatSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!miniChatInput.trim()) return;
    const userMsg: { role: 'user' | 'ai'; content: string } = { role: 'user', content: miniChatInput };
    setMiniChatMessages((msgs) => [...msgs, userMsg]);
    setMiniChatInput('');
    // Simulate AI response
    setTimeout(() => {
      setMiniChatMessages((msgs) => [...msgs, { role: 'ai', content: "I'm a mini AI. This is a test response." }]);
    }, 800);
  };

  // In EnhancedTest, define handlers:
  const handleStrategySelect = (strategy: any) => {
    setSelectedStrategy(strategy);
    setStrategyCode(strategy.code || '');
    setBacktestResults(strategy.analytics || {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      totalReturn: 0,
      avgWin: 0,
      avgLoss: 0,
      sharpeRatio: 0
    });
  };
  const handleStrategyUpload = (strategy) => {
    // Same as select, but can show a toast or highlight
    handleStrategySelect(strategy);
    toast.success('Strategy uploaded and loaded!');
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen h-screen bg-background flex flex-col">
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

        {/* Main Content - Full Height Layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Removed strategy selection/upload/timeframe row here */}
          {/* Tabs Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
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

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Chart Tab - Full Height Layout */}
                <TabsContent value="chart" className="flex-1 h-full w-full min-h-0 p-0 m-0 flex flex-col">
                  <div className="flex-1 min-h-0 flex flex-col">
                    {/* Trading Chart - Full Width */}
                    <div className="flex-1 min-h-0 w-full">
                      <TradingChart onStrategySelect={handleStrategySelect} onStrategyUpload={handleStrategyUpload} />
                    </div>
                    
                    {/* Bottom Footer - Mini Chat + Metrics */}
                    <div className="h-48 w-full flex flex-row border-t border-border bg-background">
                      {/* Left: Mini Chat */}
                      <div className="flex-1 p-4 border-r border-border">
                        <div className="mb-4">
                          <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Mini Strategy Chat
                          </div>
                          <div className="flex flex-col h-24 overflow-y-auto bg-muted/10 rounded p-2 border border-border mb-2">
                            {miniChatMessages.length === 0 ? (
                              <div className="text-xs text-muted-foreground text-center py-2">No messages yet. Try asking the mini AI something about your strategy.</div>
                            ) : (
                              miniChatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
                                  <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border border-border'}`}>
                                    {msg.content}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <form className="flex gap-2" onSubmit={handleMiniChatSend}>
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 rounded bg-background text-base border border-border focus:outline-none"
                              placeholder="Ask the mini AI..."
                              value={miniChatInput}
                              onChange={e => setMiniChatInput(e.target.value)}
                            />
                            <Button size="icon" type="submit" disabled={!miniChatInput.trim()}>
                              <Send className="w-5 h-5" />
                            </Button>
                          </form>
                        </div>
                      </div>
                      
                      {/* Right: Metrics */}
                      <div className="w-96 p-4">
                        <div className="font-semibold text-lg mb-2">Live Performance Metrics</div>
                        <div className="flex flex-row gap-4 justify-between items-center flex-wrap">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">Total P&L</span>
                            <span className="text-xl font-bold text-success">${backtestResults.totalReturn}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
                            <span className="text-xl font-bold text-blue-600">{backtestResults.winRate}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">Profit Factor</span>
                            <span className="text-xl font-bold text-black">{backtestResults.profitFactor}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">Max Drawdown</span>
                            <span className="text-xl font-bold text-danger">{backtestResults.maxDrawdown}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">Total Trades</span>
                            <span className="text-xl font-bold">{backtestResults.totalTrades}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="h-full m-0 p-6">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle>Strategy Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
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
      </div>
    </AuthGuard>
  );
};

export default EnhancedTest;