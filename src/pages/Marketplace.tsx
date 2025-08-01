import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StrategyShowcaseGrid from "@/components/StrategyShowcaseGrid";
import { useFetchStrategies } from "@/hooks/useFetchStrategies";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, GitFork, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Marketplace() {
  const { strategies, loading, error } = useFetchStrategies({ publicOnly: true, sortBy: 'likes' });
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'likes' | 'remixes'>('likes');


  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter((s: any) => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'remixes') return (b.remixes || 0) - (a.remixes || 0);
      return 0;
    });

  const handleCopy = (id: number) => toast({ title: "Strategy copied!", description: "Strategy has been added to your workspace." });
  const handleRemix = (id: number) => toast({ title: "Remix", description: `Remix strategy ${id}` });
  const handleBuy = (id: number, price: string) => toast({ title: "Redirecting to checkout", description: `Purchase ${price} strategy...` });
  const handleMoreInfo = (strategy: any) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };
  const handleShareStrategy = (strategy: any) => {
    const shareUrl = `${window.location.origin}/strategy/${strategy.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Strategy link has been copied to clipboard." });
  };
  const handleCopyStrategy = (strategyId: number) => handleCopy(strategyId);
  const handleRemixStrategy = (strategyId: number) => handleRemix(strategyId);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              <Users className="w-3 h-3 mr-1" />
              Marketplace
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              All Published Strategies
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-lg sm:max-w-2xl mx-auto">
              Browse, search, filter, buy, and remix strategies from the community.
            </p>
          </div>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
            <Input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={v => setSortBy(v as 'likes' | 'remixes')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="remixes">Most Remixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-center text-destructive py-12">{error}</div>
          ) : (
            <StrategyShowcaseGrid
              strategies={filteredStrategies}
              onCopy={handleCopy}
              onRemix={handleRemix}
              onBuy={handleBuy}
              onMoreInfo={handleMoreInfo}
            />
          )}
        </div>
      </section>
      {/* Optionally, add a modal here for selectedStrategy */}
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
    </div>
  );
} 