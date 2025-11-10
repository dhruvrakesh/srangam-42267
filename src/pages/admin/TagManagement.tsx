import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag as TagIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CATEGORIES = [
  "Period",
  "Concept",
  "Location",
  "Methodology",
  "Subject",
  "Uncategorized",
];

const CATEGORY_COLORS = {
  Period: "hsl(var(--chart-1))",
  Concept: "hsl(var(--chart-2))",
  Location: "hsl(var(--chart-3))",
  Methodology: "hsl(var(--chart-4))",
  Subject: "hsl(var(--chart-5))",
  Uncategorized: "hsl(var(--muted))",
};

interface Tag {
  id: string;
  tag_name: string;
  category: string | null;
  description: string | null;
  usage_count: number;
  last_used: string | null;
  related_tags: any;
}

export default function TagManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "usage" | "category">("usage");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeleteingTag] = useState<Tag | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { isAdmin, isLoading: isCheckingRole } = useAuth();

  // Fetch tags
  const { data: tags, isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srangam_tags")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data as Tag[];
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async (tag: Partial<Tag> & { id: string }) => {
      const { data, error } = await supabase
        .from("srangam_tags")
        .update({
          tag_name: tag.tag_name,
          category: tag.category,
          description: tag.description,
        })
        .eq("id", tag.id)
        .select();

      if (error) throw error;
      
      // Verify row was actually updated
      if (!data || data.length === 0) {
        throw new Error("Failed to update tag - no rows modified. Check authentication and permissions.");
      }
      
      return data[0];
    },
    onMutate: async (updatedTag) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin-tags"] });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData(["admin-tags"]);

      // Optimistically update cache
      queryClient.setQueryData(["admin-tags"], (old: Tag[] | undefined) =>
        old?.map((tag) => 
          tag.id === updatedTag.id 
            ? { ...tag, ...updatedTag }
            : tag
        ) || []
      );

      return { previousTags };
    },
    onSuccess: () => {
      toast({
        title: "Tag updated",
        description: "Tag has been successfully updated.",
      });
      setEditDialogOpen(false);
      setEditingTag(null);
    },
    onError: (error, updatedTag, context) => {
      // Rollback on error
      if (context?.previousTags) {
        queryClient.setQueryData(["admin-tags"], context.previousTags);
      }
      
      console.error("Update tag error:", error);
      toast({
        title: "Error",
        description: `Failed to update tag: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("srangam_tags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast({
        title: "Tag deleted",
        description: "Tag has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setDeleteingTag(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort tags
  const filteredAndSortedTags = useMemo(() => {
    if (!tags) return [];

    let filtered = tags.filter((tag) => {
      const matchesSearch = tag.tag_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "uncategorized" && !tag.category) ||
        tag.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.tag_name.localeCompare(b.tag_name);
      } else if (sortBy === "usage") {
        comparison = a.usage_count - b.usage_count;
      } else if (sortBy === "category") {
        const catA = a.category || "Uncategorized";
        const catB = b.category || "Uncategorized";
        comparison = catA.localeCompare(catB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [tags, searchQuery, categoryFilter, sortBy, sortOrder]);

  // Category distribution data for pie chart
  const categoryData = useMemo(() => {
    if (!tags) return [];

    const distribution = tags.reduce((acc, tag) => {
      const category = tag.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [tags]);

  // Top tags data for bar chart
  const topTagsData = useMemo(() => {
    if (!tags) return [];
    return tags
      .slice(0, 20)
      .map((tag) => ({
        name: tag.tag_name.length > 15 ? tag.tag_name.substring(0, 15) + "..." : tag.tag_name,
        usage: tag.usage_count,
        category: tag.category || "Uncategorized",
      }));
  }, [tags]);

  const toggleSort = (column: "name" | "usage" | "category") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleEdit = (tag: Tag) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit tags",
        variant: "destructive",
      });
      return;
    }
    setEditingTag(tag);
    setEditDialogOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete tags",
        variant: "destructive",
      });
      return;
    }
    setDeleteingTag(tag);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTag) {
      updateTagMutation.mutate(editingTag);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTag) {
      deleteTagMutation.mutate(deletingTag.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Tag Management
        </h2>
        <p className="text-muted-foreground">
          Manage and analyze AI-generated tags with advanced categorization
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Usage Per Tag
            </CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags && tags.length > 0
                ? (
                    tags.reduce((sum, t) => sum + t.usage_count, 0) /
                    tags.length
                  ).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorized Tags
            </CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags?.filter((t) => t.category).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Table</CardTitle>
          <CardDescription>
            Search, filter, and manage your article tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {CATEGORIES.filter((c) => c !== "Uncategorized").map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSort("name")}
                      className="h-8 px-2"
                    >
                      Tag Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSort("category")}
                      className="h-8 px-2"
                    >
                      Category
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSort("usage")}
                      className="h-8 px-2"
                    >
                      Usage
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTags.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No tags found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        {tag.tag_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tag.category ? "default" : "outline"}
                          className="capitalize"
                        >
                          {tag.category || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tag.usage_count}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {tag.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tag)}
                            disabled={!isAdmin || isCheckingRole}
                            title={!isAdmin ? "Admin access required" : "Edit tag"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tag)}
                            disabled={!isAdmin || isCheckingRole || tag.usage_count > 0}
                            title={
                              !isAdmin 
                                ? "Admin access required" 
                                : tag.usage_count > 0 
                                ? "Cannot delete tag in use" 
                                : "Delete tag"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
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
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Distribution of tags across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "hsl(var(--muted))"}
                    />
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
            <CardTitle>Top 20 Tags by Usage</CardTitle>
            <CardDescription>Most frequently used tags</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTagsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update tag name, category, and description
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={editingTag.tag_name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, tag_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingTag.category || "uncategorized"}
                  onValueChange={(value) =>
                    setEditingTag({
                      ...editingTag,
                      category: value === "uncategorized" ? null : value,
                    })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {CATEGORIES.filter((c) => c !== "Uncategorized").map(
                      (cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingTag.description || ""}
                  onChange={(e) =>
                    setEditingTag({
                      ...editingTag,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateTagMutation.isPending}>
              {updateTagMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tag? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deletingTag && (
            <div className="py-4">
              <p className="font-medium">
                Tag: <span className="text-muted-foreground">{deletingTag.tag_name}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Usage count: {deletingTag.usage_count}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? "Deleting..." : "Delete Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
