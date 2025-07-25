import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, TrendingUp, TestTube, Download, MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useChatContext } from "@/contexts/ChatContext";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { saveCurrentStrategy, resetChat } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNewChat = () => {
    saveCurrentStrategy();
    resetChat();
    if (!location.pathname.startsWith('/dashboard')) {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
    { to: '/marketplace', label: 'Marketplace', icon: Download }, // Added Marketplace
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <img src="/7EAD4198-05FA-4DC9-91EA-69E1014CC1E5.png" alt="TrainFlow Logo" className="h-10 w-10 block dark:hidden rounded-xl border border-border shadow-md" />
            <img src="/BA9F91F4-70B5-476A-9DC3-29879730CF55.png" alt="TrainFlow Logo Light" className="h-10 w-10 hidden dark:block rounded-xl border border-border shadow-md" />
            <span className="text-xl font-bold text-foreground">TrainFlow</span>
          </NavLink>
          {/* Desktop Navigation Links & Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {!user
                ? publicNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link flex items-center space-x-2 ${isActive ? 'nav-link-active' : ''}`
                      }
                    >
                      <span>{item.label}</span>
                    </NavLink>
                  ))
                : appNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `nav-link flex items-center space-x-2 ${isActive ? 'nav-link-active' : ''}`
                        }
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
            </div>
            <div className="flex items-center space-x-2">
              {/* Back to Home button for public pages, not on landing */}
              {!user && location.pathname !== "/" && (
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>Back to Home</Button>
              )}
              {!user ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => openAuthDialog('login')}>Log in</Button>
                  <Button size="sm" onClick={() => openAuthDialog('signup')}>Get started</Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              )}
            </div>
          </div>
          {/* Mobile Hamburger */}
          <div className="sm:hidden flex items-center">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2" aria-label="Open menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 px-4 py-4 border-b border-border">
                    <img src="/7EAD4198-05FA-4DC9-91EA-69E1014CC1E5.png" alt="TrainFlow Logo" className="h-8 w-8 rounded-xl border border-border shadow-md" />
                    <span className="text-lg font-bold text-foreground">TrainFlow</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 px-4 py-4">
                    {!user
                      ? publicNavItems.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `w-full text-left px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'}`
                            }
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </NavLink>
                        ))
                      : appNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                `w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'}`
                              }
                              onClick={() => setMobileOpen(false)}
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                              {item.label}
                            </NavLink>
                          );
                        })}
                  </div>
                  <div className="flex flex-col gap-2 px-4 pb-4 border-t border-border">
                    {!user && location.pathname !== "/" && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { setMobileOpen(false); navigate("/"); }}>Back to Home</Button>
                    )}
                    {!user ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => { setMobileOpen(false); openAuthDialog('login'); }}>Log in</Button>
                        <Button size="sm" className="w-full" onClick={() => { setMobileOpen(false); openAuthDialog('signup'); }}>Get started</Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { setMobileOpen(false); handleLogout(); }}>Logout</Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;