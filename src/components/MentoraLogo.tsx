const MentoraLogo = () => {
  return (
    <div className="relative w-32 h-32 animate-breathe">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-happy opacity-30 blur-2xl animate-pulse-glow" />
      
      {/* Main logo container */}
      <div className="relative w-full h-full rounded-full bg-gradient-calm flex items-center justify-center shadow-glow">
        {/* Brain + Heart merged symbol */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-20 h-20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heart shape */}
          <path
            d="M50 85 C30 70, 10 55, 10 35 C10 20, 20 10, 30 10 C40 10, 45 15, 50 25 C55 15, 60 10, 70 10 C80 10, 90 20, 90 35 C90 55, 70 70, 50 85 Z"
            fill="hsl(var(--glow-primary))"
            className="animate-breathe"
          />
          
          {/* Brain circuit lines overlay */}
          <path
            d="M35 30 L45 35 L40 45 M55 35 L65 30 L60 45 M45 50 L50 55 L55 50 M40 60 L50 65 L60 60"
            stroke="hsl(var(--glow-secondary))"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-80"
          />
          
          {/* Neural nodes */}
          <circle cx="35" cy="30" r="2" fill="hsl(var(--glow-secondary))" className="animate-pulse" />
          <circle cx="65" cy="30" r="2" fill="hsl(var(--glow-secondary))" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="50" cy="55" r="2" fill="hsl(var(--glow-secondary))" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
        </svg>
      </div>
    </div>
  );
};

export default MentoraLogo;
