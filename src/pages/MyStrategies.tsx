import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash, Download, Edit, FileText } from 'lucide-react';

interface Strategy {
  id: string;
  title: string;
  summary: any;
  pineScript: string;
  mql4: string;
  mql5: string;
  created: string;
}

const MyStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('myStrategies');
    if (saved) setStrategies(JSON.parse(saved));
  }, []);

  const handleDelete = (id: string) => {
    const updated = strategies.filter(s => s.id !== id);
    setStrategies(updated);
    localStorage.setItem('myStrategies', JSON.stringify(updated));
    toast('Strategy deleted.');
  };

  const handleLoad = (strategy: Strategy) => {
    localStorage.setItem('currentStrategy', strategy.title);
    localStorage.setItem('exportStrategy', strategy.title);
    localStorage.setItem('exportPineScript', strategy.pineScript);
    localStorage.setItem('exportMQL4', strategy.mql4);
    localStorage.setItem('exportMQL5', strategy.mql5);
    localStorage.setItem('exportSummary', JSON.stringify(strategy.summary));
    navigate('/build');
  };

  const handleExport = (strategy: Strategy) => {
    localStorage.setItem('exportStrategy', strategy.title);
    localStorage.setItem('exportPineScript', strategy.pineScript);
    localStorage.setItem('exportMQL4', strategy.mql4);
    localStorage.setItem('exportMQL5', strategy.mql5);
    localStorage.setItem('exportSummary', JSON.stringify(strategy.summary));
    navigate('/export');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Strategies</h1>
      {strategies.length === 0 ? (
        <div className="text-muted-foreground">No strategies saved yet.</div>
      ) : (
        <div className="space-y-6">
          {strategies.map((s) => (
            <Card key={s.id} className="trading-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {s.title}
                </CardTitle>
                <CardDescription>
                  Saved: {new Date(s.created).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                  {s.summary?.description || '--'}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleLoad(s)} variant="default">
                    <Edit className="w-4 h-4 mr-1" /> Load
                  </Button>
                  <Button onClick={() => handleExport(s)} variant="outline">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                  <Button onClick={() => handleDelete(s.id)} variant="destructive">
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStrategies; 