'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import Navigation from "@/components/Navigation";

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

export default function HomePage() {
  const rotatingPlaceholder = RotatingPlaceholder();
  const [strategy, setStrategy] = useState("");
  const [likedStrategies, setLikedStrategies] = useState<Set<number>>(new Set());
  const [strategyLikes, setStrategyLikes] = useState<Record<number, number>>({});
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { openAuthDialog } = useAuthDialog();
  const { user } = useAuth();

  const handleBuildStrategy = () => {
    if (strategy.trim()) {
      localStorage.setItem("userStrategy", strategy);
      router.push("/dashboard");
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
        // Transform database data to match display structure
        const transformedData = strategiesData.map(strategy => {
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
            isPublic: !strategy.is_paid,
            summary: strategy.summary,
            code: strategy.code,
            analytics: strategy.analytics,
            publish_version: strategy.publish_version
          };
        });
        setShowcaseStrategies(transformedData);
      } else {
        console.log('No published strategies found, using fallback data');
        // Fallback data
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
    
    router.push(`/dashboard?remix=${strategyId}`);
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
  }, [showcaseStrategies]);

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative flex-1 flex flex-col justify-center">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-accent">
              Build Smarter Trading Strategies with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your trading ideas into profitable strategies using advanced AI. 
              Generate, backtest, and deploy trading algorithms in minutes, not months.
            </p>
            
            {/* Strategy Input */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative">
                <Textarea
                  placeholder={rotatingPlaceholder}
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="min-h-[120px] text-lg p-6 border-2 border-primary/20 rounded-xl bg-card/80 backdrop-blur-sm focus:border-primary resize-none"
                />
                <Button 
                  onClick={handleBuildStrategy}
                  className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Build Strategy <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Example Strategies */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground mr-2">Try:</span>
                {exampleStrategies.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setStrategy(example)}
                    className="text-xs sm:text-sm bg-secondary/50 hover:bg-secondary text-secondary-foreground px-3 py-1 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Trade Wizard AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to create, test, and optimize your trading strategies with unprecedented speed and accuracy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Showcase */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Community Strategy Showcase
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover and learn from strategies created by our AI community
            </p>
          </div>
          
          <StrategyShowcaseGrid 
            strategies={showcaseStrategies}
            onCopy={handleCopyStrategy}
            onRemix={handleRemixStrategy}
            onBuy={handleBuyStrategy}
            onLike={handleLikeStrategy}
            onDetails={handleStrategyDetails}
            onShare={handleShareStrategy}
            likedStrategies={likedStrategies}
            strategyLikes={strategyLikes}
          />
        </div>
      </section>

      {/* Strategy Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedStrategy?.title}
            </DialogTitle>
            <DialogDescription className="text-lg">
              {selectedStrategy?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStrategy && (
            <div className="space-y-6">
              {/* Author and Performance */}
              <div className="flex flex-wrap gap-4 justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {selectedStrategy.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStrategy.author}</p>
                    <p className="text-sm text-muted-foreground">Strategy Creator</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{selectedStrategy.performance?.returns}</p>
                    <p className="text-muted-foreground">Returns</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{selectedStrategy.performance?.winRate}</p>
                    <p className="text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{selectedStrategy.performance?.sharpe}</p>
                    <p className="text-muted-foreground">Sharpe</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedStrategy.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Summary */}
              {selectedStrategy.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Strategy Summary</h3>
                  <p className="text-muted-foreground">{selectedStrategy.summary}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleCopyStrategy(selectedStrategy.id)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Code
                </Button>
                <Button 
                  onClick={() => handleRemixStrategy(selectedStrategy.id)}
                  className="flex items-center gap-2"
                >
                  <GitFork className="h-4 w-4" />
                  Remix Strategy
                </Button>
                <Button 
                  onClick={() => handleShareStrategy(selectedStrategy)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}