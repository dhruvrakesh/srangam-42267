import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Tags,
  Network,
  Languages,
  TrendingUp,
  Clock,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalArticles: number;
  articlesAddedToday: number;
  uniqueTags: number;
  avgTagUsage: number;
  totalCrossRefs: number;
  avgCrossRefStrength: number;
  totalCulturalTerms: number;
  totalTermUsages: number;
}

interface RecentArticle {
  id: string;
  slug: string;
  title: { en: string };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Get article stats
      const { data: articles, error: articlesError } = await supabase
        .from("srangam_articles")
        .select("id, created_at");

      if (articlesError) throw articlesError;

      const totalArticles = articles?.length || 0;
      const articlesAddedToday = articles?.filter((a) =>
        a.created_at?.startsWith(today)
      ).length || 0;

      // Get tag stats
      const { data: tags, error: tagsError } = await supabase
        .from("srangam_tags")
        .select("tag_name, usage_count");

      if (tagsError) throw tagsError;

      const uniqueTags = tags?.length || 0;
      const avgTagUsage = tags?.length
        ? (tags.reduce((sum, t) => sum + (t.usage_count || 0), 0) / tags.length).toFixed(2)
        : 0;

      // Get cross-reference stats
      const { data: xrefs, error: xrefsError } = await supabase
        .from("srangam_cross_references")
        .select("strength");

      if (xrefsError) throw xrefsError;

      const totalCrossRefs = xrefs?.length || 0;
      const avgCrossRefStrength = xrefs?.length
        ? (xrefs.reduce((sum, x) => sum + (x.strength || 0), 0) / xrefs.length).toFixed(1)
        : 0;

      // Get cultural terms stats with pagination
      const allTerms = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data: termsBatch, error: termsError } = await supabase
          .from("srangam_cultural_terms")
          .select("usage_count")
          .range(from, from + batchSize - 1);

        if (termsError) throw termsError;
        if (!termsBatch || termsBatch.length === 0) break;
        
        allTerms.push(...termsBatch);
        if (termsBatch.length < batchSize) break;
        from += batchSize;
      }

      const terms = allTerms;

      const totalCulturalTerms = terms?.length || 0;
      const totalTermUsages = terms?.reduce((sum, t) => sum + (t.usage_count || 0), 0) || 0;

      return {
        totalArticles,
        articlesAddedToday,
        uniqueTags,
        avgTagUsage,
        totalCrossRefs,
        avgCrossRefStrength,
        totalCulturalTerms,
        totalTermUsages,
      } as DashboardStats;
    },
  });

  // Fetch recent imports
  const { data: recentArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_articles")
        .select("id, slug, title, tags, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as RecentArticle[];
    },
  });

  // Fetch tag growth data (mock for now - would need historical tracking)
  const tagGrowthData = [
    { date: "2025-11-01", tags: 0 },
    { date: "2025-11-05", tags: 5 },
    { date: "2025-11-09", tags: stats?.uniqueTags || 11 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Srangam knowledge base analytics and recent activity
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Articles Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalArticles}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.articlesAddedToday} today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI-Generated Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.uniqueTags}</div>
                <p className="text-xs text-muted-foreground">
                  avg {stats?.avgTagUsage} usage per tag
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cross-References Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-References</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCrossRefs}</div>
                <p className="text-xs text-muted-foreground">
                  avg strength {stats?.avgCrossRefStrength}/10
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cultural Terms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultural Terms</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCulturalTerms}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalTermUsages} total usages
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Imports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            Last 10 articles imported into the database
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
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Imported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArticles?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/oceanic/${article.slug}`}
                        className="hover:underline text-primary"
                      >
                        {article.title?.en || "Untitled"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {article.slug}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(article.updated_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tag Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Growth Timeline</CardTitle>
          <CardDescription>
            Cumulative unique tags over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tagGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="tags"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
