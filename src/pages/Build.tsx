import { useState, useEffect } from "react";
import { ArrowRight, Copy, CheckCircle, Code, FileText, Brain, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

const Build = () => {
  const [strategy, setStrategy] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Load strategy from localStorage if coming from home page
    const savedStrategy = localStorage.getItem("currentStrategy");
    if (savedStrategy) {
      setStrategy(savedStrategy);
      localStorage.removeItem("currentStrategy");
    }
  }, []);

  const processStrategy = async () => {
    if (!strategy.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI response
    const mockResult = {
      summary: {
        title: "Moving Average Crossover with RSI Filter",
        description: "This strategy buys when the 50-day moving average crosses above the 200-day moving average while RSI is below 30, indicating an oversold condition in an uptrend. It sells when RSI exceeds 70 or implements a 2% stop loss.",
        indicators: ["50-day SMA", "200-day SMA", "RSI (14)"],
        timeframe: "Daily",
        riskLevel: "Medium"
      },
      pineScript: `// Trainflow Generated Strategy
//@version=5
strategy("MA Crossover + RSI", overlay=true)

// Inputs
ma_fast = input.int(50, title="Fast MA Period")
ma_slow = input.int(200, title="Slow MA Period")
rsi_period = input.int(14, title="RSI Period")
rsi_oversold = input.int(30, title="RSI Oversold Level")
rsi_overbought = input.int(70, title="RSI Overbought Level")
stop_loss_pct = input.float(2.0, title="Stop Loss %")

// Calculations
ma_fast_line = ta.sma(close, ma_fast)
ma_slow_line = ta.sma(close, ma_slow)
rsi = ta.rsi(close, rsi_period)

// Entry Conditions
ma_cross_up = ta.crossover(ma_fast_line, ma_slow_line)
rsi_oversold_condition = rsi < rsi_oversold
buy_condition = ma_cross_up and rsi_oversold_condition

// Exit Conditions
rsi_overbought_condition = rsi > rsi_overbought
sell_condition = rsi_overbought_condition

// Strategy Execution
if buy_condition
    strategy.entry("Long", strategy.long)

if sell_condition
    strategy.close("Long")

// Stop Loss
if strategy.position_size > 0
    strategy.exit("Stop Loss", "Long", stop=close * (1 - stop_loss_pct / 100))

// Plot indicators
plot(ma_fast_line, color=color.blue, title="MA 50")
plot(ma_slow_line, color=color.red, title="MA 200")`,
      mql4: `// Trainflow Generated EA for MT4
// Moving Average Crossover + RSI Strategy

#property copyright "Trainflow"
#property version   "1.00"

input int FastMA = 50;
input int SlowMA = 200;
input int RSIPeriod = 14;
input int RSIOversold = 30;
input int RSIOverbought = 70;
input double StopLossPct = 2.0;
input double LotSize = 0.1;

void OnTick()
{
   double ma_fast = iMA(Symbol(), 0, FastMA, 0, MODE_SMA, PRICE_CLOSE, 0);
   double ma_slow = iMA(Symbol(), 0, SlowMA, 0, MODE_SMA, PRICE_CLOSE, 0);
   double rsi = iRSI(Symbol(), 0, RSIPeriod, PRICE_CLOSE, 0);
   
   // Entry Logic
   if(ma_fast > ma_slow && rsi < RSIOversold && OrdersTotal() == 0)
   {
      OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 
                Ask - (Ask * StopLossPct / 100), 0, 
                "MA Cross + RSI", 0, 0, clrGreen);
   }
   
   // Exit Logic
   if(rsi > RSIOverbought && OrdersTotal() > 0)
   {
      for(int i = OrdersTotal() - 1; i >= 0; i--)
      {
         if(OrderSelect(i, SELECT_BY_POS) && OrderType() == OP_BUY)
         {
            OrderClose(OrderTicket(), OrderLots(), Bid, 3, clrRed);
         }
      }
   }
}`,
      mql5: `// Trainflow Generated EA for MT5
// Moving Average Crossover + RSI Strategy

#property copyright "Trainflow"
#property version   "1.00"

input int FastMA = 50;
input int SlowMA = 200;
input int RSIPeriod = 14;
input int RSIOversold = 30;
input int RSIOverbought = 70;
input double StopLossPct = 2.0;
input double LotSize = 0.1;

void OnTick()
{
   double ma_fast = iMA(_Symbol, 0, FastMA, 0, MODE_SMA, PRICE_CLOSE, 0);
   double ma_slow = iMA(_Symbol, 0, SlowMA, 0, MODE_SMA, PRICE_CLOSE, 0);
   double rsi = iRSI(_Symbol, 0, RSIPeriod, PRICE_CLOSE, 0);
   
   // Entry Logic
   if(ma_fast > ma_slow && rsi < RSIOversold && PositionsTotal() == 0)
   {
      trade.Buy(LotSize, _Symbol, Ask, Ask - (Ask * StopLossPct / 100), 0, "MA Cross + RSI");
   }
   
   // Exit Logic
   if(rsi > RSIOverbought && PositionsTotal() > 0)
   {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
         {
            trade.PositionClose(ticket);
         }
      }
   }
}`,
      backtest: {
        winRate: 68.5,
        totalTrades: 147,
        profit: 15420.50,
        drawdown: 8.2,
        sharpeRatio: 1.34,
        profitFactor: 1.85
      }
    };
    
    setResult(mockResult);
    setIsProcessing(false);
    toast("Strategy processed successfully!");
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast(`${type} copied to clipboard!`);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Strategy Builder</h1>
        <p className="text-muted-foreground">
          Describe your trading idea and watch AI transform it into executable code
        </p>
      </div>

      {/* Strategy Input */}
      <div className="trading-card p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Strategy Description</h2>
        </div>
        
        <Textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Describe your trading strategy in detail..."
          className="strategy-input min-h-[120px] mb-4"
        />
        
        <Button 
          onClick={processStrategy}
          disabled={!strategy.trim() || isProcessing}
          className="glow-button"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Processing Strategy...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Strategy
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Strategy Summary */}
          <div className="trading-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Strategy Summary</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">{result.summary.title}</h3>
                <p className="text-muted-foreground">{result.summary.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="metric-card">
                  <div className="text-sm text-muted-foreground">Indicators</div>
                  <div className="text-sm font-medium text-foreground">
                    {result.summary.indicators.join(", ")}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="text-sm text-muted-foreground">Timeframe</div>
                  <div className="text-sm font-medium text-foreground">{result.summary.timeframe}</div>
                </div>
                <div className="metric-card">
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div className="text-sm font-medium text-foreground">{result.summary.riskLevel}</div>
                </div>
                <div className="metric-card">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="text-sm font-medium text-foreground">Trend Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="trading-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Generated Code</h2>
              <Tooltip>
                <span className="ml-2 text-primary cursor-help">[?]</span>
              </Tooltip>
            </div>
            
            <Tabs defaultValue="pinescript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
                <TabsTrigger value="mql4">MQL4</TabsTrigger>
                <TabsTrigger value="mql5">MQL5</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pinescript" className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">TradingView Pine Script v5</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.pineScript, "Pine Script")}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(result.pineScript, "strategy.pine")}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
                <div className="code-block">
                  <pre className="text-sm">{result.pineScript}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="mql4" className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">MetaTrader 4 Expert Advisor (MQL4)</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.mql4, "MQL4")}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(result.mql4, "strategy.mq4")}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
                <div className="code-block">
                  <pre className="text-sm">{result.mql4}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="mql5" className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">MetaTrader 5 Expert Advisor (MQL5)</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.mql5, "MQL5")}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(result.mql5, "strategy.mq5")}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
                <div className="code-block">
                  <pre className="text-sm">{result.mql5}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Backtest Results */}
          <div className="trading-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Backtest Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold text-success">{result.backtest.winRate}%</div>
              </div>
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="text-lg font-bold text-foreground">{result.backtest.totalTrades}</div>
              </div>
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Profit</div>
                <div className="text-lg font-bold text-success">${result.backtest.profit}</div>
              </div>
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                <div className="text-lg font-bold text-danger">{result.backtest.drawdown}%</div>
              </div>
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                <div className="text-lg font-bold text-foreground">{result.backtest.sharpeRatio}</div>
              </div>
              <div className="metric-card">
                <div className="text-sm text-muted-foreground">Profit Factor</div>
                <div className="text-lg font-bold text-foreground">{result.backtest.profitFactor}</div>
              </div>
            </div>
          </div>

          {/* Test Strategy Button */}
          <Button
            className="mt-6 w-full glow-button"
            onClick={() => navigate("/test", { state: { strategy, code: result.pineScript } })}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Test Strategy
          </Button>

          {/* Save Strategy Button */}
          <Button
            className="w-full mt-4"
            onClick={() => {
              const saved = JSON.parse(localStorage.getItem('myStrategies') || '[]');
              const newStrategy = {
                id: uuidv4(),
                title: strategy,
                summary: result.summary,
                pineScript: result.pineScript,
                mql4: result.mql4,
                mql5: result.mql5,
                created: new Date().toISOString(),
              };
              localStorage.setItem('myStrategies', JSON.stringify([newStrategy, ...saved]));
              toast('Strategy saved!');
            }}
            variant="default"
          >
            Save Strategy
          </Button>
        </div>
      )}
    </div>
  );
};

export default Build;