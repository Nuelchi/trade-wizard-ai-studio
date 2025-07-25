import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StrategyShowcaseGrid from "@/components/StrategyShowcaseGrid";
import { useFetchStrategies } from "@/hooks/useFetchStrategies";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, GitFork, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const { strategies, loading, error } = useFetchStrategies({ publicOnly: true, sortBy: 'likes' });
  const { toast } = useToast();
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              All Published Strategies
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse, buy, and remix strategies from the community.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-center text-destructive py-12">{error}</div>
          ) : (
            <StrategyShowcaseGrid
              strategies={strategies}
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
            <DialogTitle className="text-2xl font-bold">{selectedStrategy?.title}</DialogTitle>
            <DialogDescription className="text-base">
              {selectedStrategy?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Thumbnail */}
            {selectedStrategy?.thumbnail && (
              <div className="relative">
                <img 
                  src={selectedStrategy.thumbnail} 
                  alt={selectedStrategy.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            {/* Strategy Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Performance</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Returns:</span>
                    <span className="text-sm font-medium text-success">{selectedStrategy?.performance?.returns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Win Rate:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.performance?.winRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sharpe Ratio:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.performance?.sharpe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Max Drawdown:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.performance?.maxDrawdown}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Strategy Info</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.summary?.type || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Confidence:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.summary?.confidence || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Likes:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.likes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Remixes:</span>
                    <span className="text-sm font-medium">{selectedStrategy?.remixes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Tags */}
            {selectedStrategy?.tags && selectedStrategy.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedStrategy.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
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