import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "inhale") {
            setPhase("hold");
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 6;
          } else {
            setPhase("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleToggle = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setSeconds(4);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-cyan-400";
      case "hold":
        return "from-purple-400 to-pink-400";
      case "exhale":
        return "from-green-400 to-teal-400";
    }
  };

  const getScale = () => {
    if (!isActive) return "scale-100";
    switch (phase) {
      case "inhale":
        return "scale-150";
      case "hold":
        return "scale-150";
      case "exhale":
        return "scale-100";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-8 pb-32">
      <div className="max-w-2xl w-full space-y-12">
        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center h-96">
          <div
            className={`absolute w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-30 blur-3xl transition-all duration-1000 ${
              isActive ? "animate-pulse" : ""
            }`}
          />
          <div
            className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-all duration-[${
              phase === "inhale" ? "4000ms" : phase === "hold" ? "4000ms" : "6000ms"
            }] ease-in-out ${getScale()} shadow-glow-lg`}
          >
            <div className="flex items-center justify-center h-full flex-col text-white">
              <div className="text-6xl font-bold animate-breathe">{seconds}</div>
              <div className="text-2xl capitalize mt-2 animate-fade-in">{phase}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-3xl font-bold bg-gradient-calm bg-clip-text text-transparent">
            {phase === "inhale" && "Breathe In Slowly"}
            {phase === "hold" && "Hold Your Breath"}
            {phase === "exhale" && "Breathe Out Gently"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {phase === "inhale" && "Fill your lungs with calm, peaceful energy"}
            {phase === "hold" && "Feel the stillness within you"}
            {phase === "exhale" && "Release all tension and worry"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleToggle}
            size="lg"
            className="rounded-full w-20 h-20 shadow-glow hover:shadow-glow-lg transition-all"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
            className="rounded-full w-20 h-20 border-secondary/50 hover:shadow-glow-secondary transition-all"
          >
            <RotateCcw className="w-8 h-8" />
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-secondary">Breathing Tips</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary">✨</span>
              <span>Find a comfortable seated position with your back straight</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✨</span>
              <span>Close your eyes if it helps you focus</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✨</span>
              <span>Breathe deeply from your diaphragm, not your chest</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✨</span>
              <span>Practice for 5-10 minutes daily for best results</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
