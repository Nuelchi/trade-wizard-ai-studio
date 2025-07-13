import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, CheckCircle, ArrowRight, Lightbulb, Target } from "lucide-react";
import { toast } from "sonner";

interface ParsedStrategy {
  confidence: number;
  strategyType: string;
  indicators: Array<{
    name: string;
    type: string;
    parameters: Record<string, any>;
  }>;
  entryConditions: Array<{
    description: string;
    logic: string;
  }>;
  exitConditions: Array<{
    description: string;
    logic: string;
  }>;
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    positionSizing?: string;
  };
  timeframe: string;
  marketConditions: string[];
  suggestions: string[];
}

export const AIStrategyParser = ({ 
  onStrategyParsed 
}: { 
  onStrategyParsed: (strategy: ParsedStrategy) => void; 
}) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedStrategy, setParsedStrategy] = useState<ParsedStrategy | null>(null);

  const exampleStrategies = [
    "Buy when 50-day moving average crosses above 200-day moving average and RSI is below 30. Sell when RSI goes above 70. Use 2% stop loss.",
    "Create a breakout strategy that buys when price breaks above 20-day high with high volume. Exit when price touches 10-day moving average.",
    "Implement a mean reversion strategy using Bollinger Bands. Buy when price touches lower band and sell when it reaches upper band.",
    "Design a momentum strategy that enters long when MACD crosses above signal line and price is above 50 EMA. Use trailing stop."
  ];

  const parseStrategy = async () => {
    if (!input.trim()) {
      toast.error("Please enter a strategy description");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate AI processing steps
    const steps = [
      "Analyzing strategy description...",
      "Identifying indicators...",
      "Extracting entry conditions...",
      "Determining exit rules...",
      "Assessing risk management...",
      "Generating recommendations..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProgress((i / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Mock AI parsing result
    const mockResult: ParsedStrategy = {
      confidence: 85,
      strategyType: "Trend Following",
      indicators: [
        {
          name: "50-day SMA",
          type: "moving_average",
          parameters: { period: 50, type: "simple" }
        },
        {
          name: "200-day SMA", 
          type: "moving_average",
          parameters: { period: 200, type: "simple" }
        },
        {
          name: "RSI",
          type: "oscillator",
          parameters: { period: 14, overbought: 70, oversold: 30 }
        }
      ],
      entryConditions: [
        {
          description: "50-day MA crosses above 200-day MA",
          logic: "crossover(sma(50), sma(200))"
        },
        {
          description: "RSI is below 30 (oversold)",
          logic: "rsi(14) < 30"
        }
      ],
      exitConditions: [
        {
          description: "RSI goes above 70 (overbought)",
          logic: "rsi(14) > 70"
        }
      ],
      riskManagement: {
        stopLoss: 2,
        positionSizing: "Fixed percentage"
      },
      timeframe: "Daily",
      marketConditions: ["Trending market", "Low volatility periods"],
      suggestions: [
        "Consider adding volume confirmation for stronger signals",
        "Implement trailing stop loss for better profit maximization",
        "Add position sizing based on volatility (ATR)",
        "Consider market regime filter to avoid choppy markets"
      ]
    };

    setParsedStrategy(mockResult);
    setProgress(100);
    setIsProcessing(false);
    toast.success("Strategy parsed successfully!");
    onStrategyParsed(mockResult);
  };

  const useExample = (example: string) => {
    setInput(example);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Input */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Strategy Parser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Describe your trading strategy in natural language
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: Buy when 50-day moving average crosses above 200-day moving average and RSI is below 30..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={parseStrategy}
              disabled={isProcessing || !input.trim()}
              className="glow-button"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse Strategy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="flex-1">
                <Progress value={progress} className="w-full" />
                <div className="text-xs text-muted-foreground mt-1">
                  {progress.toFixed(0)}% complete
                </div>
              </div>
            )}
          </div>

          {/* Example Strategies */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Or try these examples:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleStrategies.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left justify-start text-wrap"
                  onClick={() => useExample(example)}
                >
                  <div className="text-xs">{example}</div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Results */}
      {parsedStrategy && (
        <div className="space-y-6">
          {/* Confidence Score */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Parsing Results
                </span>
                <Badge variant={parsedStrategy.confidence > 80 ? "default" : "secondary"}>
                  {parsedStrategy.confidence}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-primary">{parsedStrategy.strategyType}</div>
                  <div className="text-sm text-muted-foreground">Strategy Type</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{parsedStrategy.timeframe}</div>
                  <div className="text-sm text-muted-foreground">Timeframe</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{parsedStrategy.indicators.length}</div>
                  <div className="text-sm text-muted-foreground">Indicators</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    {parsedStrategy.entryConditions.length + parsedStrategy.exitConditions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Conditions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicators */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Identified Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedStrategy.indicators.map((indicator, index) => (
                  <div key={index} className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{indicator.name}</h4>
                      <Badge variant="outline">{indicator.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Object.entries(indicator.parameters).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Entry & Exit Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-success">Entry Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedStrategy.entryConditions.map((condition, index) => (
                  <div key={index} className="p-3 bg-success/10 rounded-lg">
                    <div className="font-medium text-foreground mb-1">
                      {condition.description}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {condition.logic}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-danger">Exit Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedStrategy.exitConditions.map((condition, index) => (
                  <div key={index} className="p-3 bg-danger/10 rounded-lg">
                    <div className="font-medium text-foreground mb-1">
                      {condition.description}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {condition.logic}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Risk Management */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsedStrategy.riskManagement.stopLoss && (
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-danger">{parsedStrategy.riskManagement.stopLoss}%</div>
                    <div className="text-sm text-muted-foreground">Stop Loss</div>
                  </div>
                )}
                {parsedStrategy.riskManagement.takeProfit && (
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-success">{parsedStrategy.riskManagement.takeProfit}%</div>
                    <div className="text-sm text-muted-foreground">Take Profit</div>
                  </div>
                )}
                {parsedStrategy.riskManagement.positionSizing && (
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{parsedStrategy.riskManagement.positionSizing}</div>
                    <div className="text-sm text-muted-foreground">Position Sizing</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedStrategy.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <div className="text-sm text-foreground">{suggestion}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIStrategyParser;