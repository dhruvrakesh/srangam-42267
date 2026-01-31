import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export interface ThemeData {
  name: string;
  published: number;
  drafts: number;
  total: number;
}

interface ThemeDistributionChartProps {
  data: ThemeData[];
  isLoading: boolean;
}

// Dharmic color palette matching researchThemes.ts
const THEME_COLORS: Record<string, string> = {
  "Ancient India": "hsl(28, 87%, 62%)",        // saffron
  "Indian Ocean World": "hsl(195, 68%, 45%)",  // peacock-blue
  "Scripts & Inscriptions": "hsl(240, 60%, 50%)", // indigo
  "Geology & Deep Time": "hsl(16, 68%, 55%)",  // terracotta
  "Empires & Exchange": "hsl(45, 88%, 48%)",   // turmeric
  "Sacred Ecology": "hsl(330, 60%, 65%)",      // lotus pink
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Published: <span className="font-medium text-foreground">{data.published}</span>
        </p>
        {data.drafts > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Drafts: <span className="font-medium">{data.drafts}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }: any) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload?.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.value}
            <span className="ml-1 font-medium text-foreground">
              ({entry.payload.total})
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ThemeDistributionChart({ data, isLoading }: ThemeDistributionChartProps) {
  // Prepare data for pie chart with colors
  const chartData = data.map(theme => ({
    ...theme,
    color: THEME_COLORS[theme.name] || "hsl(var(--muted))"
  }));

  const totalArticles = data.reduce((sum, t) => sum + t.total, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Distribution</CardTitle>
          <CardDescription>Articles by research theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Theme Distribution</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalArticles} total
          </span>
        </CardTitle>
        <CardDescription>Articles by research theme (published + drafts)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="total"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
