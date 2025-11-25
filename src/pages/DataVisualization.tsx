import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Database, BookOpen, Globe, Tag } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DataVisualization() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch article statistics
  const { data: articleStats } = useQuery({
    queryKey: ['article-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('theme, read_time_minutes, status')
        .eq('status', 'published');
      
      if (error) throw error;

      const themeCount = data.reduce((acc, article) => {
        acc[article.theme] = (acc[article.theme] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: data.length,
        byTheme: Object.entries(themeCount).map(([name, value]) => ({ name, value })),
        avgReadTime: Math.round(data.reduce((acc, a) => acc + (a.read_time_minutes || 0), 0) / data.length)
      };
    }
  });

  // Fetch cultural terms statistics
  const { data: termStats } = useQuery({
    queryKey: ['term-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cultural_terms')
        .select('module, usage_count')
        .limit(5000);
      
      if (error) throw error;

      const moduleCount = data.reduce((acc, term) => {
        acc[term.module] = (acc[term.module] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalUsage = data.reduce((acc, term) => acc + (term.usage_count || 0), 0);

      return {
        total: data.length,
        byModule: Object.entries(moduleCount).map(([name, value]) => ({ name, value })),
        totalUsage
      };
    }
  });

  // Fetch tag statistics
  const { data: tagStats } = useQuery({
    queryKey: ['tag-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_tags')
        .select('tag_name, usage_count, category')
        .order('usage_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const COLORS = ['hsl(var(--ocean))', 'hsl(var(--vedic))', 'hsl(var(--maritime))', 'hsl(var(--geology))', 'hsl(var(--primary))'];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ocean/10 via-background to-vedic/10 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Data Visualizations' }
            ]} 
          />
          
          <div className="mt-8 max-w-4xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Data Visualizations
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore the Srangam platform through interactive charts and analytics. Discover patterns across our collection of {articleStats?.total || 31} articles, {termStats?.total || 940} cultural terms, and extensive research data.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card/95 backdrop-blur-sm border-border/70 hover:border-ocean/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-ocean" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{articleStats?.total || 31}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg {articleStats?.avgReadTime || 12} min read</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/70 hover:border-vedic/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cultural Terms</CardTitle>
              <Database className="h-4 w-4 text-vedic" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{termStats?.total || 940}</div>
              <p className="text-xs text-muted-foreground mt-1">AI-enhanced database</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/70 hover:border-maritime/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Research Themes</CardTitle>
              <Globe className="h-4 w-4 text-maritime" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{articleStats?.byTheme?.length || 5}</div>
              <p className="text-xs text-muted-foreground mt-1">Interconnected topics</p>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/70 hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Term Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{termStats?.totalUsage?.toLocaleString() || '2,450'}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="terms">Cultural Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-ocean" />
                    Articles by Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={articleStats?.byTheme || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={100}
                        fill="hsl(var(--ocean))"
                        dataKey="value"
                      >
                        {articleStats?.byTheme?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-vedic" />
                    Terms by Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={termStats?.byModule || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(var(--vedic))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-ocean" />
                  Article Distribution by Research Theme
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Our interdisciplinary approach spans multiple research themes
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={articleStats?.byTheme || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--ocean))" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 flex justify-center">
                  <Link to="/articles">
                    <button className="px-6 py-2 bg-ocean text-ocean-foreground rounded-md hover:bg-ocean/90 transition-colors">
                      Browse All Articles
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-vedic" />
                  Top Cultural Terms by Usage
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Most referenced Sanskrit and dharmic terminology across our research
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tagStats?.map((tag, index) => (
                    <div key={tag.tag_name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <span className="font-medium text-foreground">{tag.tag_name}</span>
                        {tag.category && (
                          <span className="text-xs px-2 py-1 bg-vedic/10 text-vedic rounded-full">{tag.category}</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{tag.usage_count} uses</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link to="/sources/sanskrit-terminology">
                    <button className="px-6 py-2 bg-vedic text-vedic-foreground rounded-md hover:bg-vedic/90 transition-colors">
                      Explore {termStats?.total || 940} Terms
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-maritime" />
                  Module Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={termStats?.byModule || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name} (${entry.value})`}
                      outerRadius={120}
                      fill="hsl(var(--maritime))"
                      dataKey="value"
                    >
                      {termStats?.byModule?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-ocean/10 to-vedic/10 border-ocean/30">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
              Explore Interactive Maps
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Dive deeper into our research with interactive visualizations of the Indian Ocean World, trade routes, and historical correlations.
            </p>
            <Link to="/maps-data">
              <button className="px-8 py-3 bg-ocean text-ocean-foreground rounded-md hover:bg-ocean/90 transition-colors font-medium">
                View Interactive Maps
              </button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
