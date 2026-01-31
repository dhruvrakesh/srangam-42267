import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, createSortableHeader } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, FileText, BookOpen, RefreshCw, Loader2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArticleEditDialog } from "@/components/admin/ArticleEditDialog";

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
  const { toast } = useToast();
  const [retagging, setRetagging] = useState(false);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

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

  const stats = useMemo(() => {
    if (!articles) return { total: 0, published: 0, draft: 0, archived: 0, untagged: 0 };
    
    return {
      total: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      draft: articles.filter((a) => a.status === "draft").length,
      archived: articles.filter((a) => a.status === "archived").length,
      untagged: articles.filter((a) => !a.tags || a.tags.length === 0).length,
    };
  }, [articles]);

  const retagUntaggedArticles = async () => {
    if (!articles) return;
    
    const untaggedArticles = articles.filter(a => !a.tags || a.tags.length === 0);
    
    if (untaggedArticles.length === 0) {
      toast({
        title: "No articles to retag",
        description: "All articles already have tags.",
      });
      return;
    }

    setRetagging(true);

    const { data, error } = await supabase.functions.invoke('batch-enrich-terms', {
      body: {
        articleSlugs: untaggedArticles.map(a => a.slug)
      }
    });

    setRetagging(false);

    if (error) {
      toast({
        title: "Retagging failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['admin-articles'] });

    toast({
      title: "Retagging complete",
      description: `Successfully retagged ${data.summary.successful} articles.`,
    });
  };

  const handleDeleteArticle = async (article: Article) => {
    setIsDeleting(true);
    
    try {
      const articleId = article.id;
      
      // Delete related records in correct order (foreign key dependencies)
      // 1. Cross references (as source and target)
      await supabase.from('srangam_cross_references').delete().eq('source_article_id', articleId);
      await supabase.from('srangam_cross_references').delete().eq('target_article_id', articleId);
      
      // 2. Markdown sources
      await supabase.from('srangam_markdown_sources').delete().eq('article_id', articleId);
      
      // 3. Article metadata
      await supabase.from('srangam_article_metadata').delete().eq('article_id', articleId);
      
      // 4. Article versions
      await supabase.from('srangam_article_versions').delete().eq('article_id', articleId);
      
      // 5. Article chapters
      await supabase.from('srangam_article_chapters').delete().eq('article_id', articleId);
      
      // 6. Article bibliography
      await supabase.from('srangam_article_bibliography').delete().eq('article_id', articleId);
      
      // 7. Article analytics
      await supabase.from('srangam_article_analytics').delete().eq('article_id', articleId);
      
      // 8. Translation queue
      await supabase.from('srangam_translation_queue').delete().eq('article_id', articleId);
      
      // 9. Purana references
      await supabase.from('srangam_purana_references').delete().eq('article_id', articleId);
      
      // 10. Finally, delete the article itself
      const { error } = await supabase.from('srangam_articles').delete().eq('id', articleId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      
      toast({
        title: "Article deleted",
        description: `Successfully deleted "${article.title?.en}" and all related data.`,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteArticle(null);
    }
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
                  <DropdownMenuItem onClick={() => setEditArticle(article)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Metadata
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setDeleteArticle(article)}
                  >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteArticle} onOpenChange={() => setDeleteArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteArticle?.title?.en}"</strong> and all related data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cross-references (source & target)</li>
                <li>Markdown sources</li>
                <li>Metadata & analytics</li>
                <li>Article versions</li>
                <li>Bibliography & Purana references</li>
              </ul>
              <br />
              <strong className="text-destructive">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteArticle && handleDeleteArticle(deleteArticle)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Metadata Dialog */}
      <ArticleEditDialog
        article={editArticle}
        open={!!editArticle}
        onOpenChange={() => setEditArticle(null)}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
          setEditArticle(null);
        }}
      />
    </div>
  );
}
