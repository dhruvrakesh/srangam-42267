interface IconProps {
  className?: string;
  size?: number;
}

export function IconPort({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Harbor"
      className={className}
    >
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 40c6-4 10-4 16 0s10 4 16 0 10-4 16 0" fill="none" stroke="hsl(var(--ocean))" strokeWidth="2"/>
      <path d="M20 20h8v8h-8zM36 16l10 10h-10z" fill="hsl(var(--gold))"/>
    </svg>
  );
}