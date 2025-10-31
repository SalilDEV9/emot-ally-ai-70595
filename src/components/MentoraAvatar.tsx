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
        return "🌟😊✨";
      case "calm":
        return "🌊😌💚";
      case "sad":
        return "🌧️😢💙";
      case "anxious":
        return "🌪️😰💜";
      case "angry":
        return "🔥😠❤️";
      default:
        return "💙😌💫";
    }
  };

  return (
    <div className="relative">
      {/* Animated outer glow ring */}
      <div className={`absolute inset-0 rounded-full ${getEmotionGradient()} opacity-40 blur-3xl ${
        isSpeaking ? "animate-pulse-glow scale-110" : "animate-breathe"
      } transition-all duration-700`} />
      
      {/* Middle pulsing ring */}
      <div className={`absolute inset-4 rounded-full ${getEmotionGradient()} opacity-25 blur-xl animate-pulse`} />
      
      {/* Main avatar circle with enhanced shimmer effect */}
      <div className={`relative w-48 h-48 rounded-full ${getEmotionGradient()} flex items-center justify-center backdrop-blur-sm border-2 border-primary/30 overflow-hidden transition-all duration-700 ${
        isSpeaking ? "scale-105" : "scale-100 animate-float"
      }`}>
        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Emoji display with enhanced drop shadow */}
        <div className="text-7xl animate-breathe filter drop-shadow-2xl relative z-10">
          {getEmotionEmoji()}
        </div>
        
        {/* Speaking indicator waves - enhanced */}
        {isSpeaking && (
          <>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-glow" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-glow" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-glow" style={{ animationDelay: "300ms" }} />
            </div>
            {/* Additional pulse rings when speaking */}
            <div className="absolute inset-[-10px] rounded-full border-2 border-secondary/30 animate-ping" />
          </>
        )}
      </div>
    </div>
  );
};

export default MentoraAvatar;
