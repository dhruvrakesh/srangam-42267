import { Badge } from "@/components/ui/badge";

interface PuranaCategoryBadgeProps {
  category: string;
}

const categoryStyles: Record<string, string> = {
  Mahapurana: 'bg-burgundy hover:bg-burgundy/90 text-cream',
  Veda: 'bg-saffron hover:bg-saffron/90 text-charcoal-om',
  Itihasa: 'bg-ocean hover:bg-ocean/90 text-cream dark:text-charcoal-om',
  Upapurana: 'bg-ocean-teal hover:bg-ocean-teal/90 text-cream',
  Agama: 'bg-laterite hover:bg-laterite/90 text-cream',
  Other: 'bg-muted hover:bg-muted/80 text-muted-foreground',
};

export const PuranaCategoryBadge = ({ category }: PuranaCategoryBadgeProps) => {
  return (
    <Badge className={categoryStyles[category] || categoryStyles.Other}>
      {category}
    </Badge>
  );
};
