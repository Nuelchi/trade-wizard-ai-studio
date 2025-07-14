import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Code, 
  User, 
  LogOut, 
  Eye, 
  Settings, 
  ChevronDown, 
  Save, 
  Share2, 
  Download, 
  Moon, 
  Sun, 
  Bell, 
  HelpCircle,
  BarChart3,
  FileCode,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import AuthGuard from '@/components/AuthGuard';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, signOut } = useAuth();

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
  const tradingPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD'
  ];

  const timeframes = [
    { value: '1M', label: '1 Minute' },
    { value: '5M', label: '5 Minutes' },
    { value: '15M', label: '15 Minutes' },
    { value: '30M', label: '30 Minutes' },
    { value: '1H', label: '1 Hour' },
    { value: '4H', label: '4 Hours' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1MO', label: '1 Month' }
  ];

  const handleShare = () => {
    // Share strategy logic
    console.log('Sharing strategy...');
  };

  const handleExport = () => {
    // Export strategy logic
    console.log('Exporting strategy...');
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Trainflow</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              AI Strategy Builder - Just like Lovable, but for traders
            </div>
            <Separator orientation="vertical" className="h-6" />
            
            {/* Functional Toolbar */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chat')}
                  className="flex items-center gap-2 h-8"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button
                  variant={viewMode === 'code' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('code')}
                  className="flex items-center gap-2 h-8"
                >
                  <Code className="w-4 h-4" />
                  Code
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={handleSave} className="h-8">
                  <Save className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="h-8">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExport} className="h-8">
                  <Download className="w-4 h-4" />
                </Button>
                
                {/* Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Settings className="w-4 h-4" />
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Conditional Layout */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'chat' ? (
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Left Panel - Chat Interface */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full border-r border-border flex flex-col bg-background">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">AI Assistant</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {isEditingName ? (
                          <input
                            type="text"
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            onBlur={(e) => handleNameChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameChange(strategyName)}
                            className="text-sm font-medium bg-transparent border border-border rounded px-2 py-1 min-w-[120px]"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {strategyName}
                          </button>
                        )}
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <ChatInterface 
                    onStrategyGenerated={handleStrategyGenerated}
                    onCodeGenerated={handleCodeGenerated}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel - Live Preview */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full flex flex-col bg-background">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Live Preview</span>
                    </div>
                    
                    {/* Preview Mode Toggle */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button
                          variant={previewMode === 'code' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setPreviewMode('code')}
                          className="flex items-center gap-2 h-7 text-xs"
                        >
                          <FileCode className="w-3 h-3" />
                          Code
                        </Button>
                        <Button
                          variant={previewMode === 'chart' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setPreviewMode('chart')}
                          className="flex items-center gap-2 h-7 text-xs"
                        >
                          <BarChart3 className="w-3 h-3" />
                          Chart
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {previewMode === 'code' ? (
                    <CodePreview 
                      strategy={currentStrategy}
                      code={generatedCode}
                    />
                  ) : (
                    <div className="h-full flex flex-col">
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
                                {tradingPairs.map((pair) => (
                                  <SelectItem key={pair} value={pair}>
                                    {pair}
                                  </SelectItem>
                                ))}
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
                                {timeframes.map((tf) => (
                                  <SelectItem key={tf.value} value={tf.value}>
                                    {tf.label}
                                  </SelectItem>
                                ))}
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
                        <div className="h-full border border-border rounded-lg bg-muted/10 flex items-center justify-center">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              {selectedPair} Performance Chart
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mb-4">
                              Real-time backtested performance data for {selectedPair} on {timeframes.find(tf => tf.value === selectedTimeframe)?.label} timeframe.
                            </p>
                            {currentStrategy && (
                              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
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
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* Code View - Full Width */
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Strategy Code</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Generated strategy code and preview
                </div>
              </div>
              
              <CodePreview 
                strategy={currentStrategy}
                code={generatedCode}
              />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;