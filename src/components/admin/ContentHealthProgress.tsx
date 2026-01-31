import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ContentHealthProgressProps {
  ogCoverage: number;      // percentage 0-100
  narrationCoverage: number;
  bibliographyCoverage: number;
  hindiCoverage: number;
  isLoading: boolean;
}

interface ProgressItemProps {
  label: string;
  value: number;
  colorClass: string;
  isLoading: boolean;
}

function ProgressItem({ label, value, isLoading }: Omit<ProgressItemProps, 'colorClass'>) {
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {isLoading ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <span className="font-medium text-foreground">{Math.round(value)}%</span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-2 w-full" />
      ) : (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={`h-full transition-all duration-500 ${getProgressColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ContentHealthProgress({
  ogCoverage,
  narrationCoverage,
  bibliographyCoverage,
  hindiCoverage,
  isLoading
}: ContentHealthProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Health</CardTitle>
        <CardDescription>Metadata and asset coverage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressItem
          label="OG Images"
          value={ogCoverage}
          isLoading={isLoading}
        />
        <ProgressItem
          label="Audio Narrations"
          value={narrationCoverage}
          isLoading={isLoading}
        />
        <ProgressItem
          label="Bibliography Links"
          value={bibliographyCoverage}
          isLoading={isLoading}
        />
        <ProgressItem
          label="Hindi Translations"
          value={hindiCoverage}
          isLoading={isLoading}
        />
        
        <Link 
          to="/admin/data-health" 
          className="flex items-center justify-end gap-1 text-sm text-muted-foreground hover:text-primary transition-colors pt-2"
        >
          View Data Health
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
