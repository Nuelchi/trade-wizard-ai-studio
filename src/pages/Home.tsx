import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Code, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Home = () => {
  const [strategy, setStrategy] = useState("");
  const navigate = useNavigate();

  const handleBuildStrategy = () => {
    if (strategy.trim()) {
      // Store the strategy in localStorage to pass to build page
      localStorage.setItem("currentStrategy", strategy);
      navigate("/build");
    }
  };

  const exampleStrategies = [
    "Buy when RSI is under 30 and sell when it's above 70",
    "Buy when 20-day MA crosses above 50-day MA",
    "Buy when price breaks above Bollinger Bands upper band",
    "Scalping strategy: Buy on 5-minute chart when MACD crosses above signal line"
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Chat",
      description: "Chat with AI just like in Lovable.dev - describe your strategy conversationally"
    },
    {
      icon: Code,
      title: "Live Code Preview",
      description: "Watch your code generate in real-time as you chat, with instant downloads"
    },
    {
      icon: BarChart3,
      title: "No-Code Friendly",
      description: "Perfect for traders who know nothing about coding - AI does all the work"
    },
    {
      icon: TrendingUp,
      title: "Multi-Platform Ready",
      description: "Get Pine Script, MQL4, and MQL5 versions of your strategy instantly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Strategy Builder</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build trading strategies with <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">AI conversations</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Just like Lovable.dev, but for traders. Chat with AI to describe your strategy and watch it 
            generate live Pine Script, MQL4, and MQL5 code. No coding experience needed.
          </p>
        </div>

        {/* Strategy Input Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="trading-card p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Describe Your Trading Strategy
            </h2>
            
            <Textarea
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="Describe your strategy... e.g. 'Buy when 50-day moving average crosses above 200-day moving average and RSI is below 30. Sell when RSI goes above 70 or stop loss at 2%'"
              className="strategy-input min-h-[120px] text-lg mb-6"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="glow-button text-lg px-8 py-4 group"
            >
              Start Building
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
              
              <span className="text-sm text-muted-foreground">
                Or try an example below
              </span>
            </div>
          </div>
        </div>

        {/* Example Strategies */}
        <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-lg font-medium text-foreground mb-4 text-center">
              Example Prompts to Try
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleStrategies.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    localStorage.setItem('initialPrompt', example);
                    navigate('/dashboard');
                  }}
                  className="text-left p-4 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  "{example}"
                </button>
              ))}
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="trading-card p-6 text-center group hover:shadow-glow transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;