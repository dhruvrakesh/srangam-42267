import { Badge } from "@/components/ui/badge";

interface ConfidenceBadgeProps {
  score: number;
}

export const ConfidenceBadge = ({ score }: ConfidenceBadgeProps) => {
  const getVariant = () => {
    if (score >= 0.80) return 'default';
    if (score >= 0.60) return 'secondary';
    return 'destructive';
  };
  
  const getLabel = () => {
    if (score >= 0.80) return 'High';
    if (score >= 0.60) return 'Medium';
    return 'Low';
  };
  
  return (
    <Badge variant={getVariant()} className="font-mono">
      {getLabel()} ({score.toFixed(2)})
    </Badge>
  );
};
