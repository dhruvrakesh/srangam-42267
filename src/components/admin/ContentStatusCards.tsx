import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FileEdit, Image, Volume2, CheckCircle, AlertCircle } from "lucide-react";

interface ContentStatusCardsProps {
  published: number;
  drafts: number;
  missingOG: number;
  missingAudio: number;
  isLoading: boolean;
}

interface StatusCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  variant: "success" | "warning" | "info";
  isLoading: boolean;
}

function StatusCard({ title, value, subtitle, icon: Icon, variant, isLoading }: StatusCardProps) {
  const variants = {
    success: {
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      indicator: CheckCircle
    },
    warning: {
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      indicator: AlertCircle
    },
    info: {
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      indicator: CheckCircle
    }
  };

  const style = variants[variant];
  const Indicator = style.indicator;

  return (
    <Card className={style.bgColor}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${style.iconColor}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="flex items-center gap-1 mt-1">
              <Indicator className={`h-3 w-3 ${style.iconColor}`} />
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ContentStatusCards({
  published,
  drafts,
  missingOG,
  missingAudio,
  isLoading
}: ContentStatusCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Published"
        value={published}
        subtitle="Live on site"
        icon={FileText}
        variant="success"
        isLoading={isLoading}
      />
      <StatusCard
        title="Drafts"
        value={drafts}
        subtitle="Awaiting review"
        icon={FileEdit}
        variant={drafts > 0 ? "warning" : "success"}
        isLoading={isLoading}
      />
      <StatusCard
        title="Missing OG"
        value={missingOG}
        subtitle="Need generation"
        icon={Image}
        variant={missingOG > 0 ? "warning" : "success"}
        isLoading={isLoading}
      />
      <StatusCard
        title="No Audio"
        value={missingAudio}
        subtitle="Need narration"
        icon={Volume2}
        variant={missingAudio > 0 ? "warning" : "success"}
        isLoading={isLoading}
      />
    </div>
  );
}
