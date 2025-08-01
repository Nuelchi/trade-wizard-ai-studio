import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, Code, TrendingUp, BarChart3, Paperclip, Mic, Plus, ArrowUp, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import type { Database, TablesInsert } from '@/integrations/supabase/types';
import { generateStrategyWithAI } from '@/lib/utils';
import React from 'react';
import SimpleMarkdownRenderer from './SimpleMarkdownRenderer';
import { generateStrategyName } from '@/lib/ai-service';

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
  onCodeGenerated: (code: any, type?: string) => void;
}

const WELCOME_MESSAGE: Message = {
  id: '1',
  content: "Hi! I'm your AI trading strategy assistant. I'll create MQL5 code by default, but you can also request Pine Script (TradingView), MQL4 (MetaTrader 4), or Python versions. Describe the strategy you'd like to create in plain English!",
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
  const onDoneRef = useRef(onDone);

  // Update the ref when onDone changes
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

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
          // Use setTimeout to defer the callback to avoid setState during render
          setTimeout(() => {
            onDoneRef.current?.();
          }, 0);
        }
        return next;
      });
    }, 8); // Speed: 8ms per character
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="break-words">
      <SimpleMarkdownRenderer content={displayed} />
    </div>
  );
}



// AI message renderer with markdown support
function AIMessage({ content }: { content: string }) {
  return (
    <div className="w-full">
      <SimpleMarkdownRenderer content={content} />
    </div>
  );
}

const ChatInterface = ({ onStrategyGenerated, onCodeGenerated }: ChatInterfaceProps) => {
  const { messages, setMessages, strategy, setStrategy, resetChat, saveCurrentStrategy } = useChatContext();
  
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [messages.length, setMessages]);

  // Mark loaded messages as formatted to prevent typewriter effect on load
  useEffect(() => {
    if (messages.length > 1) {
      // Only mark messages that are not the welcome message and are older than current time
      const now = Date.now();
      const loadedMessageIds = messages
        .filter(msg => msg.id !== '1' && new Date(msg.timestamp).getTime() < now - 1000) // Messages older than 1 second
        .map(msg => msg.id);
      
      if (loadedMessageIds.length > 0) {
        setFormattedIds(prev => {
          const combined = [...new Set([...prev, ...loadedMessageIds])];
          return combined;
        });
      }
    }
  }, [messages.length]);
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

  const generateStrategy = async (prompt: string, aiSummary: string, code: string) => {
    // Call the AI naming tool after code is generated
    let name = '';
    try {
      name = await generateStrategyName({ userPrompt: prompt, aiSummary, code });
    } catch {
      name = '';
    }
    const strategy = {
      name, // Use the AI-generated name directly
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

  const [pendingCode, setPendingCode] = useState<any>(null);
  const [pendingType, setPendingType] = useState<string | undefined>(undefined);

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

    // Detect requested script type
    let requestedType = undefined;
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('pine')) requestedType = 'pinescript';
    else if (lowerInput.includes('mql4')) requestedType = 'mql4';
    else if (lowerInput.includes('mql5')) requestedType = 'mql5';
    else if (lowerInput.includes('tradingview')) requestedType = 'pinescript';
    else if (lowerInput.includes('metatrader 4')) requestedType = 'mql4';
    else if (lowerInput.includes('metatrader 5')) requestedType = 'mql5';

    try {
      // Call real AI API with conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      const aiResult = await generateStrategyWithAI(input, undefined, conversationHistory);
      
      // Extract code blocks from markdown if present
      let markdownContent = '';
      if (aiResult && typeof aiResult === 'object' && 'content' in aiResult && typeof (aiResult as any).content === 'string') {
        markdownContent = (aiResult as any).content;
      }
      const extractedBlocks = extractCodeBlocks(markdownContent);
      let codeBlocks = {
        mql5: aiResult.mql5 || extractedBlocks.mql5 || '',
        pineScript: aiResult.pineScript || extractedBlocks.pineScript || '',
        mql4: aiResult.mql4 || extractedBlocks.mql4 || '',
        python: (aiResult as any).python || extractedBlocks.python || '',
      };
      // Pick the best available code for naming
      const codeForNaming = codeBlocks.mql5 || codeBlocks.mql4 || codeBlocks.pineScript || '';
      // Call the AI naming tool
      let aiName = '';
      try {
        aiName = await generateStrategyName({ userPrompt: input, aiSummary: aiResult.summary, code: codeForNaming });
      } catch (err) {
        console.error('AI naming tool failed:', err);
        aiName = '';
      }
      console.log('AI generated strategy name:', aiName);
      if (!aiName || typeof aiName !== 'string' || !aiName.trim()) {
        aiName = 'AI Generated Strategy';
      }
      // Generate strategy and code like the old version, but use AI name
      const strategy = {
        name: aiName,
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
      setPendingCode(codeBlocks);
      setPendingType(requestedType);
      // onCodeGenerated(codeBlocks, requestedType); // DELAYED, now called after typewriter
      // Check if actual code was generated
      const hasCode = aiResult.pineScript || aiResult.mql4 || aiResult.mql5;
      // Parse toast messages from AI response
      const toastMessages = parseToastMessages(aiResult.summary);
      // Remove toast markers from the displayed content
      const cleanContent = removeToastMarkers(aiResult.summary);
      // Display toast messages
      toastMessages.forEach(({ type, title, message }) => {
        switch (type) {
          case 'success':
            toast({ title, description: message });
            break;
          case 'error':
            toast({ title, description: message, variant: 'destructive' });
            break;
          case 'warning':
            toast({ title, description: message, variant: 'destructive' });
            break;
          case 'info':
            toast({ title, description: message });
            break;
        }
      });
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `${cleanContent}

${hasCode ? `I've successfully generated The working script

The strategy includes:
• Technical indicators based on your requirements
• Entry and exit conditions
• Risk management parameters

You can also test this strategy in the built-in Strategy Tester to see how it performs!` : ''}`,
        sender: 'ai',
        timestamp: new Date(),
        ...(hasCode && {
          codeGenerated: true
        })
      };
      setMessages([...messages, userMessage, aiResponse]);
      setIsTyping(false);
      // Persist strategy to Supabase
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
          remixes: 0,
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
        }
      }
    } catch (err: any) {
      setIsTyping(false);
      console.error('AI Error:', err);
      
      // Enhanced error handling with specific toast messages
      let errorTitle = 'AI Error';
      let errorMessage = err.message || JSON.stringify(err);
      
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to AI service. Please check your internet connection.';
      } else if (err.message?.includes('rate limit')) {
        errorTitle = 'Rate Limit Exceeded';
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.message?.includes('authentication')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Please log in to use the AI features.';
      }
      
      toast({ 
        title: errorTitle, 
        description: errorMessage, 
        variant: 'destructive' 
      });
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

  // Track which AI message ids have finished typewriter effect
  const [formattedIds, setFormattedIds] = useState<string[]>([]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) { // Only save if there are messages beyond the initial greeting
      const messagesToSave = messages.filter(msg => msg.id !== '1'); // Filter out welcome message
      localStorage.setItem('chatHistory', JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Utility to extract code blocks from markdown
  function extractCodeBlocks(markdown: string) {
    const codeBlocks: any = {};
    const regex = /```(mql5|mql4|pinescript|python)?\n([\s\S]*?)```/gi;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const lang = match[1] ? match[1].toLowerCase() : '';
      const code = match[2];
      if (lang) {
        if (lang === 'pinescript') codeBlocks.pineScript = code;
        else if (lang === 'mql5') codeBlocks.mql5 = code;
        else if (lang === 'mql4') codeBlocks.mql4 = code;
        else if (lang === 'python') codeBlocks.python = code;
      }
    }
    return codeBlocks;
  }

  // Utility to parse toast messages from AI response
  function parseToastMessages(content: string) {
    const toastMessages: Array<{type: string, title: string, message: string}> = [];
    const toastRegex = /\[TOAST_(SUCCESS|ERROR|WARNING|INFO):([^:]+):([^\]]+)\]/g;
    let match;
    
    while ((match = toastRegex.exec(content)) !== null) {
      const [, type, title, message] = match;
      toastMessages.push({
        type: type.toLowerCase(),
        title: title.trim(),
        message: message.trim()
      });
    }
    
    return toastMessages;
  }

  // Utility to remove toast markers from content
  function removeToastMarkers(content: string) {
    return content.replace(/\[TOAST_(SUCCESS|ERROR|WARNING|INFO):[^:]+:[^\]]+\]/g, '').trim();
  }

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
            i === messages.map((m, idx) => (m.sender === 'ai' ? idx : -1)).filter(idx => idx !== -1).pop();
          return (
            <div
              key={message.id || i}
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
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                    {isLatestAi ? (
                      formattedIds.includes(message.id) ? (
                        <AIMessage content={message.content} />
                      ) : (
                        <TypewriterText text={message.content} onDone={() => {
                          setFormattedIds(ids => [...ids, message.id]);
                          // Scroll to bottom when code is generated
                          scrollToBottom();
                          if (pendingCode) {
                            onCodeGenerated(pendingCode, pendingType);
                            setPendingCode(null);
                            setPendingType(undefined);
                          }
                        }} />
                      )
                    ) : (
                      message.sender === 'ai' ? <AIMessage content={message.content} /> : message.content
                    )}
                  </div>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="uploaded" 
                      className="mt-3 rounded-xl max-w-[200px] max-h-[150px] border border-border/20" 
                    />
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
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