import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthDialogContextType {
  isOpen: boolean;
  defaultTab: 'login' | 'signup';
  openAuthDialog: (tab?: 'login' | 'signup') => void;
  closeAuthDialog: () => void;
  setOpen: (open: boolean) => void;
  setDefaultTab: (tab: 'login' | 'signup') => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'signup'>('signup');

  const openAuthDialog = (tab?: 'login' | 'signup') => {
    if (tab) setDefaultTab(tab);
    setIsOpen(true);
  };
  const closeAuthDialog = () => setIsOpen(false);
  const setOpen = (open: boolean) => setIsOpen(open);

  return (
    <AuthDialogContext.Provider value={{ isOpen, defaultTab, openAuthDialog, closeAuthDialog, setOpen, setDefaultTab }}>
      {children}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error('useAuthDialog must be used within an AuthDialogProvider');
  }
  return context;
}; 