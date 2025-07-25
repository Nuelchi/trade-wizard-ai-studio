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
import { useFetchStrategies } from "@/hooks/useFetchStrategies";

type Strategy = Database['public']['Tables']['strategies']['Row'];
type StrategyInsert = Database['public']['Tables']['strategies']['Insert'];
type StrategyUpdate = Database['public']['Tables']['strategies']['Update'];

const MyStrategies = () => {
  const { user } = useAuth();
  const { strategies, loading, error } = useFetchStrategies({ publicOnly: false, userId: user?.id });
  const navigate = useNavigate();
  const { setMessages } = useChatContext();

  const handleOpen = (strategy: any) => {
    setMessages(Array.isArray(strategy.chat_history) ? strategy.chat_history as any[] : []);
    navigate('/dashboard', { state: { strategy } });
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Strategies</h1>
      {loading ? (
        <div className="text-muted-foreground flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : error ? (
        <div className="text-center text-destructive py-12">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                  Saved: {s.created_at ? new Date(s.created_at).toLocaleString() : '--'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between gap-2 mt-2 w-full">
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); /* handleExport(s); */ }}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={(e) => { e.stopPropagation(); /* handleDelete(s.id); */ }}>
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
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