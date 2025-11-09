import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, BookText, TrendingUp } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const MODULE_COLORS = {
  'vedic': 'hsl(var(--chart-1))',
  'puranic': 'hsl(var(--chart-2))',
  'buddhist': 'hsl(var(--chart-3))',
  'jain': 'hsl(var(--chart-4))',
  'general': 'hsl(var(--chart-5))',
  'other': 'hsl(var(--muted))',
};

export default function CulturalTermsExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const { data: terms, isLoading } = useQuery({
    queryKey: ['cultural-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_cultural_terms')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter and search terms
  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    
    return terms.filter(term => {
      const matchesSearch = !searchQuery || 
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.display_term?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesModule = moduleFilter === "all" || term.module === moduleFilter;
      
      return matchesSearch && matchesModule;
    });
  }, [terms, searchQuery, moduleFilter]);

  // Get unique modules
  const modules = useMemo(() => {
    if (!terms) return [];
    return Array.from(new Set(terms.map(t => t.module))).filter(Boolean);
  }, [terms]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!terms) return { total: 0, totalUsages: 0, avgUsage: 0 };
    
    const totalUsages = terms.reduce((sum, term) => sum + (term.usage_count || 0), 0);
    return {
      total: terms.length,
      totalUsages,
      avgUsage: terms.length > 0 ? (totalUsages / terms.length).toFixed(2) : 0
    };
  }, [terms]);

  // Prepare top 30 terms data
  const top30Terms = useMemo(() => {
    if (!terms) return [];
    return terms
      .slice(0, 30)
      .map(term => ({
        name: term.display_term || term.term,
        usage: term.usage_count || 0,
        module: term.module
      }));
  }, [terms]);

  // Prepare module breakdown data
  const moduleBreakdown = useMemo(() => {
    if (!terms) return [];
    
    const breakdown = terms.reduce((acc, term) => {
      const module = term.module || 'other';
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([module, count]) => ({
      name: module,
      value: count
    }));
  }, [terms]);

  // Get translation preview
  const getTranslationPreview = (translations: any) => {
    if (!translations) return "—";
    const langs = Object.keys(translations);
    if (langs.length === 0) return "—";
    
    const firstLang = langs[0];
    const translation = translations[firstLang]?.translation || "—";
    const extra = langs.length > 1 ? ` +${langs.length - 1} more` : "";
    return `${translation}${extra}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Cultural Terms Explorer
          </h2>
          <p className="text-muted-foreground">
            Browse and manage Sanskrit and cultural terminology
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading cultural terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Cultural Terms Explorer
        </h2>
        <p className="text-muted-foreground">
          Browse and manage Sanskrit and cultural terminology
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Terms</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Unique cultural terms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsages}</div>
            <p className="text-xs text-muted-foreground">Across all articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUsage}</div>
            <p className="text-xs text-muted-foreground">Per term</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Terms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cultural Terms ({filteredTerms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Display</TableHead>
                  <TableHead>Translations</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-right">Usage Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No terms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTerms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-mono text-sm">{term.term}</TableCell>
                      <TableCell>{term.display_term || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {getTranslationPreview(term.translations)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{term.module}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{term.usage_count || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 30 Terms Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 30 Terms by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                usage: {
                  label: "Usage Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top30Terms} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="usage" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Module Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Terms by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                vedic: { label: "Vedic", color: "hsl(var(--chart-1))" },
                puranic: { label: "Puranic", color: "hsl(var(--chart-2))" },
                buddhist: { label: "Buddhist", color: "hsl(var(--chart-3))" },
                jain: { label: "Jain", color: "hsl(var(--chart-4))" },
                general: { label: "General", color: "hsl(var(--chart-5))" },
                other: { label: "Other", color: "hsl(var(--muted))" },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moduleBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MODULE_COLORS[entry.name as keyof typeof MODULE_COLORS] || MODULE_COLORS.other} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
