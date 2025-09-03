interface IconProps {
  className?: string;
  size?: number;
}

export function IconLotus({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Sacred Lotus"
      className={className}
    >
      {/* Water base */}
      <ellipse cx="32" cy="56" rx="28" ry="6" fill="hsl(var(--peacock-blue))" opacity="0.3"/>
      
      {/* Lotus stem */}
      <line x1="32" y1="32" x2="32" y2="56" stroke="hsl(var(--terracotta))" strokeWidth="3"/>
      
      {/* Outer petals */}
      <g fill="hsl(var(--lotus-pink))" stroke="hsl(var(--lotus-pink))" strokeWidth="1" opacity="0.8">
        <path d="M32 32 Q18 28 16 40 Q20 44 32 40 Z"/>
        <path d="M32 32 Q28 18 40 16 Q44 20 40 32 Z"/>
        <path d="M32 32 Q46 28 48 40 Q44 44 32 40 Z"/>
        <path d="M32 32 Q36 18 24 16 Q20 20 24 32 Z"/>
        
        <path d="M32 32 Q22 22 14 32 Q18 38 28 36 Z"/>
        <path d="M32 32 Q42 22 50 32 Q46 38 36 36 Z"/>
        <path d="M32 32 Q22 42 14 32 Q18 26 28 28 Z"/>
        <path d="M32 32 Q42 42 50 32 Q46 26 36 28 Z"/>
      </g>
      
      {/* Inner petals */}
      <g fill="hsl(var(--saffron))" stroke="hsl(var(--turmeric))" strokeWidth="1" opacity="0.9">
        <path d="M32 32 Q26 28 24 34 Q26 36 32 34 Z"/>
        <path d="M32 32 Q30 26 36 24 Q38 26 36 32 Z"/>
        <path d="M32 32 Q38 28 40 34 Q38 36 32 34 Z"/>
        <path d="M32 32 Q34 26 28 24 Q26 26 28 32 Z"/>
        
        <path d="M32 32 Q28 30 26 34 Q28 36 30 34 Z"/>
        <path d="M32 32 Q36 30 38 34 Q36 36 34 34 Z"/>
        <path d="M32 32 Q30 36 26 34 Q28 30 30 30 Z"/>
        <path d="M32 32 Q34 36 38 34 Q36 30 34 30 Z"/>
      </g>
      
      {/* Center - seed pod */}
      <circle cx="32" cy="32" r="4" fill="hsl(var(--turmeric))" stroke="hsl(var(--saffron))" strokeWidth="1"/>
      
      {/* Seed holes */}
      <g fill="hsl(var(--terracotta))" opacity="0.6">
        <circle cx="30" cy="30" r="0.8"/>
        <circle cx="34" cy="30" r="0.8"/>
        <circle cx="32" cy="34" r="0.8"/>
        <circle cx="30" cy="33" r="0.5"/>
        <circle cx="34" cy="33" r="0.5"/>
      </g>
    </svg>
  );
}