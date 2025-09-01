interface IconProps {
  className?: string;
  size?: number;
}

export function IconScript({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Indic Script"
      className={className}
    >
      <rect x="4" y="6" width="56" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 18h40M12 28h40M12 38h40" stroke="hsl(var(--gold))" strokeWidth="2"/>
      <path d="M18 46c6-8 20-8 26 0" fill="none" stroke="hsl(var(--laterite))" strokeWidth="2"/>
    </svg>
  );
}