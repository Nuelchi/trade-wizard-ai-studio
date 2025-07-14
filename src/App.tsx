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
import Login from './pages/Login';

const App = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TooltipProvider>
  );
};

export default App;
