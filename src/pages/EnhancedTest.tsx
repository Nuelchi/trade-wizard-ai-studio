import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import CodeCompiler from "@/components/CodeCompiler";
import { Sparkles, X, Bot, User, ArrowUp, TrendingDown, Clock, TrendingUp, BarChart3, Code, Download, Play, Pause, Upload, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TradingViewWidget from 'react-tradingview-widget';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
// import StrategyTesterFooter from '../../../src/components/StrategyTesterFooter/StrategyTesterFooter';
// import OverviewTab from '../../../src/components/StrategyTesterFooter/OverviewTab';
// import PerformanceTab from '../../../src/components/StrategyTesterFooter/PerformanceTab';
// import TradeAnalysisTab from '../../../src/components/StrategyTesterFooter/TradeAnalysisTab';
import { generateStrategyWithAI } from '@/lib/utils';

// Memoized TradingView chart
interface MemoTradingViewChartProps {
  symbol: string;
  interval: string;
}
const MemoTradingViewChart = memo(({ symbol, interval }: MemoTradingViewChartProps) => (
  <div className="w-full h-[900px] bg-background rounded-lg overflow-hidden">
    <TradingViewWidget
      symbol={symbol}
      interval={interval === '1H' ? '60' : interval}
      theme="Dark"
      locale="en"
      autosize
      style="1" // Use valid style code for dark
      hide_side_toolbar={false}
      allow_symbol_change={true}
      toolbar_bg="#141413"
      enable_publishing={false}
      container_id="tradingview_chart"
      save_image={false}
    />
  </div>
));

// Memoized Chat Widget
interface MemoMiniChatProps {
  miniChatMessages: { role: 'user' | 'ai'; content: string }[];
  miniChatInput: string;
  isAiWidgetOpen: boolean;
  isAiTyping: boolean;
  setMiniChatInput: React.Dispatch<React.SetStateAction<string>>;
  setMiniChatMessages: React.Dispatch<React.SetStateAction<{ role: 'user' | 'ai'; content: string }[]>>;
  setIsAiWidgetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAiTyping: React.Dispatch<React.SetStateAction<boolean>>;
  handleMiniChatSend: (e?: React.FormEvent) => void;
  metrics: {
    winRate: number;
    totalReturn: number;
    profitFactor: number;
    maxDrawdown: number;
    totalTrades: number;
    avgWin: number;
    avgLoss: number;
    sharpeRatio: number;
  };
}
const MemoMiniChat = memo(function MemoMiniChat({
  miniChatMessages,
  miniChatInput,
  isAiWidgetOpen,
  isAiTyping,
  setMiniChatInput,
  setMiniChatMessages,
  setIsAiWidgetOpen,
  setIsAiTyping,
  handleMiniChatSend,
  metrics
}: MemoMiniChatProps) {
  const [activeFooterTab, setActiveFooterTab] = useState('overview');
  return (
    <div className="bg-card border-t border-border mt-6">
      {/* Header with Tabs and AI Assistant Button */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
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
          {/* Tabs in header */}
          <Tabs value={activeFooterTab} onValueChange={setActiveFooterTab} className="ml-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trade_analysis">Trade Analysis</TabsTrigger>
            </TabsList>
          </Tabs>
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
      {/* Main Content Area: Tab Content and AI Chat */}
      <div className="flex">
        {/* Tab Content */}
        <div className={`${isAiWidgetOpen ? 'w-2/3' : 'w-full'} transition-all duration-300 p-4`}> 
          <Tabs value={activeFooterTab} onValueChange={setActiveFooterTab} className="w-full">
            <TabsContent value="overview">
              {/* <OverviewTab metrics={metrics} /> */}
            </TabsContent>
            <TabsContent value="performance">
              {/* <PerformanceTab metrics={metrics} /> */}
            </TabsContent>
            <TabsContent value="trade_analysis">
              {/* <TradeAnalysisTab metrics={metrics} /> */}
            </TabsContent>
          </Tabs>
        </div>
        {/* AI Chat (if open) */}
        {isAiWidgetOpen && (
          <div className="w-1/3 border-l border-border flex flex-col">
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
        )}
      </div>
    </div>
  );
});

const EnhancedTest = () => {
  const [activeTab, setActiveTab] = useState('chart');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('none');
  const [symbol, setSymbol] = useState('EUR/USD');
  const [interval, setInterval] = useState('1H');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [miniChatMessages, setMiniChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>(() => {
    try {
      const saved = localStorage.getItem('enhancedTestMiniChatMessages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [miniChatInput, setMiniChatInput] = useState(() => {
    try {
      return localStorage.getItem('enhancedTestMiniChatInput') || '';
    } catch {
      return '';
    }
  });
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
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
  const [strategyCode, setStrategyCode] = useState('');
  const [pineScript, setPineScript] = useState('');
  const [mql4Code, setMql4Code] = useState('');
  const [mql5Code, setMql5Code] = useState('');
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Database['public']['Tables']['strategies']['Row'][]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoadingStrategies(true);
    supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setStrategies(data || []);
        setLoadingStrategies(false);
      });
  }, [user]);

  // When a user selects a strategy, load its chat_history and code fields into state for AI context and code tabs
  useEffect(() => {
    if (selectedStrategy === 'none') {
      setMiniChatMessages([]);
      setStrategyCode('');
      setPineScript('');
      setMql4Code('');
      setMql5Code('');
      return;
    }
    const strat = strategies.find((s) => s.id === selectedStrategy);
    if (strat) {
      if (Array.isArray(strat.chat_history)) {
        setMiniChatMessages(strat.chat_history as any[]);
      }
      if (typeof strat.code === 'object' && strat.code !== null && !Array.isArray(strat.code)) {
        setStrategyCode((strat.code as any).main || '');
        setPineScript((strat.code as any).pineScript || '');
        setMql4Code((strat.code as any).mql4 || '');
        setMql5Code((strat.code as any).mql5 || '');
      } else {
        setStrategyCode('');
        setPineScript('');
        setMql4Code('');
        setMql5Code('');
      }
    }
  }, [selectedStrategy, strategies]);

  // Mock metrics
  const metrics = {
    winRate: 67.5,
    totalReturn: 847.56,
    profitFactor: 1.84,
    maxDrawdown: 12.3,
    totalTrades: 234,
    avgWin: 156.34,
    avgLoss: -89.12,
    sharpeRatio: 1.67,
  };

  // Persist chat messages and input on change
  useEffect(() => {
    localStorage.setItem('enhancedTestMiniChatMessages', JSON.stringify(miniChatMessages));
  }, [miniChatMessages]);
  useEffect(() => {
    localStorage.setItem('enhancedTestMiniChatInput', miniChatInput);
  }, [miniChatInput]);

  // Autosave strategy chat/code changes in real time
  useEffect(() => {
    if (!user || selectedStrategy === 'none') return;
    const strat = strategies.find((s) => s.id === selectedStrategy);
    if (!strat) return;
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(async () => {
      const { error } = await supabase
        .from('strategies')
        .update({
          chat_history: miniChatMessages,
          code: {
            main: strategyCode,
            pineScript,
            mql4: mql4Code,
            mql5: mql5Code,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedStrategy);
      if (error) {
        toast(`Autosave failed: ${error.message}`);
      }
    }, 2000);
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
  }, [miniChatMessages, strategyCode, pineScript, mql4Code, mql5Code, selectedStrategy, user, strategies]);

  const handleMiniChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!miniChatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: miniChatInput };
    setMiniChatMessages((msgs) => [...msgs, userMsg]);
    const currentInput = miniChatInput;
    setMiniChatInput('');
    setIsAiTyping(true);
    try {
      // Use the same AI API as the main app
      const aiResult = await generateStrategyWithAI(currentInput);
      const aiResponse = aiResult.summary || "I'm here to help with your trading strategy. Could you please rephrase your question?";
      setMiniChatMessages((msgs) => [...msgs, { role: 'ai' as const, content: aiResponse }]);
    } catch (err) {
      setMiniChatMessages((msgs) => [...msgs, { role: 'ai' as const, content: 'AI error: ' + (err.message || String(err)) }]);
    }
    setIsAiTyping(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tab Header with Select Strategy and Upload Icon on the left */}
      <div className="border-b border-border bg-muted/20 flex items-center px-6 pt-4 pb-2">
        {/* Tab Buttons */}
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-sm ${activeTab === 'chart' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
          onClick={() => setActiveTab('chart')}
        >
          <BarChart3 className="w-4 h-4" /> Chart & Signals
        </button>
        {/* Removed Performance tab button */}
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-sm ${activeTab === 'code' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
          onClick={() => setActiveTab('code')}
        >
          <Code className="w-4 h-4" /> Strategy Code
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-sm ${activeTab === 'export' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
          onClick={() => setActiveTab('export')}
        >
          <Download className="w-4 h-4" /> Export
        </button>
        <div className="flex-1" />
        {activeTab === 'chart' && (
          <>
            <Button size="sm" variant="default" className="ml-auto" onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <><Pause className="w-4 h-4 mr-1" />Stop</> : <><Play className="w-4 h-4 mr-1" />Run</>}
            </Button>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy} disabled={loadingStrategies || !user}>
              <SelectTrigger className="w-48 ml-4">
                <SelectValue placeholder={loadingStrategies ? 'Loading...' : 'Choose a strategy'} />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {strategies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-medium">{s.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            <label className="flex items-center gap-2 cursor-pointer ml-2">
              <Button size="icon" variant="outline" asChild>
                <Upload className="w-5 h-5" />
              </Button>
              <input type="file" className="hidden" accept=".mq4,.mq5" onChange={e => {
                const file = e.target.files?.[0] || null;
                if (file && !/\.(mq4|mq5)$/i.test(file.name)) {
                  alert('Only .mq4 or .mq5 files are allowed.');
                  return;
                }
                setUploadedFile(file);
              }} />
            </label>
          </>
                )}
              </div>
              
      {/* Tabs Content */}
      {activeTab === 'chart' && (
        <div className="flex-1 flex flex-col px-6 py-4">
          <Card className="w-full h-full p-6 flex flex-col gap-6">
            {/* Chart Preview */}
            <div className="flex flex-col gap-2">
              {/* Real TradingView Chart - no default studies */}
              <MemoTradingViewChart symbol={symbol} interval={interval} />
            </div>
            {/* Strategy Tester Footer Tabs (Overview, Performance, Trade Analysis) */}
            <MemoMiniChat
              miniChatMessages={miniChatMessages}
              miniChatInput={miniChatInput}
              isAiWidgetOpen={isAiWidgetOpen}
              isAiTyping={isAiTyping}
              setMiniChatInput={setMiniChatInput}
              setMiniChatMessages={setMiniChatMessages}
              setIsAiWidgetOpen={setIsAiWidgetOpen}
              setIsAiTyping={setIsAiTyping}
              handleMiniChatSend={handleMiniChatSend}
              metrics={metrics}
            />
                    </Card>
                  </div>
      )}
      {activeTab === 'performance' && (
        <Card className="trading-card m-6">
                    <CardHeader>
                      <CardTitle>Strategy Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-success">{metrics.winRate}%</div>
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">{metrics.totalTrades}</div>
                          <div className="text-sm text-muted-foreground">Total Trades</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-warning">{metrics.profitFactor}</div>
                          <div className="text-sm text-muted-foreground">Profit Factor</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-danger">{metrics.maxDrawdown}%</div>
                          <div className="text-sm text-muted-foreground">Max Drawdown</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
      )}
      {activeTab === 'code' && (
        <Card className="trading-card m-6">
                    <CardHeader>
                      <CardTitle>Strategy Code Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="pineScript">
                        <TabsList>
                          <TabsTrigger value="pineScript">Pine Script</TabsTrigger>
                          <TabsTrigger value="mql4">MQL4</TabsTrigger>
                          <TabsTrigger value="mql5">MQL5</TabsTrigger>
                          <TabsTrigger value="view">View Generated</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pineScript" className="space-y-4">
                          <Textarea
                            placeholder="Edit Pine Script code..."
                            value={pineScript}
                            onChange={(e) => setPineScript(e.target.value)}
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </TabsContent>
                        <TabsContent value="mql4" className="space-y-4">
                          <Textarea
                            placeholder="Edit MQL4 code..."
                            value={mql4Code}
                            onChange={(e) => setMql4Code(e.target.value)}
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </TabsContent>
                        <TabsContent value="mql5" className="space-y-4">
                          <Textarea
                            placeholder="Edit MQL5 code..."
                            value={mql5Code}
                            onChange={(e) => setMql5Code(e.target.value)}
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
      )}
      {activeTab === 'export' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Export Tab Content: Full Export Page UI/Logic (minus back button and duplicate title/desc) */}
          <ExportTabFull strategies={strategies} loadingStrategies={loadingStrategies} />
        </div>
      )}
    </div>
  );
};

function ExportTabFull({ strategies, loadingStrategies }) {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [compiledFile, setCompiledFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const formats = [
    { id: 'pinescript', name: 'Pine Script', description: 'For TradingView platform', extension: '.pine' },
    { id: 'mql4', name: 'MQL4', description: 'For MetaTrader 4 platform', extension: '.mq4' },
    { id: 'mql5', name: 'MQL5', description: 'For MetaTrader 5 platform', extension: '.mq5' },
  ];
  const handleAIConvert = async () => {
    if (!selectedStrategy || !selectedFormat) {
      toast('Please select both a strategy and format to convert');
      return;
    }
    setIsConverting(true);
    setCompiledFile(null);
    setConvertedCode('');
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId: selectedStrategy, format: selectedFormat.toUpperCase() })
      });
      const data = await res.json();
      if (data.success) {
        setConvertedCode(data.code);
        if (data.compiledFileName && data.compiledContent) {
          setCompiledFile({
            name: data.compiledFileName,
            content: data.compiledContent,
            extension: formats.find(f => f.id === selectedFormat)?.extension || ''
          });
          toast('Compiled successfully!');
        } else {
          setCompiledFile(null);
          toast('Code ready!');
        }
      } else {
        toast('Conversion failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      toast('Conversion error: ' + err.message);
    }
    setIsConverting(false);
  };
  const handleDownload = () => {
    if (compiledFile) {
      // Download compiled file (base64 decode)
      const byteCharacters = atob(compiledFile.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = compiledFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast('Download started!');
    } else if (convertedCode) {
      // Download plain code
      const format = formats.find(f => f.id === selectedFormat);
      const strategy = strategies.find(s => s.id === selectedStrategy);
      const filename = `${strategy?.title?.replace(/\s+/g, '_') || 'strategy'}_${selectedFormat}${format?.extension}`;
      const blob = new Blob([convertedCode], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast('Download started!');
    } else {
      toast('No code to download. Please convert a strategy first.');
    }
  };
  const handleCopy = () => {
    if (convertedCode) {
      navigator.clipboard.writeText(convertedCode);
      toast('Code copied to clipboard!');
    } else {
      toast('No code to copy. Please convert a strategy first.');
    }
  };
  return (
    <div className="space-y-8">
      {/* Strategy and Format Selection - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Selection */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Select Strategy</CardTitle>
            <CardDescription>Choose which strategy you want to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy} disabled={loadingStrategies}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStrategies ? 'Loading...' : 'Choose a strategy to export'} />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    <span className="font-medium">{strategy.title || strategy.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStrategy && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-2">Selected Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  {strategies.find(s => s.id === selectedStrategy)?.description || strategies.find(s => s.id === selectedStrategy)?.desc}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Format Selection */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Select Format</CardTitle>
            <CardDescription>Choose the platform format for your strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Choose export format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    <div className="flex items-center space-x-3">
                      {format.id === 'pinescript' ? (
                        <Code className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{format.name}</span>
                        <span className="text-xs text-muted-foreground">{format.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAIConvert}
              disabled={!selectedStrategy || !selectedFormat || isConverting}
              className="w-full glow-button"
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Convert Strategy
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Conversion Results - Full Width Below */}
      {convertedCode ? (
        <div className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Conversion Complete!</CardTitle>
              <CardDescription>
                {compiledFile
                  ? `Your strategy has been compiled to ${compiledFile.name}`
                  : `Your strategy has been converted to ${formats.find(f => f.id === selectedFormat)?.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {compiledFile && (
                  <Button onClick={handleDownload} className="glow-button">
                    <Download className="w-4 h-4 mr-2" />
                    Download {compiledFile.extension}
                  </Button>
                )}
                <Button onClick={handleCopy} variant="outline">
                  Copy Code
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Code Preview</CardTitle>
              <CardDescription>Review your converted strategy code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <pre className="bg-muted/30 rounded p-4 text-xs font-mono overflow-x-auto">
                  {convertedCode}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Ready to Convert</CardTitle>
            <CardDescription>Select a strategy and format to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Choose your strategy and target platform, then click "AI Convert Strategy" to generate optimized code.</p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Deploy & Share Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Deploy & Share</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* VPS Deployment */}
          <Card className="trading-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary"></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>VPS Deployment</span>
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </CardTitle>
                    <CardDescription>Deploy your strategy to a Virtual Private Server for 24/7 trading</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>24/7 uptime</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Low latency</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Multiple brokers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Real-time monitoring</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Starting at $29/month</span>
                  <Button 
                    onClick={() => toast('We\'ll notify you when VPS deployment is available!')}
                    variant="outline"
                  >
                    Notify Me
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Algorithm Hub */}
          <Card className="trading-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Algorithm Hub</span>
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </CardTitle>
                    <CardDescription>Share your strategy with the Trainflow community</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Strategy marketplace</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Performance tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Copy trading</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Revenue sharing</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Free to publish</span>
                  <Button 
                    onClick={() => toast('We\'ll notify you when Algorithm Hub launches!')}
                    variant="outline"
                  >
                    Notify Me
                  </Button>
                </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EnhancedTest;
