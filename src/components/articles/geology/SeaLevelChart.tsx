export const SeaLevelChart = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">
      Post-Glacial Sea Level Rise in South India
    </h3>
    <div className="bg-card p-6 rounded-lg border">
      <svg viewBox="0 0 500 250" className="w-full h-48">
        {/* Axes */}
        <line x1="50" y1="200" x2="450" y2="200" stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1="50" y1="50" x2="50" y2="200" stroke="hsl(var(--border))" strokeWidth="1" />
        
        {/* Sea level curve */}
        <path d="M50 50 Q150 60 250 120 Q350 160 450 180" 
              stroke="hsl(var(--ocean))" strokeWidth="3" fill="none" />
        
        {/* Fill area under curve */}
        <path d="M50 200 L50 50 Q150 60 250 120 Q350 160 450 180 L450 200 Z" 
              fill="hsl(var(--ocean)/0.2)" />
        
        {/* Time markers */}
        <text x="50" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">15ka</text>
        <text x="150" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">12ka</text>
        <text x="250" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">9ka</text>
        <text x="350" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">6ka</text>
        <text x="450" y="220" className="text-xs text-muted-foreground fill-current" textAnchor="middle">3ka</text>
        
        {/* Sea level markers */}
        <text x="40" y="55" className="text-xs text-muted-foreground fill-current" textAnchor="end">-60m</text>
        <text x="40" y="110" className="text-xs text-muted-foreground fill-current" textAnchor="end">-30m</text>
        <text x="40" y="155" className="text-xs text-muted-foreground fill-current" textAnchor="end">-15m</text>
        <text x="40" y="185" className="text-xs text-muted-foreground fill-current" textAnchor="end">0m</text>
        
        {/* Labels */}
        <text x="250" y="40" className="text-sm font-medium text-foreground fill-current" textAnchor="middle">Sea Level Rise (Gulf of Mannar)</text>
        <text x="250" y="240" className="text-xs text-muted-foreground fill-current" textAnchor="middle">Years Before Present (ka = thousand years)</text>
        
        {/* Cultural memory annotation */}
        <circle cx="200" cy="90" r="3" fill="hsl(var(--destructive))" />
        <text x="210" y="85" className="text-xs text-destructive fill-current">Kumari Kandam</text>
        <text x="210" y="95" className="text-xs text-destructive fill-current">submergence</text>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      The dramatic 60-meter sea level rise between 15,000-7,000 years ago drowned vast coastal areas, 
      creating the cultural memory preserved as "Kumari Kandam" in Tamil literature.
    </p>
  </div>
);