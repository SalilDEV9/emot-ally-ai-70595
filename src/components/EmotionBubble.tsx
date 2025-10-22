interface EmotionBubbleProps {
  emotion: string;
}

const EmotionBubble = ({ emotion }: EmotionBubbleProps) => {
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

  const getEmotionText = () => {
    switch (emotion) {
      case "happy":
        return "Joyful Energy";
      case "calm":
        return "Peaceful Presence";
      case "sad":
        return "Gentle Support";
      case "anxious":
        return "Soothing Comfort";
      default:
        return "Empathetic Care";
    }
  };

  return (
    <div className="mt-6 animate-float">
      <div className="bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-secondary/30 shadow-glow-secondary">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getEmotionEmoji()}</span>
          <span className="text-sm font-medium text-secondary">{getEmotionText()}</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionBubble;
