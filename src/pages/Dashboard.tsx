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
import { MessageSquare, Code, User, LogOut, Eye, Settings, ChevronDown, Save, Share2, Download, Upload, Moon, Sun, Bell, HelpCircle, BarChart3, FileCode, ToggleLeft, ToggleRight, Camera, Globe, Lock, TrendingUp, Menu, Square, MessageSquarePlus, LayoutPanelLeft, Play, Loader2 } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import AuthGuard from '@/components/AuthGuard';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Area, Bar } from 'recharts';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useChatContext } from '@/contexts/ChatContext';
import TradingChart from '@/components/TradingChart';
import AdvancedTradingTester from '@/components/AdvancedTradingTester';
import { Badge } from '@/components/ui/badge';
// Remove: import sha256 from 'crypto-js/sha256';
// Add a simple hash function (djb2)
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash.toString();
}
type Strategy = Database['public']['Tables']['strategies']['Row'];
type StrategyInsert = Database['public']['Tables']['strategies']['Insert'];
type StrategyUpdate = Database['public']['Tables']['strategies']['Update'];

// Utility: Robust code extraction and validation
function extractAndValidateCodeBlocks(aiResponse: string, requestedType?: string) {
  const codeBlocks = {
    pineScript: '',
    mql4: '',
    mql5: ''
  };
  // Regex for code blocks (labelled and unlabelled)
  const pineRegex = /```(?:pinescript|pine|tradingview)?\s*([\s\S]*?)```/gi;
  const mql4Regex = /```(?:mql4|mq4)?\s*([\s\S]*?)```/gi;
  const mql5Regex = /```(?:mql5|mq5)?\s*([\s\S]*?)```/gi;

  // Extract Pine Script
  let match;
  while ((match = pineRegex.exec(aiResponse))) {
    if (match[1].includes('//@version')) {
      codeBlocks.pineScript = match[1].trim();
      break;
    }
  }
  // Extract MQL4
  while ((match = mql4Regex.exec(aiResponse))) {
    if (match[1].includes('#property') && match[1].includes('strict')) {
      codeBlocks.mql4 = match[1].trim();
      break;
    }
  }
  // Extract MQL5
  while ((match = mql5Regex.exec(aiResponse))) {
    if (match[1].includes('#property') && match[1].includes('strict')) {
      codeBlocks.mql5 = match[1].trim();
      break;
    }
  }
  // Fallback: If only one code block and requestedType is set, try to assign
  if (requestedType && !codeBlocks[requestedType]) {
    // Try to find any code block
    const genericRegex = /```[a-zA-Z0-9]*\s*([\s\S]*?)```/gi;
    while ((match = genericRegex.exec(aiResponse))) {
      const code = match[1].trim();
      if (requestedType === 'pinescript' && code.includes('//@version')) {
        codeBlocks.pineScript = code;
        break;
      }
      if (requestedType === 'mql4' && code.includes('#property') && code.includes('strict')) {
        codeBlocks.mql4 = code;
        break;
      }
      if (requestedType === 'mql5' && code.includes('#property') && code.includes('strict')) {
        codeBlocks.mql5 = code;
        break;
      }
    }
  }
  return codeBlocks;
}

const Dashboard = () => {
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'code'>('chat');
  const [strategyName, setStrategyName] = useState('Untitled Strategy');
  const [isEditingName, setIsEditingName] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'chart' | 'advanced'>('chart');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishData, setPublishData] = useState({
    title: "",
    description: "",
    tags: "",
    pricingType: "free" as "free" | "paid",
    price: "",
    type: "FX", // Default type
  });
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
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
  const [pendingThumbnail, setPendingThumbnail] = useState<null | { strategy: any, newCode: string }>(null);
  const lastCapturedCodeHash = useRef('');
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingSub(true);
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        setSubscription(data);
        setLoadingSub(false);
      });
  }, [user]);

  // Remove thumbnail logic from handleStrategyGenerated and useEffect
  const handleStrategyGenerated = async (strategy: any) => {
    setCurrentStrategy(strategy);
    setStrategyName(strategy.name || strategy.title || 'Untitled Strategy');
  };

  // Move thumbnail logic here
  const handleCodeGenerated = async (codeBlocks: any, requestedType?: string) => {
    setGeneratedCode(codeBlocks); // Update code state as usual
    // Always try to capture thumbnail if chart tab is open and chart is present, but only once per unique code
    const codeString = codeBlocks?.pineScript || codeBlocks?.mql4 || codeBlocks?.mql5 || codeBlocks?.python || '';
    const codeHash = simpleHash(codeString);
    if (previewMode === 'chart' && currentStrategy && currentStrategy.id && codeString && codeHash !== lastCapturedCodeHash.current) {
      setTimeout(async () => {
        const chartElement = document.getElementById('chart-preview');
        if (chartElement && user) {
          try {
            console.log('Capturing chart thumbnail (once per unique code)...');
            // Ensure the element is fully rendered and visible
            const rect = chartElement.getBoundingClientRect();
            const canvas = await html2canvas(chartElement, { 
              backgroundColor: null, 
              scale: 2, 
              logging: false,
              height: rect.height,
              width: rect.width,
              useCORS: true,
              allowTaint: true,
              scrollX: 0,
              scrollY: 0,
              windowWidth: document.documentElement.offsetWidth,
              windowHeight: document.documentElement.offsetHeight
            });
            const thumbnail = canvas.toDataURL('image/png');
            const { error } = await supabase
              .from('strategies')
              .update({ thumbnail, updated_at: new Date().toISOString() })
              .eq('id', currentStrategy.id);
            if (error) {
              console.error('Supabase update error:', error);
            } else {
              console.log('Thumbnail updated successfully');
              lastCapturedCodeHash.current = codeHash;
            }
          } catch (error) {
            console.error('Error capturing chart thumbnail:', error);
          }
        } else {
          console.log('Chart element not found or user not set');
        }
      }, 1200); // Give React more time to render the chart and metrics
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
    navigate('/');
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
    // Auto-set the publish modal title to the current strategy's title if available
    setPublishData(prev => ({
      ...prev,
      title: currentStrategy?.title || strategyName || ''
    }));
    setPublishDialogOpen(true);
  };

  const captureChartThumbnail = async () => {
    const chartElement = document.getElementById('chart-preview');
    if (chartElement) {
      try {
        // Ensure the element is fully rendered and visible
        const rect = chartElement.getBoundingClientRect();
        const canvas = await html2canvas(chartElement, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          height: rect.height,
          width: rect.width,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight
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
    if (!currentStrategy || !user || !currentStrategy.id) {
      toast({
        title: "No strategy to publish",
        description: "Please create a strategy first.",
        variant: "destructive",
      });
      return;
    }

    const thumbnail = await captureChartThumbnail();
    
    // Parse tags from comma-separated string
    const tags = publishData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      // First, check if this strategy is already published in public_strategies
      const { data: existingPublicStrategy } = await supabase
        .from('public_strategies')
        .select('id, publish_version')
        .eq('strategy_id', currentStrategy.id)
        .single();

      const publicStrategyData = {
        strategy_id: currentStrategy.id,
        user_id: user.id,
        title: publishData.title,
        description: publishData.description,
        summary: currentStrategy.summary,
        code: currentStrategy.code,
        analytics: currentStrategy.analytics,
        tags: tags,
        thumbnail: thumbnail,
        price: publishData.pricingType === 'paid' ? parseFloat(publishData.price) : null,
        is_paid: publishData.pricingType === 'paid',
        is_active: true,
        updated_at: new Date().toISOString(),
        type: publishData.type, // Add type to public strategy data
      };

      let result;
      if (existingPublicStrategy) {
        // Update existing public strategy and increment version
        console.log('Updating existing public strategy:', existingPublicStrategy.id);
        result = await supabase
          .from('public_strategies')
          .update({
            ...publicStrategyData,
            publish_version: (existingPublicStrategy.publish_version || 1) + 1
          })
          .eq('id', existingPublicStrategy.id);
      } else {
        // Insert new public strategy
        console.log('Creating new public strategy for strategy_id:', currentStrategy.id);
        result = await supabase
          .from('public_strategies')
          .insert({
            ...publicStrategyData,
            publish_version: 1
          });
      }

      if (result.error) {
        console.error('Publish error:', result.error);
        toast({
          title: "Failed to publish strategy",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

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
        price: "",
        type: "FX", // Reset type
      });

      // Refresh the current strategy to reflect the changes
      const { data: updatedStrategy } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', currentStrategy.id)
        .single();
      
      if (updatedStrategy) {
        setCurrentStrategy(updatedStrategy);
      }

    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Failed to publish strategy",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
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

  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setUserProfile(data);
        }
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
    { path: '/marketplace', label: 'Marketplace', icon: Download }, // Added Marketplace
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-2 border-b border-border bg-background/80 backdrop-blur-md flex-shrink-0 gap-2">
          {/* Left Section - Strategy Name & Dropdown */}
          <div className="flex items-center space-x-2 min-w-0 mb-2 sm:mb-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            {isEditingName ? <input type="text" value={strategyName} onChange={e => setStrategyName(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyDown={e => {
            if (e.key === 'Enter') {
              setIsEditingName(false);
            }
          }} className="text-lg sm:text-xl font-bold text-foreground bg-transparent border-none outline-none focus:bg-muted px-2 py-1 rounded" autoFocus /> : <h1 className="text-lg sm:text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted" onClick={() => setIsEditingName(true)} title="Click to edit strategy name">
                {strategyName}
              </h1>}
            {/* Strategy Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-2 sm:px-3 h-8 border-border bg-background text-foreground font-medium shadow-none text-xs sm:text-sm">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Strategies</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 sm:w-64 max-h-60 sm:max-h-96 overflow-y-auto">
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
          <div className="flex items-center gap-2 sm:-ml-14 mb-2 sm:mb-0">
            <button
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-muted transition-colors"
              onClick={startNewChat}
              title="New Chat"
              aria-label="New Chat"
            >
              <MessageSquarePlus className="w-5 h-5 text-primary" />
            </button>
            <button
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setChatCollapsed(c => !c)}
              title={chatCollapsed ? "Expand Chat" : "Collapse Chat"}
              aria-label={chatCollapsed ? "Expand Chat" : "Collapse Chat"}
            >
              <LayoutPanelLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[160px] justify-between border border-border bg-background text-foreground font-medium shadow-none text-xs sm:text-sm">
                  <span className="flex items-center gap-2">
                    {currentSection.icon && <currentSection.icon className="w-4 h-4" />}
                    {currentSection.label}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36 sm:w-48">
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
          <div className="flex items-center gap-2 flex-wrap">
            {user && currentStrategy && (
              <Button variant="outline" size="sm" className="h-8" onClick={handleSaveStrategy}>
                Save
              </Button>
            )}
            {/* Code/Chart/Advanced Toggle - pill group, only active shows label, inactive is just icon */}
            <div className="flex items-center rounded-full bg-muted/60 p-1 gap-1">
              <button
                onClick={() => setPreviewMode('code')}
                className={`flex items-center transition-all duration-200 px-2 sm:px-3 h-8 sm:h-9 rounded-full font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${previewMode === 'code' ? 'bg-background shadow text-primary' : 'hover:bg-muted/80 text-muted-foreground'} `}
                aria-label="Code View"
                type="button"
              >
                <FileCode className="w-4 h-4" />
                {previewMode === 'code' && <span className="ml-2">Code</span>}
              </button>
              <button
                onClick={() => setPreviewMode('chart')}
                className={`flex items-center transition-all duration-200 px-2 sm:px-3 h-8 sm:h-9 rounded-full font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${previewMode === 'chart' ? 'bg-background shadow text-primary' : 'hover:bg-muted/80 text-muted-foreground'} `}
                aria-label="Chart View"
                type="button"
              >
                <BarChart3 className="w-4 h-4" />
                {previewMode === 'chart' && <span className="ml-2">Chart</span>}
              </button>
              <button
                onClick={() => setPreviewMode('advanced')}
                className={`flex items-center transition-all duration-200 px-2 sm:px-3 h-8 sm:h-9 rounded-full font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${previewMode === 'advanced' ? 'bg-background shadow text-primary' : 'hover:bg-muted/80 text-muted-foreground'} `}
                aria-label="Advanced Trading Tester"
                type="button"
              >
                <TrendingUp className="w-4 h-4" />
                {previewMode === 'advanced' && <span className="ml-2">Advanced</span>}
              </button>
            </div>
            {/* Publish Button - minimal/outline, icon+label, highlight on hover/active */}
            <button
              onClick={handlePublishStrategy}
              className="flex items-center gap-2 px-3 sm:px-4 h-8 sm:h-9 rounded-full font-medium text-xs sm:text-sm border border-border bg-transparent text-foreground hover:bg-muted/70 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ml-1 sm:ml-2"
              type="button"
            >
              <Upload className="w-4 h-4" />
              <span>Publish</span>
            </button>
            {/* Upgrade Button - minimal/outline, icon+label, highlight on hover/active, disabled if subscribed */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (!subscription || subscription.tier === 'Free') navigate('/pricing');
                    }}
                    disabled={!!subscription && subscription.tier !== 'Free'}
                    className={`flex items-center gap-2 px-3 sm:px-4 h-8 sm:h-9 rounded-full font-medium text-xs sm:text-sm border border-border bg-transparent ${subscription && subscription.tier !== 'Free' ? 'text-muted-foreground opacity-60 cursor-not-allowed' : 'text-foreground hover:bg-muted/70 active:scale-95'} transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ml-1 sm:ml-2`}
                    type="button"
                  >
                    {subscription && subscription.tier !== 'Free' ? (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">{subscription.tier}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upgrade</span>
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {subscription && subscription.tier !== 'Free'
                    ? `Current Plan: ${subscription.tier}`
                    : 'Upgrade to unlock premium features'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Settings/User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 sm:w-56 bg-background border border-border shadow-lg z-50">
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
                  <span>{userProfile?.display_name || user?.email}</span>
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
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
          {/* Left Panel - Chat Interface */}
          {!chatCollapsed && (
            <div className="w-full sm:w-1/3 min-h-0 border-b sm:border-b-0 sm:border-r border-border flex flex-col bg-background min-h-0 max-h-[50vh] sm:max-h-none">
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <ChatInterface
                  onStrategyGenerated={handleStrategyGenerated}
                  onCodeGenerated={handleCodeGenerated}
                />
              </div>
            </div>
          )}
          {/* Right Panel - Live Preview */}
          <div className="w-full sm:w-2/3 min-h-0 flex flex-col bg-background min-h-0 sm:overflow-hidden sm:h-full overflow-visible h-auto scrollbar-hide">
            {previewMode === 'code' ? (
              <CodePreview strategy={currentStrategy} />
            ) : previewMode === 'chart' ? (
              <div className="flex flex-col min-h-0 sm:h-full sm:overflow-hidden overflow-visible h-auto">
                <TradingChart onStrategySelect={() => {}} onStrategyUpload={() => {}} />
                <div id="chart-preview" className="w-full mt-4 min-h-[300px]">
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
            ) : previewMode === 'advanced' ? (
              <AdvancedTradingTester strategy={currentStrategy} />
            ) : null}
          </div>
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
              
              {/* Strategy Type Selection */}
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-medium">Strategy Type</Label>
                <select
                  id="type"
                  value={publishData.type}
                  onChange={e => setPublishData({ ...publishData, type: e.target.value })}
                  className="border rounded px-2 py-1"
                >
                  <option value="FX">FX</option>
                  <option value="Stock">Stock</option>
                  <option value="Crypto">Crypto</option>
                  <option value="ETF">ETF</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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
