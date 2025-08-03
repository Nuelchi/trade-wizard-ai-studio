import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, MessageSquare, User, LogOut, TrendingUp, TestTube, Download, MessageSquarePlus, Menu } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useChatContext } from "@/contexts/ChatContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { saveCurrentStrategy, resetChat } = useChatContext();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNewChat = () => {
    saveCurrentStrategy();
    resetChat();
    if (!pathname.startsWith('/dashboard')) {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const publicNavItems = [
    { to: '/community', label: 'Community' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/learn', label: 'Learn' },
  ];
  const appNavItems = [
    { to: '/dashboard', label: 'Builder', icon: MessageSquare },
    { to: '/test', label: 'Strategy Tester', icon: TrendingUp },
    { to: '/mystrategies', label: 'My Strategies', icon: User },
    { to: '/marketplace', label: 'Marketplace', icon: Download },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trade Wizard AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Public navigation items */}
            {!user && publicNavItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.to ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* App navigation items for authenticated users */}
            {user && appNavItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.to ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* New Chat Button */}
            {user && (
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="hidden lg:flex items-center space-x-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>New Chat</span>
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:block">Account</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:block">Logout</span>
                </Button>
              </div>
            ) : (
              <Button onClick={openAuthDialog} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {/* Navigation Items */}
                  {!user && publicNavItems.map((item) => (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        pathname === item.to ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {user && appNavItems.map((item) => (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary ${
                        pathname === item.to ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {/* Mobile New Chat Button */}
                  {user && (
                    <Button
                      onClick={() => {
                        handleNewChat();
                        setMobileOpen(false);
                      }}
                      variant="outline"
                      className="flex items-center space-x-2 w-fit"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      <span>New Chat</span>
                    </Button>
                  )}

                  {/* Mobile Auth Buttons */}
                  {user ? (
                    <div className="flex flex-col space-y-3 pt-4 border-t">
                      <Link href="/account">
                        <Button
                          variant="ghost"
                          className="flex items-center space-x-2 w-full justify-start"
                          onClick={() => setMobileOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Account</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full justify-start"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        openAuthDialog();
                        setMobileOpen(false);
                      }}
                      className="bg-primary hover:bg-primary/90 w-fit"
                    >
                      Get Started
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;