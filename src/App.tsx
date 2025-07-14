import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Test from "./pages/Test";
import EnhancedTest from "./pages/EnhancedTest";
import Export from "./pages/Export";
import NotFound from "./pages/NotFound";
import MyStrategies from "./pages/MyStrategies";
import Dashboard from "./pages/Dashboard";
import Marketplace from './pages/Marketplace';
import Pricing from './pages/Pricing';
import Community from './pages/Community';
import Learn from './pages/Learn';
import { AuthDialogProvider, useAuthDialog } from "@/contexts/AuthDialogContext";
import AuthDialog from "./components/AuthDialog";
import { useState, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatProvider } from "@/contexts/ChatContext";

const GlobalAuthDialog = () => {
  const { isOpen, setOpen, defaultTab } = useAuthDialog();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = useCallback(async (type: 'login' | 'signup', formData: FormData) => {
    setLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const redirectUrl = `${window.location.origin}/`;
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
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
      }
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [setOpen, toast]);

  const handleSocialAuth = useCallback(async (provider: 'google' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <AuthDialog
      open={isOpen}
      onOpenChange={setOpen}
      onAuth={handleAuth}
      onSocialAuth={handleSocialAuth}
      loading={loading}
      defaultTab={defaultTab}
    />
  );
};

const App = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  return (
    <ChatProvider>
      <AuthDialogProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalAuthDialog />
          <div className="min-h-screen bg-background">
            {!isDashboard && <Navigation />}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<EnhancedTest />} />
              <Route path="/export" element={<Export />} />
              <Route path="/mystrategies" element={<MyStrategies />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/community" element={<Community />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </AuthDialogProvider>
    </ChatProvider>
  );
};

export default App;
