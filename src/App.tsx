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
import Account from './pages/Account';

import { AuthDialogProvider, useAuthDialog } from "@/contexts/AuthDialogContext";
import AuthDialog from "./components/AuthDialog";
import { useState, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
        const name = formData.get('name') as string;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (error) throw error;
        
        // Create profile record with display name
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              display_name: name || email.split('@')[0], // Use name or fallback to email prefix
              avatar_url: null
            });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't throw error here as user is already created
          }
        }
        
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
      
      // Note: For social auth, we'll need to handle profile creation in a different way
      // since the user might not be immediately available. We'll handle this in the auth state change listener.
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Function to fix existing users with email as display name
  const fixExistingUserProfiles = useCallback(async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .like('display_name', '%@%'); // Find profiles with email addresses
      
      if (error) {
        console.error('Error fetching profiles to fix:', error);
        return;
      }
      
      if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} profiles with email addresses as display names`);
        
        // Update each profile to use email prefix as display name
        for (const profile of profiles) {
          const emailPrefix = profile.display_name?.split('@')[0];
          if (emailPrefix) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ display_name: emailPrefix })
              .eq('id', profile.id);
            
            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fixing existing profiles:', error);
    }
  }, []);

  // Run profile fix on component mount
  React.useEffect(() => {
    fixExistingUserProfiles();
  }, [fixExistingUserProfiles]);

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
    <ThemeProvider>
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
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </TooltipProvider>
        </AuthDialogProvider>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default App;
