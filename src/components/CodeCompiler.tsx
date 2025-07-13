import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, AlertCircle, Code, FileText, Zap, Cloud } from "lucide-react";
import { toast } from "sonner";

interface CompilationResult {
  success: boolean;
  platform: string;
  filename: string;
  fileSize: string;
  errors?: string[];
  warnings?: string[];
  downloadUrl?: string;
}

export const CodeCompiler = ({ 
  pineScript, 
  mql4Code, 
  mql5Code 
}: { 
  pineScript: string; 
  mql4Code: string; 
  mql5Code: string; 
}) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [results, setResults] = useState<CompilationResult[]>([]);
  const [activeTab, setActiveTab] = useState("pinescript");

  const compileStrategy = async (platform: string) => {
    setIsCompiling(true);
    setCompilationProgress(0);
    
    // Simulate compilation process
    for (let i = 0; i <= 100; i += 10) {
      setCompilationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Mock compilation results
    const mockResults: CompilationResult[] = [
      {
        success: true,
        platform: "TradingView",
        filename: "strategy.pine",
        fileSize: "2.3 KB",
        warnings: ["Consider adding input validation"],
        downloadUrl: "mock-url"
      },
      {
        success: true,
        platform: "MetaTrader 4",
        filename: "strategy.ex4",
        fileSize: "45.7 KB",
        downloadUrl: "mock-url"
      },
      {
        success: false,
        platform: "MetaTrader 5",
        filename: "strategy.ex5",
        fileSize: "0 KB",
        errors: ["Compilation failed: Invalid syntax on line 42", "Missing include directive"]
      }
    ];

    setResults(mockResults);
    setIsCompiling(false);
    toast.success("Compilation completed!");
  };

  const downloadFile = (result: CompilationResult) => {
    if (!result.success || !result.downloadUrl) return;
    
    // Create mock download
    const mockCode = activeTab === "pinescript" ? pineScript : 
                     activeTab === "mql4" ? mql4Code : mql5Code;
    
    const blob = new Blob([mockCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Downloaded ${result.filename}`);
  };

  const deployToVPS = (result: CompilationResult) => {
    toast.info("VPS deployment feature coming soon!");
  };

  const codeValidators = {
    pinescript: (code: string) => {
      const issues = [];
      if (!code.includes("//@version=5")) {
        issues.push({ type: "warning", message: "Consider using Pine Script v5 for latest features" });
      }
      if (!code.includes("strategy(")) {
        issues.push({ type: "error", message: "Missing strategy declaration" });
      }
      return issues;
    },
    mql4: (code: string) => {
      const issues = [];
      if (!code.includes("#property")) {
        issues.push({ type: "warning", message: "Missing property declarations" });
      }
      if (!code.includes("OnTick()")) {
        issues.push({ type: "error", message: "Missing OnTick() function" });
      }
      return issues;
    },
    mql5: (code: string) => {
      const issues = [];
      if (!code.includes("#property")) {
        issues.push({ type: "warning", message: "Missing property declarations" });
      }
      if (!code.includes("OnTick()")) {
        issues.push({ type: "error", message: "Missing OnTick() function" });
      }
      return issues;
    }
  };

  const validateCode = (platform: string, code: string) => {
    const validator = codeValidators[platform as keyof typeof codeValidators];
    return validator ? validator(code) : [];
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case "pinescript": return pineScript;
      case "mql4": return mql4Code;
      case "mql5": return mql5Code;
      default: return "";
    }
  };

  const getCurrentValidation = () => {
    return validateCode(activeTab, getCurrentCode());
  };

  return (
    <div className="space-y-6">
      {/* Code Validation */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Code Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pinescript">Pine Script</TabsTrigger>
              <TabsTrigger value="mql4">MQL4</TabsTrigger>
              <TabsTrigger value="mql5">MQL5</TabsTrigger>
            </TabsList>

            {["pinescript", "mql4", "mql5"].map((platform) => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                <div className="space-y-2">
                  {validateCode(platform, getCurrentCode()).map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        issue.type === "error" 
                          ? "bg-danger/10 text-danger" 
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{issue.message}</span>
                    </div>
                  ))}
                  
                  {validateCode(platform, getCurrentCode()).length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">No issues detected</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Compilation */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Strategy Compilation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => compileStrategy("all")}
              disabled={isCompiling}
              className="glow-button"
            >
              {isCompiling ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Compiling...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Compile All Platforms
                </>
              )}
            </Button>
            
            {isCompiling && (
              <div className="flex-1">
                <Progress value={compilationProgress} className="w-full" />
                <div className="text-sm text-muted-foreground mt-1">
                  {compilationProgress}% complete
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Compilation Results</h4>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? "border-success/30 bg-success/5" 
                      : "border-danger/30 bg-danger/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.platform}
                      </Badge>
                      <span className="text-sm font-medium">{result.filename}</span>
                      <span className="text-xs text-muted-foreground">{result.fileSize}</span>
                    </div>
                    
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {result.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-sm text-danger">
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {result.warnings.map((warning, warningIndex) => (
                        <div key={warningIndex} className="text-sm text-warning">
                          ⚠ {warning}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.success && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => downloadFile(result)}
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => deployToVPS(result)}
                        variant="outline"
                        disabled
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Deploy to VPS
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Instructions */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Platform Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tradingview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tradingview">TradingView</TabsTrigger>
              <TabsTrigger value="mt4">MetaTrader 4</TabsTrigger>
              <TabsTrigger value="mt5">MetaTrader 5</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tradingview" className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</div>
                  <p>Copy the Pine Script code or download the .pine file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <p>Open TradingView and navigate to Pine Editor</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</div>
                  <p>Paste the code and click "Add to Chart"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">4</div>
                  <p>Configure parameters and start paper trading</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mt4" className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</div>
                  <p>Download the compiled .ex4 file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <p>Open MT4 and go to File → Open Data Folder</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</div>
                  <p>Navigate to MQL4/Experts folder and copy the file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">4</div>
                  <p>Restart MT4 and find your EA in Navigator</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mt5" className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</div>
                  <p>Download the compiled .ex5 file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <p>Open MT5 and go to File → Open Data Folder</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</div>
                  <p>Navigate to MQL5/Experts folder and copy the file</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">4</div>
                  <p>Restart MT5 and find your EA in Navigator</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeCompiler;