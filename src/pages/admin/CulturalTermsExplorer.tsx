import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { BookText, TrendingUp } from "lucide-react";

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

  const { data: terms, isLoading } = useQuery({
    queryKey: ["cultural-terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_cultural_terms")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data as CulturalTerm[];
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

  const getTranslationPreview = (translations: any) => {
    if (!translations) return "No translations";
    if (typeof translations === "string") return translations;
    if (Array.isArray(translations)) {
      return translations.length > 0
        ? `${translations[0]}${translations.length > 1 ? ` +${translations.length - 1} more` : ""}`
        : "No translations";
    }
    if (typeof translations === "object") {
      const keys = Object.keys(translations);
      return keys.length > 0 ? translations[keys[0]] : "No translations";
    }
    return "No translations";
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
        const preview = getTranslationPreview(row.getValue("translations"));
        return <span className="text-sm">{preview}</span>;
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cultural Terms Explorer</h2>
        <p className="text-muted-foreground">
          Browse and manage Sanskrit and cultural terminology
        </p>
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
