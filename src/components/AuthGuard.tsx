import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import AuthDialog from './AuthDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();

  const handleAuth = async (type: 'login' | 'signup', formData: FormData) => {
    setLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const redirectUrl = `${window.location.origin}/`;

      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Close dialog and navigate on successful login
        setShowAuthDialog(false);
        toast({
          title: 'Welcome!',
          description: "You're successfully logged in.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePromptToAuth = () => {
    setShowAuthDialog(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to build your strategy?
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up or log in to start creating automated trading strategies with AI.
            </p>
            <Button onClick={handlePromptToAuth} className="w-full">
              Get Started
            </Button>
          </div>
        </div>
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          onAuth={handleAuth}
          onSocialAuth={handleSocialAuth}
          loading={loading}
        />
      </>
    );
  }

  return (
    <>
      {children}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onAuth={handleAuth}
        onSocialAuth={handleSocialAuth}
        loading={loading}
      />
    </>
  );
};

export default AuthGuard;