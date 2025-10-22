import { useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-6 py-4 ${
              message.role === "user"
                ? "bg-gradient-calm text-primary-foreground shadow-glow"
                : "bg-card/80 backdrop-blur-sm border border-secondary/30 text-card-foreground"
            }`}
          >
            <p className="text-base leading-relaxed">{message.content}</p>
            {message.emotion && message.role === "assistant" && (
              <div className="mt-2 text-xs text-secondary/70">
                Detected: {message.emotion}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
