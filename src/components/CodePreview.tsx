import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Play, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TradingViewWidget from 'react-tradingview-widget';
import { supabase } from '@/integrations/supabase/client';

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
  onRunBacktest?: () => void;
}

const CodePreview = ({ strategy, onRunBacktest }: CodePreviewProps) => {
  const [activeTab, setActiveTab] = useState('mql5');
  const [dbCode, setDbCode] = useState<any>(null);
  const { toast } = useToast();
  // Track if user has manually selected a tab
  const [userSelectedTab, setUserSelectedTab] = useState(false);

  // Poll for code from DB every 3 seconds
  useEffect(() => {
    if (!strategy || !strategy.id) return;
    let mounted = true;
    const fetchCode = async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('code')
        .eq('id', strategy.id)
        .single();
      if (!error && data && data.code && mounted) {
        let codeObj = data.code;
        if (typeof codeObj === 'string') {
          try { codeObj = JSON.parse(codeObj); } catch { codeObj = {}; }
        }
        if (typeof codeObj === 'object' && codeObj !== null && !Array.isArray(codeObj)) {
          setDbCode(codeObj);
          // Only auto-select tab if user hasn't manually selected one
          if (!userSelectedTab) {
            if (typeof codeObj.mql5 === 'string' && codeObj.mql5.trim() !== '') setActiveTab('mql5');
            else if (typeof codeObj.mql4 === 'string' && codeObj.mql4.trim() !== '') setActiveTab('mql4');
            else if (typeof codeObj.pineScript === 'string' && codeObj.pineScript.trim() !== '') setActiveTab('pinescript');
            else setActiveTab('mql5');
          }
        }
      }
    };
    fetchCode();
    const interval = window.setInterval(fetchCode, 3000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, [strategy, userSelectedTab]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && e.detail.tab) {
        setActiveTab(e.detail.tab);
        setUserSelectedTab(false); // Reset so next code generation can auto-switch
      }
    };
    window.addEventListener('switchCodeTab', handler);
    return () => window.removeEventListener('switchCodeTab', handler);
  }, []);

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

  if (!strategy || !dbCode) {
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
    <div className="h-full flex flex-col min-h-0">
      {/* Chart Preview Bar and Chart removed: no chart in any tab */}
      <Tabs value={activeTab} onValueChange={tab => { setActiveTab(tab); setUserSelectedTab(true); }} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
            <TabsTrigger value="mql4">MQL4</TabsTrigger>
            <TabsTrigger value="mql5">MQL5</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <TabsContent value="pinescript" className="h-full m-0 overflow-hidden">
            {dbCode && typeof dbCode === 'object' && !Array.isArray(dbCode) && typeof dbCode.pineScript === 'string' && dbCode.pineScript &&
              (dbCode.pineScript.trim().startsWith('//@version=4') || dbCode.pineScript.trim().startsWith('//@version=5')) ? (
                <CodeEditor
                  code={dbCode.pineScript}
                  language="pinescript"
                  onCopy={() => handleCopy(dbCode.pineScript)}
                  onDownload={() => handleDownload(dbCode.pineScript, `${strategy?.name || 'strategy'}.pine`)}
                />
              ) : (
                <EmptyState message="No Pine Script generated yet" />
              )}
          </TabsContent>

          <TabsContent value="mql4" className="h-full m-0 overflow-hidden">
            {dbCode && typeof dbCode === 'object' && !Array.isArray(dbCode) && typeof dbCode.mql4 === 'string' && dbCode.mql4 ? (
              <CodeEditor
                code={dbCode.mql4}
                language="mql4"
                onCopy={() => handleCopy(dbCode.mql4)}
                onDownload={() => handleDownload(dbCode.mql4, `${strategy?.name || 'strategy'}.mq4`)}
              />
            ) : (
              <EmptyState message="No MQL4 code generated yet" />
            )}
          </TabsContent>

          <TabsContent value="mql5" className="h-full m-0 overflow-hidden">
            {dbCode && typeof dbCode === 'object' && !Array.isArray(dbCode) && typeof dbCode.mql5 === 'string' && dbCode.mql5 ? (
              <CodeEditor
                code={dbCode.mql5}
                language="mql5"
                onCopy={() => handleCopy(dbCode.mql5)}
                onDownload={() => handleDownload(dbCode.mql5, `${strategy?.name || 'strategy'}.mq5`)}
              />
            ) : (
              <EmptyState message="No MQL5 code generated yet" />
            )}
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
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 flex-shrink-0">
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
      
      <div className="flex-1 overflow-auto min-h-0 code-scrollable">
        <div className="p-4">
          <pre className="text-sm font-mono text-foreground bg-background whitespace-pre overflow-x-auto code-scrollable">
            <code className="block min-w-max">{code}</code>
          </pre>
        </div>
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