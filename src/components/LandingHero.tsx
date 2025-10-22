import { Button } from "@/components/ui/button";
import MentoraLogo from "./MentoraLogo";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero = ({ onStart }: LandingHeroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50 animate-pulse-glow" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Logo */}
        <MentoraLogo />
        
        {/* Tagline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-happy bg-clip-text text-transparent">
            Mentora
          </h1>
          <p className="text-xl md:text-2xl text-secondary font-light">
            Where Artificial Intelligence meets Emotional Intelligence
          </p>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Your emotional ally, always here to listen. Experience the power of AI that truly understands 
          your feelings through voice, text, and expressions.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onStart}
          size="lg"
          className="mt-8 bg-gradient-calm hover:shadow-glow transition-all duration-300 text-lg px-8 py-6 rounded-full"
        >
          Begin Your Journey
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all">
            <div className="text-4xl mb-3">🗣️</div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Voice Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Real-time emotion detection through voice tone and inflection
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Empathetic Chat</h3>
            <p className="text-sm text-muted-foreground">
              AI that understands context and responds with genuine care
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all">
            <div className="text-4xl mb-3">🧘</div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Mindful Guidance</h3>
            <p className="text-sm text-muted-foreground">
              Personalized meditation, journaling, and wellness support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
