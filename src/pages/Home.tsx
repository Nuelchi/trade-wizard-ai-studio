import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Brain, Code, TrendingUp, Zap, Star, Copy, Play, Eye, Users, Activity, DollarSign, Heart, Download, GitFork } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthDialog } from "@/contexts/AuthDialogContext";

const RotatingPlaceholder = () => {
  const placeholders = [
    "Create a strategy that buys when the 50 EMA is above the 200 EMA and RSI is below 40",
    "Build a strategy that enters long when price breaks above resistance with volume",
    "Design a strategy that buys Bitcoin when MACD crosses up and daily volume is high",
    "Generate a strategy that shorts SPY if VIX spikes above 30 and price breaks support",
    "Develop a strategy that buys when 20-day MA crosses above 50-day MA and ADX > 25",
    "Write a strategy that sells when RSI exceeds 70 or stop loss is hit at 2%",
    "Construct a strategy that goes long on EUR/USD when bullish divergence appears on 1H"
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentPlaceholder = placeholders[currentIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentPlaceholder.length) {
          setDisplayText(currentPlaceholder.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 800);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, isDeleting ? 20 : 40);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, placeholders]);
  
  return displayText;
};

const Home = () => {
  const rotatingPlaceholder = RotatingPlaceholder();
  const [strategy, setStrategy] = useState("");
  const [likedStrategies, setLikedStrategies] = useState<Set<number>>(new Set());
  const [strategyLikes, setStrategyLikes] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openAuthDialog } = useAuthDialog();

  const handleBuildStrategy = () => {
    if (strategy.trim()) {
      localStorage.setItem("userStrategy", strategy);
      navigate("/dashboard");
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
    navigate(`/dashboard?remix=${strategyId}`);
  };

  const handleBuyStrategy = (strategyId: number, price: string) => {
    toast({
      title: "Redirecting to checkout",
      description: `Purchase ${price} strategy...`,
    });
  };

  const handleLikeStrategy = async (strategyId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to like strategies.",
          variant: "destructive",
        });
        return;
      }

      const isLiked = likedStrategies.has(strategyId);
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('strategy_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('strategy_id', strategyId.toString());
        
        setLikedStrategies(prev => {
          const newSet = new Set(prev);
          newSet.delete(strategyId);
          return newSet;
        });
        
        setStrategyLikes(prev => ({
          ...prev,
          [strategyId]: Math.max((prev[strategyId] || 0) - 1, 0)
        }));
      } else {
        // Like
        await supabase
          .from('strategy_likes')
          .insert({
            user_id: user.id,
            strategy_id: strategyId.toString()
          });
        
        setLikedStrategies(prev => new Set([...prev, strategyId]));
        setStrategyLikes(prev => ({
          ...prev,
          [strategyId]: (prev[strategyId] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initialize like counts
    const initialLikes: Record<number, number> = {};
    showcaseStrategies.forEach(strategy => {
      initialLikes[strategy.id] = strategy.likes;
    });
    setStrategyLikes(initialLikes);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden"> {/* Reduced from py-24 to py-16 */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="text-center mb-12"> {/* Reduced mb-16 to mb-12 */}
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary bg-primary/10">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Strategy Builder
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Turn trading ideas into <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">automated strategies</span> in seconds
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Describe your trading strategy in plain English and watch our AI convert it into 
              executable Pine Script, MQL4, and MQL5 code. No programming experience required.
            </p>
          </div>

          {/* Beautiful Prompt Area */}
          <div className="flex flex-col items-center justify-center">
            <div className="backdrop-blur-md bg-black/70 border border-white/10 shadow-xl rounded-2xl px-6 py-8 w-full max-w-3xl mx-auto mb-8 relative">
              <Textarea
                placeholder={rotatingPlaceholder}
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="bg-transparent border-none text-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-primary/50 min-h-[56px] mb-4 resize-none shadow-none"
                style={{boxShadow: 'none'}}
              />
              <button
                onClick={handleBuildStrategy}
                className={`absolute right-6 bottom-8 rounded-full p-3 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${!strategy.trim() ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-primary hover:bg-primary/80 text-white'}`}
                style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)'}}
                aria-label="Submit"
                disabled={!strategy.trim()}
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Example Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {exampleStrategies.map((example, index) => (
              <Card key={index} className="trading-card hover:shadow-glow transition-all cursor-pointer group text-left" onClick={() => setStrategy(example)}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {example}
                  </p>
                </CardContent>
              </Card>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseStrategies.map((strategy) => (
              <Card key={strategy.id} className="trading-card hover:shadow-glow transition-all group overflow-hidden">
                <div className="relative">
                  <div className="h-32 bg-gradient-card flex items-center justify-center">
                    <Activity className="w-12 h-12 text-primary/50" />
                  </div>
                  {strategy.isPublic && (
                    <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                      Free
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeStrategy(strategy.id);
                      }}
                      className="flex items-center space-x-1 hover:scale-110 transition-transform"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          likedStrategies.has(strategy.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`} 
                      />
                      <span className="text-sm text-muted-foreground">
                        {strategyLikes[strategy.id] || strategy.likes}
                      </span>
                    </button>
                  </div>
                  <CardDescription className="text-sm">{strategy.description}</CardDescription>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                      {strategy.avatar}
                    </div>
                    <span className="text-sm text-muted-foreground">{strategy.author}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="metric-card">
                      <div className="text-sm font-medium text-success">{strategy.performance.returns}</div>
                      <div className="text-xs text-muted-foreground">Returns</div>
                    </div>
                    <div className="metric-card">
                      <div className="text-sm font-medium">{strategy.performance.winRate}</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {strategy.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Copy className="w-3 h-3" />
                      <span>{strategy.copies}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>Live</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {strategy.isPublic ? (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCopyStrategy(strategy.id)}>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleRemixStrategy(strategy.id)}>
                          <GitFork className="w-3 h-3 mr-1" />
                          Remix
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => handleBuyStrategy(strategy.id, strategy.price)}>
                          <DollarSign className="w-3 h-3 mr-1" />
                          Buy {strategy.price}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
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
            <Button size="lg" className="glow-button" onClick={() => navigate("/dashboard")}>
              <Brain className="w-5 h-5 mr-2" />
              Start Building Now
            </Button>
            <Button size="lg" variant="outline" onClick={openAuthDialog}>
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;