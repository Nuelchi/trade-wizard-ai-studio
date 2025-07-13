import { Download, ExternalLink, Cloud, Code, FileText, Zap, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Export = () => {
  const [strategy, setStrategy] = useState('');
  const [pineScript, setPineScript] = useState('');
  const [mql4, setMQL4] = useState('');
  const [mql5, setMQL5] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleExport = (type: string) => {
    toast(`${type} export started! Download will begin shortly.`);
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
        <Button variant="outline" onClick={() => navigate('/build')}>
          ← Back to Build
        </Button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Export & Deploy</h1>
        <p className="text-muted-foreground">
          Download your strategy code or deploy it to live trading platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Options */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Export Code</h2>
          
          {exportOptions.map((option, index) => {
            const Icon = option.icon;
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
                  <div className="flex flex-wrap gap-2">
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
                </CardContent>
              </Card>
            );
          })}

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
        </div>

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
                    <div className="grid grid-cols-2 gap-2">
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

          {/* Strategy Performance Summary */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Strategy Summary</CardTitle>
              <CardDescription>Ready for deployment</CardDescription>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-success">{summary.winRate || summary.win_rate || '--'}%</div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-lg font-bold text-foreground">{summary.profitFactor || summary.profit_factor || '--'}</div>
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <b>Description:</b> {summary.description || summary.desc || '--'}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No summary available.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Code Preview */}
      <Card className="trading-card mt-8">
        <CardHeader>
          <CardTitle>Code Preview</CardTitle>
          <CardDescription>Review your generated code before exporting</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pinescript">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
              <TabsTrigger value="mql4">MQL4</TabsTrigger>
              <TabsTrigger value="mql5">MQL5</TabsTrigger>
            </TabsList>
            <TabsContent value="pinescript">
              <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto">{pineScript}</pre>
            </TabsContent>
            <TabsContent value="mql4">
              <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto">{mql4}</pre>
            </TabsContent>
            <TabsContent value="mql5">
              <pre className="bg-muted/30 rounded p-2 text-xs overflow-x-auto">{mql5}</pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Export;