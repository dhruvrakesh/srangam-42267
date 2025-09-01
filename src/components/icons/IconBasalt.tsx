interface IconProps {
  className?: string;
  size?: number;
}

export function IconBasalt({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Basalt Steps"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 48h44v6H10zM16 40h32v6H16zM22 32h20v6H22zM26 24h12v6H26z" fill="hsl(var(--laterite))"/>
    </svg>
  );
}