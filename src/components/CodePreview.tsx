import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Play, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodePreviewProps {
  strategy?: any;
  code?: any;
}

const CodePreview = ({ strategy, code }: CodePreviewProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Code has been copied to your clipboard.',
    });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download started',
      description: `${filename} has been downloaded.`,
    });
  };

  if (!strategy && !code) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Live Preview
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Start chatting to see your strategy and generated code appear here in real-time. 
            Just like Lovable, but for trading strategies!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
            <TabsTrigger value="mql4">MQL4</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0 p-4">
            {strategy && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge variant="secondary">{strategy.confidence}% Confidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Strategy Type</h4>
                      <Badge>{strategy.type}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.indicators?.map((indicator: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {indicator.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Entry Conditions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {strategy.conditions?.entry?.map((condition: string, index: number) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Exit Conditions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {strategy.conditions?.exit?.map((condition: string, index: number) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {strategy.riskManagement && (
                      <div>
                        <h4 className="font-medium mb-2">Risk Management</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {strategy.riskManagement.stopLoss && (
                            <div>
                              <span className="text-muted-foreground">Stop Loss:</span>
                              <span className="ml-2 font-medium">{strategy.riskManagement.stopLoss}</span>
                            </div>
                          )}
                          {strategy.riskManagement.takeProfit && (
                            <div>
                              <span className="text-muted-foreground">Take Profit:</span>
                              <span className="ml-2 font-medium">{strategy.riskManagement.takeProfit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pinescript" className="h-full m-0">
            {code?.pineScript ? (
              <CodeEditor
                code={code.pineScript}
                language="pinescript"
                onCopy={() => handleCopy(code.pineScript)}
                onDownload={() => handleDownload(code.pineScript, `${strategy?.name || 'strategy'}.pine`)}
              />
            ) : (
              <EmptyState message="No Pine Script generated yet" />
            )}
          </TabsContent>

          <TabsContent value="mql4" className="h-full m-0">
            {code?.mql4 ? (
              <CodeEditor
                code={code.mql4}
                language="mql4"
                onCopy={() => handleCopy(code.mql4)}
                onDownload={() => handleDownload(code.mql4, `${strategy?.name || 'strategy'}.mq4`)}
              />
            ) : (
              <EmptyState message="No MQL4 code generated yet" />
            )}
          </TabsContent>

          <TabsContent value="backtest" className="h-full m-0">
            <div className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backtest Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Ready to Backtest
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run a backtest to see how your strategy would have performed.
                    </p>
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Run Backtest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface CodeEditorProps {
  code: string;
  language: string;
  onCopy: () => void;
  onDownload: () => void;
}

const CodeEditor = ({ code, language, onCopy, onDownload }: CodeEditorProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{language.toUpperCase()}</Badge>
          <span className="text-sm text-muted-foreground">Live Generated Code</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono text-foreground bg-background">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Play className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export default CodePreview;