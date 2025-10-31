import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import ChatInterface from "@/components/ChatInterface";
import MoodDashboard from "@/components/MoodDashboard";
import BreathingExercise from "@/components/BreathingExercise";
import JournalView from "@/components/JournalView";
import NavigationMenu from "@/components/NavigationMenu";

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "dashboard" | "breathing" | "journal">("chat");

  if (!showChat) {
    return (
      <div className="min-h-screen bg-gradient-focus">
        <LandingHero onStart={() => setShowChat(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-focus relative">
      {currentView === "chat" && <ChatInterface />}
      {currentView === "dashboard" && <MoodDashboard />}
      {currentView === "breathing" && <BreathingExercise />}
      {currentView === "journal" && <JournalView />}
      
      <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default Index;
