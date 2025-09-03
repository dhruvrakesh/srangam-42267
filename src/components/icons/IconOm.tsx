interface IconProps {
  className?: string;
  size?: number;
}

export function IconOm({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Om/Aum Symbol"
      className={className}
    >
      {/* Sacred circle background */}
      <circle cx="32" cy="32" r="30" fill="hsl(var(--sandalwood))" opacity="0.3" stroke="hsl(var(--saffron))" strokeWidth="1"/>
      
      {/* Om symbol main curves */}
      <g fill="none" stroke="hsl(var(--indigo-dharma))" strokeWidth="3" strokeLinecap="round">
        {/* Main curve - represents waking state */}
        <path d="M12 42 Q20 35 28 42 Q32 45 38 42 Q42 40 45 42"/>
        
        {/* Upper curve - represents dream state */}
        <path d="M20 30 Q28 25 35 30 Q38 32 42 30"/>
        
        {/* Lower tail - represents deep sleep */}
        <path d="M12 42 Q8 45 6 50 Q8 52 12 50 Q16 48 20 50"/>
        
        {/* Dot and crescent - represents transcendent state */}
        <circle cx="38" cy="20" r="2" fill="hsl(var(--saffron))"/>
        <path d="M34 18 Q36 16 38 18 Q40 16 42 18" fill="none" strokeWidth="2"/>
      </g>
      
      {/* Sacred geometry enhancement */}
      <g fill="hsl(var(--turmeric))" opacity="0.6">
        <circle cx="15" cy="25" r="1"/>
        <circle cx="48" cy="35" r="1"/>
        <circle cx="25" cy="15" r="0.8"/>
        <circle cx="45" cy="48" r="0.8"/>
      </g>
      
      {/* Vibration lines */}
      <g stroke="hsl(var(--lotus-pink))" strokeWidth="1" opacity="0.5" fill="none">
        <path d="M8 25 Q12 23 16 25"/>
        <path d="M48 39 Q52 37 56 39"/>
        <path d="M15 55 Q19 53 23 55"/>
        <path d="M41 8 Q45 6 49 8"/>
      </g>
    </svg>
  );
}