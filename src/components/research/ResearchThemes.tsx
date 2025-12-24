import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { researchThemes, ResearchTheme } from "@/data/researchThemes";
import { useResearchStats, getThemeArticleCount } from "@/hooks/useResearchStats";

interface ResearchThemesProps {
  variant: "pills" | "cards";
  showArticleCounts?: boolean;
  isVisible?: boolean;
  className?: string;
}

function ThemePill({ theme, index, isVisible }: { theme: ResearchTheme; index: number; isVisible: boolean }) {
  const IconComponent = theme.icon;
  
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-2 bg-card/80 border ${theme.borderColor} rounded-full hover:scale-105 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <IconComponent size={20} className={theme.color} />
      <span className="text-sm font-medium text-foreground">{theme.name}</span>
    </div>
  );
}

function ThemeCard({ 
  theme, 
  index, 
  isVisible, 
  isLoading, 
  articleCount 
}: { 
  theme: ResearchTheme; 
  index: number; 
  isVisible: boolean; 
  isLoading: boolean;
  articleCount: number;
}) {
  const IconComponent = theme.icon;
  
  return (
    <Link
      to={theme.path}
      className={`group block transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className={`h-full transition-all duration-300 ${theme.borderColor} ${theme.hoverBorderColor} hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className={`w-12 h-12 rounded-full ${theme.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <IconComponent size={24} className={theme.color} />
          </div>
          <CardTitle className="flex items-center justify-between">
            <span className="text-foreground group-hover:text-saffron transition-colors">
              {theme.name}
            </span>
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
              {isLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                `${articleCount} articles`
              )}
            </span>
          </CardTitle>
          <p className="text-sm text-saffron/70 font-serif">
            {theme.nameSanskrit}
          </p>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {theme.description}
          </CardDescription>
          <div className="flex items-center mt-4 text-sm font-medium text-muted-foreground group-hover:text-saffron transition-colors">
            Explore theme
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ResearchThemes({ 
  variant, 
  showArticleCounts = true, 
  isVisible = true,
  className = "" 
}: ResearchThemesProps) {
  const { themes, isLoading } = useResearchStats();

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
        {researchThemes.map((theme, index) => (
          <ThemePill 
            key={theme.id} 
            theme={theme} 
            index={index} 
            isVisible={isVisible} 
          />
        ))}
      </div>
    );
  }

  // Cards variant
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {researchThemes.map((theme, index) => {
        const articleCount = showArticleCounts ? getThemeArticleCount(themes, theme.id) : 0;
        
        return (
          <ThemeCard
            key={theme.id}
            theme={theme}
            index={index}
            isVisible={isVisible}
            isLoading={isLoading && showArticleCounts}
            articleCount={articleCount}
          />
        );
      })}
    </div>
  );
}
