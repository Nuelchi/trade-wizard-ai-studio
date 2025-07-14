import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Code, User, LogOut } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
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

        {/* Main Content - Split Layout like Lovable */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat Interface */}
          <div className="w-1/2 border-r border-border flex flex-col bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Describe your strategy in plain English
              </div>
            </div>
            
            <ChatInterface 
              onStrategyGenerated={handleStrategyGenerated}
              onCodeGenerated={handleCodeGenerated}
            />
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 flex flex-col bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Live Preview</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Your strategy appears here in real-time
              </div>
            </div>
            
            <CodePreview 
              strategy={currentStrategy}
              code={generatedCode}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;