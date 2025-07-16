import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, Code, TrendingUp, BarChart3, Paperclip, Mic, Plus, ArrowUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import type { Database, TablesInsert } from '@/integrations/supabase/types';
import { generateStrategyWithAI } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  codeGenerated?: boolean;
  image?: string;
}

interface ChatInterfaceProps {
  onStrategyGenerated: (strategy: any) => void;
  onCodeGenerated: (code: any) => void;
}

const WELCOME_MESSAGE: Message = {
  id: '1',
  content: "Hi! I'm your AI trading strategy assistant. Describe the strategy you'd like to create in plain English, and I'll help you build it step by step. What kind of trading strategy are you thinking about?",
  sender: 'ai',
  timestamp: new Date(),
  suggestions: [
    "Create a moving average crossover strategy",
    "Build an RSI mean reversion strategy",
    "Design a breakout strategy with Bollinger Bands"
  ]
};

// TypewriterText component for typewriter effect
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const index = useRef(0);

  useEffect(() => {
    setDisplayed('');
    index.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        const next = text.slice(0, index.current + 1);
        index.current++;
        if (next.length === text.length) {
          clearInterval(interval);
          if (onDone) onDone();
        }
        return next;
      });
    }, 15); // Speed: 15ms per character
    return () => clearInterval(interval);
  }, [text, onDone]);

  return <span>{displayed}</span>;
}

const ChatInterface = ({ onStrategyGenerated, onCodeGenerated }: ChatInterfaceProps) => {
  const { messages, setMessages, strategy, setStrategy, resetChat, saveCurrentStrategy } = useChatContext();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Voice input state and logic
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({ title: 'Voice input not supported', description: 'Your browser does not support speech recognition.' });
      return;
    }
    if (!isRecording) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev ? prev + ' ' + transcript : transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } else {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateStrategy = (prompt: string) => {
    // Mock strategy generation based on prompt analysis
    const strategy = {
      name: `AI Generated Strategy`,
      description: prompt,
      type: prompt.toLowerCase().includes('scalp') ? 'Scalping' : 
            prompt.toLowerCase().includes('crossover') ? 'Trend Following' :
            prompt.toLowerCase().includes('rsi') ? 'Mean Reversion' : 'Custom',
      confidence: 85 + Math.floor(Math.random() * 10),
      indicators: extractIndicators(prompt),
      conditions: {
        entry: extractEntryConditions(prompt),
        exit: extractExitConditions(prompt)
      },
      riskManagement: {
        stopLoss: prompt.toLowerCase().includes('stop') ? '2%' : null,
        takeProfit: prompt.toLowerCase().includes('profit') ? '4%' : null
      }
    };

    onStrategyGenerated(strategy);
    return strategy;
  };

  const generateCode = (strategy: any) => {
    const code = {
      pineScript: `// ${strategy.name} - Generated by Trainflow AI\n//@version=5\nstrategy(\"${strategy.name}\", overlay=true)\n\n// Indicators\n${strategy.indicators.map((ind: any) => `${ind.name.toLowerCase().replace(/\s+/g, '_')} = ${ind.code}`).join('\n')}\n\n// Entry Logic\n${strategy.conditions.entry.map((cond: any) => `// ${cond}`).join('\n')}\n\n// Exit Logic  \n${strategy.conditions.exit.map((cond: any) => `// ${cond}`).join('\n')}\n\n// Risk Management\n${strategy.riskManagement.stopLoss ? `strategy.exit(\"Stop Loss\", \"Long\", loss=${strategy.riskManagement.stopLoss})` : ''}\n${strategy.riskManagement.takeProfit ? `strategy.exit(\"Take Profit\", \"Long\", profit=${strategy.riskManagement.takeProfit})` : ''}`,
      mql4: `// ${strategy.name} - MQL4 Expert Advisor\n#property copyright \"Trainflow AI\"\n#property version   \"1.00\"\n\n// Input Parameters\n${strategy.riskManagement.stopLoss ? `input double StopLoss = ${parseFloat(strategy.riskManagement.stopLoss.replace('%', ''))};` : ''}\n${strategy.riskManagement.takeProfit ? `input double TakeProfit = ${parseFloat(strategy.riskManagement.takeProfit.replace('%', ''))};` : ''}\n\nvoid OnTick()\n{\n   // Strategy Implementation\n   ${strategy.indicators.map((ind: any) => `// ${ind.name} logic here`).join('\n   ')}\n}`,
      mql5: `// ${strategy.name} - MQL5 Expert Advisor\n#property copyright \"Trainflow AI\"\n#property version   \"1.00\"\n\n// Input Parameters\n${strategy.riskManagement.stopLoss ? `input double StopLoss = ${parseFloat(strategy.riskManagement.stopLoss.replace('%', ''))};` : ''}\n${strategy.riskManagement.takeProfit ? `input double TakeProfit = ${parseFloat(strategy.riskManagement.takeProfit.replace('%', ''))};` : ''}\n\nvoid OnTick()\n{\n    // Strategy Implementation\n    ${strategy.indicators.map((ind: any) => `// ${ind.name} logic here`).join('\n    ')}\n}`
    };
    onCodeGenerated(code);
    return code;
  };

  const extractIndicators = (prompt: string) => {
    const indicators = [];
    if (prompt.toLowerCase().includes('rsi')) {
      indicators.push({ name: 'RSI', code: 'ta.rsi(close, 14)', period: 14 });
    }
    if (prompt.toLowerCase().includes('moving average') || prompt.toLowerCase().includes('ma')) {
      indicators.push({ name: 'Moving Average', code: 'ta.sma(close, 20)', period: 20 });
    }
    if (prompt.toLowerCase().includes('bollinger')) {
      indicators.push({ name: 'Bollinger Bands', code: 'ta.bb(close, 20, 2)', period: 20 });
    }
    if (prompt.toLowerCase().includes('macd')) {
      indicators.push({ name: 'MACD', code: 'ta.macd(close, 12, 26, 9)', period: 12 });
    }
    return indicators;
  };

  const extractEntryConditions = (prompt: string) => {
    const conditions = [];
    if (prompt.toLowerCase().includes('buy when')) {
      conditions.push('Buy signal detected based on your criteria');
    }
    if (prompt.toLowerCase().includes('sell when')) {
      conditions.push('Sell signal detected based on your criteria');
    }
    return conditions;
  };

  const extractExitConditions = (prompt: string) => {
    const conditions = [];
    if (prompt.toLowerCase().includes('stop loss')) {
      conditions.push('Stop loss triggered');
    }
    if (prompt.toLowerCase().includes('take profit')) {
      conditions.push('Take profit triggered');
    }
    return conditions;
  };

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;

    let userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined
    };
    setMessages([...messages, userMessage]);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      // Call real AI API
      const aiResult = await generateStrategyWithAI(input);
      const strategy = {
        name: 'AI Generated Strategy',
        description: aiResult.summary,
        type: aiResult.jsonLogic?.type || 'Custom',
        confidence: aiResult.jsonLogic?.confidence || 90,
        indicators: aiResult.jsonLogic?.indicators || [],
        conditions: aiResult.jsonLogic?.conditions || { entry: [], exit: [] },
        riskManagement: aiResult.risk || {},
      };
      const code = {
        pineScript: aiResult.pineScript,
        mql4: aiResult.mql4,
        mql5: aiResult.mql5,
      };
      onStrategyGenerated(strategy);
      onCodeGenerated(code);
      // Defensive check: Only proceed if PineScript or other code is present
      if (!aiResult.pineScript || aiResult.pineScript.trim() === "") {
        // No code generated, just show the summary and skip save/backtest
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResult.summary || "No code generated for this prompt.",
          sender: 'ai',
          timestamp: new Date(),
        };
        const userMsg: Message = {
          ...userMessage,
          sender: 'user',
        };
        setMessages([...messages, userMsg, aiMessage]);
        toast({
          title: "No Strategy Code Generated",
          description: "The AI did not generate any code for this prompt. Try asking for a trading strategy!",
          variant: "default"
        });
        setIsTyping(false);
        return;
      }
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Great! Here is your strategy summary and code.\n\n${aiResult.summary}\n\nPine Script, MQL4, and MQL5 code are available in the preview tabs.`,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Run a backtest on this strategy',
          'Modify the stop loss settings',
          'Add more indicators',
          'Change the timeframe'
        ],
        codeGenerated: true
      };
      setMessages([...messages, userMessage, aiResponse]);
      setIsTyping(false);
      // Persist strategy to Supabase and run backtest as before...
      if (user) {
        const chatHistoryJson = [
          ...messages,
          userMessage,
          aiResponse
        ].map((msg) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        const insertObj: TablesInsert<'strategies'> = {
          user_id: user.id,
          title: strategy.name,
          description: strategy.description,
          summary: {
            type: strategy.type,
            confidence: strategy.confidence,
            indicators: strategy.indicators,
            riskManagement: strategy.riskManagement
          },
          code: code,
          chat_history: chatHistoryJson,
          analytics: null,
          tags: [],
          is_public: false,
          thumbnail: null,
          likes: 0,
          copies: 0,
          price: null,
        };
        const { data, error } = await supabase
          .from('strategies')
          .insert(insertObj)
          .select('*')
          .single();
        if (error) {
          toast({ title: 'Failed to save strategy', description: error.message, variant: 'destructive' });
        } else if (data) {
          setStrategy(data);
          // After saving, run backtest and sync metrics
          // You must provide real OHLCV data here:
          const ohlcv = []; // TODO: Replace with real OHLCV data for the selected symbol/interval
          await runBacktestAndSync(code, ohlcv);
        }
      }
    } catch (err: any) {
      setIsTyping(false);
      // Enhanced error logging for debugging
      console.error('AI Error:', err);
      if (err && typeof err === 'object') {
        for (const key in err) {
          if (Object.prototype.hasOwnProperty.call(err, key)) {
            console.error(`AI Error property [${key}]:`, err[key]);
          }
        }
      }
      toast({ title: 'AI Error', description: err.message || JSON.stringify(err), variant: 'destructive' });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const runBacktestAndSync = async (codeOrRules, ohlcv) => {
    try {
      const res = await fetch('http://localhost:8000/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ohlcv,
          strategy_rules: codeOrRules
        })
      });
      const data = await res.json();
      const analytics = data.metrics;
      const equityCurve = data.equity_curve || data.equityCurve || [];
      // Update Supabase and context
      if (user && strategy && strategy.id) {
        await supabase
          .from('strategies')
          .update({
            analytics,
            equityCurve,
            updated_at: new Date().toISOString(),
          })
          .eq('id', strategy.id);
        setStrategy({ ...strategy, analytics, equityCurve });
      }
    } catch (err) {
      toast({ title: 'Backtest error', description: err.message || String(err), variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-[85%] bg-muted/50 text-foreground rounded-2xl px-4 py-3 mx-auto mb-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{WELCOME_MESSAGE.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WELCOME_MESSAGE.suggestions!.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium px-3 py-1.5 h-auto rounded-full border-border/50 hover:bg-muted/80 hover:border-border transition-colors"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, i) => {
          const isLatestAi =
            message.sender === 'ai' &&
            // Find the last AI message index
            i === messages.map((m, idx) => (m.sender === 'ai' ? idx : -1)).filter(idx => idx !== -1).pop();
          return (
            <div
              key={message.id}
              className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted/50 text-foreground'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {isLatestAi ? (
                      <TypewriterText text={message.content} />
                    ) : (
                      message.content
                    )}
                  </p>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="uploaded" 
                      className="mt-3 rounded-xl max-w-[200px] max-h-[150px] border border-border/20" 
                    />
                  )}
                  {message.codeGenerated && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                      <Badge variant="secondary" className="text-xs font-medium">
                        <Code className="w-3 h-3 mr-1.5" />
                        Code Generated
                      </Badge>
                    </div>
                  )}
                </div>
                
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs font-medium px-3 py-1.5 h-auto rounded-full border-border/50 hover:bg-muted/80 hover:border-border transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2 px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-0">
        <div className="relative border border-border rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4">
            {/* Main textarea taking full width */}
            <div className="mb-3">
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize logic
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  const scrollHeight = target.scrollHeight;
                  const lineHeight = 20; // Approximate line height
                  const maxLines = 9;
                  const maxHeight = lineHeight * maxLines;
                  target.style.height = Math.min(scrollHeight, maxHeight) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder="Describe your trading strategy..."
                className="w-full min-h-[50px] max-h-[180px] resize-none bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 scrollbar-hide overflow-y-auto"
                rows={1}
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              />
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="w-12 h-12 object-cover rounded-lg border border-border/50" 
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="w-6 h-6 rounded-full hover:bg-muted/80" 
                    onClick={handleRemoveImage} 
                    title="Remove image"
                  >
                    <span className="text-muted-foreground text-sm">×</span>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Buttons row below textarea */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="w-8 h-8 rounded-lg hover:bg-muted/80 transition-colors" 
                  title="Upload Image" 
                  asChild
                >
                  <label>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Plus className="w-4 h-4" />
                  </label>
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`w-8 h-8 rounded-lg transition-colors ${
                    isRecording ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted/80'
                  }`} 
                  title="Voice Input" 
                  onClick={handleVoiceInput}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleSend} 
                disabled={(!input.trim() && !imageFile) || isTyping}
                size="icon"
                className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;