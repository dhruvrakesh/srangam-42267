import { cn } from "@/lib/utils";

interface TagChipProps {
  children: React.ReactNode;
  variant?: "theme" | "default";
  className?: string;
}

export function TagChip({ children, variant = "default", className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        variant === "theme" 
          ? "bg-ocean text-white dark:bg-ocean dark:text-charcoal-om"
          : "bg-sand border border-border text-foreground dark:bg-card dark:text-card-foreground dark:border-border",
        className
      )}
    >
      {children}
    </span>
  );
}