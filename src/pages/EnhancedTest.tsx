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
import { Play, Pause, Square, Upload, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Percent, Target, MessageSquare, Code, Download, Settings, FileText, Send, X, Sparkles, User, Bot, Mic, ArrowUp } from 'lucide-react';
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
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

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

  // Enhanced AI chat functionality similar to the main ChatInterface
  const handleMiniChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!miniChatInput.trim()) return;
    
    const userMsg: { role: 'user' | 'ai'; content: string } = { role: 'user', content: miniChatInput };
    setMiniChatMessages((msgs) => [...msgs, userMsg]);
    const currentInput = miniChatInput;
    setMiniChatInput('');
    setIsAiTyping(true);
    
    try {
      // Call our edge function for AI response
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          context: "You are an AI trading strategy assistant. Provide helpful advice about trading strategies, indicators, risk management, and market analysis. Keep responses concise and actionable."
        }),
      });
      
      const data = await response.json();
      const aiResponse = data.response || "I'm here to help with your trading strategy. Could you please rephrase your question?";
      
      setMiniChatMessages((msgs) => [...msgs, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      // Fallback to local responses
      let aiResponse = "I'm analyzing your request...";
      
      if (currentInput.toLowerCase().includes('indicator')) {
        aiResponse = "I can help you add indicators like RSI, MACD, or Bollinger Bands. Which specific indicator would you like to implement for better signal accuracy?";
      } else if (currentInput.toLowerCase().includes('backtest')) {
        aiResponse = "Great! I can run a backtest analysis. Based on current settings, your strategy shows promising signals. Would you like me to optimize the parameters for better performance?";
      } else if (currentInput.toLowerCase().includes('optimize')) {
        aiResponse = "I'll analyze your strategy parameters. Consider adjusting stop loss to 1.5% and take profit to 3% for better risk-reward ratio. Should I apply these changes?";
      } else if (currentInput.toLowerCase().includes('risk')) {
        aiResponse = "Risk management is crucial. I recommend a maximum 2% risk per trade and position sizing based on volatility. Should I adjust these settings for your strategy?";
      } else {
        aiResponse = "I understand you want to improve your strategy. I can help with indicator selection, parameter optimization, risk management, or backtesting. What specific area interests you most?";
      }
      
      setMiniChatMessages((msgs) => [...msgs, { role: 'ai', content: aiResponse }]);
    }
    
    setIsAiTyping(false);
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
      <div className="min-h-screen bg-background flex flex-col">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs Section */}
          <div className="flex-1 flex flex-col">
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

              <div className="flex-1 flex flex-col">
                {/* Chart Tab */}
                <TabsContent value="chart" className="flex-1 flex flex-col p-0 m-0">
                  {/* Trading Chart */}
                  <div className="flex-1 min-h-[60vh] w-full">
                    <TradingChart onStrategySelect={handleStrategySelect} onStrategyUpload={handleStrategyUpload} />
                  </div>
                  
                  {/* TradingView-style Strategy Tester Footer */}
                  <div className="bg-card border-t border-border">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-sm font-medium">Strategy Tester</span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Last updated: {new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
                          className="h-7 text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isAiWidgetOpen ? 'Hide AI' : 'AI Assistant'}
                        </Button>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex">
                      {/* Performance Overview */}
                      <div className={`${isAiWidgetOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
                        {/* Key Metrics Row */}
                        <div className="p-4 border-b border-border bg-background/50">
                          <div className="grid grid-cols-8 gap-4">
                            {/* Net Profit */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Net Profit</span>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-success">${backtestResults.totalReturn}</span>
                                <TrendingUp className="w-3 h-3 text-success" />
                              </div>
                              <span className="text-xs text-success">+12.4%</span>
                            </div>

                            {/* Win Rate */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
                              <span className="text-lg font-bold text-primary">{backtestResults.winRate}%</span>
                              <span className="text-xs text-muted-foreground">({Math.round(backtestResults.totalTrades * backtestResults.winRate / 100)} wins)</span>
                            </div>

                            {/* Profit Factor */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Profit Factor</span>
                              <span className="text-lg font-bold text-primary">{backtestResults.profitFactor}</span>
                              <span className="text-xs text-muted-foreground">Excellent</span>
                            </div>

                            {/* Max Drawdown */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Max Drawdown</span>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-destructive">{backtestResults.maxDrawdown}%</span>
                                <TrendingDown className="w-3 h-3 text-destructive" />
                              </div>
                              <span className="text-xs text-destructive">Low risk</span>
                            </div>

                            {/* Total Trades */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Total Trades</span>
                              <span className="text-lg font-bold text-foreground">{backtestResults.totalTrades}</span>
                              <span className="text-xs text-muted-foreground">Active</span>
                            </div>

                            {/* Sharpe Ratio */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Sharpe Ratio</span>
                              <span className="text-lg font-bold text-orange-500">{backtestResults.sharpeRatio}</span>
                              <span className="text-xs text-muted-foreground">Strong</span>
                            </div>

                            {/* Avg Win */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Avg Win</span>
                              <span className="text-lg font-bold text-success">${backtestResults.avgWin}</span>
                              <span className="text-xs text-muted-foreground">Per trade</span>
                            </div>

                            {/* Avg Loss */}
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground mb-1">Avg Loss</span>
                              <span className="text-lg font-bold text-destructive">${Math.abs(backtestResults.avgLoss)}</span>
                              <span className="text-xs text-muted-foreground">Per trade</span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Stats Table */}
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Performance Stats */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3 text-foreground">Performance</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Total Return</span>
                                  <span className="font-medium text-success">+{((backtestResults.totalReturn / 10000) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Annual Return</span>
                                  <span className="font-medium">+24.8%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Monthly Return</span>
                                  <span className="font-medium">+2.1%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Best Trade</span>
                                  <span className="font-medium text-success">+$450.23</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Worst Trade</span>
                                  <span className="font-medium text-destructive">-$234.56</span>
                                </div>
                              </div>
                            </div>

                            {/* Risk Stats */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3 text-foreground">Risk Management</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Largest Winning Streak</span>
                                  <span className="font-medium">8 trades</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Largest Losing Streak</span>
                                  <span className="font-medium">3 trades</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Recovery Factor</span>
                                  <span className="font-medium">6.89</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Calmar Ratio</span>
                                  <span className="font-medium">2.01</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Sortino Ratio</span>
                                  <span className="font-medium">2.34</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* AI Assistant Widget */}
                      {isAiWidgetOpen && (
                        <div className="w-1/3 border-l border-border bg-card">
                          <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="p-3 border-b border-border bg-muted/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                  <span className="text-sm font-medium">AI Assistant</span>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setIsAiWidgetOpen(false)}
                                  className="h-6 w-6"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                              {miniChatMessages.length === 0 ? (
                                <div className="text-center py-4">
                                  <Bot className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                                  <p className="text-sm font-medium mb-1">AI Ready</p>
                                  <p className="text-xs text-muted-foreground">Ask about strategy optimization</p>
                                </div>
                              ) : (
                                miniChatMessages.map((msg, idx) => (
                                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'ai' && (
                                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                                      </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs ${
                                      msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}>
                                      {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <User className="w-2.5 h-2.5 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                              {isAiTyping && (
                                <div className="flex gap-2">
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-primary-foreground animate-pulse" />
                                  </div>
                                  <div className="bg-muted rounded-lg px-2.5 py-1.5 text-xs">
                                    <div className="flex items-center gap-1">
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Input */}
                            <div className="p-3 border-t border-border">
                              <form onSubmit={handleMiniChatSend} className="flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-background border border-border focus:border-primary/50 focus:outline-none"
                                  placeholder="Ask about strategy optimization..."
                                  value={miniChatInput}
                                  onChange={e => setMiniChatInput(e.target.value)}
                                />
                                <Button 
                                  type="submit" 
                                  size="icon" 
                                  disabled={!miniChatInput.trim() || isAiTyping}
                                  className="h-8 w-8"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}
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