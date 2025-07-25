import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Brain, Code, TrendingUp, Zap, Star, Copy, Play, Eye, Users, Activity, DollarSign, Heart, Download, GitFork, MoreVertical, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import StrategyShowcaseGrid from "@/components/StrategyShowcaseGrid";
import { useAuth } from "@/contexts/AuthContext";

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
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openAuthDialog } = useAuthDialog();
  const { user } = useAuth();

  useEffect(() => {
    // Theme is now managed globally
    return () => {};
  }, []);

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

  const [showcaseStrategies, setShowcaseStrategies] = useState<any[]>([]);
  useEffect(() => {
    const fetchStrategies = async () => {
      console.log('Fetching published strategies from public_strategies table...');
      
      // Fetch public strategies
      const { data: strategiesData, error: strategiesError } = await supabase
        .from('public_strategies')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (strategiesError) {
        console.error('Error fetching strategies:', strategiesError);
        return;
      }
      
      // Fetch all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
      
      // Create a map of user_id to profile data
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      console.log('Fetch result:', { strategiesData, profilesData });
      
      if (strategiesData && strategiesData.length > 0) {
        //console.log('Found', strategiesData.length, 'published strategies');
        // Transform database data to match display structure
        const transformedData = strategiesData.map(strategy => {
          //console.log('Strategy thumbnail:', strategy.thumbnail); // Debug thumbnail
          
          // Get user display name from profiles map
          const userProfile = profilesMap.get(strategy.user_id);
          const displayName = userProfile?.display_name || 'Anonymous';
          const avatarInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          
          return {
            id: strategy.id,
            title: strategy.title || 'Untitled Strategy',
            description: strategy.description || 'No description available',
            author: displayName,
            avatar: avatarInitials,
            performance: {
              returns: (strategy.analytics as any)?.total_return ? `+${(strategy.analytics as any).total_return.toFixed(1)}%` : '+0.0%',
              winRate: (strategy.analytics as any)?.win_rate ? `${((strategy.analytics as any).win_rate * 100).toFixed(1)}%` : '0.0%',
              sharpe: (strategy.analytics as any)?.sharpe_ratio ? (strategy.analytics as any).sharpe_ratio.toFixed(2) : '0.00',
              maxDrawdown: (strategy.analytics as any)?.max_drawdown ? `${(strategy.analytics as any).max_drawdown.toFixed(1)}%` : '0.0%'
            },
            tags: strategy.tags || [],
            price: strategy.is_paid && strategy.price ? `$${strategy.price}` : "Free",
            likes: strategy.likes || 0,
            copies: strategy.copies || 0,
            remixes: strategy.remixes || 0,
            thumbnail: strategy.thumbnail,
            isPublic: !strategy.is_paid, // Free strategies are public
            summary: strategy.summary,
            code: strategy.code,
            analytics: strategy.analytics,
            publish_version: strategy.publish_version
          };
        });
        setShowcaseStrategies(transformedData);
      } else {
        console.log('No published strategies found, using fallback data');
        // fallback to hardcoded if fetch fails or empty
        setShowcaseStrategies([
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
        ]);
      }
    };
    fetchStrategies();
  }, []);

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

  const handleCopyStrategy = async (strategyId: number) => {
    // Find the strategy by ID
    const strategy = showcaseStrategies.find(s => s.id === strategyId);
    if (!strategy || !strategy.code) {
      toast({
        title: "No code available",
        description: "This strategy doesn't have any code to copy.",
        variant: "destructive",
      });
      return;
    }

    // Get the best available code (prefer MQL5, then MQL4, then Pine Script)
    let codeToCopy = '';
    if (strategy.code.mql5 && strategy.code.mql5.trim()) {
      codeToCopy = strategy.code.mql5;
    } else if (strategy.code.mql4 && strategy.code.mql4.trim()) {
      codeToCopy = strategy.code.mql4;
    } else if (strategy.code.pineScript && strategy.code.pineScript.trim()) {
      codeToCopy = strategy.code.pineScript;
    }

    if (!codeToCopy) {
      toast({
        title: "No code available",
        description: "This strategy doesn't have any code to copy.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(codeToCopy);
      
      // Increment remix count in database
      const { error: updateError } = await supabase
        .from('public_strategies')
        .update({ 
          remixes: (strategy.remixes || 0) + 1 
        })
        .eq('id', strategyId.toString());
      
      if (updateError) {
        console.error('Error updating remix count:', updateError);
      } else {
        // Update local state
        setShowcaseStrategies(prev => 
          prev.map(s => 
            s.id === strategyId 
              ? { ...s, remixes: (s.remixes || 0) + 1 }
              : s
          )
        );
      }
      
      // Determine which code type was copied
      let codeType = '';
      if (strategy.code.mql5 && strategy.code.mql5.trim()) {
        codeType = 'MQL5';
      } else if (strategy.code.mql4 && strategy.code.mql4.trim()) {
        codeType = 'MQL4';
      } else if (strategy.code.pineScript && strategy.code.pineScript.trim()) {
        codeType = 'Pine Script';
      }
      
      toast({
        title: "✅ Strategy copied to clipboard!",
        description: `${codeType} code for "${strategy.title}" has been copied. You can now paste it into your trading platform.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy code",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  const handleRemixStrategy = async (strategyId: number) => {
    // Find the strategy by ID
    const strategy = showcaseStrategies.find(s => s.id === strategyId);
    
    // Increment remix count in database
    if (strategy) {
      const { error: updateError } = await supabase
        .from('public_strategies')
        .update({ 
          remixes: (strategy.remixes || 0) + 1 
        })
        .eq('id', strategyId.toString());
      
      if (updateError) {
        console.error('Error updating remix count:', updateError);
      } else {
        // Update local state
        setShowcaseStrategies(prev => 
          prev.map(s => 
            s.id === strategyId 
              ? { ...s, remixes: (s.remixes || 0) + 1 }
              : s
          )
        );
      }
    }
    
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
        
        // Update likes count in public_strategies table
        const currentLikes = strategyLikes[strategyId] || 0;
        await supabase
          .from('public_strategies')
          .update({ likes: Math.max(currentLikes - 1, 0) })
          .eq('id', strategyId.toString());
        
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
        
        // Update likes count in public_strategies table
        const currentLikes = strategyLikes[strategyId] || 0;
        await supabase
          .from('public_strategies')
          .update({ likes: currentLikes + 1 })
          .eq('id', strategyId.toString());
        
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
  }, [showcaseStrategies]); // Add showcaseStrategies to dependency array

  const handleStrategyDetails = (strategy: any) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleShareStrategy = async (strategy: any) => {
    const shareUrl = `${window.location.origin}/strategy/${strategy.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Strategy link has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          <div className="text-center mb-8 sm:mb-12">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-primary/20 text-primary bg-primary/10">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Strategy Builder
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Turn trading ideas into <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">automated strategies</span> in seconds
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-10 max-w-xl sm:max-w-3xl mx-auto">
              Describe your trading strategy in plain English and watch our AI convert it into 
              executable Pine Script, MQL4, and MQL5 code. No programming experience required.
            </p>
          </div>

          {/* Prompt Area */}
          <div className="flex flex-col items-center justify-center">
            <div className="backdrop-blur-md bg-black/70 border border-white/10 shadow-xl rounded-2xl px-4 sm:px-6 py-6 sm:py-8 w-full max-w-md sm:max-w-3xl mx-auto mb-6 sm:mb-8 relative">
              <Textarea
                placeholder={rotatingPlaceholder}
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="bg-transparent border-none text-base sm:text-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-[56px] mb-3 sm:mb-4 resize-none shadow-none"
                style={{boxShadow: 'none'}}
              />
              <button
                onClick={handleBuildStrategy}
                className={`absolute right-4 sm:right-6 bottom-6 sm:bottom-8 rounded-full p-3 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${!strategy.trim() ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-primary hover:bg-primary/80 text-white'}`}
                style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)'}}
                aria-label="Submit"
                disabled={!strategy.trim()}
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Example Strategy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md sm:max-w-4xl mx-auto">
            {exampleStrategies.map((example, index) => (
              <Card key={index} className="trading-card hover:shadow-glow transition-all cursor-pointer group text-left" onClick={() => setStrategy(example)}>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Showcase */}
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-2 sm:mb-4 border-primary/20 text-primary">
              <Users className="w-3 h-3 mr-1" />
              Community Showcase
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Discover Profitable Strategies
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-lg sm:max-w-2xl mx-auto">
              Explore top-performing strategies created by our community. Copy, remix, or purchase to accelerate your trading success.
            </p>
          </div>

          <StrategyShowcaseGrid
            strategies={showcaseStrategies}
            onCopy={handleCopyStrategy}
            onRemix={handleRemixStrategy}
            onBuy={handleBuyStrategy}
            onMoreInfo={handleStrategyDetails}
          />

          {/* Strategy Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-xs sm:max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-bold">{selectedStrategy?.title}</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {selectedStrategy?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                {/* Thumbnail */}
                {selectedStrategy?.thumbnail && (
                  <div className="relative">
                    <img 
                      src={selectedStrategy.thumbnail} 
                      alt={selectedStrategy.title}
                      className="w-full h-32 sm:h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {/* Strategy Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Performance</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Returns:</span>
                        <span className="text-xs sm:text-sm font-medium text-success">{selectedStrategy?.performance?.returns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Win Rate:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.performance?.winRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Sharpe Ratio:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.performance?.sharpe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Max Drawdown:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.performance?.maxDrawdown}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Strategy Info</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Type:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.summary?.type || 'Custom'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Confidence:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.summary?.confidence || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Likes:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.likes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Remixes:</span>
                        <span className="text-xs sm:text-sm font-medium">{selectedStrategy?.remixes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tags */}
                {selectedStrategy?.tags && selectedStrategy.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStrategy.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 pt-2 sm:pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleShareStrategy(selectedStrategy)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleCopyStrategy(selectedStrategy?.id)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Strategy
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleRemixStrategy(selectedStrategy?.id)}
                  >
                    <GitFork className="w-4 h-4 mr-2" />
                    Remix
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="text-center mt-8 sm:mt-12">
            <Button asChild variant="outline" size="lg">
              <NavLink to="/marketplace" className="flex items-center justify-center">
                View All Strategies
                <ArrowRight className="w-4 h-4 ml-2" />
              </NavLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Powerful Features for Every Trader
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-lg sm:max-w-2xl mx-auto">
              Everything you need to create, test, and deploy winning trading strategies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="trading-card hover:shadow-glow transition-all text-center group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-lg sm:max-w-2xl mx-auto">
            Join thousands of traders who've revolutionized their approach with AI-powered strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" className="glow-button" onClick={() => navigate("/dashboard")}> 
              <Brain className="w-5 h-5 mr-2" />
              Start Building Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuthDialog()}>
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;