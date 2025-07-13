import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings, TrendingUp } from "lucide-react";

interface Indicator {
  id: string;
  name: string;
  type: "sma" | "ema" | "rsi" | "macd" | "bb" | "stoch";
  period?: number;
  source?: "open" | "high" | "low" | "close";
  parameters?: Record<string, any>;
}

interface Condition {
  id: string;
  type: "entry" | "exit";
  logic: "and" | "or";
  rules: ConditionRule[];
}

interface ConditionRule {
  id: string;
  indicator1: string;
  operator: ">" | "<" | "crossover" | "crossunder" | "=" | "!=";
  indicator2?: string;
  value?: number;
}

export const StrategyBuilder = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [strategyParams, setStrategyParams] = useState({
    name: "",
    timeframe: "1D",
    symbol: "EURUSD",
    riskManagement: {
      stopLoss: 2.0,
      takeProfit: 4.0,
      positionSize: 1.0
    }
  });

  const indicatorTypes = [
    { value: "sma", label: "Simple Moving Average" },
    { value: "ema", label: "Exponential Moving Average" },
    { value: "rsi", label: "Relative Strength Index" },
    { value: "macd", label: "MACD" },
    { value: "bb", label: "Bollinger Bands" },
    { value: "stoch", label: "Stochastic" }
  ];

  const operators = [
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
    { value: "crossover", label: "Crosses above" },
    { value: "crossunder", label: "Crosses below" },
    { value: "=", label: "Equals" },
    { value: "!=", label: "Not equals" }
  ];

  const addIndicator = () => {
    const newIndicator: Indicator = {
      id: `indicator_${Date.now()}`,
      name: `Indicator ${indicators.length + 1}`,
      type: "sma",
      period: 20,
      source: "close"
    };
    setIndicators([...indicators, newIndicator]);
  };

  const removeIndicator = (id: string) => {
    setIndicators(indicators.filter(i => i.id !== id));
  };

  const updateIndicator = (id: string, updates: Partial<Indicator>) => {
    setIndicators(indicators.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addCondition = (type: "entry" | "exit") => {
    const newCondition: Condition = {
      id: `condition_${Date.now()}`,
      type,
      logic: "and",
      rules: []
    };
    setConditions([...conditions, newCondition]);
  };

  const addConditionRule = (conditionId: string) => {
    const newRule: ConditionRule = {
      id: `rule_${Date.now()}`,
      indicator1: indicators[0]?.id || "",
      operator: ">",
      value: 0
    };
    
    setConditions(conditions.map(c => 
      c.id === conditionId 
        ? { ...c, rules: [...c.rules, newRule] }
        : c
    ));
  };

  const generateStrategy = () => {
    const strategyData = {
      name: strategyParams.name,
      indicators,
      conditions,
      parameters: strategyParams
    };
    
    // This would normally call an AI service to generate code
    console.log("Generated Strategy:", strategyData);
    return strategyData;
  };

  return (
    <div className="space-y-6">
      {/* Strategy Parameters */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Strategy Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategyName">Strategy Name</Label>
              <Input
                id="strategyName"
                value={strategyParams.name}
                onChange={(e) => setStrategyParams({...strategyParams, name: e.target.value})}
                placeholder="My Trading Strategy"
              />
            </div>
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={strategyParams.timeframe} onValueChange={(value) => setStrategyParams({...strategyParams, timeframe: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1D">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stopLoss">Stop Loss %</Label>
              <Input
                id="stopLoss"
                type="number"
                value={strategyParams.riskManagement.stopLoss}
                onChange={(e) => setStrategyParams({
                  ...strategyParams,
                  riskManagement: {
                    ...strategyParams.riskManagement,
                    stopLoss: parseFloat(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit %</Label>
              <Input
                id="takeProfit"
                type="number"
                value={strategyParams.riskManagement.takeProfit}
                onChange={(e) => setStrategyParams({
                  ...strategyParams,
                  riskManagement: {
                    ...strategyParams.riskManagement,
                    takeProfit: parseFloat(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="positionSize">Position Size</Label>
              <Input
                id="positionSize"
                type="number"
                value={strategyParams.riskManagement.positionSize}
                onChange={(e) => setStrategyParams({
                  ...strategyParams,
                  riskManagement: {
                    ...strategyParams.riskManagement,
                    positionSize: parseFloat(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Technical Indicators
            </CardTitle>
            <Button onClick={addIndicator} size="sm" className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Indicator
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {indicators.map((indicator) => (
            <div key={indicator.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={indicator.type} 
                    onValueChange={(value) => updateIndicator(indicator.id, { type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indicatorTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Period</Label>
                  <Input
                    type="number"
                    value={indicator.period}
                    onChange={(e) => updateIndicator(indicator.id, { period: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Source</Label>
                  <Select 
                    value={indicator.source} 
                    onValueChange={(value) => updateIndicator(indicator.id, { source: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="close">Close</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={indicator.name}
                    onChange={(e) => updateIndicator(indicator.id, { name: e.target.value })}
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeIndicator(indicator.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {indicators.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No indicators added yet. Click "Add Indicator" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Conditions */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entry Conditions</CardTitle>
            <Button onClick={() => addCondition("entry")} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Entry Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conditions.filter(c => c.type === "entry").map((condition) => (
            <div key={condition.id} className="p-4 bg-success/10 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-success/20">Entry</Badge>
                <Button
                  size="sm"
                  onClick={() => addConditionRule(condition.id)}
                  variant="outline"
                >
                  Add Rule
                </Button>
              </div>
              
              {condition.rules.map((rule, index) => (
                <div key={rule.id} className="grid grid-cols-4 gap-4 mb-2">
                  <Select value={rule.indicator1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={rule.operator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Value"
                    value={rule.value || ""}
                    onChange={(e) => {
                      // Update rule value logic here
                    }}
                  />
                  
                  <Button size="sm" variant="destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Exit Conditions */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exit Conditions</CardTitle>
            <Button onClick={() => addCondition("exit")} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Exit Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conditions.filter(c => c.type === "exit").map((condition) => (
            <div key={condition.id} className="p-4 bg-danger/10 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-danger/20">Exit</Badge>
                <Button
                  size="sm"
                  onClick={() => addConditionRule(condition.id)}
                  variant="outline"
                >
                  Add Rule
                </Button>
              </div>
              
              {condition.rules.map((rule, index) => (
                <div key={rule.id} className="grid grid-cols-4 gap-4 mb-2">
                  <Select value={rule.indicator1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={rule.operator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Value"
                    value={rule.value || ""}
                    onChange={(e) => {
                      // Update rule value logic here
                    }}
                  />
                  
                  <Button size="sm" variant="destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generate Strategy */}
      <Button onClick={generateStrategy} className="w-full glow-button" size="lg">
        <TrendingUp className="w-5 h-5 mr-2" />
        Generate Strategy Code
      </Button>
    </div>
  );
};

export default StrategyBuilder;