import { NavLink } from "react-router-dom";
import { Brain, TrendingUp, BarChart3, Download, Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const navItems = [
    { to: "/", label: "Home", icon: Brain },
    { to: "/build", label: "Build", icon: TrendingUp },
    { to: "/test", label: "Test", icon: BarChart3 },
    { to: "/export", label: "Export", icon: Download },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Trainflow</span>
          </div>

          {/* Navigation Links & Theme Toggle */}
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
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;