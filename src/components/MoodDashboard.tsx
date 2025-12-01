import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Smile, Frown, Heart, Wind, Flame, Meh } from "lucide-react";

interface MoodEntry {
  id: string;
  emotion: string;
  confidence: number;
  note: string;
  created_at: string;
}

const MoodDashboard = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodEntries();
    
    // Set up realtime subscription for mood entries
    const placeholderUserId = '00000000-0000-0000-0000-000000000000';
    const channel = supabase
      .channel('mood_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${placeholderUserId}`,
        },
        () => {
          console.log('Mood entry changed, reloading...');
          loadMoodEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMoodEntries = async () => {
    try {
      // Use the same placeholder user_id as in ChatInterface
      const placeholderUserId = '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", placeholderUserId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setMoodEntries(data || []);
    } catch (error) {
      console.error("Error loading mood entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return <Smile className="w-6 h-6 text-yellow-400" />;
      case "sad":
        return <Frown className="w-6 h-6 text-blue-400" />;
      case "calm":
        return <Wind className="w-6 h-6 text-teal-400" />;
      case "anxious":
        return <Flame className="w-6 h-6 text-purple-400" />;
      case "angry":
        return <Flame className="w-6 h-6 text-red-400" />;
      default:
        return <Meh className="w-6 h-6 text-gray-400" />;
    }
  };

  const getEmotionGradient = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return "bg-gradient-happy";
      case "sad":
        return "bg-gradient-sad";
      case "calm":
        return "bg-gradient-calm";
      case "anxious":
        return "bg-gradient-anxious";
      default:
        return "bg-gradient-calm";
    }
  };

  const emotionStats = moodEntries.reduce((acc, entry) => {
    const emotion = entry.emotion.toLowerCase();
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = moodEntries.length;

  return (
    <div className="min-h-screen bg-gradient-focus p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-calm bg-clip-text text-transparent">
            Your Emotional Journey
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your mood patterns and emotional well-being over time
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["happy", "sad", "calm", "anxious", "angry", "neutral"].map((emotion) => {
            const count = emotionStats[emotion] || 0;
            const percentage = totalEntries > 0 ? ((count / totalEntries) * 100).toFixed(0) : 0;
            
            return (
              <Card
                key={emotion}
                className={`p-6 ${getEmotionGradient(emotion)} backdrop-blur-sm border-border/50 hover:shadow-glow transition-all hover:scale-105 cursor-pointer animate-fade-in`}
              >
                <div className="flex flex-col items-center gap-3">
                  {getEmotionIcon(emotion)}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{count}</div>
                    <div className="text-sm text-white/80 capitalize">{emotion}</div>
                    <div className="text-xs text-white/60">{percentage}%</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Entries */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-secondary">Recent Mood Entries</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading your mood history...</div>
            </div>
          ) : moodEntries.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No mood entries yet. Start your journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card/30 hover:bg-card/50 transition-all border border-border/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`p-3 rounded-full ${getEmotionGradient(entry.emotion)}`}>
                    {getEmotionIcon(entry.emotion)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold capitalize text-foreground">{entry.emotion}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                  </div>
                  {entry.confidence && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">{entry.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MoodDashboard;
