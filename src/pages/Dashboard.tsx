import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Code, User, LogOut, Eye } from 'lucide-react';
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
                    <div className="text-xs text-muted-foreground">
                      Your strategy appears here in real-time
                    </div>
                  </div>
                  
                  <CodePreview 
                    strategy={currentStrategy}
                    code={generatedCode}
                  />
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