import React, { useState, useEffect } from 'react';
import TradingViewWidget from 'react-tradingview-widget';

const ASSET_CLASSES = [
  { key: 'stocks', label: 'Stocks', defaultSymbol: 'NASDAQ:AAPL' },
  { key: 'funds', label: 'Funds', defaultSymbol: 'AMEX:SPY' },
  { key: 'futures', label: 'Futures', defaultSymbol: 'CME_MINI:ES1!' },
  { key: 'forex', label: 'Forex', defaultSymbol: 'FX:EURUSD' },
  { key: 'crypto', label: 'Crypto', defaultSymbol: 'BINANCE:BTCUSDT' },
  { key: 'indices', label: 'Indices', defaultSymbol: 'INDEX:SPX' },
  { key: 'bonds', label: 'Bonds', defaultSymbol: 'TVC:US10Y' },
  { key: 'economy', label: 'Economy', defaultSymbol: 'ECONOMICS:USGDP' },
  { key: 'options', label: 'Options', defaultSymbol: 'OPRA:AAPL230616C00150000' },
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

const TradingChart = () => {
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

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Asset Class Selector */}
      <div className="flex flex-row gap-2 overflow-x-auto pb-2">
        {ASSET_CLASSES.map(a => (
          <button
            key={a.key}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 ${assetClass === a.key ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/30'}`}
            onClick={() => setAssetClass(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>
      {/* Symbol Selector */}
      <div className="flex flex-row gap-2 items-center">
        <span className="text-xs text-muted-foreground">Symbol:</span>
        <select
          className="px-2 py-1 rounded border border-border bg-background text-foreground"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
        >
          {SYMBOLS_BY_CLASS[assetClass].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {/* Interval Selector */}
      <div className="flex flex-row gap-2 items-center">
        <span className="text-xs text-muted-foreground">Interval:</span>
        <select
          className="px-2 py-1 rounded border border-border bg-background text-foreground"
          value={interval}
          onChange={e => setInterval(e.target.value)}
        >
          {INTERVALS.map(i => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>
      {/* TradingView Chart */}
      <div className="flex-1 min-h-[400px] w-full">
        <TradingViewWidget
          symbol={symbol}
          interval={interval}
          theme="Dark"
          locale="en"
          autosize
          hide_side_toolbar={false}
          allow_symbol_change={false}
          toolbar_bg="#141413"
          enable_publishing={false}
          hide_top_toolbar={false}
          save_image={false}
        />
      </div>
    </div>
  );
};

export default TradingChart; 