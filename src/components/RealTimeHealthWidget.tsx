import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Activity, Heart, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetrics {
  currentEmotion: string;
  emotionalStability: number;
  sessionCount: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdate: Date;
}

const RealTimeHealthWidget = () => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    currentEmotion: 'calm',
    emotionalStability: 75,
    sessionCount: 0,
    trend: 'stable',
    lastUpdate: new Date(),
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    // Set up real-time subscription
    const placeholderUserId = '00000000-0000-0000-0000-000000000000';
    const channel = supabase
      .channel('realtime_health')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${placeholderUserId}`,
        },
        (payload) => {
          console.log('Real-time health update:', payload);
          loadMetrics();
          setIsLive(true);
          // Flash effect
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe();

    // Periodic refresh
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      const placeholderUserId = '00000000-0000-0000-0000-000000000000';
      
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', placeholderUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (entries && entries.length > 0) {
        // Current emotion (most recent)
        const currentEmotion = entries[0].emotion;
        
        // Calculate emotional stability (inverse of emotion variance)
        const positiveEmotions = ['happy', 'calm'];
        const recentPositive = entries.slice(0, 10).filter(e => 
          positiveEmotions.includes(e.emotion.toLowerCase())
        ).length;
        const emotionalStability = Math.min(100, (recentPositive / Math.min(entries.length, 10)) * 100 + 30);

        // Calculate trend
        const recentEntries = entries.slice(0, 5);
        const olderEntries = entries.slice(5, 10);
        
        const getEmotionScore = (emotion: string) => {
          const scores: Record<string, number> = {
            happy: 100,
            calm: 80,
            neutral: 60,
            anxious: 40,
            sad: 30,
            angry: 20,
          };
          return scores[emotion.toLowerCase()] || 50;
        };

        const recentAvg = recentEntries.reduce((sum, e) => sum + getEmotionScore(e.emotion), 0) / Math.max(recentEntries.length, 1);
        const olderAvg = olderEntries.reduce((sum, e) => sum + getEmotionScore(e.emotion), 0) / Math.max(olderEntries.length, 1);
        
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (olderEntries.length > 0) {
          if (recentAvg > olderAvg + 10) trend = 'improving';
          else if (recentAvg < olderAvg - 10) trend = 'declining';
        }

        setMetrics({
          currentEmotion,
          emotionalStability,
          sessionCount: entries.length,
          trend,
          lastUpdate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'text-yellow-400',
      sad: 'text-blue-400',
      calm: 'text-teal-400',
      anxious: 'text-purple-400',
      angry: 'text-red-400',
      neutral: 'text-gray-400',
    };
    return colors[emotion.toLowerCase()] || 'text-gray-400';
  };

  return (
    <Card className={`p-4 bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ${isLive ? 'ring-2 ring-primary/50 shadow-glow' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isLive ? 'text-green-400 animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">Real-Time Health</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isLive ? 'LIVE' : `Updated ${Math.floor((Date.now() - metrics.lastUpdate.getTime()) / 1000)}s ago`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Current Emotion */}
        <div className="p-3 rounded-lg bg-background/30">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">Current Mood</span>
          </div>
          <p className={`text-lg font-semibold capitalize ${getEmotionColor(metrics.currentEmotion)}`}>
            {metrics.currentEmotion}
          </p>
        </div>

        {/* Emotional Stability */}
        <div className="p-3 rounded-lg bg-background/30">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-3 h-3 text-secondary" />
            <span className="text-xs text-muted-foreground">Stability</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-secondary">
              {metrics.emotionalStability.toFixed(0)}%
            </p>
            {getTrendIcon()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
            style={{ width: `${metrics.emotionalStability}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{metrics.sessionCount} sessions</span>
          <span className="text-xs text-muted-foreground capitalize">
            Trend: {metrics.trend}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RealTimeHealthWidget;
