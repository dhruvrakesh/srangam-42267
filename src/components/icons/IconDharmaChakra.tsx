interface IconProps {
  className?: string;
  size?: number;
}

export function IconDharmaChakra({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Dharma Chakra"
      className={className}
    >
      {/* Outer rim */}
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3"/>
      
      {/* Inner hub */}
      <circle cx="32" cy="32" r="6" fill="hsl(var(--saffron))" stroke="currentColor" strokeWidth="2"/>
      
      {/* 8 Spokes - Noble Eightfold Path */}
      <g stroke="hsl(var(--turmeric))" strokeWidth="2" fill="none">
        <line x1="32" y1="2" x2="32" y2="14" />
        <line x1="54.5" y1="9.5" x2="46.5" y2="17.5" />
        <line x1="62" y1="32" x2="50" y2="32" />
        <line x1="54.5" y1="54.5" x2="46.5" y2="46.5" />
        <line x1="32" y1="62" x2="32" y2="50" />
        <line x1="9.5" y1="54.5" x2="17.5" y2="46.5" />
        <line x1="2" y1="32" x2="14" y2="32" />
        <line x1="9.5" y1="9.5" x2="17.5" y2="17.5" />
      </g>
      
      {/* Lotus petals around the rim */}
      <g fill="hsl(var(--lotus-pink))" opacity="0.6">
        <path d="M32 4 L28 8 L32 12 L36 8 Z" />
        <path d="M52 12 L48 16 L52 20 L56 16 Z" />
        <path d="M60 32 L56 28 L60 32 L56 36 Z" />
        <path d="M52 52 L48 48 L52 52 L56 48 Z" />
        <path d="M32 60 L28 56 L32 60 L36 56 Z" />
        <path d="M12 52 L8 48 L12 52 L16 48 Z" />
        <path d="M4 32 L8 28 L4 32 L8 36 Z" />
        <path d="M12 12 L8 16 L12 12 L16 16 Z" />
      </g>
    </svg>
  );
}