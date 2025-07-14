import { Download, ExternalLink, Cloud, Code, FileText, Zap, CheckCircle, Copy, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Export = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [strategy, setStrategy] = useState('');
  const [pineScript, setPineScript] = useState('');
  const [mql4, setMQL4] = useState('');
  const [mql5, setMQL5] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const navigate = useNavigate();

  // Mock strategies - in real app, this would come from database
  const availableStrategies = [
    { 
      id: 'ma_crossover', 
      name: 'Moving Average Crossover', 
      description: 'Simple MA crossover strategy',
      code: `// Moving Average Crossover Strategy
//@version=5
strategy("MA Crossover", overlay=true)

fastMA = ta.sma(close, 10)
slowMA = ta.sma(close, 20)

plot(fastMA, color=color.blue)
plot(slowMA, color=color.red)

if (ta.crossover(fastMA, slowMA))
    strategy.entry("Long", strategy.long)
if (ta.crossunder(fastMA, slowMA))
    strategy.entry("Short", strategy.short)`
    },
    { 
      id: 'rsi_divergence', 
      name: 'RSI Divergence Strategy', 
      description: 'RSI-based divergence trading',
      code: `// RSI Divergence Strategy
//@version=5
strategy("RSI Divergence", overlay=false)

rsi = ta.rsi(close, 14)
plot(rsi, color=color.purple)

if (rsi < 30)
    strategy.entry("Long", strategy.long)
if (rsi > 70)
    strategy.entry("Short", strategy.short)`
    },
    { 
      id: 'bollinger_bands', 
      name: 'Bollinger Bands Strategy', 
      description: 'Mean reversion using Bollinger Bands',
      code: `// Bollinger Bands Strategy
//@version=5
strategy("Bollinger Bands", overlay=true)

length = 20
basis = ta.sma(close, length)
dev = ta.stdev(close, length)
upper = basis + dev * 2
lower = basis - dev * 2

plot(basis, color=color.blue)
plot(upper, color=color.red)
plot(lower, color=color.green)

if (close <= lower)
    strategy.entry("Long", strategy.long)
if (close >= upper)
    strategy.entry("Short", strategy.short)`
    }
  ];

  useEffect(() => {
    setStrategy(localStorage.getItem('exportStrategy') || '');
    setPineScript(localStorage.getItem('exportPineScript') || '');
    setMQL4(localStorage.getItem('exportMQL4') || '');
    setMQL5(localStorage.getItem('exportMQL5') || '');
    try {
      setSummary(JSON.parse(localStorage.getItem('exportSummary') || 'null'));
    } catch {
      setSummary(null);
    }
  }, []);

  const handleConvertAll = async () => {
    if (!selectedStrategy) {
      toast('Please select a strategy first!');
      return;
    }

    setIsConverting(true);
    
    const strategyData = availableStrategies.find(s => s.id === selectedStrategy);
    if (!strategyData) return;

    // Simulate AI conversion process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI conversion - in real app, this would call an AI service
    const baseCode = strategyData.code;
    
    // Convert to Pine Script (already in Pine Script format)
    setPineScript(baseCode);
    
    // Convert to MQL4
    const mql4Code = `//+------------------------------------------------------------------+
//|                                         ${strategyData.name}.mq4 |
//|                        Copyright 2024, MetaQuotes Software Corp. |
//|                                             https://www.mql4.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, MetaQuotes Software Corp."
#property link      "https://www.mql4.com"
#property version   "1.00"
#property strict

// Converted from Pine Script: ${strategyData.name}
// ${strategyData.description}

extern double LotSize = 0.1;
extern int MagicNumber = 12345;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Strategy logic converted from Pine Script
   ${baseCode.split('\n').map(line => '   // ' + line).join('\n')}
   
   // Add MQL4-specific implementation here
}`;

    setMQL4(mql4Code);
    
    // Convert to MQL5
    const mql5Code = `//+------------------------------------------------------------------+
//|                                         ${strategyData.name}.mq5 |
//|                        Copyright 2024, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"

// Converted from Pine Script: ${strategyData.name}
// ${strategyData.description}

input double InpLotSize = 0.1;
input int InpMagic = 12345;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Strategy logic converted from Pine Script
   ${baseCode.split('\n').map(line => '   // ' + line).join('\n')}
   
   // Add MQL5-specific implementation here
}`;

    setMQL5(mql5Code);
    setStrategy(strategyData.name);
    setHasConverted(true);
    setIsConverting(false);
    toast('Successfully converted strategy to all formats!');
  };

  const handleCopyLink = (platform: string) => {
    navigator.clipboard.writeText(`https://tradingview.com/script/${platform.toLowerCase()}-strategy`);
    toast(`${platform} link copied to clipboard!`);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Download started!');
  };

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast(`${type} copied to clipboard!`);
  };

  const exportOptions = [
    {
      title: "TradingView Pine Script",
      description: "Ready-to-use Pine Script for TradingView platform",
      icon: Code,
      type: "pinescript",
      actions: [
        { label: "Download .pine", action: () => handleDownload(pineScript, "strategy.pine") },
        { label: "Copy to Clipboard", action: () => handleCopy(pineScript, "Pine Script") },
      ]
    },
    {
      title: "MetaTrader 4 EA",
      description: "Expert Advisor for MT4 platform",
      icon: FileText,
      type: "mql4",
      actions: [
        { label: "Download .mq4", action: () => handleDownload(mql4, "strategy.mq4") },
        { label: "Copy to Clipboard", action: () => handleCopy(mql4, "MQL4") },
      ]
    },
    {
      title: "MetaTrader 5 EA",
      description: "Expert Advisor for MT5 platform",
      icon: FileText,
      type: "mql5",
      actions: [
        { label: "Download .mq5", action: () => handleDownload(mql5, "strategy.mq5") },
        { label: "Copy to Clipboard", action: () => handleCopy(mql5, "MQL5") },
      ]
    }
  ];

  const deploymentOptions = [
    {
      title: "VPS Deployment",
      description: "Deploy your strategy to a Virtual Private Server for 24/7 trading",
      icon: Cloud,
      features: ["24/7 uptime", "Low latency", "Multiple brokers", "Real-time monitoring"],
      price: "Starting at $29/month",
      comingSoon: true
    },
    {
      title: "Algorithm Hub",
      description: "Share your strategy with the Trainflow community",
      icon: Zap,
      features: ["Strategy marketplace", "Performance tracking", "Copy trading", "Revenue sharing"],
      price: "Free to publish",
      comingSoon: true
    }
  ];

  const instalationSteps = {
    tradingview: [
      "Copy the Pine Script code",
      "Open TradingView and go to Pine Editor",
      "Paste the code and click 'Add to Chart'",
      "Configure your parameters and start trading"
    ],
    mt4: [
      "Download the .mq4 file",
      "Open MT4 and go to File > Open Data Folder",
      "Navigate to MQL4/Experts folder",
      "Copy the .mq4 file to this folder",
      "Restart MT4 and find your EA in Navigator"
    ],
    mt5: [
      "Download the .mq5 file", 
      "Open MT5 and go to File > Open Data Folder",
      "Navigate to MQL5/Experts folder",
      "Copy the .mq5 file to this folder",
      "Restart MT5 and find your EA in Navigator"
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ← Back to Builder
        </Button>
      </div>

      {!hasConverted ? (
        // Strategy Selection Screen
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose Strategy to Export</h1>
            <p className="text-muted-foreground">
              Select a strategy to convert into Pine Script, MQL4, and MQL5 formats
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            {availableStrategies.map((strategy) => (
              <Card 
                key={strategy.id} 
                className={`trading-card cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedStrategy === strategy.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{strategy.name}</CardTitle>
                      <CardDescription className="mt-1">{strategy.description}</CardDescription>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedStrategy === strategy.id 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedStrategy === strategy.id && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto max-h-32">
                    {strategy.code.split('\n').slice(0, 8).join('\n')}
                    {strategy.code.split('\n').length > 8 ? '\n...' : ''}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleConvertAll}
              disabled={!selectedStrategy || isConverting}
              className="glow-button px-8 py-3 text-lg"
            >
              {isConverting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Converting to all formats...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to All Formats</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // Converted Results Screen
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Export {strategy}</h1>
            <p className="text-muted-foreground">
              Choose your preferred format to download or copy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {exportOptions.map((option, index) => {
              const Icon = option.icon;
              const code = option.type === 'pinescript' ? pineScript : 
                          option.type === 'mql4' ? mql4 : mql5;
              
              return (
                <Card key={index} className="trading-card">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto max-h-32">
                        {code.split('\n').slice(0, 6).join('\n')}
                        {code.split('\n').length > 6 ? '\n...' : ''}
                      </pre>
                      <div className="flex flex-col gap-2">
                        {option.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            onClick={action.action}
                            variant={actionIndex === 0 ? "default" : "outline"}
                            className={actionIndex === 0 ? "glow-button" : ""}
                          >
                            {actionIndex === 0 ? (
                              <Download className="w-4 h-4 mr-2" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Installation Instructions */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
                <CardDescription>Step-by-step guides for each platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tradingview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tradingview">TradingView</TabsTrigger>
                    <TabsTrigger value="mt4">MT4</TabsTrigger>
                    <TabsTrigger value="mt5">MT5</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(instalationSteps).map(([platform, steps]) => (
                    <TabsContent key={platform} value={platform} className="space-y-4">
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-muted-foreground flex-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Deployment Options */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Deploy & Share</h2>
              
              {deploymentOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className="trading-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <span>{option.title}</span>
                              {option.comingSoon && (
                                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>{option.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          {option.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{option.price}</span>
                          <Button 
                            disabled={option.comingSoon}
                            className={option.comingSoon ? "" : "glow-button"}
                          >
                            {option.comingSoon ? "Notify Me" : "Get Started"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setHasConverted(false);
                setSelectedStrategy('');
                setPineScript('');
                setMQL4('');
                setMQL5('');
              }}
            >
              ← Convert Another Strategy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Export;