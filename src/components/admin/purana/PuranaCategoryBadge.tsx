import { Badge } from "@/components/ui/badge";

interface PuranaCategoryBadgeProps {
  category: string;
}

const categoryStyles: Record<string, string> = {
  Mahapurana: 'bg-purple-500 hover:bg-purple-600 text-white',
  Veda: 'bg-amber-500 hover:bg-amber-600 text-white',
  Itihasa: 'bg-blue-500 hover:bg-blue-600 text-white',
  Upapurana: 'bg-green-500 hover:bg-green-600 text-white',
  Agama: 'bg-red-500 hover:bg-red-600 text-white',
  Other: 'bg-muted hover:bg-muted/80 text-muted-foreground',
};

export const PuranaCategoryBadge = ({ category }: PuranaCategoryBadgeProps) => {
  return (
    <Badge className={categoryStyles[category] || categoryStyles.Other}>
      {category}
    </Badge>
  );
};
