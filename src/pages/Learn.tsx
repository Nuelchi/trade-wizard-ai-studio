import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Learn() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/40 mx-auto">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Learn Coming Soon</h2>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Tutorials, guides, and resources to help you master trading strategy building. Stay tuned!
        </p>
        <Button asChild size="lg" className="rounded-full px-8 py-3 text-base font-semibold">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
} 