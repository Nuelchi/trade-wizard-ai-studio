import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Code, User, LogOut, Eye, Settings, ChevronDown, Save, Share2, Download, Upload, Moon, Sun, Bell, HelpCircle, BarChart3, FileCode, ToggleLeft, ToggleRight, Camera, Globe, Lock, TrendingUp, Menu, Square, MessageSquarePlus, LayoutPanelLeft, Play } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import AuthGuard from '@/components/AuthGuard';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useChatContext } from '@/contexts/ChatContext';
import TradingChart from '@/components/TradingChart';
type Strategy = Database['public']['Tables']['strategies']['Row'];
type StrategyInsert = Database['public']['Tables']['strategies']['Insert'];
type StrategyUpdate = Database['public']['Tables']['strategies']['Update'];

const Dashboard = () => {
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'code'>('chat');
  const [strategyName, setStrategyName] = useState('Untitled Strategy');
  const [isEditingName, setIsEditingName] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'chart'>('code');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishData, setPublishData] = useState({
    title: "",
    description: "",
    tags: "",
    pricingType: "free" as "free" | "paid",
    price: ""
  });
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const { resetChat, setMessages, strategy, messages } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStrategyGenerated = (strategy: any) => {
    console.log('Strategy generated:', strategy);
    setCurrentStrategy(strategy);
  };

  const handleCodeGenerated = async (code: any, requestedType?: string) => {
    // Log the incoming code object
    console.log('Incoming code object:', code);

    // Normalize code object
    let normalizedCode = { pineScript: '', mql4: '', mql5: '' };
    if (code.pineScript || code.pine_script) normalizedCode.pineScript = code.pineScript || code.pine_script;
    if (code.mql4) normalizedCode.mql4 = code.mql4;
    if (code.mql5) normalizedCode.mql5 = code.mql5;
    // If AI sometimes returns 'code' for pine, mql4, or mql5, try to infer:
    if (requestedType === 'pinescript' && code.code) normalizedCode.pineScript = code.code;
    if (requestedType === 'mql4' && code.code) normalizedCode.mql4 = code.code;
    if (requestedType === 'mql5' && code.code) normalizedCode.mql5 = code.code;
    // Add more mappings as needed
    console.log('Normalized code object:', normalizedCode);

    // Fetch current code from DB
    let currentDbCode = {};
    if (currentStrategy && currentStrategy.id && user) {
      const { data, error } = await supabase
        .from('strategies')
        .select('code')
        .eq('id', currentStrategy.id)
        .single();
      if (!error && data && data.code) {
        try {
          currentDbCode = typeof data.code === 'string' ? JSON.parse(data.code) : data.code;
        } catch (e) {
          console.error('Error parsing code from DB:', e, data.code);
          currentDbCode = {};
        }
      } else if (error) {
        console.error('Error fetching code from DB before update:', error);
      }
    }
    // Merge normalized code with current DB code
    let pineScript = '';
    let mql4 = '';
    let mql5 = '';
    if (currentDbCode && typeof currentDbCode === 'object' && !Array.isArray(currentDbCode)) {
      pineScript = (currentDbCode as any).pineScript || '';
      mql4 = (currentDbCode as any).mql4 || '';
      mql5 = (currentDbCode as any).mql5 || '';
    }
    const mergedCode = {
      pineScript: normalizedCode.pineScript && normalizedCode.pineScript.trim() !== '' ? normalizedCode.pineScript : pineScript,
      mql4: normalizedCode.mql4 && normalizedCode.mql4.trim() !== '' ? normalizedCode.mql4 : mql4,
      mql5: normalizedCode.mql5 && normalizedCode.mql5.trim() !== '' ? normalizedCode.mql5 : mql5,
    };
    console.log('Saving merged code to DB:', mergedCode);
    // Save merged code to DB
    if (currentStrategy && currentStrategy.id && user) {
      const { error } = await supabase
        .from('strategies')
        .update({ code: mergedCode, updated_at: new Date().toISOString() })
        .eq('id', currentStrategy.id);
      if (error) {
        console.error('Error updating code in DB:', error);
      } else {
        // Refetch latest code from DB to update preview tabs immediately
        const { data: refetchData, error: refetchError } = await supabase
          .from('strategies')
          .select('code')
          .eq('id', currentStrategy.id)
          .single();
        if (!refetchError && refetchData && refetchData.code) {
          let codeObj = refetchData.code;
          if (typeof codeObj === 'string') {
            try { codeObj = JSON.parse(codeObj); } catch { codeObj = {}; }
          }
          setGeneratedCode(codeObj);
        }
      }
    }
    // setGeneratedCode(mergedCode); // Now handled by refetch
    // Auto-switch to the newly generated tab
    if (requestedType) {
      setTimeout(() => {
        const tabMap: { [key: string]: string } = {
          pinescript: 'pinescript',
          pine: 'pinescript',
          tradingview: 'pinescript',
          mql4: 'mql4',
          metatrader4: 'mql4',
          mql5: 'mql5',
          metatrader5: 'mql5',
        };
        const targetTab = tabMap[requestedType.toLowerCase()];
        if (targetTab) {
          // Dispatch a custom event to switch the tab in CodePreview
          const event = new CustomEvent('switchCodeTab', { detail: { tab: targetTab } });
          window.dispatchEvent(event);
        }
      }, 100);
    }
  };

  // Poll for latest code from DB every 20 seconds
  useEffect(() => {
    if (!currentStrategy || !currentStrategy.id) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('code')
        .eq('id', currentStrategy.id)
        .single();
      if (!error && data && data.code) {
        let codeObj = data.code;
        if (typeof codeObj === 'string') {
          try { codeObj = JSON.parse(codeObj); } catch { codeObj = {}; }
        }
        console.log('Fetched code from DB:', codeObj);
        setGeneratedCode((prev: any) => {
          // Only update if code actually changed
          if (JSON.stringify(prev) !== JSON.stringify(codeObj)) {
            return codeObj;
          }
          return prev;
        });
      } else if (error) {
        console.error('Error polling code from DB:', error);
      }
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, [currentStrategy]);

  const handleLogout = async () => {
    await signOut();
    setCurrentStrategy(null);
    setGeneratedCode(null);
  };

  const handleNameChange = (newName: string) => {
    setStrategyName(newName || 'Untitled Strategy');
    setIsEditingName(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would typically update your theme context
  };

  const handleSave = () => {
    // Save strategy logic
    console.log('Saving strategy...');
  };

  const handleSaveStrategy = async () => {
    if (!currentStrategy || !user || !currentStrategy.id || currentStrategy.id === 'undefined') return;
    const { error } = await supabase
      .from('strategies')
      .update({
        chat_history: currentStrategy.chat_history,
        code: generatedCode,
        title: strategyName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentStrategy.id);
    if (error) {
      toast({ title: 'Failed to update strategy', description: error.message, variant: 'destructive' });
    }
  };

  // Trading pairs and timeframes data
  const tradingPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD'];
  const timeframes = [{
    value: '1M',
    label: '1 Minute'
  }, {
    value: '5M',
    label: '5 Minutes'
  }, {
    value: '15M',
    label: '15 Minutes'
  }, {
    value: '30M',
    label: '30 Minutes'
  }, {
    value: '1H',
    label: '1 Hour'
  }, {
    value: '4H',
    label: '4 Hours'
  }, {
    value: '1D',
    label: '1 Day'
  }, {
    value: '1W',
    label: '1 Week'
  }, {
    value: '1MO',
    label: '1 Month'
  }];
  const handleShare = () => {
    // Share strategy logic
    toast({
      title: "Strategy Shared",
      description: "Share link copied to clipboard"
    });
  };

  const handleExport = () => {
    // Export strategy logic
    toast({
      title: "Strategy Exported",
      description: "Strategy code has been exported"
    });
  };

  const handlePublishStrategy = () => {
    setPublishDialogOpen(true);
  };

  const captureChartThumbnail = async () => {
    const chartElement = document.getElementById('chart-preview');
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: null,
          scale: 2,
          logging: false
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing chart:', error);
        return null;
      }
    }
    return null;
  };

  const handlePublishSubmit = async () => {
    const thumbnail = await captureChartThumbnail();

    // Here you would normally save to your backend/database
    console.log('Publishing strategy:', {
      ...publishData,
      thumbnail,
      strategyCode: generatedCode,
      performanceData: {
        pair: selectedPair,
        timeframe: selectedTimeframe
        // Add actual performance metrics here
      }
    });
    toast({
      title: "Strategy Published!",
      description: "Your strategy is now available in the showcase"
    });
    setPublishDialogOpen(false);
    setPublishData({
      title: "",
      description: "",
      tags: "",
      pricingType: "free",
      price: ""
    });
  };

  const startNewChat = async () => {
    // 1. Save current strategy if valid
    if (strategy && strategy.id && strategy.id !== 'undefined') {
      // Optionally call your save logic here
      await handleSaveStrategy();
    }
    // 2. Reset chat context and messages - only when explicitly starting new chat
    resetChat();
    setMessages([]);
    localStorage.removeItem('chatHistory');
    // 3. Reset UI state
    setChatCollapsed(false);
    setPreviewMode('code');
    setStrategyName('Untitled Strategy');
    setCurrentStrategy(null);
    setGeneratedCode(null);
    // 4. Optionally navigate to builder/dashboard if not already there
    if (!location.pathname.startsWith('/dashboard')) {
      navigate('/dashboard');
    }
  };

  // Load strategies for dropdown
  useEffect(() => {
    if (!user) return;
    setLoadingStrategies(true);
    supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setStrategies(data || []);
        setLoadingStrategies(false);
      });
  }, [user]);

  // Hydrate from navigation state if a strategy is passed in
  useEffect(() => {
    if (location.state && location.state.strategy) {
      const s = location.state.strategy;
      setCurrentStrategy(s);
      setStrategyName(s.title || 'Untitled Strategy');
      setGeneratedCode(s.code || null);
      // Optionally hydrate analytics, chat, etc. if needed
    }
  }, [location.state]);

  // Update current strategy when strategy context changes
  useEffect(() => {
    if (strategy && strategy.id && strategy.id !== 'undefined') {
      console.log('Strategy context updated:', strategy);
      setCurrentStrategy(strategy);
      setStrategyName(strategy.title || 'Untitled Strategy');
      setGeneratedCode(strategy.code || null);
    }
  }, [strategy]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        console.log('Loading saved chat history:', parsedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setMessages(parsedHistory);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error parsing chat history:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!currentStrategy || !user || !currentStrategy.id || currentStrategy.id === 'undefined') return;
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(async () => {
      console.log('Autosaving strategy:', currentStrategy.id);
      // Convert chat messages to the format expected by the database
      const chatHistoryJson = messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      const { error } = await supabase
        .from('strategies')
        .update({
          chat_history: chatHistoryJson,
          code: generatedCode,
          title: strategyName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentStrategy.id);
      if (error) {
        console.error('Autosave error:', error);
        toast({ title: 'Autosave failed', description: error.message, variant: 'destructive' });
      } else {
        console.log('Autosave successful');
      }
    }, 2000);
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
  }, [currentStrategy, generatedCode, strategyName, user, messages]);

  const sectionOptions = [
    { path: '/dashboard', label: 'Builder', icon: MessageSquare },
    { path: '/test', label: 'Strategy Tester', icon: TrendingUp },
    { path: '/mystrategies', label: 'My Strategies', icon: User },
  ];
  const currentSection = sectionOptions.find(opt => location.pathname.startsWith(opt.path)) || sectionOptions[0];

  // Mock price data for chart
  const priceData = [
    { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103 },
    { time: '2024-01-02', open: 103, high: 108, low: 101, close: 106 },
    { time: '2024-01-03', open: 106, high: 109, low: 104, close: 107 },
    { time: '2024-01-04', open: 107, high: 112, low: 105, close: 110 },
    { time: '2024-01-05', open: 110, high: 115, low: 108, close: 113 },
    { time: '2024-01-06', open: 113, high: 116, low: 111, close: 114 },
    { time: '2024-01-07', open: 114, high: 118, low: 112, close: 117 },
  ];

  // Add mock analytics data for advanced metrics and equity/drawdown curve
  const analytics = {
    totalPnL: 2450.75,
    totalReturn: 24.5,
    maxDrawdown: -8.2,
    totalTrades: 145,
    profitableTrades: 87,
    losingTrades: 58,
    profitFactor: 1.73,
    winRate: 60.0,
    sharpeRatio: 1.8,
    largestWin: 520.5,
    largestLoss: -310.2,
    avgWin: 110.3,
    avgLoss: -75.6,
  };

  const equityCurve = [
    { time: '2024-01-01', equity: 10000, drawdown: 0 },
    { time: '2024-01-02', equity: 10250, drawdown: 0 },
    { time: '2024-01-03', equity: 10400, drawdown: 0 },
    { time: '2024-01-04', equity: 10100, drawdown: 2.88 },
    { time: '2024-01-05', equity: 10600, drawdown: 0 },
    { time: '2024-01-06', equity: 10800, drawdown: 0 },
    { time: '2024-01-07', equity: 11250, drawdown: 0 },
  ];

  return <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 backdrop-blur-md flex-shrink-0 gap-2">
          {/* Left Section - Strategy Name & Dropdown */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            {isEditingName ? <input type="text" value={strategyName} onChange={e => setStrategyName(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyDown={e => {
            if (e.key === 'Enter') {
              setIsEditingName(false);
            }
          }} className="text-xl font-bold text-foreground bg-transparent border-none outline-none focus:bg-muted px-2 py-1 rounded" autoFocus /> : <h1 className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted" onClick={() => setIsEditingName(true)} title="Click to edit strategy name">
                {strategyName}
              </h1>}
            
            {/* Strategy Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 h-8 border-border bg-background text-foreground font-medium shadow-none">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Strategies</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
                {loadingStrategies ? (
                  <DropdownMenuItem disabled>
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading strategies...</span>
                    </div>
                  </DropdownMenuItem>
                ) : strategies.length === 0 ? (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">No strategies found</span>
                  </DropdownMenuItem>
                ) : (
                  <>
                    {strategies.map((strategy) => (
                      <DropdownMenuItem 
                        key={strategy.id} 
                        onClick={() => {
                          setCurrentStrategy(strategy);
                          setStrategyName(strategy.title || 'Untitled Strategy');
                          setGeneratedCode(strategy.code || null);
                          // Load chat history if available
                          if (Array.isArray(strategy.chat_history) && strategy.chat_history.length > 0) {
                            setMessages(strategy.chat_history as any[]);
                          } else {
                            setMessages([]);
                          }
                        }}
                        className="flex flex-col items-start gap-1 p-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm truncate">{strategy.title || 'Untitled Strategy'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(strategy.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        {strategy.description && (
                          <span className="text-xs text-muted-foreground truncate w-full">
                            {strategy.description}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/mystrategies')}>
                      <User className="w-4 h-4 mr-2" />
                      <span>View All Strategies</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center Section - New Chat & Min/Max Icons + Navigation Dropdown */}
          <div className="flex items-center gap-2 -ml-14">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors"
              onClick={startNewChat}
              title="New Chat"
              aria-label="New Chat"
            >
              <MessageSquarePlus className="w-5 h-5 text-primary" />
            </button>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setChatCollapsed(c => !c)}
              title={chatCollapsed ? "Expand Chat" : "Collapse Chat"}
              aria-label={chatCollapsed ? "Expand Chat" : "Collapse Chat"}
            >
              <LayoutPanelLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-4 min-w-[160px] justify-between border border-border bg-background text-foreground font-medium shadow-none">
                  <span className="flex items-center gap-2">
                    {currentSection.icon && <currentSection.icon className="w-4 h-4" />}
                    {currentSection.label}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {sectionOptions.map(opt => (
                  <DropdownMenuItem asChild key={opt.path} className={opt.path === currentSection.path ? 'bg-muted font-semibold' : ''}>
                    <Link to={opt.path} className="flex items-center gap-2">
                      {opt.icon && <opt.icon className="w-4 h-4 mr-2" />}
                      {opt.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2">
            {user && currentStrategy && (
              <Button variant="outline" size="sm" className="h-8" onClick={handleSaveStrategy}>
                Save
              </Button>
            )}
            {/* Code/Chart Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              <Button variant={previewMode === 'code' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('code')} className="flex items-center gap-2 h-8">
                <FileCode className="w-4 h-4" />
                Code
              </Button>
              <Button variant={previewMode === 'chart' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('chart')} className="flex items-center gap-2 h-8">
                <BarChart3 className="w-4 h-4" />
                Chart
              </Button>
            </div>
            {/* Publish Button - now labeled and primary */}
            <Button variant="default" size="sm" onClick={handlePublishStrategy} className="h-8 bg-gradient-primary flex items-center gap-2 px-4">
              <Upload className="w-4 h-4" />
              Publish
            </Button>
            {/* Upgrade Button */}
            <Button variant="outline" size="sm" className="h-8">
              Upgrade
            </Button>
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Settings/User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content - Always show chat + preview layout */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 scrollbar-hide">
            {/* Left Panel - Chat Interface */}
            {!chatCollapsed && (
              <ResizablePanel defaultSize={30} minSize={25} maxSize={35} className="min-h-0">
                <div className="h-full border-r border-border flex flex-col bg-background min-h-0">
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <ChatInterface
                      onStrategyGenerated={handleStrategyGenerated}
                      onCodeGenerated={handleCodeGenerated}
                    />
                  </div>
                </div>
              </ResizablePanel>
            )}
            {/* No collapsed button in the chat panel anymore */}
            <ResizableHandle withHandle />
            {/* Right Panel - Live Preview */}
            <ResizablePanel defaultSize={chatCollapsed ? 100 : 50} minSize={30} className="min-h-0">
              <div className="h-full flex flex-col bg-background min-h-0 overflow-hidden scrollbar-hide">
                  
                  
                  {previewMode === 'code' ? <CodePreview strategy={currentStrategy} /> :
  <div className="h-full flex flex-col min-h-0 overflow-hidden">
    <TradingChart onStrategySelect={() => {}} onStrategyUpload={() => {}} />
    <div className="w-full mt-4">
      <div className="w-full h-full border border-border rounded-lg bg-muted/10 p-4 flex flex-col gap-6">
        {/* Top Metrics Row - Only the requested metrics, spaced horizontally */}
        <div className="flex flex-row justify-between items-end w-full mb-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Total P&L</span>
            <span className="text-lg font-bold text-green-500">${analytics.totalPnL.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Max Drawdown</span>
            <span className="text-lg font-bold text-purple-500">{analytics.maxDrawdown}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Total Trades</span>
            <span className="text-lg font-bold text-foreground">{analytics.totalTrades}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Profitable Trades</span>
            <span className="text-lg font-bold text-green-500">{analytics.profitableTrades}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Profit Factor</span>
            <span className="text-lg font-bold text-yellow-500">{analytics.profitFactor}</span>
          </div>
        </div>
        {/* Equity/Drawdown Curve Chart */}
        <div className="w-full h-[220px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={equityCurve} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="equity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Equity" />
              <Bar yAxisId="right" dataKey="drawdown" fill="#ef4444" fillOpacity={0.3} name="Drawdown %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
        </div>

        {/* Publish Strategy Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Publish Strategy</DialogTitle>
              <DialogDescription>
                Share your strategy with the community. Set pricing and visibility options.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Strategy Title</Label>
                <Input id="title" value={publishData.title} onChange={e => setPublishData({
                ...publishData,
                title: e.target.value
              })} placeholder="e.g., Momentum Breakout Pro" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={publishData.description} onChange={e => setPublishData({
                ...publishData,
                description: e.target.value
              })} placeholder="Describe what makes your strategy unique..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={publishData.tags} onChange={e => setPublishData({
                ...publishData,
                tags: e.target.value
              })} placeholder="e.g., Momentum, Breakout, AI" />
              </div>
              
              {/* Pricing Selection */}
              <div className="grid gap-3">
                <Label>Strategy Pricing</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={publishData.pricingType === "free" ? "default" : "outline"} className="h-auto p-3 flex flex-col items-center gap-2" onClick={() => setPublishData({
                  ...publishData,
                  pricingType: "free",
                  price: ""
                })}>
                    <Globe className="w-4 h-4" />
                    <div className="text-center">
                      <div className="font-medium">Free</div>
                      <div className="text-xs text-muted-foreground">Anyone can copy</div>
                    </div>
                  </Button>
                  <Button type="button" variant={publishData.pricingType === "paid" ? "default" : "outline"} className="h-auto p-3 flex flex-col items-center gap-2" onClick={() => setPublishData({
                  ...publishData,
                  pricingType: "paid"
                })}>
                    <Lock className="w-4 h-4" />
                    <div className="text-center">
                      <div className="font-medium">Sell</div>
                      <div className="text-xs text-muted-foreground">Set your price</div>
                    </div>
                  </Button>
                </div>
              </div>
              
              {/* Price Input - Only show when "Sell" is selected */}
              {publishData.pricingType === "paid" && <div className="grid gap-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" value={publishData.price} onChange={e => setPublishData({
                ...publishData,
                price: e.target.value
              })} placeholder="0" min="0" />
                </div>}
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Camera className="w-4 h-4" />
                  <span className="font-medium">Automatic Thumbnail</span>
                </div>
                <p>A screenshot of your chart preview will be automatically captured as the strategy thumbnail.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePublishSubmit} className="bg-gradient-primary">
                Publish Strategy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>;
};

export default Dashboard;
