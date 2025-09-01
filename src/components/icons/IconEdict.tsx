interface IconProps {
  className?: string;
  size?: number;
}

export function IconEdict({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      role="img" 
      aria-label="Rock Edict"
      className={className}
    >
      <path d="M20 56c-6-12-6-36 12-44s24 10 12 44z" fill="hsl(var(--sand))" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 28h8M26 34h12M24 40h16" stroke="hsl(var(--laterite))" strokeWidth="2"/>
    </svg>
  );
}