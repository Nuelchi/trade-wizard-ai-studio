import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Upload, ListChecks, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { AdvancedChart } from 'react-tradingview-embed';

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
  futures: [
    'CME_MINI:ES1!', 'NYMEX:CL1!', 'COMEX:GC1!', 'CBOT:ZC1!', 'CME:6E1!', 'CME:6J1!', 'CME:6B1!', 'CME:6A1!', 'CME:6C1!', 'CME:SI1!'
  ],
  forex: [
    'FX:EURUSD', 'FX:USDJPY', 'FX:GBPUSD', 'FX:USDCHF', 'FX:AUDUSD', 'FX:USDCAD', 'FX:NZDUSD', 'FX:EURGBP', 'FX:EURJPY', 'FX:GBPJPY'
  ],
  crypto: [
    'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT', 'BINANCE:XRPUSDT', 'BINANCE:ADAUSDT', 'BINANCE:DOGEUSDT', 'BINANCE:SOLUSDT', 'BINANCE:MATICUSDT', 'BINANCE:DOTUSDT', 'BINANCE:SHIBUSDT'
  ],
  indices: [
    'INDEX:SPX', 'INDEX:DOWI', 'INDEX:NDX', 'INDEX:RUT', 'INDEX:VIX', 'INDEX:FTSE', 'INDEX:NIKKEI', 'INDEX:DAX', 'INDEX:HSI', 'INDEX:STI'
  ],
  bonds: [
    'TVC:US10Y', 'TVC:US02Y', 'TVC:US30Y', 'TVC:DE10Y', 'TVC:JP10Y', 'TVC:GB10Y', 'TVC:FR10Y', 'TVC:IT10Y', 'TVC:CA10Y', 'TVC:AU10Y'
  ],
  economy: [
    'ECONOMICS:USGDP', 'ECONOMICS:USCPI', 'ECONOMICS:USUNR', 'ECONOMICS:USEMP', 'ECONOMICS:USIR', 'ECONOMICS:USPMI', 'ECONOMICS:USRETAIL', 'ECONOMICS:USCONF', 'ECONOMICS:USM2', 'ECONOMICS:USDEBT'
  ],
  options: [
    'OPRA:AAPL230616C00150000', 'OPRA:TSLA230616C00200000', 'OPRA:MSFT230616C00250000', 'OPRA:GOOGL230616C00120000', 'OPRA:AMZN230616C00130000', 'OPRA:NVDA230616C00400000', 'OPRA:BRK.A230616C00500000', 'OPRA:UNH230616C00550000', 'OPRA:V230616C00220000', 'OPRA:JNJ230616C00180000'
  ]
};

function getPersisted(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

// Memoized TradingView AdvancedChart
interface MemoAdvancedChartProps {
  symbol: string;
  interval: string;
}
const MemoAdvancedChart: React.FC<MemoAdvancedChartProps> = React.memo(({ symbol, interval }) => (
  <AdvancedChart
    widgetProps={{
      symbol,
      theme: "dark",
      interval,
      height: 700,
      width: "100%",
    }}
  />
));

const TradingChart = ({ onStrategySelect, onStrategyUpload }) => {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Database['public']['Tables']['strategies']['Row'][]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Database['public']['Tables']['strategies']['Row'] | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setStrategies(data || []);
        if (data && data.length > 0 && !selectedStrategy) {
          setSelectedStrategy(data[0]);
          onStrategySelect && onStrategySelect(data[0]);
        }
      });
  }, [user]);

  const handleStrategySelect = (strategyId: string) => {
    const strat = strategies.find(s => s.id === strategyId);
    if (strat) {
      setSelectedStrategy(strat);
      onStrategySelect && onStrategySelect(strat);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(pine|mq4|mq5)$/i.test(file.name)) {
      alert('Only .pine, .mq4, or .mq5 files are allowed.');
      return;
    }
    const content = await file.text();
    const newStrategy = {
      user_id: user.id,
      title: file.name,
      description: 'Uploaded strategy',
      code: content,
      chat_history: [],
      analytics: null,
      tags: [],
      is_public: false,
      thumbnail: null,
      likes: 0,
      copies: 0,
      price: null,
    };
    const { data, error } = await supabase.from('strategies').insert(newStrategy).select('*').single();
    if (error) {
      alert('Failed to upload strategy: ' + error.message);
      return;
    }
    setStrategies(prev => [data, ...prev]);
    setSelectedStrategy(data);
    onStrategyUpload && onStrategyUpload(data);
    onStrategySelect && onStrategySelect(data);
  };

  const [assetClass, setAssetClass] = useState(() => getPersisted('chartAssetClass', 'stocks'));
  const [symbol, setSymbol] = useState(() => getPersisted('chartSymbol', ASSET_CLASSES[0].defaultSymbol));
  const [interval, setInterval] = useState(() => getPersisted('chartInterval', 'D'));

  useEffect(() => {
    localStorage.setItem('chartAssetClass', assetClass);
  }, [assetClass]);
  useEffect(() => {
    localStorage.setItem('chartSymbol', symbol);
  }, [symbol]);
  useEffect(() => {
    localStorage.setItem('chartInterval', interval);
  }, [interval]);

  // When asset class changes, update symbol to default for that class
  useEffect(() => {
    const found = ASSET_CLASSES.find(a => a.key === assetClass);
    if (found && !SYMBOLS_BY_CLASS[assetClass].includes(symbol)) {
      setSymbol(found.defaultSymbol);
    }
    // eslint-disable-next-line
  }, [assetClass]);

  const handleAssetClassChange = (key: string) => {
    setAssetClass(key);
    setSymbol(ASSET_CLASSES.find(ac => ac.key === key)?.defaultSymbol || ASSET_CLASSES[0].defaultSymbol);
  };

  const handleSymbolInputBlur = () => {
    const found = ASSET_CLASSES.find(ac => ac.key === assetClass);
    if (found && !SYMBOLS_BY_CLASS[assetClass].includes(symbol)) {
      setSymbol(found.defaultSymbol);
    }
  };

  const handleSymbolInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSymbolInputBlur();
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value);
  };

  const [symbolInput, setSymbolInput] = useState(symbol);
  const [customSymbol, setCustomSymbol] = useState(false);

  useEffect(() => {
    setSymbolInput(symbol);
    setCustomSymbol(!SYMBOLS_BY_CLASS[assetClass].includes(symbol));
  }, [symbol, assetClass]);

  const handleSymbolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSymbol(e.target.value);
    setCustomSymbol(false);
  };

  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbolInput(e.target.value);
    setSymbol(e.target.value);
    setCustomSymbol(true);
  };

  return (
    <div className="flex flex-col h-full w-full p-0 m-0">
      {/* Horizontal selector bar */}
      <div className="flex flex-row items-center gap-2 px-4 py-2 border-b border-border bg-muted/30" style={{ minHeight: 48, maxHeight: 56 }}>
        {/* Asset class pills */}
        <div className="flex flex-row gap-1">
          {ASSET_CLASSES.map((ac) => (
            <button
              key={ac.key}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${assetClass === ac.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              onClick={() => handleAssetClassChange(ac.key)}
            >
              {ac.label}
            </button>
          ))}
        </div>
        {/* Symbol selector */}
        <div className="ml-4 flex flex-row items-center gap-1">
          <span className="text-xs text-muted-foreground">Symbol:</span>
          {customSymbol ? (
            <input
              className="w-28 px-2 py-1 rounded border border-border bg-background text-xs"
              value={symbolInput}
              onChange={handleSymbolInputChange}
              onBlur={handleSymbolInputBlur}
              onKeyDown={handleSymbolInputKeyDown}
              placeholder="e.g. AAPL"
              spellCheck={false}
            />
          ) : (
            <select
              className="w-32 px-2 py-1 rounded border border-border bg-background text-xs"
              value={symbol}
              onChange={handleSymbolSelect}
            >
              {SYMBOLS_BY_CLASS[assetClass].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="__custom__">Custom...</option>
            </select>
          )}
        </div>
        {/* Interval selector */}
        <div className="ml-4 flex flex-row items-center gap-1">
          <span className="text-xs text-muted-foreground">Interval:</span>
          <select
            className="px-2 py-1 rounded border border-border bg-background text-xs"
            value={interval}
            onChange={handleIntervalChange}
          >
            {INTERVALS.map((iv) => (
              <option key={iv.value} value={iv.value}>{iv.label}</option>
            ))}
          </select>
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Strategy dropdown and upload icon */}
        {/* Removed: Play button, strategy dropdown, and upload icon */}
        {/*
        <div className="flex flex-row items-center gap-2">
          <button ...>...</button>
          <select ...>...</select>
          <button ...>...</button>
          <input ... />
        </div>
        */}
      </div>
      {/* Chart area fills all remaining space */}
      <div className="flex-1 h-0 w-full">
        <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
          {/* Removed header for more space */}
          <div className="w-full">
            <MemoAdvancedChart symbol={symbol} interval={interval} key={`${symbol}-${interval}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart; 