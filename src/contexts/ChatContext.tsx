import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  codeGenerated?: boolean;
  image?: string;
}

export interface Strategy {
  id?: string;
  title?: string;
  description?: string;
  code?: string | any;
  analytics?: any;
  equityCurve?: any[];
  // Add more fields as needed
}

interface ChatContextType {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  strategy: Strategy | null;
  setStrategy: (s: Strategy | null) => void;
  resetChat: () => void;
  saveCurrentStrategy: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = 'traintrade_chat';
const STRATEGY_STORAGE_KEY = 'traintrade_strategy';

function filterWelcome(messages: any) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  // Only filter out the exact welcome message, not all AI messages
  return safeMessages.filter(
    m => !(m.id === '1' && m.sender === 'ai' && m.content === "Hi! I'm your AI trading strategy assistant. I'll create MQL5 code by default, but you can also request Pine Script (TradingView), MQL4 (MetaTrader 4), or Python versions. Describe the strategy you'd like to create in plain English!")
  );
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessagesState] = useState<any[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMsgs = localStorage.getItem(CHAT_STORAGE_KEY);
    const savedStrat = localStorage.getItem(STRATEGY_STORAGE_KEY);
    if (savedMsgs) {
      try {
        const parsed = JSON.parse(savedMsgs, (k, v) => k === 'timestamp' ? new Date(v) : v);
        console.log('Loading saved messages:', parsed);
        setMessagesState(filterWelcome(parsed));
      } catch (error) {
        console.error('Error loading saved messages:', error);
        setMessagesState([]);
      }
    }
    if (savedStrat) {
      try {
        setStrategy(JSON.parse(savedStrat));
      } catch (error) {
        console.error('Error loading saved strategy:', error);
        setStrategy(null);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    console.log('Saving messages to localStorage:', messages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
  }, [strategy]);

  const setMessages = (msgs: Message[]) => {
    setMessagesState(msgs);
  };

  const resetChat = () => {
    setMessagesState([]);
    setStrategy(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(STRATEGY_STORAGE_KEY);
  };

  const saveCurrentStrategy = () => {
    // Placeholder: implement actual save logic (e.g., Supabase)
    // For now, just persist to localStorage (already handled)
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, strategy, setStrategy, resetChat, saveCurrentStrategy }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatProvider');
  return context;
}; 