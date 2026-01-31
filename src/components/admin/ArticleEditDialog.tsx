import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUniqueAuthors } from "@/hooks/useUniqueAuthors";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "Ancient India", label: "Ancient India" },
  { value: "Indian Ocean World", label: "Indian Ocean World" },
  { value: "Scripts & Inscriptions", label: "Scripts & Inscriptions" },
  { value: "Geology & Deep Time", label: "Geology & Deep Time" },
  { value: "Empires & Exchange", label: "Empires & Exchange" },
  { value: "Sacred Ecology", label: "Sacred Ecology" },
];

interface Article {
  id: string;
  slug: string;
  title: any;
  theme: string;
  author: string;
  status: string;
  tags: string[];
  featured?: boolean;
  dek?: any;
}

interface ArticleEditDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface FormData {
  title_en: string;
  author: string;
  theme: string;
  status: 'draft' | 'published';
  tags: string[];
  dek_en: string;
  featured: boolean;
}

export function ArticleEditDialog({ article, open, onOpenChange, onSave }: ArticleEditDialogProps) {
  const { toast } = useToast();
  const { data: authors = [] } = useUniqueAuthors();
  const [isSaving, setIsSaving] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    title_en: '',
    author: '',
    theme: '',
    status: 'draft',
    tags: [],
    dek_en: '',
    featured: false,
  });

  // Initialize form when article changes
  useEffect(() => {
    if (article) {
      setFormData({
        title_en: article.title?.en || '',
        author: article.author || '',
        theme: article.theme || '',
        status: (article.status === 'published' ? 'published' : 'draft'),
        tags: article.tags || [],
        dek_en: article.dek?.en || '',
        featured: article.featured || false,
      });
    }
  }, [article]);

  const handleSave = async () => {
    if (!article) return;
    
    // Validation
    if (!formData.title_en.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.author.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.theme) {
      toast({
        title: "Validation Error",
        description: "Theme is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        title: { 
          ...article.title, 
          en: formData.title_en.trim(),
        },
        author: formData.author.trim(),
        theme: formData.theme,
        status: formData.status,
        tags: formData.tags,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      };

      // Only update dek if it has a value
      if (formData.dek_en.trim()) {
        updateData.dek = { 
          ...(article.dek || {}), 
          en: formData.dek_en.trim(),
        };
      }

      const { error } = await supabase
        .from('srangam_articles')
        .update(updateData)
        .eq('id', article.id);

      if (error) throw error;
      
      toast({
        title: "Article updated",
        description: `Successfully updated "${formData.title_en}"`,
      });
      
      onSave();
    } catch (err: any) {
      console.error('Update error:', err);
      toast({ 
        title: "Update failed", 
        description: err.message || "Failed to update article",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  if (!article) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Article Metadata</SheetTitle>
          <SheetDescription>
            Update metadata for <span className="font-medium">{article.slug}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title (English) *</Label>
            <Input
              id="title"
              value={formData.title_en}
              onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
              placeholder="Enter article title"
            />
          </div>

          {/* Author with Combobox */}
          <div className="grid gap-2">
            <Label>Author *</Label>
            <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={authorOpen}
                  className="justify-between font-normal"
                >
                  {formData.author || "Select author..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search or type new author..." 
                    value={formData.author}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, author: value }))}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2 text-sm text-muted-foreground">
                        Press Enter to use "{formData.author}"
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Existing Authors">
                      {authors.map((author) => (
                        <CommandItem
                          key={author.name}
                          value={author.name}
                          onSelect={(value) => {
                            setFormData(prev => ({ ...prev, author: value }));
                            setAuthorOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.author === author.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {author.name}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {author.count} article{author.count !== 1 ? 's' : ''}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Theme */}
          <div className="grid gap-2">
            <Label>Theme *</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status *</Label>
            <RadioGroup
              value={formData.status}
              onValueChange={(value: 'draft' | 'published') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="font-normal cursor-pointer">Draft</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="published" id="published" />
                <Label htmlFor="published" className="font-normal cursor-pointer">Published</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Description/Dek */}
          <div className="grid gap-2">
            <Label htmlFor="dek">Description (Dek)</Label>
            <Textarea
              id="dek"
              value={formData.dek_en}
              onChange={(e) => setFormData(prev => ({ ...prev, dek_en: e.target.value }))}
              placeholder="Brief description or subtitle..."
              rows={3}
            />
          </div>

          {/* Featured */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Article</Label>
              <p className="text-sm text-muted-foreground">
                Display prominently on homepage
              </p>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, featured: checked }))
              }
            />
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
