import { Download, Code, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Export = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  // Mock strategies - in real app, this would come from your database
  const strategies = [
    { id: '1', name: 'RSI + MACD Strategy', description: 'Uses RSI and MACD indicators for trend following' },
    { id: '2', name: 'Moving Average Crossover', description: 'Simple MA crossover strategy for trend detection' },
    { id: '3', name: 'Bollinger Bands Strategy', description: 'Mean reversion strategy using Bollinger Bands' },
    { id: '4', name: 'Breakout Strategy', description: 'Support/resistance breakout trading system' },
    { id: '5', name: 'Scalping Strategy', description: 'High-frequency trading for small profits' },
  ];

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
    
    // Simulate AI conversion process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const strategy = strategies.find(s => s.id === selectedStrategy);
    const format = formats.find(f => f.id === selectedFormat);
    
    // Mock AI conversion - in real app, this would call an AI service
    const mockCode = `// AI-Generated ${format?.name} Code
// Strategy: ${strategy?.name}
// Generated on: ${new Date().toLocaleDateString()}

${selectedFormat === 'pinescript' ? `
//@version=5
strategy("${strategy?.name}", overlay=true)

// Strategy Parameters
rsi_length = input.int(14, "RSI Length")
ma_length = input.int(20, "MA Length")

// Calculations
rsi = ta.rsi(close, rsi_length)
ma = ta.sma(close, ma_length)

// Entry Conditions
long_condition = ta.crossover(rsi, 30) and close > ma
short_condition = ta.crossunder(rsi, 70) and close < ma

// Strategy Execution
if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(ma, color=color.blue, title="Moving Average")
hline(70, "Overbought", color=color.red)
hline(30, "Oversold", color=color.green)
` : selectedFormat === 'mql4' ? `
//+------------------------------------------------------------------+
//| ${strategy?.name} Expert Advisor for MT4                         |
//+------------------------------------------------------------------+

#property strict

// Input Parameters
input int RSI_Period = 14;
input int MA_Period = 20;
input double LotSize = 0.1;

// Global Variables
int magic = 12345;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit() {
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick() {
    double rsi = iRSI(Symbol(), 0, RSI_Period, PRICE_CLOSE, 0);
    double ma = iMA(Symbol(), 0, MA_Period, 0, MODE_SMA, PRICE_CLOSE, 0);
    
    // Long Entry
    if(rsi < 30 && Close[0] > ma && OrdersTotal() == 0) {
        OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 0, 0, 
                 "${strategy?.name} Long", magic, 0, clrGreen);
    }
    
    // Short Entry
    if(rsi > 70 && Close[0] < ma && OrdersTotal() == 0) {
        OrderSend(Symbol(), OP_SELL, LotSize, Bid, 3, 0, 0, 
                 "${strategy?.name} Short", magic, 0, clrRed);
    }
}
` : `
//+------------------------------------------------------------------+
//| ${strategy?.name} Expert Advisor for MT5                         |
//+------------------------------------------------------------------+

#include <Trade\\Trade.mqh>

// Input Parameters
input int RSI_Period = 14;
input int MA_Period = 20;
input double LotSize = 0.1;

// Global Variables
CTrade trade;
int rsi_handle, ma_handle;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit() {
    rsi_handle = iRSI(_Symbol, PERIOD_CURRENT, RSI_Period, PRICE_CLOSE);
    ma_handle = iMA(_Symbol, PERIOD_CURRENT, MA_Period, 0, MODE_SMA, PRICE_CLOSE);
    
    if(rsi_handle == INVALID_HANDLE || ma_handle == INVALID_HANDLE) {
        Print("Error creating indicators");
        return(INIT_FAILED);
    }
    
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick() {
    double rsi[], ma[];
    ArraySetAsSeries(rsi, true);
    ArraySetAsSeries(ma, true);
    
    if(CopyBuffer(rsi_handle, 0, 0, 1, rsi) != 1 ||
       CopyBuffer(ma_handle, 0, 0, 1, ma) != 1) return;
    
    // Long Entry
    if(rsi[0] < 30 && SymbolInfoDouble(_Symbol, SYMBOL_BID) > ma[0] && 
       PositionsTotal() == 0) {
        trade.Buy(LotSize, _Symbol, 0, 0, 0, "${strategy?.name} Long");
    }
    
    // Short Entry
    if(rsi[0] > 70 && SymbolInfoDouble(_Symbol, SYMBOL_BID) < ma[0] && 
       PositionsTotal() == 0) {
        trade.Sell(LotSize, _Symbol, 0, 0, 0, "${strategy?.name} Short");
    }
}
`}`;

    setConvertedCode(mockCode);
    setIsConverting(false);
    toast(`Successfully converted ${strategy?.name} to ${format?.name}!`);
  };

  const handleDownload = () => {
    if (!convertedCode) {
      toast('No code to download. Please convert a strategy first.');
      return;
    }

    const format = formats.find(f => f.id === selectedFormat);
    const strategy = strategies.find(s => s.id === selectedStrategy);
    const filename = `${strategy?.name.replace(/\s+/g, '_')}_${selectedFormat}${format?.extension}`;
    
    const blob = new Blob([convertedCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Download started!');
  };

  const handleCopy = () => {
    if (!convertedCode) {
      toast('No code to copy. Please convert a strategy first.');
      return;
    }
    
    navigator.clipboard.writeText(convertedCode);
    toast('Code copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ← Back to Builder
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Export Strategy</h1>
        <p className="text-muted-foreground">
          Select your strategy and choose the platform format for export
        </p>
      </div>

      <div className="space-y-8">
        {/* Strategy and Format Selection - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Strategy Selection */}
          <Card className="trading-card">
                <CardHeader>
              <CardTitle>Select Strategy</CardTitle>
              <CardDescription>Choose which strategy you want to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a strategy to export" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{strategy.name}</span>
                        <span className="text-xs text-muted-foreground">{strategy.description}</span>
                    </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStrategy && (
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    {strategies.find(s => s.id === selectedStrategy)?.description}
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
                  Your strategy has been converted to {formats.find(f => f.id === selectedFormat)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="glow-button">
                    <Download className="w-4 h-4 mr-2" />
                    Download {formats.find(f => f.id === selectedFormat)?.extension}
                  </Button>
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
        </div>

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
};

export default Export;