interface IconProps {
  className?: string;
  size?: number;
}

export function IconMonsoon({ className = "", size = 24 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      aria-labelledby="monsoon-title" 
      role="img"
      className={className}
    >
      <title id="monsoon-title">Monsoon Winds</title>
      <circle cx="32" cy="32" r="31" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 26c8-8 20-8 28 0 6 6 16 6 22 0" fill="none" stroke="hsl(var(--laterite))" strokeWidth="2" markerEnd="url(#monsoon-arrow)"/>
      <path d="M4 38c10 10 26 10 36 0 7-7 18-7 24 0" fill="none" stroke="hsl(var(--ocean))" strokeWidth="2" markerEnd="url(#monsoon-arrow)"/>
      <defs>
        <marker id="monsoon-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0l10 5-10 5z" fill="hsl(var(--ocean))"/>
        </marker>
      </defs>
    </svg>
  );
}