import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, Code, Zap, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import StrategyBuilder from "@/components/StrategyBuilder";
import BacktestEngine from "@/components/BacktestEngine";
import CodeCompiler from "@/components/CodeCompiler";
import AIStrategyParser from "@/components/AIStrategyParser";

// Mock data for dashboard
const mockOHLCVData = [
  { time: '2024-01-01', open: 1.2500, high: 1.2550, low: 1.2490, close: 1.2520 },
  { time: '2024-01-02', open: 1.2520, high: 1.2580, low: 1.2510, close: 1.2580 },
  { time: '2024-01-03', open: 1.2580, high: 1.2590, low: 1.2530, close: 1.2535 },
  { time: '2024-01-04', open: 1.2535, high: 1.2560, low: 1.2520, close: 1.2545 },
  { time: '2024-01-05', open: 1.2545, high: 1.2570, low: 1.2540, close: 1.2565 },
  // Add more mock data...
];

const Dashboard = () => {
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState({
    pineScript: "",
    mql4: "",
    mql5: ""
  });

  const handleStrategyParsed = (strategy: any) => {
    setCurrentStrategy(strategy);
    // Generate code based on parsed strategy
    generateCodeFromStrategy(strategy);
  };

  const generateCodeFromStrategy = (strategy: any) => {
    // Mock code generation - in real app this would call AI service
    const mockPineScript = `// AI Generated Strategy: ${strategy.strategyType}
//@version=5
strategy("${strategy.strategyType}", overlay=true)

// Indicators
${strategy.indicators.map((ind: any) => 
  `${ind.name.toLowerCase().replace(/\s+/g, '_')} = ${generateIndicatorCode(ind)}`
).join('\n')}

// Entry Conditions
${strategy.entryConditions.map((cond: any) => 
  `// ${cond.description}`
).join('\n')}

// Exit Conditions
${strategy.exitConditions.map((cond: any) => 
  `// ${cond.description}`
).join('\n')}

// Risk Management
${strategy.riskManagement.stopLoss ? `stop_loss_pct = ${strategy.riskManagement.stopLoss}` : ''}
${strategy.riskManagement.takeProfit ? `take_profit_pct = ${strategy.riskManagement.takeProfit}` : ''}`;

    const mockMQL4 = `// AI Generated EA: ${strategy.strategyType}
#property copyright "Trainflow AI"
#property version   "1.00"

// Input parameters
${strategy.riskManagement.stopLoss ? `input double StopLoss = ${strategy.riskManagement.stopLoss};` : ''}
${strategy.riskManagement.takeProfit ? `input double TakeProfit = ${strategy.riskManagement.takeProfit};` : ''}

void OnTick()
{
   // Strategy logic here
}`;

    const mockMQL5 = mockMQL4.replace('#property', '#property')
      .replace('void OnTick()', 'void OnTick()');

    setGeneratedCode({
      pineScript: mockPineScript,
      mql4: mockMQL4,
      mql5: mockMQL5
    });
  };

  const generateIndicatorCode = (indicator: any) => {
    switch (indicator.type) {
      case 'moving_average':
        return `ta.sma(close, ${indicator.parameters.period})`;
      case 'oscillator':
        return `ta.rsi(close, ${indicator.parameters.period})`;
      default:
        return 'close';
    }
  };

  const platformStats = [
    { name: "Strategies Created", value: "1,247", icon: Brain, change: "+12%" },
    { name: "Backtests Run", value: "8,934", icon: BarChart3, change: "+8%" },
    { name: "Code Downloads", value: "3,421", icon: Code, change: "+15%" },
    { name: "Active Users", value: "567", icon: Users, change: "+23%" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Strategy Development Dashboard</h1>
        <p className="text-muted-foreground">
          Build, test, and deploy your trading strategies with AI-powered tools
        </p>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="trading-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-success">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="ai-parser" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-parser" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Parser
          </TabsTrigger>
          <TabsTrigger value="visual-builder" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Backtest
          </TabsTrigger>
          <TabsTrigger value="compiler" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Compiler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-parser" className="space-y-6">
          <AIStrategyParser onStrategyParsed={handleStrategyParsed} />
          
          {currentStrategy && (
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Strategy Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-primary">{currentStrategy.strategyType}</div>
                    <div className="text-sm text-muted-foreground">Type</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{currentStrategy.confidence}%</div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{currentStrategy.indicators.length}</div>
                    <div className="text-sm text-muted-foreground">Indicators</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visual-builder" className="space-y-6">
          <StrategyBuilder />
        </TabsContent>

        <TabsContent value="backtest" className="space-y-6">
          {currentStrategy ? (
            <BacktestEngine strategy={currentStrategy} ohlcvData={mockOHLCVData} />
          ) : (
            <Card className="trading-card">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Strategy Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Create or parse a strategy first to run backtests
                </p>
                <Button onClick={() => {}} variant="outline">
                  Go to AI Parser
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compiler" className="space-y-6">
          {generatedCode.pineScript ? (
            <CodeCompiler 
              pineScript={generatedCode.pineScript}
              mql4Code={generatedCode.mql4}
              mql5Code={generatedCode.mql5}
            />
          ) : (
            <Card className="trading-card">
              <CardContent className="text-center py-12">
                <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Code Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Create a strategy first to compile and download code
                </p>
                <Button onClick={() => {}} variant="outline">
                  Go to AI Parser
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="trading-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <Brain className="w-6 h-6" />
              <span>Parse New Strategy</span>
            </Button>
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <TrendingUp className="w-6 h-6" />
              <span>Visual Builder</span>
            </Button>
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <BarChart3 className="w-6 h-6" />
              <span>Run Backtest</span>
            </Button>
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <Code className="w-6 h-6" />
              <span>Download Code</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;