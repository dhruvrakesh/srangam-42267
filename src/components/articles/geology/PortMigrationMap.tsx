export const PortMigrationMap = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      How Ports Moved: Geological Change and Commercial Adaptation
    </h3>
    <div className="bg-card p-6 rounded-lg border">
      <svg viewBox="0 0 600 400" className="w-full h-64">
        {/* Western Ghats */}
        <path d="M50 50 L50 350" stroke="hsl(var(--laterite))" strokeWidth="8" />
        <text x="25" y="200" className="text-xs text-muted-foreground fill-current" transform="rotate(-90 25 200)">
          Western Ghats
        </text>
        
        {/* Coastline (simplified) */}
        <path d="M120 80 Q200 100 280 120 Q400 140 550 160" stroke="hsl(var(--ocean))" strokeWidth="3" fill="none" />
        
        {/* Ancient ports (lost) */}
        <circle cx="180" cy="95" r="6" fill="hsl(var(--destructive))" opacity="0.7" />
        <text x="190" y="100" className="text-xs text-destructive fill-current">Muziris (lost 1341)</text>
        
        <circle cx="420" cy="145" r="6" fill="hsl(var(--destructive))" opacity="0.7" />
        <text x="430" y="150" className="text-xs text-destructive fill-current">Puhār (lost c.300)</text>
        
        {/* New ports */}
        <circle cx="200" cy="110" r="6" fill="hsl(var(--ocean))" />
        <text x="210" y="115" className="text-xs text-ocean fill-current">Kochi (born 1341)</text>
        
        <circle cx="380" cy="135" r="6" fill="hsl(var(--ocean))" />
        <text x="390" y="140" className="text-xs text-ocean fill-current">Nagapattinam</text>
        
        {/* Migration arrows */}
        <path d="M185 100 Q195 105 205 105" stroke="hsl(var(--ocean))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <path d="M415 148 Q405 142 385 140" stroke="hsl(var(--ocean))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        
        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--ocean))" />
          </marker>
        </defs>
        
        {/* Legend */}
        <g transform="translate(400, 250)">
          <rect x="0" y="0" width="180" height="80" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="4" />
          <text x="10" y="20" className="text-sm font-medium text-foreground fill-current">Port Evolution</text>
          <circle cx="20" cy="35" r="4" fill="hsl(var(--destructive))" opacity="0.7" />
          <text x="30" y="39" className="text-xs text-muted-foreground fill-current">Geological destruction</text>
          <circle cx="20" cy="55" r="4" fill="hsl(var(--ocean))" />
          <text x="30" y="59" className="text-xs text-muted-foreground fill-current">New port emergence</text>
        </g>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      When geological forces destroyed established ports, maritime communities didn't disappear—they 
      relocated to take advantage of new harbors or safer locations created by the same natural processes.
    </p>
  </div>
);