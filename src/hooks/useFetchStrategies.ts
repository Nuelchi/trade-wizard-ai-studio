import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type StrategyCard = {
  id: string;
  title: string;
  description: string;
  author: string;
  avatar: string;
  performance: {
    returns: string;
    winRate: string;
    sharpe: string;
    maxDrawdown: string;
  };
  tags: string[];
  price: string;
  likes: number;
  copies: number;
  remixes: number;
  thumbnail?: string;
  isPublic: boolean;
  created_at?: string | null;
};

const DEMO_STRATEGIES: StrategyCard[] = [
  {
    id: '1',
    title: 'Momentum Breakout Pro',
    description: 'AI-powered momentum strategy with adaptive stop-loss',
    author: 'Alex Chen',
    avatar: 'AC',
    performance: {
      returns: '+156.7%',
      winRate: '73.2%',
      sharpe: '2.41',
      maxDrawdown: '-8.3%'
    },
    tags: ['Momentum', 'Breakout', 'AI'],
    price: 'Free',
    likes: 247,
    copies: 1432,
    remixes: 12,
    thumbnail: '/placeholder.svg',
    isPublic: true
  },
  {
    id: '2',
    title: 'Crypto Scalping Beast',
    description: 'High-frequency scalping for BTC/ETH pairs',
    author: 'Maria Silva',
    avatar: 'MS',
    performance: {
      returns: '+89.4%',
      winRate: '68.9%',
      sharpe: '1.87',
      maxDrawdown: '-12.1%'
    },
    tags: ['Crypto', 'Scalping', 'High-Freq'],
    price: '$49',
    likes: 189,
    copies: 892,
    remixes: 8,
    thumbnail: '/placeholder.svg',
    isPublic: false
  },
  {
    id: '3',
    title: 'Mean Reversion Master',
    description: 'Statistical arbitrage with machine learning signals',
    author: 'David Kim',
    avatar: 'DK',
    performance: {
      returns: '+203.1%',
      winRate: '81.5%',
      sharpe: '3.12',
      maxDrawdown: '-5.7%'
    },
    tags: ['Mean Reversion', 'ML', 'Statistical'],
    price: '$99',
    likes: 356,
    copies: 2156,
    remixes: 15,
    thumbnail: '/placeholder.svg',
    isPublic: false
  },
  {
    id: '4',
    title: 'Forex Trend Rider',
    description: 'Multi-timeframe trend following for major pairs',
    author: 'Sarah Johnson',
    avatar: 'SJ',
    performance: {
      returns: '+127.3%',
      winRate: '69.8%',
      sharpe: '2.23',
      maxDrawdown: '-9.8%'
    },
    tags: ['Forex', 'Trend', 'Multi-TF'],
    price: 'Free',
    likes: 412,
    copies: 1876,
    remixes: 20,
    thumbnail: '/placeholder.svg',
    isPublic: true
  }
];

export function useFetchStrategies({
  publicOnly = false,
  userId,
  sortBy = 'likes',
}: {
  publicOnly?: boolean;
  userId?: string;
  sortBy?: 'likes' | 'remixes';
}) {
  const [strategies, setStrategies] = useState<StrategyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (publicOnly) {
          // Fetch from public_strategies
          const { data, error } = await supabase
            .from('public_strategies')
            .select('*')
            .order(sortBy, { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            // Optionally fetch profiles for author display
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, display_name, avatar_url');
            const profilesMap = new Map();
            profiles?.forEach((profile) => {
              profilesMap.set(profile.user_id, profile);
            });
            const mapped = data.map((strategy: Database['public']['Tables']['public_strategies']['Row']) => {
              const userProfile = profilesMap.get(strategy.user_id);
              const displayName = userProfile?.display_name || 'Anonymous';
              const avatarInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              const analytics = strategy.analytics as any;
              return {
                id: strategy.id,
                title: strategy.title || 'Untitled Strategy',
                description: strategy.description || 'No description available',
                author: displayName,
                avatar: avatarInitials,
                performance: {
                  returns: analytics?.total_return ? `+${analytics.total_return.toFixed(1)}%` : '+0.0%',
                  winRate: analytics?.win_rate ? `${(analytics.win_rate * 100).toFixed(1)}%` : '0.0%',
                  sharpe: analytics?.sharpe_ratio ? analytics.sharpe_ratio.toFixed(2) : '0.00',
                  maxDrawdown: analytics?.max_drawdown ? `${analytics.max_drawdown.toFixed(1)}%` : '0.0%'
                },
                tags: strategy.tags || [],
                price: strategy.is_paid && strategy.price ? `$${strategy.price}` : 'Free',
                likes: strategy.likes || 0,
                copies: strategy.copies || 0,
                remixes: strategy.remixes || 0,
                thumbnail: strategy.thumbnail || undefined,
                isPublic: !strategy.is_paid,
              };
            });
            if (isMounted) setStrategies(mapped);
          } else {
            if (isMounted) setStrategies(DEMO_STRATEGIES);
          }
        } else {
          // Fetch from private strategies for a user
          if (!userId) throw new Error('No userId provided for private strategies');
          const { data, error } = await supabase
            .from('strategies')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            const mapped = data.map((strategy: Database['public']['Tables']['strategies']['Row']) => {
              const analytics = strategy.analytics as any;
              return {
                id: strategy.id,
                title: strategy.title || 'Untitled Strategy',
                description: strategy.description || 'No description available',
                author: '',
                avatar: '',
                performance: {
                  returns: analytics?.total_return ? `+${analytics.total_return.toFixed(1)}%` : '+0.0%',
                  winRate: analytics?.win_rate ? `${(analytics.win_rate * 100).toFixed(1)}%` : '0.0%',
                  sharpe: analytics?.sharpe_ratio ? analytics.sharpe_ratio.toFixed(2) : '0.00',
                  maxDrawdown: analytics?.max_drawdown ? `${analytics.max_drawdown.toFixed(1)}%` : '0.0%'
                },
                tags: strategy.tags || [],
                price: strategy.price ? `$${strategy.price}` : 'Free',
                likes: strategy.likes || 0,
                copies: strategy.copies || 0,
                remixes: strategy.remixes || 0,
                thumbnail: strategy.thumbnail || undefined,
                isPublic: !!strategy.is_public,
                created_at: strategy.created_at || null,
              };
            });
            if (isMounted) setStrategies(mapped);
          } else {
            if (isMounted) setStrategies([]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch strategies');
        if (publicOnly) {
          setStrategies(DEMO_STRATEGIES);
        } else {
          setStrategies([]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [publicOnly, userId, sortBy]);

  return { strategies, loading, error };
} 