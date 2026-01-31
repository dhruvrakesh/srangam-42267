import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ThemeData {
  name: string;
  published: number;
  drafts: number;
  total: number;
}

interface DashboardStats {
  published: number;
  drafts: number;
  missingOG: number;
  missingAudio: number;
  ogCoverage: number;
  narrationCoverage: number;
  bibliographyCoverage: number;
  hindiCoverage: number;
  themeDistribution: ThemeData[];
  totalArticles: number;
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all stats in parallel
      const [
        articlesResult,
        narrationResult,
        bibliographyResult
      ] = await Promise.all([
        // All articles with status and OG info
        supabase
          .from('srangam_articles')
          .select('id, slug, status, theme, og_image_url, content'),
        
        // Distinct narrated articles
        supabase
          .from('srangam_audio_narrations')
          .select('article_slug'),
        
        // Distinct articles with bibliography
        supabase
          .from('srangam_article_bibliography')
          .select('article_id')
      ]);

      const articles = articlesResult.data || [];
      const narrations = narrationResult.data || [];
      const bibliography = bibliographyResult.data || [];

      // Calculate basic stats
      const published = articles.filter(a => a.status === 'published').length;
      const drafts = articles.filter(a => a.status === 'draft').length;
      const missingOG = articles.filter(a => !a.og_image_url).length;
      const totalArticles = articles.length;

      // Narration coverage
      const narratedSlugs = new Set(narrations.map(n => n.article_slug));
      const missingAudio = articles.filter(a => !narratedSlugs.has(a.slug)).length;
      const narrationCoverage = totalArticles > 0 
        ? ((totalArticles - missingAudio) / totalArticles) * 100 
        : 0;

      // OG coverage
      const ogCoverage = totalArticles > 0 
        ? ((totalArticles - missingOG) / totalArticles) * 100 
        : 0;

      // Bibliography coverage
      const bibArticleIds = new Set(bibliography.map(b => b.article_id));
      const hasBib = articles.filter(a => bibArticleIds.has(a.id)).length;
      const bibliographyCoverage = totalArticles > 0 
        ? (hasBib / totalArticles) * 100 
        : 0;

      // Hindi translation coverage (check if content.hi exists)
      const hasHindi = articles.filter(a => {
        try {
          const content = a.content as Record<string, any>;
          return content && content.hi && content.hi.length > 0;
        } catch {
          return false;
        }
      }).length;
      const hindiCoverage = totalArticles > 0 
        ? (hasHindi / totalArticles) * 100 
        : 0;

      // Theme distribution
      const themeMap = new Map<string, { published: number; drafts: number }>();
      articles.forEach(article => {
        const theme = article.theme || 'Other';
        const current = themeMap.get(theme) || { published: 0, drafts: 0 };
        if (article.status === 'published') {
          current.published += 1;
        } else {
          current.drafts += 1;
        }
        themeMap.set(theme, current);
      });

      const themeDistribution: ThemeData[] = Array.from(themeMap.entries())
        .map(([name, counts]) => ({
          name,
          published: counts.published,
          drafts: counts.drafts,
          total: counts.published + counts.drafts
        }))
        .sort((a, b) => b.total - a.total);

      return {
        published,
        drafts,
        missingOG,
        missingAudio,
        ogCoverage,
        narrationCoverage,
        bibliographyCoverage,
        hindiCoverage,
        themeDistribution,
        totalArticles
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
