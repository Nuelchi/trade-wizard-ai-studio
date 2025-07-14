
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash, Download, Edit, FileText, Calendar, TrendingUp, BarChart3, Play, Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Strategy {
  id: string;
  title: string;
  summary: any;
  pineScript: string;
  mql4: string;
  mql5: string;
  created: string;
  chatHistory?: any[];
  thumbnail?: string;
  type?: string;
  confidence?: number;
  purchased?: boolean;
  originalAuthor?: string;
  price?: number;
  liked?: boolean;
  rating?: number;
}

const MyStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('myStrategies');
    if (saved) {
      const parsedStrategies = JSON.parse(saved);
      // Add mock data for better visualization
      const enhancedStrategies = parsedStrategies.map((strategy: Strategy) => ({
        ...strategy,
        type: strategy.summary?.type || 'Custom',
        confidence: strategy.summary?.confidence || Math.floor(Math.random() * 20) + 80,
        thumbnail: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1518770660439-4636190af475' : '1461749280684-dccba630e2f6'}?w=400&h=200&fit=crop`,
        rating: Math.floor(Math.random() * 2) + 4,
        liked: Math.random() > 0.5
      }));
      setStrategies(enhancedStrategies);
    }

    // Add some mock purchased strategies
    const mockPurchased = [
      {
        id: 'purchased-1',
        title: 'Pro Scalping Strategy',
        summary: { 
          description: 'Advanced scalping strategy with 85% win rate',
          type: 'Scalping',
          confidence: 92
        },
        pineScript: '// Pro scalping code here',
        mql4: '// MQL4 code',
        mql5: '// MQL5 code',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        purchased: true,
        originalAuthor: 'TradeBot Pro',
        price: 49.99,
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
        rating: 5,
        liked: true,
        chatHistory: [
          { id: '1', content: 'Loading purchased strategy...', sender: 'ai', timestamp: new Date() }
        ]
      },
      {
        id: 'purchased-2',
        title: 'Trend Following Master',
        summary: { 
          description: 'Professional trend following system',
          type: 'Trend Following',
          confidence: 88
        },
        pineScript: '// Trend following code here',
        mql4: '// MQL4 code',
        mql5: '// MQL5 code',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        purchased: true,
        originalAuthor: 'AlgoTrader',
        price: 79.99,
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
        rating: 4,
        liked: false,
        chatHistory: [
          { id: '1', content: 'Loading purchased strategy...', sender: 'ai', timestamp: new Date() }
        ]
      }
    ];

    setStrategies(prev => [...prev, ...mockPurchased]);
  }, []);

  const handleDelete = (id: string) => {
    const updated = strategies.filter(s => s.id !== id && !s.purchased);
    const userStrategies = updated.filter(s => !s.purchased);
    setStrategies(updated);
    localStorage.setItem('myStrategies', JSON.stringify(userStrategies));
    toast('Strategy deleted.');
  };

  const handleOpenStrategy = (strategy: Strategy) => {
    // Store strategy data for dashboard
    localStorage.setItem('currentStrategy', strategy.title);
    localStorage.setItem('exportStrategy', strategy.title);
    localStorage.setItem('exportPineScript', strategy.pineScript);
    localStorage.setItem('exportMQL4', strategy.mql4);
    localStorage.setItem('exportMQL5', strategy.mql5);
    localStorage.setItem('exportSummary', JSON.stringify(strategy.summary));
    
    // Store chat history if available
    if (strategy.chatHistory) {
      localStorage.setItem('chatHistory', JSON.stringify(strategy.chatHistory));
    }
    
    navigate('/dashboard');
  };

  const handleExport = (strategy: Strategy) => {
    localStorage.setItem('exportStrategy', strategy.title);
    localStorage.setItem('exportPineScript', strategy.pineScript);
    localStorage.setItem('exportMQL4', strategy.mql4);
    localStorage.setItem('exportMQL5', strategy.mql5);
    localStorage.setItem('exportSummary', JSON.stringify(strategy.summary));
    navigate('/export');
  };

  const toggleLike = (id: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === id ? { ...s, liked: !s.liked } : s
    ));
  };

  const userStrategies = strategies.filter(s => !s.purchased);
  const purchasedStrategies = strategies.filter(s => s.purchased);

  const StrategyCard = ({ strategy }: { strategy: Strategy }) => (
    <Card className="group relative overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img 
          src={strategy.thumbnail || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop`}
          alt={strategy.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="text-xs font-medium bg-background/90 backdrop-blur-sm">
            {strategy.type || 'Custom'}
          </Badge>
          {strategy.purchased && (
            <Badge className="text-xs font-medium bg-primary text-primary-foreground">
              Purchased
            </Badge>
          )}
        </div>

        {/* Like button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 w-8 h-8 bg-background/90 backdrop-blur-sm hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(strategy.id);
          }}
        >
          <Heart className={`w-4 h-4 ${strategy.liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm hover:bg-primary shadow-lg"
            onClick={() => handleOpenStrategy(strategy)}
          >
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {strategy.title}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{strategy.rating || 4.5}</span>
          </div>
        </div>
        
        {strategy.purchased && strategy.originalAuthor && (
          <p className="text-sm text-muted-foreground">by {strategy.originalAuthor}</p>
        )}
        
        <CardDescription className="line-clamp-2 text-sm">
          {strategy.summary?.description || 'No description available'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(strategy.created).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{strategy.confidence || 85}%</span>
            </div>
          </div>
          
          {strategy.purchased && strategy.price && (
            <Badge variant="outline" className="text-xs">
              ${strategy.price}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenStrategy(strategy)} 
            className="flex-1 text-sm"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-1" /> 
            Open in Builder
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleExport(strategy);
            }} 
            variant="outline" 
            size="sm"
            className="px-3"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {!strategy.purchased && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(strategy.id);
              }} 
              variant="outline" 
              size="sm"
              className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Strategies</h1>
          <p className="text-muted-foreground">
            Manage your trading strategies and purchased content
          </p>
        </div>

        {/* My Strategies Section */}
        {userStrategies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">My Strategies</h2>
              <Badge variant="secondary" className="ml-2">
                {userStrategies.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          </div>
        )}

        {/* Purchased Strategies Section */}
        {purchasedStrategies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Purchased Strategies</h2>
              <Badge variant="secondary" className="ml-2">
                {purchasedStrategies.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchasedStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {strategies.length === 0 && (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No strategies yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your first trading strategy to see it here
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Create Your First Strategy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStrategies;
