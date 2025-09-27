import { BookOpen, Calendar, MapPin, Compass, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import taxonomyData from '@/data/field_notes/taxonomy.json';

interface ResearchEntryData {
  title: string;
  dateLabel: string;
  location: string;
  summary: string;
  readingMinutes: number;
  tags: string[];
  status: string;
  slug: string;
  cta: { en: string; hi: string; };
}

interface ResearchEntryProps {
  entry: ResearchEntryData;
  index: number;
}

export function ResearchEntry({ entry, index }: ResearchEntryProps) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  // Theme colors based on entry index
  const themeColors = [
    {
      primary: "burgundy",
      secondary: "gold-warm",
      bg: "from-cream/95 to-sand/95",
      border: "border-burgundy/20",
      gradient: "from-burgundy/20 via-gold-warm/20 to-burgundy/20",
      topBar: "from-burgundy via-gold-warm to-burgundy",
      icon: BookOpen,
      iconBg: "bg-burgundy/10",
      iconColor: "text-burgundy",
      titleColor: "text-burgundy",
      titleHover: "group-hover:text-burgundy-light",
      linkColor: "text-burgundy hover:text-burgundy-light",
      accentColor: "text-gold-warm",
      borderColor: "border-burgundy/20"
    },
    {
      primary: "ocean",
      secondary: "cyan-600",
      bg: "from-sand/95 to-cyan-50/95", 
      border: "border-ocean/20",
      gradient: "from-ocean/20 via-cyan-500/20 to-ocean/20",
      topBar: "from-ocean via-cyan-400 to-ocean",
      icon: Compass,
      iconBg: "bg-ocean/10",
      iconColor: "text-ocean", 
      titleColor: "text-ocean",
      titleHover: "group-hover:text-ocean/80",
      linkColor: "text-ocean hover:text-ocean/80",
      accentColor: "text-cyan-600",
      borderColor: "border-ocean/20"
    }
  ];

  const theme = themeColors[index % themeColors.length];
  const IconComponent = theme.icon;

  // Get tag display names
  const getTagDisplayName = (slug: string) => {
    const chip = taxonomyData.chips.find(c => c.slug === slug);
    return chip ? (isHindi ? chip.hi : chip.en) : slug;
  };

  return (
    <div className="group relative">
      <div className={`absolute -inset-2 bg-gradient-to-r ${theme.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
      <Card className={`relative bg-gradient-to-br ${theme.bg} backdrop-blur-sm border-2 ${theme.border} shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]`}>
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${theme.topBar} rounded-t-lg`}></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`${theme.iconBg} p-3 rounded-xl`}>
                <IconComponent size={24} className={theme.iconColor} />
              </div>
              <div className="flex-1">
                <CardTitle className={`font-serif text-2xl ${theme.titleColor} ${theme.titleHover} mb-2 transition-colors`}>
                  {entry.title}
                </CardTitle>
                <div className="flex items-center gap-6 text-sm text-charcoal/70">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={theme.accentColor} />
                    <span className="font-medium">{entry.dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className={theme.accentColor} />
                    <span>{entry.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <TagChip variant="theme" className={`bg-${theme.primary} text-cream shadow-lg`}>
                {t('fieldNotes.labels.published')}
              </TagChip>
              <div className={`absolute -top-1 -right-1 w-3 h-3 bg-${theme.secondary} rounded-full animate-pulse`}></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-charcoal/80 leading-relaxed text-lg">
            {entry.summary}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {entry.tags.map((tag, idx) => (
              <TagChip 
                key={tag}
                className={`bg-${theme.primary}/10 text-${theme.primary} border-${theme.primary}/20 ${isHindi ? 'font-hindi' : ''}`}
              >
                {getTagDisplayName(tag)}
              </TagChip>
            ))}
          </div>
          
          <div className={`border-t ${theme.borderColor} pt-4`}>
            <Link 
              to={entry.slug}
              className={`inline-flex items-center gap-2 text-lg font-semibold ${theme.linkColor} transition-colors group/link`}
            >
              <span className="relative">
                {isHindi ? entry.cta.hi : entry.cta.en}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-${theme.primary} transition-all duration-300 group-hover/link:w-full`}></span>
              </span>
              <span className={theme.accentColor}>→</span>
              <span className="text-sm text-charcoal/60">
                ({entry.readingMinutes} {t('fieldNotes.labels.minutes')})
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}