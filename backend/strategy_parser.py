# strategy_parser.py
from typing import Any, Callable, Dict

class StrategyParseError(Exception):
    pass

def parse_with_ai(rules: str) -> Callable:
    """
    Placeholder for AI-powered parsing of natural language or code-based strategies.
    Should return a signal function.
    """
    # TODO: Integrate with OpenAI or local LLM
    raise StrategyParseError('AI-powered parsing not implemented yet')

def parse_strategy(rules: Any) -> Callable:
    """
    Parse user strategy rules (JSON, code, or natural language) and return a Python function
    that can be used by the backtest engine to generate signals.
    Args:
        rules: JSON, code, or natural language description of the strategy
    Returns:
        signal_func: Callable that takes (candles, idx) and returns 'buy', 'sell', or None
    Raises:
        StrategyParseError: if the rules cannot be parsed
    """
    if isinstance(rules, dict):
        rule_type = rules.get('type')
        params = rules.get('params', {})
        # 1. Simple Moving Average Crossover
        if rule_type == 'sma_crossover':
            fast = params.get('fast', 10)
            slow = params.get('slow', 30)
            def signal_func(candles, idx):
                if idx < slow:
                    return None
                fast_ma = sum([c['close'] for c in candles[idx-fast:idx]]) / fast
                slow_ma = sum([c['close'] for c in candles[idx-slow:idx]]) / slow
                if fast_ma > slow_ma:
                    return 'buy'
                elif fast_ma < slow_ma:
                    return 'sell'
                return None
            return signal_func
        # 2. RSI Threshold
        elif rule_type == 'rsi':
            period = params.get('period', 14)
            overbought = params.get('overbought', 70)
            oversold = params.get('oversold', 30)
            def compute_rsi(candles, idx, period):
                if idx < period:
                    return 50
                gains = 0
                losses = 0
                for i in range(idx-period+1, idx+1):
                    change = candles[i]['close'] - candles[i-1]['close']
                    if change > 0:
                        gains += change
                    else:
                        losses -= change
                avg_gain = gains / period
                avg_loss = losses / period if losses != 0 else 1e-9
                rs = avg_gain / avg_loss
                return 100 - (100 / (1 + rs))
            def signal_func(candles, idx):
                rsi = compute_rsi(candles, idx, period)
                if rsi > overbought:
                    return 'sell'
                elif rsi < oversold:
                    return 'buy'
                return None
            return signal_func
        # 3. MACD Crossover
        elif rule_type == 'macd':
            fast = params.get('fast', 12)
            slow = params.get('slow', 26)
            signal = params.get('signal', 9)
            def ema(values, period):
                k = 2 / (period + 1)
                ema_val = values[0]
                for v in values[1:]:
                    ema_val = v * k + ema_val * (1 - k)
                return ema_val
            def signal_func(candles, idx):
                if idx < slow + signal:
                    return None
                closes = [c['close'] for c in candles[:idx+1]]
                macd_line = ema(closes[-fast:], fast) - ema(closes[-slow:], slow)
                signal_line = ema([ema(closes[max(0, i-fast+1):i+1], fast) - ema(closes[max(0, i-slow+1):i+1], slow) for i in range(slow, idx+1)], signal)
                if macd_line > signal_line:
                    return 'buy'
                elif macd_line < signal_line:
                    return 'sell'
                return None
            return signal_func
        # 4. Price Cross
        elif rule_type == 'price_cross':
            level = params.get('level')
            direction = params.get('direction', 'both')
            if level is None:
                raise StrategyParseError('Missing level for price_cross')
            def signal_func(candles, idx):
                price = candles[idx]['close']
                if direction in ('both', 'above') and price > level:
                    return 'buy'
                if direction in ('both', 'below') and price < level:
                    return 'sell'
                return None
            return signal_func
        # 5. Custom Threshold (generic indicator)
        elif rule_type == 'custom_threshold':
            indicator = params.get('indicator')
            threshold = params.get('threshold')
            op = params.get('op', 'gt')
            action = params.get('action', 'buy')
            if indicator is None or threshold is None:
                raise StrategyParseError('Missing indicator or threshold for custom_threshold')
            def signal_func(candles, idx):
                value = candles[idx].get(indicator)
                if value is None:
                    return None
                if op == 'gt' and value > threshold:
                    return action
                if op == 'lt' and value < threshold:
                    return action
                return None
            return signal_func
        raise StrategyParseError(f'Unsupported JSON rule type: {rule_type}')
    # If rules is a string, use AI-powered parsing (placeholder)
    if isinstance(rules, str):
        return parse_with_ai(rules)
    raise StrategyParseError('Unrecognized strategy rule format') 