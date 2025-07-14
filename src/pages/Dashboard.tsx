import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Save, Download, Edit, User, MessageSquare, BarChart3, ChevronDown } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import ChatInterface from '@/components/ChatInterface';
import AuthGuard from '@/components/AuthGuard';

const Dashboard = () => {
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [strategyName, setStrategyName] = useState('Untitled Strategy');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    tags: '',
    price: ''
  });
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Load strategy data and chat history on mount
  useEffect(() => {
    const savedStrategy = localStorage.getItem('currentStrategy');
    const savedChatHistory = localStorage.getItem('chatHistory');
    const savedCode = localStorage.getItem('exportPineScript');
    
    if (savedStrategy) {
      setStrategyName(savedStrategy);
    }
    
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        setChatHistory(parsedHistory);
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
    
    if (savedCode) {
      setGeneratedCode({
        pineScript: savedCode,
        mql4: localStorage.getItem('exportMQL4') || '',
        mql5: localStorage.getItem('exportMQL5') || ''
      });
    }
  }, []);

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
    setChatHistory([]);
    // Clear stored data
    localStorage.removeItem('currentStrategy');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('exportPineScript');
    localStorage.removeItem('exportMQL4');
    localStorage.removeItem('exportMQL5');
    localStorage.removeItem('exportSummary');
  };

  const handleNameChange = (newName: string) => {
    setStrategyName(newName);
    setIsEditingName(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSave = () => {
    toast({
      title: 'Strategy Saved!',
      description: 'Your strategy has been saved to your profile.',
    });
  };

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    tags: z.string(),
    price: z.string().regex(/^(\d+(\.\d{1,2})?)$/, {
      message: "Price must be a valid number with up to 2 decimal places.",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      price: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Strategy Published!",
      description: "Your strategy is now live on the marketplace.",
    })
  }

  const location = useLocation();
  const sectionOptions = [
    { path: '/dashboard', label: 'Builder', icon: MessageSquare },
    { path: '/test', label: 'Backtest', icon: BarChart3 },
    { path: '/export', label: 'Export', icon: Download },
    { path: '/mystrategies', label: 'My Strategies', icon: User },
  ];
  const currentSection = sectionOptions.find(opt => location.pathname.startsWith(opt.path)) || sectionOptions[0];

  const mockAnalytics = [
    { name: 'Win Rate', value: '65%' },
    { name: 'Avg. Profit', value: '1.2%' },
    { name: 'Max Drawdown', value: '8%' },
  ];

  const mockBacktestResults = [
    { time: '2024-01-01', profit: 100 },
    { time: '2024-01-02', profit: 150 },
    { time: '2024-01-03', profit: 130 },
    { time: '2024-01-04', profit: 180 },
    { time: '2024-01-05', profit: 200 },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Trainflow</span>
            </Link>
          </div>

          {/* Center Section - Navigation Dropdown as Select Field */}
          <div className="ml-12">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-4 min-w-[160px] justify-between border border-border bg-background text-foreground font-medium shadow-none">
                  <div className="flex items-center gap-2">
                    <currentSection.icon className="w-4 h-4" />
                    <span>{currentSection.label}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {sectionOptions.map((option) => (
                  <DropdownMenuItem key={option.path} asChild>
                    <Link to={option.path} className="flex items-center gap-2 cursor-pointer">
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" onChecked={isDarkMode} onCheckedChange={toggleTheme} />
              <Label htmlFor="dark-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Dark Mode
              </Label>
            </div>

            {/* Publish Strategy Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">Publish Strategy</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Publish Your Strategy</DialogTitle>
                  <DialogDescription>
                    List your strategy on the marketplace for other users to discover and use.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome Strategy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A brief description of your strategy..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="scalping, trend following, rsi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="49.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Publish Strategy</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 flex items-center justify-center">
                  {user?.email?.charAt(0).toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup 
            direction="horizontal" 
            className="h-full scrollbar-hide"
          >
            {/* Chat Panel */}
            <ResizablePanel defaultSize={50} minSize={30} className="relative">
              <div className="h-full flex flex-col">
                {/* Strategy Name Header */}
                <div className="flex-shrink-0 p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEditingName ? (
                        <input
                          type="text"
                          value={strategyName}
                          onChange={(e) => setStrategyName(e.target.value)}
                          onBlur={() => handleNameChange(strategyName)}
                          onKeyPress={(e) => e.key === 'Enter' && handleNameChange(strategyName)}
                          className="text-lg font-semibold bg-transparent border-none outline-none text-foreground"
                          autoFocus
                        />
                      ) : (
                        <h2 
                          className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setIsEditingName(true)}
                        >
                          {strategyName}
                        </h2>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditingName(!isEditingName)}
                        className="w-6 h-6 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSave} size="sm" variant="outline">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface 
                    onStrategyGenerated={handleStrategyGenerated}
                    onCodeGenerated={handleCodeGenerated}
                    initialChatHistory={chatHistory}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border hover:bg-border/80 transition-colors" />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30} className="relative">
              <div className="h-full flex flex-col">
                {/* Preview Header */}
                <div className="flex-shrink-0 p-4 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-semibold text-foreground">Code Preview</h2>
                  <p className="text-sm text-muted-foreground">View and edit the generated code</p>
                </div>

                {/* Code Tabs */}
                <div className="flex-shrink-0 flex items-center justify-start p-2 bg-muted/10 border-b border-border">
                  <Badge variant="secondary" className="mr-2">Pine Script</Badge>
                  <Badge variant="outline" className="mr-2">MQL4</Badge>
                  <Badge variant="outline">MQL5</Badge>
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-auto p-4">
                  <Textarea
                    placeholder="Generated code will appear here..."
                    className="w-full h-full resize-none bg-transparent border-none outline-none text-sm text-foreground"
                    value={generatedCode?.pineScript || ''}
                    readOnly
                  />
                </div>

                {/* Analytics Section */}
                <div className="flex-shrink-0 p-4 border-t border-border bg-muted/10">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Analytics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {mockAnalytics.map((item) => (
                      <div key={item.name} className="text-center">
                        <div className="text-lg font-bold text-primary">{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Backtest Results */}
                <div className="flex-shrink-0 p-4 border-t border-border bg-muted/10">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Backtest Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="py-2 text-xs font-semibold text-muted-foreground">Date</th>
                          <th className="py-2 text-xs font-semibold text-muted-foreground">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockBacktestResults.map((result) => (
                          <tr key={result.time}>
                            <td className="py-2 text-xs text-foreground">{result.time}</td>
                            <td className="py-2 text-xs text-primary">{result.profit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
