import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthGuard from "@/components/AuthGuard";
import CodeCompiler from "@/components/CodeCompiler";
import { Play, Pause, Square, Upload, BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Percent, Target, MessageSquare, Code, Download, Settings, FileText, Send, X, Sparkles, User, Bot, Mic, ArrowUp } from 'lucide-react';
import { toast } from "sonner";
import TradingChartRaw from '@/components/TradingChart';

const TradingChart = React.memo(TradingChartRaw);

const EnhancedTest = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('chart');

  const handleStrategySelect = (strategy: any) => {
    setSelectedStrategy(strategy?.id || '');
    toast.success(`Strategy "${strategy?.title}" loaded`);
  };

  const handleStrategyUpload = (strategy: any) => {
    setSelectedStrategy(strategy?.id || '');
    toast.success(`Strategy "${strategy?.title}" uploaded successfully`);
  };

  const startBacktest = () => {
    setBacktestRunning(true);
    setBacktestProgress(0);
    
    const interval = setInterval(() => {
      setBacktestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBacktestRunning(false);
          toast.success("Backtest completed successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Strategy Tester</h1>
                {selectedStrategy && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Strategy Loaded
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {backtestRunning ? (
                  <div className="flex items-center gap-2">
                    <Progress value={backtestProgress} className="w-24" />
                    <Button size="sm" variant="outline" onClick={() => setBacktestRunning(false)}>
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={startBacktest} disabled={!selectedStrategy}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Backtest
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex-shrink-0 border-b border-border bg-background/50 backdrop-blur-sm">
              <div className="container mx-auto px-4">
                <TabsList className="grid w-full grid-cols-4 h-12">
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
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {/* Chart Tab */}
              <TabsContent value="chart" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  {/* Trading Chart Container */}
                  <div className="flex-1 min-h-0 overflow-hidden bg-background">
                    <TradingChart onStrategySelect={handleStrategySelect} onStrategyUpload={handleStrategyUpload} />
                  </div>
                  
                  {/* Strategy Tester Footer */}
                  <div className="flex-shrink-0 bg-card border-t border-border">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium text-sm">Strategy Tester</span>
                        <span className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 px-3">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-3">
                          <Sparkles className="w-4 h-4" />
                          AI Assistant
                        </Button>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-7 gap-6">
                        {/* Net Profit */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Net Profit</span>
                          <span className="text-lg font-bold text-green-500">$12,450.23</span>
                          <span className="text-xs text-green-500">+24.8%</span>
                        </div>

                        {/* Win Rate */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
                          <span className="text-lg font-bold text-blue-500">68%</span>
                          <span className="text-xs text-muted-foreground">(425 wins)</span>
                        </div>

                        {/* Profit Factor */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Profit Factor</span>
                          <span className="text-lg font-bold text-purple-500">1.89</span>
                          <span className="text-xs text-purple-500">Excellent</span>
                        </div>

                        {/* Max Drawdown */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Max Drawdown</span>
                          <span className="text-lg font-bold text-red-500">-8.4%</span>
                          <span className="text-xs text-red-500">Low risk</span>
                        </div>

                        {/* Total Trades */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Total Trades</span>
                          <span className="text-lg font-bold text-foreground">625</span>
                          <span className="text-xs text-muted-foreground">Active</span>
                        </div>

                        {/* Sharpe Ratio */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Sharpe Ratio</span>
                          <span className="text-lg font-bold text-yellow-500">2.15</span>
                          <span className="text-xs text-yellow-500">Strong</span>
                        </div>

                        {/* Avg Win/Loss */}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">Avg Win/Loss</span>
                          <span className="text-lg font-bold text-cyan-500">$89/$34</span>
                          <span className="text-xs text-cyan-500">Per trade</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Performance Metrics */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-8">
                        {/* Left Column - Performance */}
                        <div>
                          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Performance</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Return</span>
                              <span className="text-green-500 font-medium">+45.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Annual Return</span>
                              <span className="text-green-500 font-medium">+24.8%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly Return</span>
                              <span className="text-green-500 font-medium">+2.1%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Best Trade</span>
                              <span className="text-green-500 font-medium">+$450.23</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Worst Trade</span>
                              <span className="text-red-500 font-medium">-$234.56</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Risk Management */}
                        <div>
                          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Risk Management</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Largest Winning Streak</span>
                              <span className="text-foreground font-medium">8 trades</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Largest Losing Streak</span>
                              <span className="text-foreground font-medium">3 trades</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Recovery Factor</span>
                              <span className="text-foreground font-medium">2.89</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Calmar Ratio</span>
                              <span className="text-foreground font-medium">2.95</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sortino Ratio</span>
                              <span className="text-foreground font-medium">3.21</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="h-full m-0 p-6 overflow-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Equity Curve</h4>
                        <p className="text-sm text-muted-foreground">Visual representation of account growth over time</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Drawdown Analysis</h4>
                        <p className="text-sm text-muted-foreground">Peak-to-trough decline analysis</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Monthly Returns</h4>
                        <p className="text-sm text-muted-foreground">Month-by-month performance breakdown</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Strategy Code Tab */}
              <TabsContent value="code" className="h-full m-0 p-6 overflow-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Strategy Code</h3>
                    <Card className="p-4">
                      <pre className="text-sm bg-muted/30 p-4 rounded-lg overflow-auto">
                        <code>{`// AI Generated Strategy
//@version=5
strategy("AI Strategy", overlay=true)

// Strategy parameters
length = input.int(14, title="Length")
source = input(close, title="Source")

// Strategy logic
ma = ta.sma(source, length)
longCondition = ta.crossover(source, ma)
shortCondition = ta.crossunder(source, ma)

if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.close("Long")

plot(ma, color=color.blue, title="Moving Average")`}</code>
                      </pre>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="h-full m-0 p-6 overflow-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Export Results</h4>
                        <p className="text-sm text-muted-foreground mb-4">Download strategy performance data</p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Save Strategy</h4>
                        <p className="text-sm text-muted-foreground mb-4">Save strategy to your collection</p>
                        <Button variant="outline" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Save Strategy
                        </Button>
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

export default EnhancedTest;