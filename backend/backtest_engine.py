# backtest_engine.py
from typing import List, Dict, Any, Tuple
from strategy_parser import parse_strategy, StrategyParseError
from metrics_calculator import calculate_metrics

def run_backtest(ohlcv: List[Dict[str, Any]], strategy_rules: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Simulate trades on OHLCV data using the provided strategy rules.
    Args:
        ohlcv: List of OHLCV dicts (timestamp, open, high, low, close, volume)
        strategy_rules: Dict or string describing entry/exit logic
    Returns:
        trades: List of trade dicts (entry, exit, direction, P&L, etc.)
        metrics: Dict of performance metrics (net profit, win rate, etc.)
    """
    try:
        signal_func = parse_strategy(strategy_rules)
    except StrategyParseError as e:
        return [], {"error": str(e)}

    trades = []
    position = None  # None, 'long', or 'short'
    entry_price = 0
    entry_idx = 0
    for idx in range(len(ohlcv)):
        signal = signal_func(ohlcv, idx)
        price = ohlcv[idx]['close']
        timestamp = ohlcv[idx]['timestamp']
        # Entry logic
        if position is None and signal in ('buy', 'sell'):
            position = 'long' if signal == 'buy' else 'short'
            entry_price = price
            entry_idx = idx
        # Exit logic: reverse signal or end of data
        elif position == 'long' and (signal == 'sell' or idx == len(ohlcv)-1):
            exit_price = price
            trades.append({
                'direction': 'long',
                'entry_idx': entry_idx,
                'entry_time': ohlcv[entry_idx]['timestamp'],
                'entry_price': entry_price,
                'exit_idx': idx,
                'exit_time': timestamp,
                'exit_price': exit_price,
                'pnl': exit_price - entry_price
            })
            position = None
        elif position == 'short' and (signal == 'buy' or idx == len(ohlcv)-1):
            exit_price = price
            trades.append({
                'direction': 'short',
                'entry_idx': entry_idx,
                'entry_time': ohlcv[entry_idx]['timestamp'],
                'entry_price': entry_price,
                'exit_idx': idx,
                'exit_time': timestamp,
                'exit_price': exit_price,
                'pnl': entry_price - exit_price
            })
            position = None
    metrics = calculate_metrics(trades, ohlcv)
    return trades, metrics 