interface MentoraAvatarProps {
  emotion: string;
  isSpeaking: boolean;
}

const MentoraAvatar = ({ emotion, isSpeaking }: MentoraAvatarProps) => {
  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "hsl(var(--gradient-happy-start))";
      case "calm":
        return "hsl(var(--glow-primary))";
      case "sad":
        return "hsl(234 30% 40%)";
      case "anxious":
        return "hsl(270 25% 50%)";
      default:
        return "hsl(var(--glow-primary))";
    }
  };

  return (
    <div className="relative">
      {/* Breathing aura */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
          isSpeaking ? "animate-pulse-glow" : "animate-breathe"
        }`}
        style={{ backgroundColor: `${getEmotionColor()}40` }}
      />
      
      {/* Avatar circle */}
      <div className="relative w-48 h-48 rounded-full bg-gradient-calm flex items-center justify-center shadow-glow">
        <svg 
          viewBox="0 0 100 100" 
          className="w-32 h-32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Face outline */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none"
            stroke={getEmotionColor()}
            strokeWidth="2"
            className="transition-all duration-500"
          />
          
          {/* Eyes - change based on emotion */}
          {emotion === "happy" ? (
            <>
              <path d="M35 40 Q40 35 45 40" stroke={getEmotionColor()} strokeWidth="2" fill="none" />
              <path d="M55 40 Q60 35 65 40" stroke={getEmotionColor()} strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              <circle cx="38" cy="40" r="3" fill={getEmotionColor()} />
              <circle cx="62" cy="40" r="3" fill={getEmotionColor()} />
            </>
          )}
          
          {/* Mouth - changes based on emotion */}
          {emotion === "happy" && (
            <path d="M35 60 Q50 70 65 60" stroke={getEmotionColor()} strokeWidth="2" fill="none" />
          )}
          {emotion === "calm" && (
            <line x1="38" y1="60" x2="62" y2="60" stroke={getEmotionColor()} strokeWidth="2" />
          )}
          {emotion === "sad" && (
            <path d="M35 65 Q50 55 65 65" stroke={getEmotionColor()} strokeWidth="2" fill="none" />
          )}
          
          {/* Speaking indicator */}
          {isSpeaking && (
            <g className="animate-pulse">
              <circle cx="20" cy="50" r="2" fill={getEmotionColor()} />
              <circle cx="15" cy="50" r="1.5" fill={getEmotionColor()} opacity="0.7" />
              <circle cx="10" cy="50" r="1" fill={getEmotionColor()} opacity="0.4" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default MentoraAvatar;
