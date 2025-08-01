import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Copy, Eye, GitFork, DollarSign, Heart, MoreVertical } from "lucide-react";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";

export type Strategy = {
  id: string | number;
  title: string;
  description: string;
  author: string;
  avatar: string;
  performance: {
    returns: string;
    winRate: string;
    sharpe: string;
    maxDrawdown: string;
  };
  tags: string[];
  price: string;
  likes: number;
  copies: number;
  remixes?: number;
  thumbnail?: string;
  isPublic?: boolean;
  summary?: {
    type: string;
  };
  type?: string;
};

type Props = {
  strategies: Strategy[];
  onCopy?: (id: number) => void;
  onRemix?: (id: number) => void;
  onBuy?: (id: number, price: string) => void;
  onMoreInfo?: (strategy: Strategy) => void;
};

const StrategyShowcaseGrid: React.FC<Props> = ({ strategies, onCopy, onRemix, onBuy, onMoreInfo }) => {
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {strategies.map((strategy) => (
        <Card key={strategy.id} className="trading-card hover:shadow-glow transition-all group overflow-hidden">
          <div className="relative">
            {strategy.thumbnail ? (
              <img 
                src={strategy.thumbnail} 
                alt={strategy.title}
                className="h-32 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`h-32 bg-gradient-card flex items-center justify-center ${strategy.thumbnail ? 'hidden' : ''}`}>
              <Activity className="w-12 h-12 text-primary/50" />
            </div>
            {strategy.isPublic && (
              <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                Free
              </Badge>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMoreInfo?.(strategy);
              }}
              className="absolute top-2 left-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg">{strategy.title}</CardTitle>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal opacity-80 ml-2 align-top">
                {strategy.summary?.type || strategy.type || 'Custom'}
              </Badge>
              {/*
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{strategy.likes}</span>
            </div>
            */}
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
                <GitFork className="w-3 h-3" />
                <span>{strategy.remixes ?? 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>

            <div className="space-y-2">
              {strategy.isPublic ? (
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                    if (!user) { openAuthDialog('login'); return; }
                    onCopy?.(Number(strategy.id));
                  }}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => {
                    if (!user) { openAuthDialog('login'); return; }
                    onRemix?.(Number(strategy.id));
                  }}>
                    <GitFork className="w-3 h-3 mr-1" />
                    Remix
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-primary" onClick={() => {
                    if (!user) { openAuthDialog('login'); return; }
                    onBuy?.(Number(strategy.id), strategy.price);
                  }}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    {strategy.price}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StrategyShowcaseGrid; 