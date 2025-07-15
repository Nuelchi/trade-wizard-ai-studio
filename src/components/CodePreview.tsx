import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Play, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingViewWidget from 'react-tradingview-widget';

const ASSET_CLASSES = [
  { key: 'stocks', label: 'Stocks', defaultSymbol: 'NASDAQ:AAPL' },
  { key: 'funds', label: 'Funds', defaultSymbol: 'AMEX:SPY' },
  { key: 'forex', label: 'Forex', defaultSymbol: 'FX:EURUSD' },
  { key: 'crypto', label: 'Crypto', defaultSymbol: 'BINANCE:BTCUSDT' },
];
const INTERVALS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
  { value: 'M', label: '1M' },
];
const SYMBOLS_BY_CLASS = {
  stocks: [
    'NASDAQ:AAPL', 'NASDAQ:MSFT', 'NYSE:TSLA', 'NASDAQ:GOOGL', 'NYSE:BRK.A', 'NASDAQ:NVDA', 'NYSE:JNJ', 'NASDAQ:AMZN', 'NYSE:V', 'NYSE:UNH'
  ],
  funds: [
    'AMEX:SPY', 'NASDAQ:QQQ', 'AMEX:IVV', 'AMEX:VTI', 'AMEX:VOO', 'AMEX:ARKK', 'AMEX:XLK', 'AMEX:XLF', 'AMEX:VYM', 'AMEX:VUG'
  ],
  forex: [
    'FX:EURUSD', 'FX:USDJPY', 'FX:GBPUSD', 'FX:USDCHF', 'FX:AUDUSD', 'FX:USDCAD', 'FX:NZDUSD', 'FX:EURGBP', 'FX:EURJPY', 'FX:GBPJPY'
  ],
  crypto: [
    'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT', 'BINANCE:XRPUSDT', 'BINANCE:ADAUSDT', 'BINANCE:DOGEUSDT', 'BINANCE:SOLUSDT', 'BINANCE:MATICUSDT', 'BINANCE:DOTUSDT', 'BINANCE:SHIBUSDT'
  ]
};

interface CodePreviewProps {
  strategy?: any;
  code?: any;
  onRunBacktest?: () => void;
}

const CodePreview = ({ strategy, code, onRunBacktest }: CodePreviewProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Chart preview state (local to preview only)
  const [assetClass, setAssetClass] = useState('forex');
  const [symbol, setSymbol] = useState('FX:EURUSD');
  const [interval, setInterval] = useState('D');
  const [symbolInput, setSymbolInput] = useState(symbol);
  const [customSymbol, setCustomSymbol] = useState(false);

  // Sync symbol input and custom state
  useEffect(() => {
    setSymbolInput(symbol);
    setCustomSymbol(!SYMBOLS_BY_CLASS[assetClass].includes(symbol));
  }, [symbol, assetClass]);

  const handleAssetClassChange = (key: string) => {
    setAssetClass(key);
    setSymbol(SYMBOLS_BY_CLASS[key][0]);
  };
  const handleSymbolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__custom__') {
      setCustomSymbol(true);
      setSymbolInput('');
      setSymbol('');
    } else {
      setSymbol(e.target.value);
      setCustomSymbol(false);
    }
  };
  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbolInput(e.target.value);
    setSymbol(e.target.value);
    setCustomSymbol(true);
  };
  const handleSymbolInputBlur = () => {
    if (!symbolInput || !symbolInput.trim()) {
      setSymbol(SYMBOLS_BY_CLASS[assetClass][0]);
      setCustomSymbol(false);
    }
  };
  const handleSymbolInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSymbolInputBlur();
  };
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Code has been copied to your clipboard.',
    });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download started',
      description: `${filename} has been downloaded.`,
    });
  };

  if (!strategy && !code) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Live Preview
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Start chatting to see your strategy and generated code appear here in real-time. 
            Just like Lovable, but for trading strategies!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chart Preview Bar and Chart removed: no chart in any tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
            <TabsTrigger value="mql4">MQL4</TabsTrigger>
            <TabsTrigger value="mql5">MQL5</TabsTrigger>
          </TabsList>
          {strategy && code && (
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={onRunBacktest ? onRunBacktest : () => toast({ title: 'Not implemented', description: 'Backtest function not connected.' })}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Backtest
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0 p-4">
            {strategy && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge variant="secondary">{strategy.confidence}% Confidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Strategy Type</h4>
                      <Badge>{strategy.type}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.indicators?.map((indicator: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {indicator.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Entry Conditions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {strategy.conditions?.entry?.map((condition: string, index: number) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Exit Conditions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {strategy.conditions?.exit?.map((condition: string, index: number) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {strategy.riskManagement && (
                      <div>
                        <h4 className="font-medium mb-2">Risk Management</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {strategy.riskManagement.stopLoss && (
                            <div>
                              <span className="text-muted-foreground">Stop Loss:</span>
                              <span className="ml-2 font-medium">{strategy.riskManagement.stopLoss}</span>
                            </div>
                          )}
                          {strategy.riskManagement.takeProfit && (
                            <div>
                              <span className="text-muted-foreground">Take Profit:</span>
                              <span className="ml-2 font-medium">{strategy.riskManagement.takeProfit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pinescript" className="h-full m-0">
            {code?.pineScript ? (
              <CodeEditor
                code={code.pineScript}
                language="pinescript"
                onCopy={() => handleCopy(code.pineScript)}
                onDownload={() => handleDownload(code.pineScript, `${strategy?.name || 'strategy'}.pine`)}
              />
            ) : (
              <EmptyState message="No Pine Script generated yet" />
            )}
          </TabsContent>

          <TabsContent value="mql4" className="h-full m-0">
            {code?.mql4 ? (
              <CodeEditor
                code={code.mql4}
                language="mql4"
                onCopy={() => handleCopy(code.mql4)}
                onDownload={() => handleDownload(code.mql4, `${strategy?.name || 'strategy'}.mq4`)}
              />
            ) : (
              <EmptyState message="No MQL4 code generated yet" />
            )}
          </TabsContent>

          <TabsContent value="mql5" className="h-full m-0">
            <CodeEditor
              code={code?.mql5 || `// AI Generated Strategy – MQL5 Expert Advisor\n#property copyright \"Trainflow AI\"\n#property version   \"1.00\"\n\n// Input Parameters\n\nvoid OnTick()\n{\n    // Strategy Implementation\n}\n`}
              language="mql5"
              onCopy={() => handleCopy(code?.mql5 || `// AI Generated Strategy – MQL5 Expert Advisor\n#property copyright \"Trainflow AI\"\n#property version   \"1.00\"\n\n// Input Parameters\n\nvoid OnTick()\n{\n    // Strategy Implementation\n}\n`)}
              onDownload={() => handleDownload(code?.mql5 || `// AI Generated Strategy – MQL5 Expert Advisor\n#property copyright \"Trainflow AI\"\n#property version   \"1.00\"\n\n// Input Parameters\n\nvoid OnTick()\n{\n    // Strategy Implementation\n}\n`, `${strategy?.name || 'strategy'}.mq5`)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface CodeEditorProps {
  code: string;
  language: string;
  onCopy: () => void;
  onDownload: () => void;
}

const CodeEditor = ({ code, language, onCopy, onDownload }: CodeEditorProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{language.toUpperCase()}</Badge>
          <span className="text-sm text-muted-foreground">Live Generated Code</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono text-foreground bg-background">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Play className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export default CodePreview;