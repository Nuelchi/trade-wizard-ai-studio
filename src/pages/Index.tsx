import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Brain, Code, TrendingUp, Zap, Star, Copy, Play, Eye, Users, Activity, DollarSign, Heart, Download, GitFork } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StrategyShowcaseGrid from "@/components/StrategyShowcaseGrid";
import { useFetchStrategies } from "@/hooks/useFetchStrategies";

const Index = () => {
  const [strategy, setStrategy] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuildStrategy = () => {
    if (strategy.trim()) {
      localStorage.setItem("userStrategy", strategy);
      navigate("/build");
    } else {
      toast({
        title: "Please enter a strategy",
        description: "Describe your trading strategy to get started.",
        variant: "destructive",
      });
    }
  };

  const exampleStrategies = [
    "Buy when RSI is oversold and price breaks above 20-day moving average",
    "Sell when Bitcoin price drops 5% from 24h high with high volume",
    "Long EUR/USD when it crosses above 50 EMA with bullish divergence on MACD",
    "Short SPY when VIX spikes above 30 and price breaks key support"
  ];

  const showcaseStrategies = [
    {
      id: 1,
      title: "Momentum Breakout Pro",
      description: "AI-powered momentum strategy with adaptive stop-loss",
      author: "Alex Chen",
      avatar: "AC",
      performance: {
        returns: "+156.7%",
        winRate: "73.2%",
        sharpe: "2.41",
        maxDrawdown: "-8.3%"
      },
      tags: ["Momentum", "Breakout", "AI"],
      price: "Free",
      likes: 247,
      copies: 1432,
      thumbnail: "/placeholder.svg",
      isPublic: true
    },
    {
      id: 2,
      title: "Crypto Scalping Beast",
      description: "High-frequency scalping for BTC/ETH pairs",
      author: "Maria Silva", 
      avatar: "MS",
      performance: {
        returns: "+89.4%",
        winRate: "68.9%",
        sharpe: "1.87",
        maxDrawdown: "-12.1%"
      },
      tags: ["Crypto", "Scalping", "High-Freq"],
      price: "$49",
      likes: 189,
      copies: 892,
      thumbnail: "/placeholder.svg",
      isPublic: false
    },
    {
      id: 3,
      title: "Mean Reversion Master",
      description: "Statistical arbitrage with machine learning signals",
      author: "David Kim",
      avatar: "DK", 
      performance: {
        returns: "+203.1%",
        winRate: "81.5%",
        sharpe: "3.12",
        maxDrawdown: "-5.7%"
      },
      tags: ["Mean Reversion", "ML", "Statistical"],
      price: "$99",
      likes: 356,
      copies: 2156,
      thumbnail: "/placeholder.svg",
      isPublic: false
    },
    {
      id: 4,
      title: "Forex Trend Rider",
      description: "Multi-timeframe trend following for major pairs",
      author: "Sarah Johnson",
      avatar: "SJ",
      performance: {
        returns: "+127.3%",
        winRate: "69.8%",
        sharpe: "2.23",
        maxDrawdown: "-9.8%"
      },
      tags: ["Forex", "Trend", "Multi-TF"],
      price: "Free",
      likes: 412,
      copies: 1876,
      thumbnail: "/placeholder.svg",
      isPublic: true
    }
  ];

  const { strategies, loading, error } = useFetchStrategies({ publicOnly: true, sortBy: 'likes' });
  const limitedShowcaseStrategies = strategies.slice(0, 12);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Strategy Generation",
      description: "Transform natural language into executable trading code with advanced AI algorithms."
    },
    {
      icon: Code,
      title: "Multiple Language Support",
      description: "Generate strategies in Pine Script, MQL4/5, Python, and more trading platforms."
    },
    {
      icon: TrendingUp,
      title: "Real-time Backtesting",
      description: "Test your strategies against historical data with comprehensive performance metrics."
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Deploy strategies instantly with optimized code generation and minimal latency."
    }
  ];

  const handleCopyStrategy = (strategyId: number) => {
    toast({
      title: "Strategy copied!",
      description: "Strategy has been added to your workspace.",
    });
  };

  const handleRemixStrategy = (strategyId: number) => {
    navigate(`/build?remix=${strategyId}`);
  };

  const handleBuyStrategy = (strategyId: number, price: string) => {
    toast({
      title: "Redirecting to checkout",
      description: `Purchase ${price} strategy...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Trainflow
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" className="nav-link">Features</Button>
              <Button variant="ghost" className="nav-link">Showcase</Button>
              <Button variant="ghost" className="nav-link">Pricing</Button>
              <Button variant="outline">Sign In</Button>
              <Button className="glow-button">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Trading Strategies
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Transform Ideas into
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Profitable Strategies
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Turn your trading concepts into executable code with our advanced AI. 
              No programming knowledge required. Just describe, deploy, and profit.
            </p>
            
            {/* Strategy Input */}
            <div className="trading-card p-8 max-w-3xl mx-auto mb-12">
              <h3 className="text-lg font-semibold mb-4 text-left">Describe your trading strategy:</h3>
              <Textarea
                placeholder="e.g., Buy when RSI is oversold and price breaks above 20-day moving average with high volume..."
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="strategy-input min-h-[120px] mb-6 text-base"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleBuildStrategy} className="glow-button flex-1">
                  <Brain className="w-4 h-4 mr-2" />
                  Build Strategy with AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  See Examples
                </Button>
              </div>
            </div>

            {/* Example Strategies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {exampleStrategies.map((example, index) => (
                <Card key={index} className="trading-card hover:shadow-glow transition-all cursor-pointer group" onClick={() => setStrategy(example)}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {example}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Showcase */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              <Users className="w-3 h-3 mr-1" />
              Community Showcase
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Discover Profitable Strategies
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore top-performing strategies created by our community. Copy, remix, or purchase to accelerate your trading success.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-center text-destructive py-12">{error}</div>
          ) : (
            <StrategyShowcaseGrid
              strategies={limitedShowcaseStrategies}
              onCopy={handleCopyStrategy}
              onRemix={handleRemixStrategy}
              onBuy={handleBuyStrategy}
            />
          )}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={() => navigate("/marketplace")}> 
              View All Strategies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Every Trader
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, test, and deploy winning trading strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="trading-card hover:shadow-glow transition-all text-center group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of traders who've revolutionized their approach with AI-powered strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-button">
              <Brain className="w-5 h-5 mr-2" />
              Start Building Now
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-primary rounded flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold bg-gradient-primary bg-clip-text text-transparent">
                Trainflow
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Trainflow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;