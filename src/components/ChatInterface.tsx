import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Video, MicOff, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MentoraAvatar from "./MentoraAvatar";
import EmotionBubble from "./EmotionBubble";
import MessageList from "./MessageList";
import { AudioRecorder } from "@/utils/audioRecorder";

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
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        const base64Audio = await audioRecorderRef.current?.stop();
        setIsRecording(false);
        
        if (base64Audio) {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) throw error;
          
          if (data?.text) {
            setInput(data.text);
            toast({
              title: "Transcription Complete",
              description: "Your voice has been converted to text",
            });
          }
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
        toast({
          title: "Transcription Error",
          description: "Failed to convert voice to text",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        audioRecorderRef.current = new AudioRecorder();
        await audioRecorderRef.current.start();
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Speak now - click again to transcribe",
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Recording Error",
          description: "Could not access microphone",
          variant: "destructive",
        });
      }
    }
  };

  const handleCameraToggle = async () => {
    if (isCameraOn) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      setIsCameraOn(false);
      toast({
        title: "Camera Disabled",
        description: "Camera access disabled",
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
        videoStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Explicitly start video playback
          await videoRef.current.play();
        }
        setIsCameraOn(true);
        toast({
          title: "Camera Enabled",
          description: "Mentora can now see your facial expressions",
        });
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Error",
          description: "Could not access camera",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
      {/* Left side - Avatar & Camera */}
      <div className="w-1/3 bg-card/30 backdrop-blur-sm border-r border-border/50 flex flex-col items-center justify-center p-8 relative">
        {isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden border-2 border-secondary/30 shadow-glow">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}
        
        {!isCameraOn && (
          <>
            <MentoraAvatar emotion={currentEmotion} isSpeaking={isLoading} />
            <EmotionBubble emotion={currentEmotion} />
          </>
        )}
        
        {/* Mode buttons */}
        <div className="mt-8 flex gap-4 relative z-10">
          <Button
            variant="outline"
            size="lg"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={`rounded-full w-16 h-16 border-secondary/50 hover:shadow-glow-secondary transition-all ${
              isRecording ? "bg-secondary/20 shadow-glow-secondary animate-pulse" : ""
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6 text-secondary" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCameraToggle}
            className={`rounded-full w-16 h-16 border-secondary/50 hover:shadow-glow-secondary transition-all ${
              isCameraOn ? "bg-secondary/20 shadow-glow-secondary animate-pulse" : ""
            }`}
          >
            {isCameraOn ? <VideoOff className="w-6 h-6 text-secondary" /> : <Video className="w-6 h-6" />}
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
