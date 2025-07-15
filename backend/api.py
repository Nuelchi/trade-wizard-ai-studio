from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, List, Dict
from backtest_engine import run_backtest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BacktestRequest(BaseModel):
    ohlcv: List[Dict[str, Any]]
    strategy_rules: Any

@app.post("/backtest")
async def backtest(req: BacktestRequest):
    trades, metrics = run_backtest(req.ohlcv, req.strategy_rules)
    return {"trades": trades, "metrics": metrics} 