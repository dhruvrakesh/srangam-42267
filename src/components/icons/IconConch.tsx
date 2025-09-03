interface IconProps {
  className?: string;
  size?: number;
}

export function IconConch({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Sacred Conch"
      className={className}
    >
      {/* Main conch body */}
      <path d="M20 52 Q16 48 16 42 Q16 20 32 14 Q48 20 48 42 Q48 48 44 52 Q40 56 32 56 Q24 56 20 52 Z" 
            fill="hsl(var(--sandalwood))" stroke="currentColor" strokeWidth="2"/>
      
      {/* Spiral shell pattern */}
      <g fill="none" stroke="hsl(var(--terracotta))" strokeWidth="1" opacity="0.7">
        <path d="M32 16 Q40 18 42 26 Q40 34 32 36 Q24 34 22 26 Q24 18 32 16"/>
        <path d="M32 20 Q36 22 37 26 Q36 30 32 32 Q28 30 27 26 Q28 22 32 20"/>
        <path d="M32 24 Q34 25 34 26 Q34 27 32 28 Q30 27 30 26 Q30 25 32 24"/>
      </g>
      
      {/* Conch opening/mouth */}
      <ellipse cx="32" cy="14" rx="8" ry="4" fill="hsl(var(--lotus-pink))" stroke="hsl(var(--saffron))" strokeWidth="2"/>
      
      {/* Inner conch opening */}
      <ellipse cx="32" cy="14" rx="5" ry="2.5" fill="hsl(var(--turmeric))" opacity="0.8"/>
      
      {/* Conch spire */}
      <path d="M32 14 Q28 8 26 4 Q30 2 32 6 Q34 2 38 4 Q36 8 32 14" 
            fill="hsl(var(--peacock-blue))" stroke="currentColor" strokeWidth="1"/>
      
      {/* Sound waves emanating */}
      <g fill="none" stroke="hsl(var(--saffron))" strokeWidth="1" opacity="0.6">
        <path d="M20 10 Q16 8 12 10"/>
        <path d="M18 8 Q12 6 6 8"/>
        <path d="M44 10 Q48 8 52 10"/>
        <path d="M46 8 Q52 6 58 8"/>
      </g>
      
      {/* Sacred markings */}
      <g fill="hsl(var(--indigo-dharma))" opacity="0.4">
        <circle cx="28" cy="40" r="1"/>
        <circle cx="36" cy="38" r="1"/>
        <circle cx="32" cy="44" r="0.8"/>
      </g>
      
      {/* Base stabilizer */}
      <ellipse cx="32" cy="56" rx="12" ry="3" fill="hsl(var(--terracotta))" opacity="0.5"/>
    </svg>
  );
}