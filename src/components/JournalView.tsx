import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  emotion: string;
  sentiment_score: number;
  created_at: string;
}

const JournalView = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  const analyzeAndSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please add both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Analyze emotion
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-emotion",
        {
          body: {
            audio: content,
            type: "voice",
          },
        }
      );

      if (analysisError) throw analysisError;

      // Save entry
      const { error: saveError } = await supabase.from("journal_entries").insert({
        title,
        content,
        emotion: analysisData.emotion || "neutral",
        sentiment_score: analysisData.confidence / 100,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (saveError) throw saveError;

      toast({
        title: "✨ Entry Saved",
        description: `Emotion detected: ${analysisData.emotion}`,
      });

      setTitle("");
      setContent("");
      setIsWriting(false);
      loadEntries();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "text-yellow-400",
      sad: "text-blue-400",
      calm: "text-teal-400",
      anxious: "text-purple-400",
      angry: "text-red-400",
      neutral: "text-gray-400",
    };
    return colors[emotion.toLowerCase()] || colors.neutral;
  };

  return (
    <div className="min-h-screen bg-gradient-focus p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-calm bg-clip-text text-transparent">
            Your Journal
          </h1>
          <p className="text-xl text-muted-foreground">
            Express yourself and track your emotional patterns
          </p>
        </div>

        {/* New Entry Button */}
        {!isWriting && (
          <Button
            onClick={() => setIsWriting(true)}
            size="lg"
            className="w-full rounded-full shadow-glow hover:shadow-glow-lg bg-gradient-calm"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Journal Entry
          </Button>
        )}

        {/* Writing Area */}
        {isWriting && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
            <div className="space-y-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title..."
                className="text-2xl font-semibold border-none bg-transparent focus:ring-0 px-0"
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? Express yourself freely..."
                className="min-h-[300px] text-lg border-none bg-transparent focus:ring-0 resize-none px-0"
              />
              <div className="flex gap-4">
                <Button
                  onClick={analyzeAndSave}
                  disabled={isAnalyzing}
                  className="flex-1 rounded-full shadow-glow hover:shadow-glow-lg bg-gradient-calm"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Save & Analyze"}
                </Button>
                <Button
                  onClick={() => {
                    setIsWriting(false);
                    setTitle("");
                    setContent("");
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <Card
              key={entry.id}
              className="p-6 bg-card/30 hover:bg-card/50 transition-all border border-border/30 cursor-pointer hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-foreground">{entry.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium capitalize ${getEmotionColor(entry.emotion)}`}>
                      {entry.emotion}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
              </div>
            </Card>
          ))}
        </div>

        {entries.length === 0 && !isWriting && (
          <div className="text-center py-12 animate-fade-in">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-muted-foreground">Start your journaling journey today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;
