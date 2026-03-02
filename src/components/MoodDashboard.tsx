import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Smile, Frown, Heart, Wind, Flame, Meh, Trash2, TrendingUp, Calendar, Activity } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";

interface MoodEntry {
  id: string;
  emotion: string;
  confidence: number;
  note: string;
  created_at: string;
}

const EMOTION_CONFIG: Record<string, { icon: typeof Smile; color: string; value: number; gradient: string }> = {
  happy: { icon: Smile, color: "#FBBF24", value: 5, gradient: "from-yellow-500/20 to-amber-500/20" },
  calm: { icon: Wind, color: "#2DD4BF", value: 4, gradient: "from-teal-500/20 to-cyan-500/20" },
  neutral: { icon: Meh, color: "#94A3B8", value: 3, gradient: "from-slate-400/20 to-gray-400/20" },
  anxious: { icon: Flame, color: "#A78BFA", value: 2, gradient: "from-violet-500/20 to-purple-500/20" },
  sad: { icon: Frown, color: "#60A5FA", value: 1, gradient: "from-blue-500/20 to-indigo-500/20" },
  angry: { icon: Flame, color: "#F87171", value: 0, gradient: "from-red-500/20 to-rose-500/20" },
};

const MoodDashboard = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadMoodEntries();

    const channel = supabase
      .channel('mood_entries_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${user.id}`,
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
  }, [user?.id]);

  const loadMoodEntries = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setMoodEntries(data || []);
    } catch (error) {
      console.error("Error loading mood entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMoodEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mood_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Entry deleted", description: "Mood entry removed" });
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  // Build chart data grouped by day
  const chartData = (() => {
    const days: { date: string; label: string; avgScore: number | null; count: number; dominant: string }[] = [];
    const cutoff = startOfDay(subDays(new Date(), timeRange));

    for (let i = timeRange - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStr = format(day, "yyyy-MM-dd");
      const label = format(day, "MMM d");

      const dayEntries = moodEntries.filter(
        (e) => format(new Date(e.created_at), "yyyy-MM-dd") === dayStr
      );

      if (dayEntries.length === 0) {
        days.push({ date: dayStr, label, avgScore: null, count: 0, dominant: "" });
      } else {
        const scores = dayEntries.map((e) => EMOTION_CONFIG[e.emotion.toLowerCase()]?.value ?? 3);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Find dominant emotion
        const freq: Record<string, number> = {};
        dayEntries.forEach((e) => {
          const em = e.emotion.toLowerCase();
          freq[em] = (freq[em] || 0) + 1;
        });
        const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

        days.push({ date: dayStr, label, avgScore: Math.round(avg * 10) / 10, count: dayEntries.length, dominant });
      }
    }
    return days;
  })();

  const emotionStats = moodEntries.reduce((acc, entry) => {
    const emotion = entry.emotion.toLowerCase();
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = moodEntries.length;

  // Determine overall mood trend
  const recentEntries = moodEntries.slice(0, 5);
  const olderEntries = moodEntries.slice(5, 10);
  const recentAvg = recentEntries.length > 0
    ? recentEntries.reduce((s, e) => s + (EMOTION_CONFIG[e.emotion.toLowerCase()]?.value ?? 3), 0) / recentEntries.length
    : 0;
  const olderAvg = olderEntries.length > 0
    ? olderEntries.reduce((s, e) => s + (EMOTION_CONFIG[e.emotion.toLowerCase()]?.value ?? 3), 0) / olderEntries.length
    : 0;
  const trend = recentEntries.length < 2 ? "neutral" : recentAvg > olderAvg ? "improving" : recentAvg < olderAvg ? "declining" : "stable";

  const scoreToEmoji = (score: number) => {
    if (score >= 4.5) return "😊";
    if (score >= 3.5) return "😌";
    if (score >= 2.5) return "😐";
    if (score >= 1.5) return "😟";
    return "😢";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {scoreToEmoji(data.avgScore)} Score: {data.avgScore}/5
          </p>
          <p className="text-xs text-muted-foreground">
            Dominant: <span className="capitalize font-medium" style={{ color: EMOTION_CONFIG[data.dominant]?.color }}>{data.dominant}</span>
          </p>
          <p className="text-xs text-muted-foreground">{data.count} entries</p>
        </div>
      );
    }
    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-focus p-8 flex items-center justify-center">
        <Card className="p-12 bg-card/50 backdrop-blur-sm border-border/50 text-center max-w-md">
          <Heart className="w-16 h-16 mx-auto mb-4 text-primary opacity-60" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In to Track Your Journey</h2>
          <p className="text-muted-foreground">Log in to see your emotional patterns and mood history.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-focus p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-calm bg-clip-text text-transparent">
            Your Emotional Journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your mood patterns and emotional well-being over time
          </p>
        </div>

        {/* Trend Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-foreground">{totalEntries}</p>
            </div>
          </Card>
          <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-secondary/10">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mood Trend</p>
              <p className="text-2xl font-bold text-foreground capitalize">{trend} {trend === "improving" ? "📈" : trend === "declining" ? "📉" : "➡️"}</p>
            </div>
          </Card>
          <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-accent/30">
              <Calendar className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Frequent</p>
              <p className="text-2xl font-bold text-foreground capitalize">
                {totalEntries > 0
                  ? Object.entries(emotionStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
                  : "—"}
              </p>
            </div>
          </Card>
        </div>

        {/* Emotion Trend Chart */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Mood Over Time
            </h2>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map((d) => (
                <Button
                  key={d}
                  variant={timeRange === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(d)}
                  className="rounded-full text-xs px-3"
                >
                  {d}d
                </Button>
              ))}
            </div>
          </div>

          {totalEntries === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>Chat with Mentora to start tracking your emotions here</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tickFormatter={(v) => ["😡", "😢", "😟", "😐", "😌", "😊"][v] || ""}
                    tick={{ fontSize: 14 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#moodGradient)"
                    connectNulls={false}
                    dot={(props: any) => {
                      if (props.payload.avgScore === null) return <></>;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Emotion Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(EMOTION_CONFIG).map(([emotion, config]) => {
            const count = emotionStats[emotion] || 0;
            const percentage = totalEntries > 0 ? ((count / totalEntries) * 100).toFixed(0) : "0";
            const Icon = config.icon;

            return (
              <Card
                key={emotion}
                className={`p-4 bg-gradient-to-br ${config.gradient} backdrop-blur-sm border-border/50 hover:shadow-lg transition-all hover:scale-105 cursor-default animate-fade-in`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" style={{ color: config.color }} />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{emotion}</div>
                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                  </div>
                  {/* Mini bar */}
                  <div className="w-full h-1.5 rounded-full bg-background/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Entries */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-foreground">Recent Mood Entries</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading your mood history...</div>
            </div>
          ) : moodEntries.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No mood entries yet. Chat with Mentora to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {moodEntries.slice(0, 20).map((entry, index) => {
                const config = EMOTION_CONFIG[entry.emotion.toLowerCase()] || EMOTION_CONFIG.neutral;
                const Icon = config.icon;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/30 hover:bg-card/50 transition-all border border-border/30 group"
                  >
                    <div className="p-2 rounded-full" style={{ backgroundColor: config.color + "22" }}>
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize text-foreground text-sm">{entry.emotion}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.note}</p>
                      )}
                    </div>
                    {entry.confidence && (
                      <div className="text-right shrink-0">
                        <div className="text-xs font-medium text-primary">{entry.confidence}%</div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMoodEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive h-8 w-8 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MoodDashboard;
