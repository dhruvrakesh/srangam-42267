interface IconProps {
  className?: string;
  size?: number;
}

export function IconSarnathLion({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Sarnath Lion Capital"
      className={className}
    >
      {/* Base with Dharma Chakra */}
      <rect x="8" y="54" width="48" height="8" rx="2" fill="hsl(var(--terracotta))" stroke="currentColor" strokeWidth="1"/>
      
      {/* Inverted lotus base */}
      <path d="M12 54 Q16 50 20 54 Q24 50 28 54 Q32 50 36 54 Q40 50 44 54 Q48 50 52 54" 
            fill="none" stroke="hsl(var(--lotus-pink))" strokeWidth="2"/>
      
      {/* Abacus with animals */}
      <rect x="10" y="42" width="44" height="12" rx="2" fill="hsl(var(--sandalwood))" stroke="currentColor" strokeWidth="1"/>
      
      {/* Lion bodies - simplified */}
      <g fill="hsl(var(--saffron))" stroke="currentColor" strokeWidth="1">
        {/* Front-facing lion */}
        <circle cx="32" cy="30" r="8"/>
        <path d="M32 22 Q28 18 24 22 Q28 26 32 22 Q36 18 40 22 Q36 26 32 22" fill="hsl(var(--turmeric))"/>
        
        {/* Side lions - stylized */}
        <circle cx="18" cy="36" r="6"/>
        <circle cx="46" cy="36" r="6"/>
      </g>
      
      {/* Lion manes */}
      <g fill="hsl(var(--turmeric))" opacity="0.8">
        <path d="M32 14 Q28 10 24 14 Q20 18 24 22 Q28 18 32 22 Q36 18 40 22 Q44 18 40 14 Q36 10 32 14"/>
      </g>
      
      {/* Dharma Chakra on top */}
      <circle cx="32" cy="8" r="6" fill="none" stroke="hsl(var(--indigo-dharma))" strokeWidth="2"/>
      <circle cx="32" cy="8" r="2" fill="hsl(var(--saffron))"/>
      
      {/* Chakra spokes */}
      <g stroke="hsl(var(--indigo-dharma))" strokeWidth="1">
        <line x1="32" y1="2" x2="32" y2="5"/>
        <line x1="37" y1="3.5" x2="35.5" y2="6"/>
        <line x1="38" y1="8" x2="35" y2="8"/>
        <line x1="37" y1="12.5" x2="35.5" y2="10"/>
        <line x1="32" y1="14" x2="32" y2="11"/>
        <line x1="27" y1="12.5" x2="28.5" y2="10"/>
        <line x1="26" y1="8" x2="29" y2="8"/>
        <line x1="27" y1="3.5" x2="28.5" y2="6"/>
      </g>
      
      {/* Sanskrit "Satyameva Jayate" suggestion */}
      <path d="M14 46 L18 46 M24 46 L28 46 M36 46 L40 46 M46 46 L50 46" 
            stroke="hsl(var(--indigo-dharma))" strokeWidth="1" opacity="0.7"/>
    </svg>
  );
}