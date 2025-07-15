import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash, Download, Edit, FileText, Image, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { useChatContext } from '@/contexts/ChatContext';

type Strategy = Database['public']['Tables']['strategies']['Row'];
type StrategyInsert = Database['public']['Tables']['strategies']['Insert'];
type StrategyUpdate = Database['public']['Tables']['strategies']['Update'];

const MyStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setMessages } = useChatContext();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast('Failed to fetch strategies');
        } else {
          setStrategies(data || []);
        }
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this strategy? This action cannot be undone.');
    if (!confirmed) return;
    const { error } = await supabase.from('strategies').delete().eq('id', id);
    if (error) {
      toast('Failed to delete strategy');
    } else {
      setStrategies((prev) => prev.filter((s) => s.id !== id));
      toast('Strategy deleted');
    }
  };

  const handleOpen = (strategy: Strategy) => {
    setMessages(Array.isArray(strategy.chat_history) ? strategy.chat_history as any[] : []);
    navigate('/dashboard', { state: { strategy } });
  };

  const handleExport = (strategy: Strategy) => {
    // Implement export logic as needed
    toast('Export not implemented yet.');
  };

  if (!loading && strategies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/40 mx-auto">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">No Strategies Yet</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            You haven&apos;t created or collected any strategies yet. Start building your first AI-powered trading strategy or explore public ones to remix!
          </p>
          <Button asChild size="lg" className="rounded-full px-8 py-3 text-base font-semibold">
            <a href="/dashboard">Create Your First Strategy</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Strategies</h1>
      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {strategies.map((s) => (
            <Card key={s.id} className="trading-card hover:shadow-glow transition-all group overflow-hidden cursor-pointer" onClick={() => handleOpen(s)}>
              <div className="relative">
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt="thumbnail" className="h-32 w-full object-cover bg-muted" />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center bg-muted">
                    <Image className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {s.title}
                </CardTitle>
                <CardDescription>
                  Saved: {new Date(s.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground line-clamp-2">
                  {s.description || (s.summary as any)?.description || '--'}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={e => { e.stopPropagation(); handleOpen(s); }} variant="default">
                    <Edit className="w-4 h-4 mr-1" /> Open
                  </Button>
                  <Button onClick={e => { e.stopPropagation(); handleExport(s); }} variant="outline">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                  <Button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} variant="destructive">
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStrategies; 