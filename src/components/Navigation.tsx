import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, TrendingUp, TestTube, Download, MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useChatContext } from "@/contexts/ChatContext";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { saveCurrentStrategy, resetChat } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {
    saveCurrentStrategy();
    resetChat();
    if (!location.pathname.startsWith('/dashboard')) {
      navigate('/dashboard');
    }
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
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <img src="/7EAD4198-05FA-4DC9-91EA-69E1014CC1E5.png" alt="TrainFlow Logo" className="h-10 w-10 block dark:hidden rounded-xl border border-border shadow-md" />
            <img src="/BA9F91F4-70B5-476A-9DC3-29879730CF55.png" alt="TrainFlow Logo Light" className="h-10 w-10 hidden dark:block rounded-xl border border-border shadow-md" />
            <span className="text-xl font-bold text-foreground">TrainFlow</span>
          </NavLink>
          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-4">
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
              {!user ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => openAuthDialog('login')}>Log in</Button>
                  <Button size="sm" onClick={() => openAuthDialog('signup')}>Get started</Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={signOut}>Logout</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;