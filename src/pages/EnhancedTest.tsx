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
                    
                    {/* Bottom Footer - Performance Metrics + AI Widget */}
                    <div className="h-64 w-full flex flex-row border-t border-border bg-background relative">
                      {/* Performance Metrics - Full width when AI widget is closed */}
                      <div className={`${isAiWidgetOpen ? 'w-1/2' : 'w-full'} p-6 bg-gradient-to-br from-background to-muted/10 transition-all duration-300`}>
                        <div className="h-full flex flex-col">
                          <div className="font-semibold text-lg mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-primary" />
                              <span>Live Performance Analytics</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
                              className="flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" />
                              {isAiWidgetOpen ? 'Hide AI' : 'AI Assistant'}
                            </Button>
                          </div>
                          
                          <div className="flex-1 bg-background/50 rounded-xl p-6 border border-border/30 mx-4">
                            <div className={`grid ${isAiWidgetOpen ? 'grid-cols-2' : 'grid-cols-4'} gap-6 h-full transition-all duration-300`}>
                              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-success/10 to-success/5 rounded-lg border border-success/20 p-3">
                                <TrendingUp className="w-6 h-6 text-success mb-2" />
                                <span className="text-xs text-muted-foreground mb-1">Total P&L</span>
                                <span className={`${isAiWidgetOpen ? 'text-lg' : 'text-xl'} font-bold text-success`}>${backtestResults.totalReturn}</span>
                                {!isAiWidgetOpen && (
                                  <span className="text-xs text-muted-foreground mt-1">+12.4% this month</span>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 p-3">
                                <Target className="w-6 h-6 text-blue-600 mb-2" />
                                <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
                                <span className={`${isAiWidgetOpen ? 'text-lg' : 'text-xl'} font-bold text-blue-600`}>{backtestResults.winRate}%</span>
                                {!isAiWidgetOpen && (
                                  <span className="text-xs text-muted-foreground mt-1">Above average</span>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-3">
                                <BarChart3 className="w-6 h-6 text-primary mb-2" />
                                <span className="text-xs text-muted-foreground mb-1">Profit Factor</span>
                                <span className={`${isAiWidgetOpen ? 'text-lg' : 'text-xl'} font-bold text-primary`}>{backtestResults.profitFactor}</span>
                                {!isAiWidgetOpen && (
                                  <span className="text-xs text-muted-foreground mt-1">Excellent ratio</span>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-destructive/10 to-destructive/5 rounded-lg border border-destructive/20 p-3">
                                <TrendingDown className="w-6 h-6 text-destructive mb-2" />
                                <span className="text-xs text-muted-foreground mb-1">Max Drawdown</span>
                                <span className={`${isAiWidgetOpen ? 'text-lg' : 'text-xl'} font-bold text-destructive`}>{backtestResults.maxDrawdown}%</span>
                                {!isAiWidgetOpen && (
                                  <span className="text-xs text-muted-foreground mt-1">Low risk</span>
                                )}
                              </div>
                              
                              {!isAiWidgetOpen && (
                                <>
                                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg border border-border p-3">
                                    <Clock className="w-6 h-6 text-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground mb-1">Total Trades</span>
                                    <span className="text-xl font-bold text-foreground">{backtestResults.totalTrades}</span>
                                    <span className="text-xs text-muted-foreground mt-1">Active trading</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20 p-3">
                                    <Percent className="w-6 h-6 text-orange-600 mb-2" />
                                    <span className="text-xs text-muted-foreground mb-1">Sharpe Ratio</span>
                                    <span className="text-xl font-bold text-orange-600">{backtestResults.sharpeRatio}</span>
                                    <span className="text-xs text-muted-foreground mt-1">Strong performance</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20 p-3">
                                    <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                                    <span className="text-xs text-muted-foreground mb-1">Avg Win</span>
                                    <span className="text-xl font-bold text-green-600">${backtestResults.avgWin}</span>
                                    <span className="text-xs text-muted-foreground mt-1">Per trade</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-red-500/10 to-red-500/5 rounded-lg border border-red-500/20 p-3">
                                    <TrendingDown className="w-6 h-6 text-red-600 mb-2" />
                                    <span className="text-xs text-muted-foreground mb-1">Avg Loss</span>
                                    <span className="text-xl font-bold text-red-600">${Math.abs(backtestResults.avgLoss)}</span>
                                    <span className="text-xs text-muted-foreground mt-1">Per trade</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* AI Assistant Widget - Slides in from right */}
                      <div className={`${isAiWidgetOpen ? 'w-1/2 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 overflow-hidden border-l border-border bg-gradient-to-br from-background to-muted/20`}>
                        {isAiWidgetOpen && (
                          <div className="w-full h-full p-6">
                            <div className="h-full flex flex-col">
                              <div className="font-semibold text-lg mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                                  </div>
                                  <span>AI Strategy Assistant</span>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setIsAiWidgetOpen(false)}
                                  className="w-6 h-6"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Messages Area */}
                              <div className="flex-1 overflow-y-auto bg-background/50 rounded-xl p-3 border border-border/50 mb-3 space-y-2">
                                {miniChatMessages.length === 0 ? (
                                  <div className="text-sm text-muted-foreground text-center py-4">
                                    <Bot className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                                    <p className="font-medium mb-1">AI Assistant Ready</p>
                                    <p className="text-xs">Ask me about strategy optimization, indicators, or market analysis.</p>
                                  </div>
                                ) : (
                                  miniChatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      {msg.role === 'ai' && (
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                                        </div>
                                      )}
                                      <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                                        msg.role === 'user' 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted text-foreground border border-border/30'
                                      }`}>
                                        {msg.content}
                                      </div>
                                      {msg.role === 'user' && (
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                          <User className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                                {isAiTyping && (
                                  <div className="flex gap-3 justify-start">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                      <Sparkles className="w-3 h-3 text-primary-foreground animate-pulse" />
                                    </div>
                                    <div className="bg-muted rounded-xl px-3 py-2 text-sm">
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Enhanced Input */}
                              <form className="flex gap-2" onSubmit={handleMiniChatSend}>
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                    placeholder="Ask about indicators, strategy optimization..."
                                    value={miniChatInput}
                                    onChange={e => setMiniChatInput(e.target.value)}
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <Button 
                                      type="button" 
                                      size="icon" 
                                      variant="ghost" 
                                      className="w-6 h-6 hover:bg-muted/50"
                                      title="Voice input"
                                    >
                                      <Mic className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      size="icon" 
                                      disabled={!miniChatInput.trim() || isAiTyping}
                                      className="w-6 h-6 bg-primary hover:bg-primary/90"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}
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