import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, parseISO } from "date-fns";

export default function ImportAnalytics() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('author, created_at, read_time_minutes, tags, title, slug')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!articles) return { totalArticles: 0, totalAuthors: 0, avgReadTime: 0, latestImport: null };
    
    const uniqueAuthors = new Set(articles.map(a => a.author)).size;
    const totalReadTime = articles.reduce((sum, a) => sum + (a.read_time_minutes || 0), 0);
    const avgReadTime = articles.length > 0 ? (totalReadTime / articles.length).toFixed(1) : 0;
    const latestImport = articles.length > 0 ? articles[articles.length - 1].created_at : null;

    return {
      totalArticles: articles.length,
      totalAuthors: uniqueAuthors,
      avgReadTime,
      latestImport
    };
  }, [articles]);

  // Prepare timeline data (imports by date)
  const timelineData = useMemo(() => {
    if (!articles) return [];
    
    const importsByDate = articles.reduce((acc, article) => {
      const date = format(parseISO(article.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(importsByDate)
      .map(([date, count]) => ({
        date,
        imports: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [articles]);

  // Prepare word count distribution (using read_time as proxy)
  const wordCountDistribution = useMemo(() => {
    if (!articles) return [];
    
    const buckets = {
      '0-5 min': 0,
      '6-10 min': 0,
      '11-15 min': 0,
      '16-20 min': 0,
      '21+ min': 0
    };

    articles.forEach(article => {
      const readTime = article.read_time_minutes || 0;
      if (readTime <= 5) buckets['0-5 min']++;
      else if (readTime <= 10) buckets['6-10 min']++;
      else if (readTime <= 15) buckets['11-15 min']++;
      else if (readTime <= 20) buckets['16-20 min']++;
      else buckets['21+ min']++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count
    }));
  }, [articles]);

  // Prepare top authors data
  const topAuthors = useMemo(() => {
    if (!articles) return [];
    
    const authorStats = articles.reduce((acc, article) => {
      const author = article.author;
      if (!acc[author]) {
        acc[author] = {
          name: author,
          articleCount: 0,
          totalReadTime: 0,
          tags: new Set()
        };
      }
      acc[author].articleCount++;
      acc[author].totalReadTime += article.read_time_minutes || 0;
      
      if (article.tags) {
        article.tags.forEach((tag: string) => acc[author].tags.add(tag));
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(authorStats)
      .map((author: any) => ({
        name: author.name,
        articleCount: author.articleCount,
        totalReadTime: author.totalReadTime,
        uniqueTags: author.tags.size
      }))
      .sort((a, b) => b.articleCount - a.articleCount);
  }, [articles]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Import Analytics
          </h2>
          <p className="text-muted-foreground">
            Track article import trends and statistics
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Import Analytics
        </h2>
        <p className="text-muted-foreground">
          Track article import trends and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Imported to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuthors}</div>
            <p className="text-xs text-muted-foreground">Unique contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReadTime} min</div>
            <p className="text-xs text-muted-foreground">Per article</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Import</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.latestImport ? format(parseISO(stats.latestImport), 'MMM d') : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.latestImport ? format(parseISO(stats.latestImport), 'yyyy') : 'No imports'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Import Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              imports: {
                label: "Imports",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  fontSize={12}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="imports" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Word Count Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Read Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Articles",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wordCountDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Authors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Articles</TableHead>
                  <TableHead className="text-right">Total Read Time</TableHead>
                  <TableHead className="text-right">Unique Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAuthors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No authors found
                    </TableCell>
                  </TableRow>
                ) : (
                  topAuthors.map((author) => (
                    <TableRow key={author.name}>
                      <TableCell className="font-medium">{author.name}</TableCell>
                      <TableCell className="text-right">{author.articleCount}</TableCell>
                      <TableCell className="text-right">{author.totalReadTime} min</TableCell>
                      <TableCell className="text-right">{author.uniqueTags}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
