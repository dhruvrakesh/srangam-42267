import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: 'H' | 'M' | 'L' | 'D';
  context?: string;
  inline?: boolean;
}

const confidenceConfig = {
  H: {
    label: 'High',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-600 dark:text-green-400',
    description: 'Multi-source convergence: archaeology, ethnography, ecology, and/or texts align with minimal ambiguity.',
    bgColor: 'bg-green-500/10'
  },
  M: {
    label: 'Medium',
    icon: AlertCircle,
    variant: 'secondary' as const,
    color: 'text-blue-600 dark:text-blue-400',
    description: 'Strong evidence in one domain (e.g., ethnography) with partial support elsewhere. Functional parallels documented.',
    bgColor: 'bg-blue-500/10'
  },
  L: {
    label: 'Low',
    icon: HelpCircle,
    variant: 'outline' as const,
    color: 'text-amber-600 dark:text-amber-400',
    description: 'Suggestive patterns requiring further validation. Preliminary or single-source evidence.',
    bgColor: 'bg-amber-500/10'
  },
  D: {
    label: 'Decline',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600 dark:text-red-400',
    description: 'Decline to time-lock: Oral traditions reference geological events but lack independent stratigraphic anchors. Pattern noted, dating withheld.',
    bgColor: 'bg-red-500/10'
  }
};

export function ConfidenceBadge({ level, context, inline = true }: ConfidenceBadgeProps) {
  const config = confidenceConfig[level];
  const Icon = config.icon;

  const badgeContent = (
    <Badge variant={config.variant} className={inline ? 'inline-flex mx-1' : ''}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className={`font-semibold ${config.color}`}>
              Confidence: {config.label} [{level}]
            </div>
            <p className="text-xs">{config.description}</p>
            {context && (
              <div className={`text-xs p-2 rounded ${config.bgColor} mt-2`}>
                <strong>Context:</strong> {context}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
