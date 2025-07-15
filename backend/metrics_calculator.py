# metrics_calculator.py
from typing import List, Dict, Any
import math
from collections import defaultdict, Counter
from datetime import datetime

def calculate_metrics(trades: List[Dict[str, Any]], ohlcv: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate all performance metrics for Overview, Performance, and Trade Analysis tabs.
    Returns a dict with 'overview', 'performance', and 'trade_analysis' keys.
    """
    if not trades:
        return {
            'overview': {},
            'performance': {},
            'trade_analysis': {},
            'equity_curve': [],
            'trade_log': [],
        }
    net_profit = sum(t['pnl'] for t in trades)
    gross_profit = sum(t['pnl'] for t in trades if t['pnl'] > 0)
    gross_loss = sum(t['pnl'] for t in trades if t['pnl'] < 0)
    wins = [t for t in trades if t['pnl'] > 0]
    losses = [t for t in trades if t['pnl'] <= 0]
    win_rate = len(wins) / len(trades) * 100
    profit_factor = gross_profit / abs(gross_loss) if gross_loss else float('inf')
    avg_win = sum(t['pnl'] for t in wins) / len(wins) if wins else 0
    avg_loss = sum(t['pnl'] for t in losses) / len(losses) if losses else 0
    avg_trade = net_profit / len(trades)
    longs = [t for t in trades if t['direction'] == 'long']
    shorts = [t for t in trades if t['direction'] == 'short']
    longs_won = len([t for t in longs if t['pnl'] > 0])
    shorts_won = len([t for t in shorts if t['pnl'] > 0])
    avg_bars_in_trade = sum(t['exit_idx'] - t['entry_idx'] for t in trades) / len(trades)
    largest_win = max(trades, key=lambda t: t['pnl'])['pnl']
    largest_loss = min(trades, key=lambda t: t['pnl'])['pnl']
    # Max consecutive wins/losses
    max_consec_wins = max_consec_losses = 0
    cur_wins = cur_losses = 0
    for t in trades:
        if t['pnl'] > 0:
            cur_wins += 1
            cur_losses = 0
        else:
            cur_losses += 1
            cur_wins = 0
        max_consec_wins = max(max_consec_wins, cur_wins)
        max_consec_losses = max(max_consec_losses, cur_losses)
    # Equity curve
    equity = 0
    equity_curve = []
    for t in trades:
        equity += t['pnl']
        equity_curve.append(equity)
    # Max drawdown
    peak = 0
    max_dd = 0
    for eq in equity_curve:
        peak = max(peak, eq)
        dd = peak - eq
        max_dd = max(max_dd, dd)
    # Recovery factor
    recovery_factor = net_profit / max_dd if max_dd > 0 else 0
    # Sharpe ratio (assume risk-free rate = 0, daily returns)
    returns = [trades[0]['pnl']] + [trades[i]['pnl'] - trades[i-1]['pnl'] for i in range(1, len(trades))]
    mean_return = sum(returns) / len(returns)
    std_return = math.sqrt(sum((r - mean_return) ** 2 for r in returns) / len(returns)) if len(returns) > 1 else 0
    sharpe = (mean_return / std_return) * math.sqrt(252) if std_return > 0 else 0
    # Expectancy
    expectancy = (avg_win * (win_rate/100)) + (avg_loss * (1-win_rate/100))
    # Standard deviation
    stddev = std_return
    # Calmar ratio (annual return / max drawdown)
    annual_return = net_profit # Placeholder: should be annualized
    calmar = (annual_return / max_dd) if max_dd > 0 else 0
    # Sortino ratio (downside deviation)
    downside_returns = [r for r in returns if r < 0]
    downside_std = math.sqrt(sum((r - mean_return) ** 2 for r in downside_returns) / len(downside_returns)) if downside_returns else 0
    sortino = (mean_return / downside_std) * math.sqrt(252) if downside_std > 0 else 0
    # Best/worst trade
    best_trade = max(trades, key=lambda t: t['pnl'])
    worst_trade = min(trades, key=lambda t: t['pnl'])
    # Profit/loss by month
    pl_by_month = defaultdict(float)
    for t in trades:
        dt = datetime.utcfromtimestamp(t['exit_time']) if isinstance(t['exit_time'], (int, float)) else datetime.fromisoformat(t['exit_time'])
        key = f"{dt.year}-{dt.month:02d}"
        pl_by_month[key] += t['pnl']
    # Trade length distribution
    trade_lengths = [t['exit_idx'] - t['entry_idx'] for t in trades]
    trade_length_dist = dict(Counter(trade_lengths))
    # R-multiples (assume 1R = average loss)
    avg_loss_abs = abs(avg_loss) if avg_loss else 1
    r_multiples = [t['pnl']/avg_loss_abs if avg_loss_abs else 0 for t in trades]
    r_multiple_dist = dict(Counter(round(r, 1) for r in r_multiples))
    # Trade direction distribution
    direction_dist = dict(Counter(t['direction'] for t in trades))
    return {
        # Overview Tab Metrics
        'overview': {
            'net_profit': net_profit,
            'gross_profit': gross_profit,
            'gross_loss': gross_loss,
            'total_trades': len(trades),
            'win_rate': win_rate,
            'max_drawdown': max_dd,
            'profit_factor': profit_factor,
            'sharpe_ratio': sharpe,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'avg_trade': avg_trade,
            'longs_won': longs_won,
            'shorts_won': shorts_won,
            'avg_bars_in_trade': avg_bars_in_trade,
            'largest_win': largest_win,
            'largest_loss': largest_loss,
            'max_consec_wins': max_consec_wins,
            'max_consec_losses': max_consec_losses,
            'recovery_factor': recovery_factor,
            'equity_curve': equity_curve,
        },
        # Performance Tab Metrics
        'performance': {
            'total_return': net_profit, # Placeholder for annualized
            'annual_return': annual_return,
            'monthly_return': dict(pl_by_month),
            'best_trade': best_trade,
            'worst_trade': worst_trade,
            'calmar_ratio': calmar,
            'sortino_ratio': sortino,
            'expectancy': expectancy,
            'stddev': stddev,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'avg_r_multiple': sum(r_multiples) / len(r_multiples) if r_multiples else 0,
        },
        # Trade Analysis Tab Metrics
        'trade_analysis': {
            'trade_length_dist': trade_length_dist,
            'direction_dist': direction_dist,
            'r_multiple_dist': r_multiple_dist,
            'trade_log': trades,
        },
        'equity_curve': equity_curve,
        'trade_log': trades,
    } 