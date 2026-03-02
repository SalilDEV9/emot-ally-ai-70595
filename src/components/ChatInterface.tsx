import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Video, MicOff, VideoOff, Scan, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MentoraAvatar from "./MentoraAvatar";
import EmotionBubble from "./EmotionBubble";
import MessageList from "./MessageList";
import HealthReportButton from "./HealthReportButton";
import RealTimeHealthWidget from "./RealTimeHealthWidget";
import MusicTherapy from "./MusicTherapy";
import HealthAdvice from "./HealthAdvice";
import UserMenu from "./UserMenu";
import { SpeechRecognizer, getRecognitionLang } from "@/utils/speechRecognition";
import { useBrowserTTS } from "@/hooks/useBrowserTTS";
import { useAuth } from "@/hooks/useAuth";

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
      content: "Hello, I'm Dr. Mentora, your AI health companion created by Salil. I'm here to support your mental and physical well-being. How can I help you today?",
      emotion: "calm",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState("calm");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [language, setLanguage] = useState<"english" | "hindi" | "maithili">("english");
  const { toast } = useToast();
  const speechRecognizerRef = useRef<SpeechRecognizer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use browser-native TTS (free, no API key needed)
  const { speak, isSpeaking, volume, setVolume, isMuted, toggleMute } = useBrowserTTS();
  const { user } = useAuth();

  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        console.log('Stopping speech recognition...');
        speechRecognizerRef.current?.stop();
        setIsRecording(false);
        // The promise from start() will resolve with the transcript
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    } else {
      try {
        console.log('Starting speech recognition...');
        speechRecognizerRef.current = new SpeechRecognizer();
        setIsRecording(true);
        toast({
          title: "Listening...",
          description: "Speak now — click mic again to stop",
        });

        const lang = getRecognitionLang(language);
        const transcript = await speechRecognizerRef.current.start(lang);
        setIsRecording(false);

        if (transcript) {
          setInput(transcript);
          toast({
            title: "Got it!",
            description: "Your speech has been captured",
          });
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking more clearly",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsRecording(false);
        toast({
          title: "Speech Recognition Error",
          description: error instanceof Error ? error.message : "Failed to recognize speech",
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
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      toast({
        title: "Camera Disabled",
        description: "Camera access disabled",
      });
    } else {
      try {
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
        console.log('Camera stream obtained:', stream);
        
        videoStreamRef.current = stream;
        setIsCameraOn(true);
        
        toast({
          title: "Camera Enabled",
          description: "Mentora can now see your facial expressions",
        });
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Error",
          description: "Could not access camera - please allow camera permissions",
          variant: "destructive",
        });
      }
    }
  };

  // Set up video stream when camera is enabled
  useEffect(() => {
    if (isCameraOn && videoRef.current && videoStreamRef.current) {
      console.log('Setting video srcObject...');
      videoRef.current.srcObject = videoStreamRef.current;
      videoRef.current.play().then(() => {
        console.log('Video playing successfully');
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [isCameraOn]);

  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const analyzeFacialEmotion = async () => {
    if (!videoRef.current || !isCameraOn) {
      toast({
        title: "Camera Not Active",
        description: "Please enable your camera first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Capture frame from video
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video not ready - no video dimensions');
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      console.log('Image captured, size:', imageData.length);

      toast({
        title: "Analyzing Your Expression",
        description: "Mentora is reading your emotions...",
      });

      // Send to analysis endpoint
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          image: imageData,
          type: 'facial'
        }
      });

      if (error) throw error;

      // Add analysis result to chat
      const analysisMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Emotion Detected: ${data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1)}** (${data.confidence}% confidence)\n\n${data.observation}\n\n💡 ${data.suggestion}`,
        emotion: data.emotion,
      };

      setMessages((prev) => [...prev, analysisMessage]);
      setCurrentEmotion(data.emotion);

      toast({
        title: "Analysis Complete",
        description: `Detected: ${data.emotion}`,
      });
    } catch (error) {
      console.error('Error analyzing facial emotion:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze facial expression",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim(); // Save input before clearing
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Detect emotion from user's message FIRST
      console.log('Detecting emotion from user message:', userText);
      const userEmotion = await detectEmotionFromUserInput(userText);
      console.log('Detected emotion:', userEmotion);
      setCurrentEmotion(userEmotion);

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
            language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion: userEmotion,  // Use the detected emotion directly
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the response
      await speakText(data.message);
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

  const saveMoodEntry = async (emotion: string, confidence: number, note: string) => {
    try {
      // Only save mood entries for authenticated users
      if (!user?.id) {
        console.log('User not authenticated, skipping mood entry save - please log in to track mood history');
        return false;
      }
      
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          emotion,
          confidence,
          note: note.substring(0, 500), // Limit note length for storage
          user_id: user.id,
        });

      if (error) {
        console.error('Error saving mood entry:', error);
        return false;
      } else {
        console.log('Mood entry saved successfully for user:', user.id, 'emotion:', emotion);
        return true;
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return false;
    }
  };

  const detectEmotionFromUserInput = async (text: string): Promise<string> => {
    try {
      console.log('Calling analyze-emotion edge function with text:', text);
      
      // Use AI to detect emotion from user's message
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          audio: text,  // Using 'audio' field for text analysis
          type: 'voice'
        }
      });
      
      console.log('Analyze-emotion response:', { data, error });
      
      if (error) {
        console.error('Emotion detection error:', error);
        toast({
          title: "Emotion Detection Issue",
          description: "Using default emotion detection",
          variant: "destructive",
        });
        return 'calm';
      }
      
      if (!data || !data.emotion) {
        console.error('No emotion data received:', data);
        return 'calm';
      }
      
      console.log('Successfully detected emotion:', data.emotion);
      
      // Normalize emotion to lowercase for consistent matching
      const normalizedEmotion = data.emotion.toLowerCase();
      
      // Save mood entry to database
      await saveMoodEntry(normalizedEmotion, data.confidence || 75, text);
      
      return normalizedEmotion;
    } catch (error) {
      console.error('Error detecting emotion:', error);
      return 'calm';
    }
  };

  // Use browser TTS to speak text (no API key needed)
  const speakText = (text: string) => {
    speak(text, language);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Controls - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
        {/* User Menu */}
        <UserMenu />
        
        {/* Health Report Button */}
        <HealthReportButton />
        
        {/* Volume Controls */}
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-2 border border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 hover:bg-background/50"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-20"
            disabled={isMuted}
          />
        </div>
        
        {/* Language Selector */}
        <button
          onClick={() => setLanguage("english")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            language === "english"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-card/50 text-muted-foreground hover:bg-card backdrop-blur-sm"
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage("hindi")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            language === "hindi"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-card/50 text-muted-foreground hover:bg-card backdrop-blur-sm"
          }`}
        >
          हिन्दी
        </button>
        <button
          onClick={() => setLanguage("maithili")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            language === "maithili"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-card/50 text-muted-foreground hover:bg-card backdrop-blur-sm"
          }`}
        >
          मैथिली
        </button>
      </div>
      
      {/* Left side - Avatar & Camera */}
      <div className="w-1/3 bg-card/30 backdrop-blur-sm border-r border-border/50 flex flex-col items-center justify-center p-8 relative">
        {isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden border-2 border-secondary/30 shadow-glow bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-lg" />
              </div>
            </div>
          </div>
        )}
        
        {!isCameraOn && (
          <>
            <MentoraAvatar emotion={currentEmotion} isSpeaking={isLoading || isSpeaking} />
            <EmotionBubble emotion={currentEmotion} />
            {isSpeaking && (
              <div className="absolute bottom-32 flex items-center gap-2 text-secondary animate-pulse">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-medium">Speaking...</span>
              </div>
            )}
          </>
        )}
        
        {/* Real-Time Health Widget */}
        <div className="absolute bottom-4 left-4 w-64 z-10">
          <RealTimeHealthWidget />
        </div>
        
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
            title="Voice Input"
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
            title="Camera"
          >
            {isCameraOn ? <VideoOff className="w-6 h-6 text-secondary" /> : <Video className="w-6 h-6" />}
          </Button>
          {isCameraOn && (
            <Button
              variant="outline"
              size="lg"
              onClick={analyzeFacialEmotion}
              disabled={isAnalyzing || isLoading}
              className="rounded-full w-16 h-16 border-primary/50 hover:shadow-glow bg-primary/10 animate-fade-in"
              title="Analyze Face"
            >
              <Scan className={`w-6 h-6 text-primary ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Center - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList messages={messages} />
        </div>

        {/* Input - Added bottom padding to prevent navigation overlap */}
        <div className="p-6 pb-32 bg-card/50 backdrop-blur-sm border-t border-border/50">
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
      
      {/* Right side - Music & Health Panels */}
      <div className="w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 flex flex-col gap-4 p-4 overflow-y-auto">
        <MusicTherapy currentEmotion={currentEmotion} />
        <HealthAdvice currentEmotion={currentEmotion} />
      </div>
    </div>
  );
};

export default ChatInterface;
