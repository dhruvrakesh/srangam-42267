import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tags,
  Network,
  Languages,
  Clock,
  CheckCircle,
  FileEdit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { ContentStatusCards } from "@/components/admin/ContentStatusCards";
import { ThemeDistributionChart } from "@/components/admin/ThemeDistributionChart";
import { ContentHealthProgress } from "@/components/admin/ContentHealthProgress";
import { QuickActionsPanel } from "@/components/admin/QuickActionsPanel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentArticle {
  id: string;
  slug: string;
  title: { en: string };
  theme: string;
  status: string;
  tags: string[];
  updated_at: string;
}

// Fetch recent articles with status
function useRecentArticles() {
  return useQuery({
    queryKey: ["recent-articles-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_articles")
        .select("id, slug, title, theme, status, tags, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as RecentArticle[];
    },
  });
}

// Fetch legacy stats for comparison
function useLegacyStats() {
  return useQuery({
    queryKey: ["dashboard-legacy-stats"],
    queryFn: async () => {
      const [tagsResult, xrefsResult, termsResult] = await Promise.all([
        supabase.from("srangam_tags").select("tag_name", { count: 'exact', head: true }),
        supabase.from("srangam_cross_references").select("id", { count: 'exact', head: true }),
        supabase.from("srangam_cultural_terms").select("id", { count: 'exact', head: true }),
      ]);

      return {
        uniqueTags: tagsResult.count || 0,
        totalCrossRefs: xrefsResult.count || 0,
        totalCulturalTerms: termsResult.count || 0,
      };
    },
  });
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: legacyStats, isLoading: legacyLoading } = useLegacyStats();
  const { data: recentArticles, isLoading: articlesLoading } = useRecentArticles();

  const handlePublishComplete = () => {
    // Invalidate all relevant queries
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['recent-articles-admin'] });
    queryClient.invalidateQueries({ queryKey: ['research-stats'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Srangam knowledge base analytics and content management
        </p>
      </div>

      {/* Content Status Cards */}
      <ContentStatusCards
        published={stats?.published || 0}
        drafts={stats?.drafts || 0}
        missingOG={stats?.missingOG || 0}
        missingAudio={stats?.missingAudio || 0}
        isLoading={statsLoading}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Distribution */}
        <ThemeDistributionChart
          data={stats?.themeDistribution || []}
          isLoading={statsLoading}
        />

        {/* Content Health */}
        <ContentHealthProgress
          ogCoverage={stats?.ogCoverage || 0}
          narrationCoverage={stats?.narrationCoverage || 0}
          bibliographyCoverage={stats?.bibliographyCoverage || 0}
          hindiCoverage={stats?.hindiCoverage || 0}
          isLoading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel 
        draftCount={stats?.drafts || 0}
        onPublishComplete={handlePublishComplete}
      />

      {/* Knowledge Base Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI-Generated Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {legacyLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{legacyStats?.uniqueTags}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-References</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {legacyLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{legacyStats?.totalCrossRefs}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultural Terms</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {legacyLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{legacyStats?.totalCulturalTerms}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
          <CardDescription>
            Last 10 articles updated in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArticles?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.status === 'published' ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <FileEdit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={`/oceanic/${article.slug}`}
                        className="hover:underline text-primary"
                      >
                        {article.title?.en || "Untitled"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {article.theme}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags?.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(article.updated_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
