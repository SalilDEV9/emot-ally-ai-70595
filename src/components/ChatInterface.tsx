import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MentoraAvatar from "./MentoraAvatar";
import EmotionBubble from "./EmotionBubble";
import MessageList from "./MessageList";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello, I'm Mentora. I'm here to listen and support you. How are you feeling today?",
      emotion: "calm",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState("calm");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const { toast } = useToast();

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Voice Disabled" : "Voice Enabled",
      description: isRecording ? "Microphone access disabled" : "Microphone access enabled - speak to Mentora",
    });
  };

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn);
    toast({
      title: isCameraOn ? "Camera Disabled" : "Camera Enabled",
      description: isCameraOn ? "Camera access disabled" : "Camera will analyze your facial expressions",
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the AI edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const emotion = detectEmotion(data.message);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentEmotion(emotion);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectEmotion = (text: string): string => {
    // Simple emotion detection based on keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes("great") || lowerText.includes("wonderful") || lowerText.includes("happy")) {
      return "happy";
    } else if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("relax")) {
      return "calm";
    } else if (lowerText.includes("sad") || lowerText.includes("down") || lowerText.includes("low")) {
      return "sad";
    } else if (lowerText.includes("anxious") || lowerText.includes("worried") || lowerText.includes("stress")) {
      return "anxious";
    }
    return "calm";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Avatar */}
      <div className="w-1/3 bg-card/30 backdrop-blur-sm border-r border-border/50 flex flex-col items-center justify-center p-8">
        <MentoraAvatar emotion={currentEmotion} isSpeaking={isLoading} />
        <EmotionBubble emotion={currentEmotion} />
        
        {/* Mode buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleVoiceToggle}
            className={`rounded-full w-16 h-16 border-secondary/50 hover:shadow-glow-secondary transition-all ${
              isRecording ? "bg-secondary/20 shadow-glow-secondary animate-pulse" : ""
            }`}
          >
            <Mic className={`w-6 h-6 ${isRecording ? "text-secondary" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCameraToggle}
            className={`rounded-full w-16 h-16 border-secondary/50 hover:shadow-glow-secondary transition-all ${
              isCameraOn ? "bg-secondary/20 shadow-glow-secondary animate-pulse" : ""
            }`}
          >
            <Video className={`w-6 h-6 ${isCameraOn ? "text-secondary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Right side - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList messages={messages} />
        </div>

        {/* Input */}
        <div className="p-6 bg-card/50 backdrop-blur-sm border-t border-border/50">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Share what's on your mind..."
              className="flex-1 bg-input border-border/50 rounded-full px-6 py-6 text-lg focus:shadow-glow"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="rounded-full w-16 h-16 bg-gradient-calm hover:shadow-glow"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
