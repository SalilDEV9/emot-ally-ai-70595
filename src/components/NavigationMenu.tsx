import { MessageCircle, BarChart3, Wind, BookOpen } from "lucide-react";
import { Button } from "./ui/button";

interface NavigationMenuProps {
  currentView: "chat" | "dashboard" | "breathing" | "journal";
  onViewChange: (view: "chat" | "dashboard" | "breathing" | "journal") => void;
}

const NavigationMenu = ({ currentView, onViewChange }: NavigationMenuProps) => {
  const menuItems = [
    { id: "chat" as const, icon: MessageCircle, label: "Chat" },
    { id: "dashboard" as const, icon: BarChart3, label: "Dashboard" },
    { id: "breathing" as const, icon: Wind, label: "Breathe" },
    { id: "journal" as const, icon: BookOpen, label: "Journal" },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex gap-2 p-3 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full shadow-glow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              variant={isActive ? "default" : "ghost"}
              size="lg"
              className={`rounded-full gap-2 transition-all ${
                isActive
                  ? "bg-gradient-calm shadow-glow hover:shadow-glow-lg"
                  : "hover:bg-card/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationMenu;
