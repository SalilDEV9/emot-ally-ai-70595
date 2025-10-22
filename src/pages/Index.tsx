import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-focus">
      {!showChat ? (
        <LandingHero onStart={() => setShowChat(true)} />
      ) : (
        <ChatInterface />
      )}
    </div>
  );
};

export default Index;
