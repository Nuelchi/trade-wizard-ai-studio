import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Code, User, LogOut, Eye, Settings, ChevronDown, Save, Share2, Download, Upload, Moon, Sun, Bell, HelpCircle, BarChart3, FileCode, ToggleLeft, ToggleRight, Camera, Globe, Lock } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import AuthGuard from '@/components/AuthGuard';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
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
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleStrategyGenerated = (strategy: any) => {
    setCurrentStrategy(strategy);
  };
  const handleCodeGenerated = (code: any) => {
    setGeneratedCode(code);
  };
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
  return <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md flex-shrink-0">
          {/* Left Section - Strategy Name */}
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
          </div>

          {/* Center Section - Strategy Info & Controls */}
          <div className="flex items-center justify-between flex-1 max-w-5xl">
            <div className="text-sm text-muted-foreground hidden md:block ml-8">
              AI Strategy Builder - Just like Lovable, but for traders
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Code/Chart Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button variant={previewMode === 'code' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('code')} className="flex items-center gap-2 h-8">
                  <FileCode className="w-4 h-4" />
                  Code
                </Button>
                <Button variant={previewMode === 'chart' ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewMode('chart')} className="flex items-center gap-2 h-8">
                  <BarChart3 className="w-4 h-4" />
                  Chart
                </Button>
              </div>
              
              {/* Publish Button */}
              <Button variant="default" size="sm" onClick={handlePublishStrategy} className="h-8 bg-gradient-primary">
                <Upload className="w-4 h-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6 hidden md:block" />
              
              {/* Upgrade Button */}
              <Button variant="outline" size="sm" className="h-8">
                Upgrade
              </Button>
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center space-x-2 min-w-0">
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
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Left Panel - Chat Interface */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full border-r border-border flex flex-col bg-background">
                  
                  
                  <ChatInterface onStrategyGenerated={handleStrategyGenerated} onCodeGenerated={handleCodeGenerated} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel - Live Preview */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full flex flex-col bg-background">
                  
                  
                  {previewMode === 'code' ? <CodePreview strategy={currentStrategy} code={generatedCode} /> : <div className="h-full flex flex-col">
                      {/* Chart Controls */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-foreground">Pair:</span>
                            <Select value={selectedPair} onValueChange={setSelectedPair}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tradingPairs.map(pair => <SelectItem key={pair} value={pair}>
                                    {pair}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-foreground">Timeframe:</span>
                            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeframes.map(tf => <SelectItem key={tf.value} value={tf.value}>
                                    {tf.label}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {selectedPair} • {timeframes.find(tf => tf.value === selectedTimeframe)?.label}
                        </div>
                      </div>

                      {/* Performance Chart View */}
                      <div className="flex-1 p-4">
                        <div id="chart-preview" className="h-full border border-border rounded-lg bg-muted/10 flex items-center justify-center">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              {selectedPair} Performance Chart
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mb-4">
                              Real-time backtested performance data for {selectedPair} on {timeframes.find(tf => tf.value === selectedTimeframe)?.label} timeframe.
                            </p>
                            {currentStrategy && <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-green-500">+24.5%</div>
                                  <div className="text-xs text-muted-foreground">Total Return</div>
                                </div>
                                <div className="p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-blue-500">1.8</div>
                                  <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                                </div>
                                <div className="p-3 bg-background rounded-lg border">
                                  <div className="text-2xl font-bold text-purple-500">-8.2%</div>
                                  <div className="text-xs text-muted-foreground">Max Drawdown</div>
                                </div>
                              </div>}
                          </div>
                        </div>
                      </div>
                    </div>}
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