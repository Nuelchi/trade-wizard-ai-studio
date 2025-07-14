import { NavLink } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, TrendingUp, TestTube } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { user, signOut } = useAuth();
  
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/dashboard", label: "Builder", icon: MessageSquare },
    { to: "/test", label: "Strategy Tester", icon: TrendingUp },
  ];

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Trainflow</span>
          </NavLink>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-2 ${
                        isActive ? "nav-link-active" : ""
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              
              <Button 
                variant={user ? "outline" : "default"} 
                size="sm" 
                onClick={handleAuthAction}
              >
                {user ? 'Logout' : 'Get Started'}
              </Button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;