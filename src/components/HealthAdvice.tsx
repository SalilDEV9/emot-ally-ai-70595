import { Card } from './ui/card';
import { Pill, Activity, Apple, Moon, Droplets, Heart } from 'lucide-react';

interface HealthAdviceProps {
  currentEmotion: string;
}

interface HealthTip {
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  medicine?: string;
}

const HealthAdvice = ({ currentEmotion }: HealthAdviceProps) => {
  const getHealthAdvice = (): HealthTip[] => {
    const baseAdvice: HealthTip[] = [
      {
        icon: <Droplets className="w-4 h-4" />,
        category: 'Hydration',
        title: 'Stay Hydrated',
        description: 'Drink at least 8 glasses of water daily for optimal health.',
      },
      {
        icon: <Moon className="w-4 h-4" />,
        category: 'Sleep',
        title: 'Quality Sleep',
        description: 'Aim for 7-8 hours of quality sleep each night.',
      },
    ];

    const emotionAdvice: Record<string, HealthTip[]> = {
      happy: [
        {
          icon: <Activity className="w-4 h-4" />,
          category: 'Exercise',
          title: 'Maintain Your Energy',
          description: 'Continue regular physical activity to sustain positive mood.',
        },
        {
          icon: <Apple className="w-4 h-4" />,
          category: 'Nutrition',
          title: 'Balanced Diet',
          description: 'Eat colorful fruits and vegetables to maintain vitality.',
        },
      ],
      sad: [
        {
          icon: <Pill className="w-4 h-4" />,
          category: 'Wellness',
          title: 'Natural Mood Support',
          description: 'Consider Omega-3 supplements, Vitamin D, or St. John\'s Wort (consult doctor first).',
          medicine: 'Omega-3, Vitamin D3',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          category: 'Exercise',
          title: 'Gentle Movement',
          description: '20-minute walks can significantly improve mood through endorphin release.',
        },
        {
          icon: <Heart className="w-4 h-4" />,
          category: 'Self-Care',
          title: 'Social Connection',
          description: 'Reach out to a friend or loved one. Connection heals.',
        },
      ],
      anxious: [
        {
          icon: <Pill className="w-4 h-4" />,
          category: 'Wellness',
          title: 'Calming Supplements',
          description: 'Magnesium, L-Theanine, or Ashwagandha may help (consult doctor first).',
          medicine: 'Magnesium, L-Theanine',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          category: 'Breathing',
          title: 'Deep Breathing',
          description: 'Practice 4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s.',
        },
        {
          icon: <Apple className="w-4 h-4" />,
          category: 'Diet',
          title: 'Reduce Stimulants',
          description: 'Limit caffeine and sugar intake to reduce anxiety symptoms.',
        },
      ],
      angry: [
        {
          icon: <Pill className="w-4 h-4" />,
          category: 'Wellness',
          title: 'Stress Relief',
          description: 'B-vitamins and Chamomile tea can help calm the nervous system.',
          medicine: 'Vitamin B Complex',
        },
        {
          icon: <Activity className="w-4 h-4" />,
          category: 'Physical',
          title: 'Release Energy',
          description: 'High-intensity exercise or a brisk walk can channel anger constructively.',
        },
        {
          icon: <Heart className="w-4 h-4" />,
          category: 'Mindfulness',
          title: 'Count to 10',
          description: 'Before reacting, take 10 deep breaths to regain composure.',
        },
      ],
      calm: [
        {
          icon: <Activity className="w-4 h-4" />,
          category: 'Maintenance',
          title: 'Keep It Up',
          description: 'Continue your current wellness practices - they\'re working!',
        },
        {
          icon: <Apple className="w-4 h-4" />,
          category: 'Nutrition',
          title: 'Brain Foods',
          description: 'Incorporate nuts, berries, and leafy greens for cognitive health.',
        },
      ],
    };

    const specificAdvice = emotionAdvice[currentEmotion.toLowerCase()] || emotionAdvice.calm;
    return [...specificAdvice, ...baseAdvice];
  };

  const advice = getHealthAdvice();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Wellness: 'text-purple-400 bg-purple-400/20',
      Exercise: 'text-green-400 bg-green-400/20',
      Breathing: 'text-cyan-400 bg-cyan-400/20',
      Nutrition: 'text-orange-400 bg-orange-400/20',
      Diet: 'text-orange-400 bg-orange-400/20',
      Sleep: 'text-indigo-400 bg-indigo-400/20',
      Hydration: 'text-blue-400 bg-blue-400/20',
      'Self-Care': 'text-pink-400 bg-pink-400/20',
      Physical: 'text-red-400 bg-red-400/20',
      Mindfulness: 'text-teal-400 bg-teal-400/20',
      Maintenance: 'text-emerald-400 bg-emerald-400/20',
    };
    return colors[category] || 'text-gray-400 bg-gray-400/20';
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Pill className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Health & Wellness Advice</h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {advice.map((tip, index) => (
          <div 
            key={index}
            className="p-3 rounded-xl bg-background/30 border border-border/30 hover:bg-background/50 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                {tip.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">{tip.category}</span>
                </div>
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                {tip.medicine && (
                  <div className="mt-2 flex items-center gap-1">
                    <Pill className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">{tip.medicine}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <p className="text-xs text-yellow-400">
          ⚠️ <strong>Disclaimer:</strong> This is AI-generated wellness advice. Always consult a qualified healthcare professional before taking any supplements or medications.
        </p>
      </div>
    </Card>
  );
};

export default HealthAdvice;
