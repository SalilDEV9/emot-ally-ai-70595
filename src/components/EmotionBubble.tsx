interface EmotionBubbleProps {
  emotion: string;
}

const EmotionBubble = ({ emotion }: EmotionBubbleProps) => {
  const getEmotionData = () => {
    switch (emotion) {
      case "happy":
        return { emoji: "✨😊✨", text: "Joyful Energy", bg: "bg-gradient-happy" };
      case "calm":
        return { emoji: "🧘‍♀️😌💙", text: "Peaceful Presence", bg: "bg-gradient-calm" };
      case "sad":
        return { emoji: "🤗😔💜", text: "Gentle Support", bg: "bg-gradient-sad" };
      case "anxious":
        return { emoji: "🌸😰🌊", text: "Soothing Comfort", bg: "bg-gradient-anxious" };
      default:
        return { emoji: "💙😊✨", text: "Empathetic Care", bg: "bg-gradient-calm" };
    }
  };

  const emotionData = getEmotionData();

  return (
    <div className="mt-8 animate-float">
      <div className={`${emotionData.bg} backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-primary/40 shadow-glow-lg relative overflow-hidden`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
             style={{ backgroundSize: "200% 100%" }} />
        
        <div className="relative flex items-center gap-4">
          <span className="text-4xl animate-pulse">{emotionData.emoji}</span>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground tracking-wide">{emotionData.text}</span>
            <span className="text-xs text-foreground/70">Detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionBubble;
