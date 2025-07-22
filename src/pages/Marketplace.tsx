import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StrategyShowcaseGrid from "@/components/StrategyShowcaseGrid";
import { useFetchStrategies } from "@/hooks/useFetchStrategies";

export default function Marketplace() {
  const { strategies, loading, error } = useFetchStrategies({ publicOnly: true, sortBy: 'likes' });
  const { toast } = useToast();

  const handleCopy = (id: number) => toast({ title: "Strategy copied!", description: "Strategy has been added to your workspace." });
  const handleRemix = (id: number) => toast({ title: "Remix", description: `Remix strategy ${id}` });
  const handleBuy = (id: number, price: string) => toast({ title: "Redirecting to checkout", description: `Purchase ${price} strategy...` });

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
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
            />
          )}
        </div>
      </section>
    </div>
  );
} 