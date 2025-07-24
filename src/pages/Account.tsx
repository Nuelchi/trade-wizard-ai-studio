import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Account() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        setSubscription(data);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Account & Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {!user && <div>Please log in to view your account.</div>}
            {loading && <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading subscription...</div>}
            {!loading && subscription && (
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">{subscription.tier}</Badge>
                  <div>Status: <span className="font-semibold">{subscription.status}</span></div>
                  <div>Provider: {subscription.provider}</div>
                  <div>Renewal: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</div>
                </div>
                {subscription.status !== 'active' && <div className="text-destructive">Your subscription is not active.</div>}
              </div>
            )}
            {!loading && !subscription && <div>No active subscription found.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 