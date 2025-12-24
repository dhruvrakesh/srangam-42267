import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp, formatCountUp } from "@/hooks/useCountUp";

export interface MetricConfig {
  value: number;
  label: string;
  sublabel: string;
  suffix?: string;
  color: "saffron" | "peacock-blue" | "terracotta" | "turmeric" | "indigo-dharma";
}

interface ResearchMetricsProps {
  metrics: MetricConfig[];
  isLoading: boolean;
  isVisible: boolean;
  variant?: "minimal" | "cards";
  staggerDelay?: number;
  animationDuration?: number;
  className?: string;
}

// Color mapping for consistent theming
const colorClasses: Record<MetricConfig["color"], { text: string; gradient: string; border: string }> = {
  "saffron": {
    text: "text-saffron",
    gradient: "bg-gradient-to-br from-saffron/10 to-transparent",
    border: "border-saffron/30",
  },
  "peacock-blue": {
    text: "text-peacock-blue",
    gradient: "bg-gradient-to-br from-peacock-blue/10 to-transparent",
    border: "border-peacock-blue/30",
  },
  "terracotta": {
    text: "text-terracotta",
    gradient: "bg-gradient-to-br from-terracotta/10 to-transparent",
    border: "border-terracotta/30",
  },
  "turmeric": {
    text: "text-turmeric",
    gradient: "bg-gradient-to-br from-turmeric/10 to-transparent",
    border: "border-turmeric/30",
  },
  "indigo-dharma": {
    text: "text-indigo-dharma",
    gradient: "bg-gradient-to-br from-indigo-dharma/10 to-transparent",
    border: "border-indigo-dharma/30",
  },
};

// Individual metric with staggered animation and pulse on complete
function MetricItem({
  metric,
  index,
  isVisible,
  isLoading,
  variant,
  staggerDelay,
  animationDuration,
}: {
  metric: MetricConfig;
  index: number;
  isVisible: boolean;
  isLoading: boolean;
  variant: "minimal" | "cards";
  staggerDelay: number;
  animationDuration: number;
}) {
  const [startAnimation, setStartAnimation] = useState(false);
  
  // Staggered start for count-up animation
  useEffect(() => {
    if (isVisible && !isLoading) {
      const timer = setTimeout(() => {
        setStartAnimation(true);
      }, index * staggerDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoading, index, staggerDelay]);

  const { count, isComplete } = useCountUp(metric.value, animationDuration, startAnimation);
  const colors = colorClasses[metric.color];
  
  const displayValue = isLoading 
    ? null 
    : `${formatCountUp(count)}${metric.suffix || ""}`;

  // Pulse animation class when count completes
  const pulseClass = isComplete ? "animate-pulse-complete" : "";

  if (variant === "cards") {
    return (
      <Card 
        className={`${colors.gradient} ${colors.border} text-center p-6 transition-all duration-500 ease-out ${pulseClass} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className={`text-4xl lg:text-5xl font-bold ${colors.text} mb-2`}>
          {isLoading ? <Skeleton className="h-12 w-16 mx-auto" /> : displayValue}
        </div>
        <div className="font-medium text-foreground">{metric.label}</div>
        <div className="text-xs text-muted-foreground">{metric.sublabel}</div>
      </Card>
    );
  }

  // Minimal variant
  return (
    <div 
      className={`text-center transition-all duration-500 ease-out ${pulseClass} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      {isLoading ? (
        <Skeleton className="h-12 w-20 mx-auto mb-1" />
      ) : (
        <div className={`text-4xl lg:text-5xl font-bold ${colors.text} mb-1`}>
          {displayValue}
        </div>
      )}
      <div className="font-medium text-foreground text-sm">{metric.label}</div>
      <div className="text-xs text-muted-foreground">{metric.sublabel}</div>
    </div>
  );
}

export function ResearchMetrics({
  metrics,
  isLoading,
  isVisible,
  variant = "minimal",
  staggerDelay = 200,
  animationDuration = 2000,
  className = "",
}: ResearchMetricsProps) {
  const gridClass = variant === "cards" 
    ? "grid grid-cols-2 lg:grid-cols-4 gap-6" 
    : "grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto";

  return (
    <div className={`${gridClass} ${className}`}>
      {metrics.map((metric, index) => (
        <MetricItem
          key={metric.label}
          metric={metric}
          index={index}
          isVisible={isVisible}
          isLoading={isLoading}
          variant={variant}
          staggerDelay={staggerDelay}
          animationDuration={animationDuration}
        />
      ))}
    </div>
  );
}
