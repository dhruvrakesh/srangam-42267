import { TimelineEvent } from '@/lib/geodeep';
import { Badge } from '@/components/ui/badge';
import { IconBasalt } from '@/components/icons';

interface TimelineDeepTimeProps {
  events: TimelineEvent[];
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'tectonic': return 'text-laterite';
    case 'volcanic': return 'text-saffron';
    case 'collision': return 'text-indigo-dharma';
    case 'climate': return 'text-turmeric';
    case 'fluvial': return 'text-peacock';
    case 'active': return 'text-gold';
    default: return 'text-muted-foreground';
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'volcanic': return 'destructive' as const;
    case 'collision': return 'default' as const;
    case 'climate': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

export const TimelineDeepTime = ({ events }: TimelineDeepTimeProps) => {
  const maxAge = Math.max(...events.map(e => e.ageMa));
  
  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <IconBasalt size={32} className="text-laterite" />
          <h3 className="font-serif text-2xl lg:text-3xl text-foreground">
            Deep Time Timeline
          </h3>
          <IconBasalt size={32} className="text-laterite scale-x-[-1]" />
        </div>
        <p className="text-sm text-muted-foreground font-sanskrit">
          कल्प चक्र काल - From Cosmic Egg to Sacred Mountains
        </p>
      </div>

      {/* Timeline SVG */}
      <div className="relative w-full max-w-4xl mx-auto">
        <svg className="w-full h-64" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
          {/* Background cosmic gradient */}
          <defs>
            <linearGradient id="cosmic-bg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--indigo-dharma))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="hsl(var(--laterite))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--saffron))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#cosmic-bg)" />
          
          {/* Main timeline line */}
          <line x1="50" y1="100" x2="750" y2="100" 
                stroke="hsl(var(--laterite))" strokeWidth="2" opacity="0.6" />
          
          {/* Timeline events */}
          {events.map((event, index) => {
            const x = 50 + ((maxAge - event.ageMa) / maxAge) * 700;
            const isEven = index % 2 === 0;
            const textY = isEven ? 80 : 130;
            const lineY = isEven ? 85 : 115;
            
            return (
              <g key={event.ageMa}>
                {/* Event dot */}
                <circle 
                  cx={x} cy="100" r="6" 
                  fill={`hsl(var(--${event.type === 'volcanic' ? 'saffron' : 
                                      event.type === 'collision' ? 'indigo-dharma' :
                                      event.type === 'climate' ? 'turmeric' : 'laterite'}))`}
                  stroke="hsl(var(--background))" strokeWidth="2"
                />
                
                {/* Connecting line */}
                <line x1={x} y1="100" x2={x} y2={lineY} 
                      stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.5" />
                
                {/* Age label */}
                <text x={x} y={textY} textAnchor="middle" 
                      className="text-xs fill-current text-foreground font-medium">
                  {event.ageMa > 0 ? `${event.ageMa} Ma` : 'Now'}
                </text>
                
                {/* Event label */}
                <text x={x} y={textY + 12} textAnchor="middle" 
                      className={`text-xs fill-current font-medium ${getTypeColor(event.type)}`}>
                  {event.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Event details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-6xl mx-auto">
        {events.map((event) => (
          <div key={event.ageMa} 
               className="p-4 rounded-lg bg-card border border-border/50 hover:border-laterite/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={getTypeBadgeVariant(event.type)} className="text-xs">
                {event.type}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {event.ageMa > 0 ? `${event.ageMa} Ma` : 'Present'}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-1">{event.label}</h4>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};