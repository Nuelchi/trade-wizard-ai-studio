import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User } from 'lucide-react';

export interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuth: (type: 'login' | 'signup', formData: FormData) => void;
  onSocialAuth: (provider: 'google' | 'twitter') => void;
  loading: boolean;
  defaultTab?: 'login' | 'signup';
}

const AuthDialog = ({ open, onOpenChange, onAuth, onSocialAuth, loading, defaultTab = 'signup' }: AuthDialogProps) => {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, open]);

  const handleSubmit = (type: 'login' | 'signup') => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onAuth(type, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
            Join Trainflow
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => onSocialAuth('google')}
              className="w-full"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => onSocialAuth('twitter')}
              className="w-full"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
        </div>
        <Tabs value={tab} onValueChange={v => setTab(v as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-base">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>
          <TabsContent value="signup" className="space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit('signup')} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-name" className="text-xs sm:text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    name="name"
                    placeholder="John Doe"
                    className="pl-10 text-xs sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-email" className="text-xs sm:text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 text-xs sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-password" className="text-xs sm:text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 text-xs sm:text-base"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="login" className="space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit('login')} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="login-email" className="text-xs sm:text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 text-xs sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="login-password" className="text-xs sm:text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 text-xs sm:text-base"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog; 