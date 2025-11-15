import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ExtractionProgressProps {
  current: number;
  total: number;
  currentArticle?: string;
  isProcessing: boolean;
}

export const ExtractionProgress = ({ 
  current, 
  total, 
  currentArticle,
  isProcessing 
}: ExtractionProgressProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const estimatedMinutes = Math.ceil((total - current) * 0.5);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              {isProcessing ? 'Processing...' : 'Extraction Complete'}
            </span>
            <span className="text-muted-foreground font-mono">
              {current}/{total} articles
            </span>
          </div>
          
          <Progress value={percentage} className="h-2" />
          
          {currentArticle && isProcessing && (
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{currentArticle}</span>
            </p>
          )}
          
          {isProcessing && (
            <p className="text-xs text-muted-foreground">
              Estimated time remaining: <span className="font-medium">{estimatedMinutes} minutes</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
