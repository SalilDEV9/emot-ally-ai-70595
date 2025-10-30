interface MentoraAvatarProps {
  emotion: string;
  isSpeaking: boolean;
}

const MentoraAvatar = ({ emotion, isSpeaking }: MentoraAvatarProps) => {
  const getEmotionGradient = () => {
    switch (emotion) {
      case "happy":
        return "bg-gradient-happy shadow-glow-happy";
      case "calm":
        return "bg-gradient-calm shadow-glow";
      case "sad":
        return "bg-gradient-sad shadow-glow-sad";
      case "anxious":
        return "bg-gradient-anxious shadow-glow-secondary";
      default:
        return "bg-gradient-calm shadow-glow";
    }
  };

  const getEmotionEmoji = () => {
    switch (emotion) {
      case "happy":
        return "😊";
      case "calm":
        return "😌";
      case "sad":
        return "😔";
      case "anxious":
        return "😰";
      default:
        return "💙";
    }
  };

  return (
    <div className="relative">
      {/* Animated outer ring */}
      <div className={`absolute inset-0 rounded-full ${getEmotionGradient()} opacity-30 blur-2xl ${
        isSpeaking ? "animate-pulse scale-110" : "animate-breathe"
      } transition-all duration-500`} />
      
      {/* Middle ring */}
      <div className={`absolute inset-4 rounded-full ${getEmotionGradient()} opacity-20 blur-xl animate-pulse`} />
      
      {/* Avatar circle with emoji */}
      <div className={`relative w-48 h-48 rounded-full ${getEmotionGradient()} flex items-center justify-center backdrop-blur-sm border-2 border-primary/30 transition-all duration-700 ${
        isSpeaking ? "scale-105" : "scale-100"
      }`}>
        <div className="text-7xl animate-float filter drop-shadow-2xl">
          {getEmotionEmoji()}
        </div>
        
        {/* Speaking indicator waves */}
        {isSpeaking && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MentoraAvatar;
