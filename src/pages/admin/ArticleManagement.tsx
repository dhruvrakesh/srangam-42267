import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, createSortableHeader } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, FileText, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type Article = {
  id: string;
  slug: string;
  title: any;
  theme: string;
  author: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const themeColors: Record<string, string> = {
  "Ancient India": "hsl(var(--chart-1))",
  "Vedic": "hsl(var(--chart-2))",
  "Maritime": "hsl(var(--chart-3))",
  "Cultural": "hsl(var(--chart-4))",
  "Historical": "hsl(var(--chart-5))",
};

export default function ArticleManagement() {
  const { isAdmin } = useAuth();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
    archived: articles.filter((a) => a.status === "archived").length,
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: createSortableHeader("Title"),
      cell: ({ row }) => {
        const article = row.original;
        const title = article.title?.en || "Untitled";
        const titleTa = article.title?.ta;
        return (
          <div className="flex flex-col gap-1">
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline flex items-center gap-1"
            >
              {title}
              <ExternalLink className="h-3 w-3" />
            </a>
            {titleTa && (
              <span className="text-xs text-muted-foreground">{titleTa}</span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const titleA = rowA.original.title?.en || "";
        const titleB = rowB.original.title?.en || "";
        return titleA.localeCompare(titleB);
      },
    },
    {
      accessorKey: "slug",
      header: createSortableHeader("Slug"),
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          {row.getValue("slug")}
        </code>
      ),
    },
    {
      accessorKey: "theme",
      header: createSortableHeader("Theme"),
      cell: ({ row }) => {
        const theme = row.getValue("theme") as string;
        return (
          <Badge
            style={{
              backgroundColor: themeColors[theme] || "hsl(var(--muted))",
              color: "hsl(var(--background))",
            }}
          >
            {theme}
          </Badge>
        );
      },
    },
    {
      accessorKey: "author",
      header: createSortableHeader("Author"),
    },
    {
      accessorKey: "status",
      header: createSortableHeader("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "published"
            ? "default"
            : status === "draft"
            ? "secondary"
            : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        if (!tags || tags.length === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1 flex-wrap max-w-[200px]">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: createSortableHeader("Created"),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.getValue("created_at")), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: createSortableHeader("Updated"),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.getValue("updated_at")), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const article = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => window.open(`/articles/${article.slug}`, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Article
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(article.slug)}
              >
                Copy Slug
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Edit Metadata</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Article
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Article Management</h1>
        <p className="text-muted-foreground">
          Manage all articles in the Srangam knowledge base
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            Browse, search, and manage all articles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={articles}
            searchKey="slug"
            searchPlaceholder="Search articles..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
