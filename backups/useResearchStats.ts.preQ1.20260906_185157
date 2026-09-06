import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeStats {
  theme: string;
  count: number;        // published articles
  draftCount: number;   // draft articles
}

export interface ResearchStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  crossReferences: number;
  culturalTerms: number;
  themes: ThemeStats[];
  isLoading: boolean;
}

async function fetchResearchStats(): Promise<Omit<ResearchStats, 'isLoading'>> {
  // Fetch all stats in parallel
  const [articlesResult, crossRefsResult, termsResult, themeStatsResult] = await Promise.all([
    // Total published articles
    supabase
      .from('srangam_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    
    // Cross-references count
    supabase
      .from('srangam_cross_references')
      .select('id', { count: 'exact', head: true }),
    
    // Cultural terms count
    supabase
      .from('srangam_cultural_terms')
      .select('id', { count: 'exact', head: true }),
    
    // Articles grouped by theme with status
    supabase
      .from('srangam_articles')
      .select('theme, status')
  ]);

  // Calculate theme counts with published and draft separation
  const themeMap = new Map<string, { published: number; draft: number }>();
  
  if (themeStatsResult.data) {
    themeStatsResult.data.forEach((article) => {
      const theme = article.theme || 'other';
      const current = themeMap.get(theme) || { published: 0, draft: 0 };
      
      if (article.status === 'published') {
        current.published += 1;
      } else {
        current.draft += 1;
      }
      
      themeMap.set(theme, current);
    });
  }

  const themes: ThemeStats[] = Array.from(themeMap.entries()).map(([theme, counts]) => ({
    theme,
    count: counts.published,
    draftCount: counts.draft
  }));

  // Calculate totals
  const totalArticles = themeStatsResult.data?.length || 0;
  const publishedArticles = themes.reduce((sum, t) => sum + t.count, 0);
  const draftArticles = themes.reduce((sum, t) => sum + t.draftCount, 0);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    crossReferences: crossRefsResult.count || 0,
    culturalTerms: termsResult.count || 0,
    themes
  };
}

export function useResearchStats(): ResearchStats {
  const { data, isLoading } = useQuery({
    queryKey: ['research-stats'],
    queryFn: fetchResearchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    totalArticles: data?.totalArticles || 0,
    publishedArticles: data?.publishedArticles || 0,
    draftArticles: data?.draftArticles || 0,
    crossReferences: data?.crossReferences || 0,
    culturalTerms: data?.culturalTerms || 0,
    themes: data?.themes || [],
    isLoading
  };
}

// Helper to get article count for a specific theme
// Includes legacy theme mappings (sacred-geography, acoustic-archaeology, etc.)
export function getThemeArticleCount(themes: ThemeStats[], themeId: string): number {
  const themeMapping: Record<string, string[]> = {
    'ancient-india': [
      'ancient-india', 
      'Ancient India', 
      'sacred-geography',  // Legacy theme
      'acoustic-archaeology'  // Legacy theme
    ],
    'indian-ocean': ['indian-ocean-world', 'Indian Ocean World', 'indian-ocean'],
    'scripts-inscriptions': ['scripts-inscriptions', 'Scripts & Inscriptions', 'scripts-and-inscriptions'],
    'geology-deep-time': ['geology-deep-time', 'Geology & Deep Time', 'geology'],
    'empires-exchange': ['empires-exchange', 'Empires & Exchange', 'empires-and-exchange'],
    'sacred-ecology': ['sacred-ecology', 'Sacred Ecology']
  };

  const matchingThemes = themeMapping[themeId] || [themeId];
  return themes
    .filter(t => matchingThemes.some(m => 
      t.theme.toLowerCase() === m.toLowerCase() || 
      t.theme.toLowerCase().includes(m.toLowerCase())
    ))
    .reduce((sum, t) => sum + t.count, 0);
}

// Helper to get draft count for a specific theme
export function getThemeDraftCount(themes: ThemeStats[], themeId: string): number {
  const themeMapping: Record<string, string[]> = {
    'ancient-india': [
      'ancient-india', 
      'Ancient India', 
      'sacred-geography',
      'acoustic-archaeology'
    ],
    'indian-ocean': ['indian-ocean-world', 'Indian Ocean World', 'indian-ocean'],
    'scripts-inscriptions': ['scripts-inscriptions', 'Scripts & Inscriptions', 'scripts-and-inscriptions'],
    'geology-deep-time': ['geology-deep-time', 'Geology & Deep Time', 'geology'],
    'empires-exchange': ['empires-exchange', 'Empires & Exchange', 'empires-and-exchange'],
    'sacred-ecology': ['sacred-ecology', 'Sacred Ecology']
  };

  const matchingThemes = themeMapping[themeId] || [themeId];
  return themes
    .filter(t => matchingThemes.some(m => 
      t.theme.toLowerCase() === m.toLowerCase() || 
      t.theme.toLowerCase().includes(m.toLowerCase())
    ))
    .reduce((sum, t) => sum + t.draftCount, 0);
}
