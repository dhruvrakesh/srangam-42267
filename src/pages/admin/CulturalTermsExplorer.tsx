import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DataTable, createSortableHeader } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { BookText, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MODULE_COLORS = {
  'vedic': 'hsl(var(--chart-1))',
  'puranic': 'hsl(var(--chart-2))',
  'buddhist': 'hsl(var(--chart-3))',
  'jain': 'hsl(var(--chart-4))',
  'general': 'hsl(var(--chart-5))',
  'default': 'hsl(var(--muted))',
};

type CulturalTerm = {
  id: string;
  term: string;
  display_term: string;
  translations: any;
  module: string;
  usage_count: number;
};

export default function CulturalTermsExplorer() {
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [enriching, setEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: terms, isLoading } = useQuery({
    queryKey: ["cultural-terms"],
    queryFn: async () => {
      const allData = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from("srangam_cultural_terms")
          .select("*")
          .order("usage_count", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allData.push(...data);
        if (data.length < batchSize) break;
        from += batchSize;
      }
      
      return allData as CulturalTerm[];
    },
  });

  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    
    let filtered = [...terms];
    
    if (moduleFilter !== "all") {
      filtered = filtered.filter((term) => term.module === moduleFilter);
    }
    
    return filtered;
  }, [terms, moduleFilter]);

  const modules = useMemo(() => {
    if (!terms) return [];
    return Array.from(new Set(terms.map((t) => t.module))).filter(Boolean);
  }, [terms]);

  const stats = useMemo(() => {
    if (!terms) return { total: 0, totalUsages: 0, avgUsage: 0 };
    const totalUsages = terms.reduce((sum, term) => sum + (term.usage_count || 0), 0);
    return {
      total: terms.length,
      totalUsages,
      avgUsage: terms.length > 0 ? (totalUsages / terms.length).toFixed(2) : 0,
    };
  }, [terms]);

  const top30Terms = useMemo(() => {
    if (!terms) return [];
    return terms
      .slice(0, 30)
      .map((term) => ({
        name: term.display_term || term.term,
        usage: term.usage_count || 0,
        module: term.module,
      }));
  }, [terms]);

  const moduleBreakdown = useMemo(() => {
    if (!terms) return [];
    const breakdown = terms.reduce((acc, term) => {
      const module = term.module || "default";
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(breakdown).map(([module, count]) => ({
      name: module,
      value: count,
    }));
  }, [terms]);

  const getTranslationPreview = (translations: any): string => {
    if (!translations) return "No translations";
    if (typeof translations === "string") return translations;
    
    // Handle new enriched format: { en: { translation, etymology, ... } }
    if (typeof translations === "object" && !Array.isArray(translations)) {
      const keys = Object.keys(translations);
      if (keys.length === 0) return "No translations";
      
      // Check if it's the new enriched format
      const firstKey = keys[0];
      const firstValue = translations[firstKey];
      
      if (firstValue && typeof firstValue === "object" && firstValue.translation) {
        // New format: Show count of languages
        return `${keys.length} language${keys.length > 1 ? 's' : ''} (${keys.join(', ')})`;
      }
      
      // Old format: Just a string value
      return typeof firstValue === "string" ? firstValue : "Invalid format";
    }
    
    if (Array.isArray(translations)) {
      return translations.length > 0
        ? `${translations[0]}${translations.length > 1 ? ` +${translations.length - 1} more` : ""}`
        : "No translations";
    }
    
    return "No translations";
  };

  const enrichTermsBatch = async () => {
    if (!terms || terms.length === 0) return;

    const termsToEnrich = terms.filter(term => {
      const translations = term.translations;
      if (!translations || typeof translations !== 'object') return true;
      // Check for NEW enriched format (object with .translation property)
      const hasEnglish = translations.en && 
                         typeof translations.en === 'object' &&
                         translations.en.translation;
      // Also re-enrich if it's still in OLD string format
      const isOldFormat = typeof translations.en === 'string';
      return !hasEnglish || isOldFormat;
    });

    if (termsToEnrich.length === 0) {
      toast({
        title: "All terms enriched",
        description: "All cultural terms already have translations.",
      });
      return;
    }

    setEnriching(true);
    setEnrichmentProgress({ current: 0, total: termsToEnrich.length });

    let successCount = 0;
    let failCount = 0;

    const batchSize = 5;
    for (let i = 0; i < termsToEnrich.length; i += batchSize) {
      const batch = termsToEnrich.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (term) => {
          const { data, error } = await supabase.functions.invoke('enrich-cultural-term', {
            body: {
              termId: term.id,
              term: term.term,
              displayTerm: term.display_term
            }
          });

          if (error) throw error;
          return data;
        })
      );

      results.forEach((result, idx) => {
        setEnrichmentProgress(prev => ({ ...prev, current: i + idx + 1 }));
        
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failCount++;
          console.error('Enrichment failed:', result.reason);
        }
      });

      if (i + batchSize < termsToEnrich.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setEnriching(false);
    
    queryClient.invalidateQueries({ queryKey: ['cultural-terms'] });

    toast({
      title: "Enrichment Complete",
      description: `Successfully enriched ${successCount} terms. ${failCount > 0 ? `${failCount} failed.` : ''}`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const columns: ColumnDef<CulturalTerm>[] = [
    {
      accessorKey: "term",
      header: createSortableHeader("Term"),
      cell: ({ row }) => (
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {row.getValue("term")}
        </code>
      ),
    },
    {
      accessorKey: "display_term",
      header: createSortableHeader("Display Term"),
      cell: ({ row }) => {
        const displayTerm = row.getValue("display_term") as string;
        return displayTerm || <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "translations",
      header: "Translations",
      cell: ({ row }) => {
        const translations = row.getValue("translations");
        const preview = getTranslationPreview(translations);
        return (
          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
            {preview}
          </div>
        );
      },
    },
    {
      accessorKey: "module",
      header: createSortableHeader("Module"),
      cell: ({ row }) => {
        const module = row.getValue("module") as string;
        const moduleColor = MODULE_COLORS[module as keyof typeof MODULE_COLORS] || MODULE_COLORS.default;
        return (
          <Badge
            style={{
              backgroundColor: moduleColor,
              color: "hsl(var(--background))",
            }}
          >
            {module}
          </Badge>
        );
      },
    },
    {
      accessorKey: "usage_count",
      header: createSortableHeader("Usage Count"),
      cell: ({ row }) => {
        const count = row.getValue("usage_count") as number;
        return <span className="font-medium">{count}</span>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading cultural terms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cultural Terms Explorer</h2>
          <p className="text-muted-foreground">
            Browse and manage Sanskrit and cultural terminology
          </p>
        </div>
        <Button 
          onClick={enrichTermsBatch} 
          disabled={enriching}
          className="gap-2"
        >
          {enriching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enriching {enrichmentProgress.current}/{enrichmentProgress.total}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich Terms with AI
            </>
          )}
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Filter cultural terms by module</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultural Terms Database</CardTitle>
          <CardDescription>
            Showing {filteredTerms.length} terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredTerms}
            searchKey="term"
            searchPlaceholder="Search terms, translations..."
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 30 Terms by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top30Terms} layout="vertical" margin={{ left: 100, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} fontSize={12} />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
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
                    <Cell key={`cell-${index}`} fill={MODULE_COLORS[entry.name as keyof typeof MODULE_COLORS] || MODULE_COLORS.default} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
