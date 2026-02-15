import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload, FileText, Loader2, CheckCircle, Circle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ImportStep {
  id: number;
  label: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
}

interface ExtractedMetadata {
  title: any;
  author?: string;
  date?: string;
  tags?: string[];
  theme?: string;
  dek?: any;
  slug?: string;
  volume?: number;
  chapter?: number;
}

interface ImportResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  stats?: {
    wordCount: number;
    termsExtracted: number;
    termsMatched?: number;
    termsCreated?: number;
    citationsCreated: number;
    crossReferencesCreated?: number;
    markdownSourceSaved?: boolean;
  };
  error?: string;
  hint?: string;
}

const BOOK_CHAPTERS = [
  { value: 'none', label: "Don't assign to any chapter (standalone article)" },
  { 
    group: 'Volume I: Foundations',
    options: [
      { value: 'vol1-ch1-deep-time', label: 'Ch 1: Deep Time & Geological Continuity' },
      { value: 'vol1-ch2-epigraphy', label: 'Ch 2: Epigraphy & Material Evidence' },
      { value: 'vol1-ch3-vedic-transmission', label: 'Ch 3: Vedic Transmission & Oral Preservation' },
      { value: 'vol1-ch4-sacred-ecology', label: 'Ch 4: Sacred Ecology & Environmental Knowledge' },
    ]
  },
  {
    group: 'Volume II: Indian Ocean Networks',
    options: [
      { value: 'vol2-ch5-monsoon-maritime', label: 'Ch 5: Monsoon Winds & Maritime Networks' },
      { value: 'vol2-ch6-port-cities', label: 'Ch 6: Port Cities & Cosmopolitan Centers' },
      { value: 'vol2-ch7-cultural-transmission', label: 'Ch 7: Cultural Transmission & Adaptation' },
    ]
  },
  {
    group: 'Volume III: Synthesis & Analysis',
    options: [
      { value: 'vol3-ch8-genetics-linguistics', label: 'Ch 8: Genetic & Linguistic Evidence' },
      { value: 'vol3-ch9-synthesis', label: 'Ch 9: Synthesis & Future Directions' },
    ]
  }
];

const THEME_OPTIONS = [
  'Ancient India',
  'Indian Ocean World',
  'Scripts & Inscriptions',
  'Empires & Exchange',
  'Geology & Deep Time'
];

export default function MarkdownImport() {
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedMetadata, setExtractedMetadata] = useState<ExtractedMetadata>({} as ExtractedMetadata);
  const [selectedChapter, setSelectedChapter] = useState('none');
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [autoDetectTerms, setAutoDetectTerms] = useState(true);
  const [createMarkdownSource, setCreateMarkdownSource] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSteps, setImportSteps] = useState<ImportStep[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState('');
  const { toast } = useToast();

  // Fetch existing articles for merge mode
  const { data: existingArticles = [] } = useQuery({
    queryKey: ['articles-for-merge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('srangam_articles')
        .select('slug, title')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Extract frontmatter and metadata from markdown
  const extractMetadata = (markdown: string): ExtractedMetadata => {
    const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const metadata: ExtractedMetadata = {
        title: {}
      };
      
      // Parse YAML-like frontmatter
      const lines = frontmatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          
          if (key === 'title') metadata.title = value;
          if (key === 'author') metadata.author = value;
          if (key === 'date') metadata.date = value;
          if (key === 'theme') metadata.theme = value;
          if (key === 'slug') metadata.slug = value;
          if (key === 'tags') metadata.tags = value.split(',').map(t => t.trim());
          if (key === 'dek') metadata.dek = value;
        }
      });
      
      return metadata;
    }
    
    return { title: 'Untitled Article' };
  };

  // Calculate word count
  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    setUploadedFiles([file]);

    const text = await file.text();
    setRawMarkdown(text);
    
    const metadata = extractMetadata(text);
    setExtractedMetadata(metadata);

    toast({
      title: '📄 File loaded',
      description: `Loaded ${file.name}`,
    });
  };

  // Handle markdown paste
  const handleMarkdownPaste = (value: string) => {
    setRawMarkdown(value);
    const metadata = extractMetadata(value);
    setExtractedMetadata(metadata);
  };

  // Sanitize escaped markdown characters (common in exports from Notion, Obsidian, Google Docs)
  const sanitizeEscapedMarkdown = (text: string): string => {
    return text
      .replace(/\\#/g, '#')
      .replace(/\\-/g, '-')
      .replace(/\\\*/g, '*')
      .replace(/\\_/g, '_')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\`/g, '`');
  };

  // Generate frontmatter template
  const generateFrontmatter = () => {
    const hasFrontmatter = rawMarkdown.trim().startsWith('---');
    
    if (hasFrontmatter) {
      toast({
        title: '⚠️ Frontmatter already exists',
        description: 'This markdown already has frontmatter',
      });
      return;
    }
    
    // Extract title from first heading or first line, sanitize escaped chars
    const firstLine = rawMarkdown.split('\n')[0];
    const sanitizedFirstLine = sanitizeEscapedMarkdown(firstLine);
    const title = sanitizedFirstLine.replace(/^#+\s*/, '').trim() || 'Untitled Article';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Quote all string values for YAML safety (handles special chars like –, :, diacritics)
    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
author: "NF Research Team"
date: ${new Date().toISOString().split('T')[0]}
theme: "Ancient India"
tags: []
slug: "${slug}"
---

`;
    
    setRawMarkdown(frontmatter + rawMarkdown);
    
    // Re-extract metadata
    const metadata = extractMetadata(frontmatter + rawMarkdown);
    setExtractedMetadata(metadata);
    
    toast({
      title: '✅ Frontmatter added',
      description: 'Review and edit the frontmatter before importing',
    });
  };

  // Handle import
  const handleImport = async () => {
    if (!rawMarkdown.trim()) {
      toast({
        title: '⚠️ No content',
        description: 'Please upload a file or paste markdown content',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    
    // Initialize progress steps
    const steps: ImportStep[] = [
      { id: 1, label: 'Parsing frontmatter', status: 'in_progress' },
      { id: 2, label: 'Converting markdown to HTML', status: 'pending' },
      { id: 3, label: 'Extracting cultural terms', status: 'pending' },
      { id: 4, label: 'Creating bibliography entries', status: 'pending' },
      { id: 5, label: 'Inserting into database', status: 'pending' },
      { id: 6, label: 'Linking to chapter', status: 'pending' },
    ];
    setImportSteps(steps);

    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('markdown-to-article-import', {
        body: {
          markdownContent: rawMarkdown,
          overwriteExisting,
          assignToChapter: selectedChapter !== 'none' ? selectedChapter : undefined,
          sequenceNumber: selectedChapter !== 'none' ? sequenceNumber : undefined,
          lang: targetLanguage,
          mergeIntoArticle: isMergeMode ? selectedArticleSlug : undefined
        }
      });

      if (error) throw error;

      // Update all steps to complete
      setImportSteps(steps.map(s => ({ ...s, status: 'complete' })));

      // Set success result
      setImportResult({
        success: data.success,
        articleId: data.articleId,
        slug: data.slug,
        stats: data.stats,
      });

      toast({
        title: '✅ Import successful!',
        description: (
          <div className="mt-2 space-y-1 text-sm">
            <p><strong>Article:</strong> {data.slug}</p>
            <p><strong>Word Count:</strong> {data.stats?.wordCount?.toLocaleString()}</p>
            <p><strong>Cultural Terms:</strong> {data.stats?.termsExtracted} 
              ({data.stats?.termsCreated} new, {data.stats?.termsMatched} matched)</p>
            <p><strong>Cross-References:</strong> {data.stats?.crossReferencesCreated || 0} connections</p>
            <p><strong>Read Time:</strong> {data.stats?.readTimeMinutes} min</p>
          </div>
        ),
      });

      // Clear form
      setRawMarkdown('');
      setUploadedFiles([]);
      setExtractedMetadata({} as ExtractedMetadata);

    } catch (error: any) {
      // Mark current step as error
      setImportSteps(steps.map((s, i) => 
        i === 0 ? { ...s, status: 'error' } : s
      ));

      // Phase C: Read structured error from edge function first
      const structuredError = error?.context?.body?.error || error?.error;
      
      let userFriendlyMessage: string;
      let actionableHint = '';

      if (structuredError?.code) {
        // Structured error from edge function
        userFriendlyMessage = structuredError.message;
        actionableHint = structuredError.hint || '';
      } else {
        // Fallback: legacy string-matching (backward compat)
        const errorMessage = error.message || 'Unknown error occurred';
        userFriendlyMessage = errorMessage;
        
        if (errorMessage.includes('duplicate key') && errorMessage.includes('slug')) {
          userFriendlyMessage = `An article with slug "${extractedMetadata.slug || 'auto-generated'}" already exists.`;
          actionableHint = 'Enable "Overwrite existing article" below, or change the slug in your frontmatter.';
        } else if (errorMessage.includes('YAML') || errorMessage.includes('frontmatter')) {
          actionableHint = 'Ensure all text values are wrapped in quotes, especially titles with special characters.';
        }
      }

      setImportResult({
        success: false,
        error: userFriendlyMessage,
        hint: actionableHint,
      });

      toast({
        title: '❌ Import failed',
        description: userFriendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const wordCount = calculateWordCount(rawMarkdown);
  const readTimeMinutes = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
            Srangam Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Import markdown articles, manage book collation, and export chapters
          </p>
        </header>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Markdown Import</TabsTrigger>
            <TabsTrigger value="book" disabled>Book Collation</TabsTrigger>
            <TabsTrigger value="preview" disabled>Chapter Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {/* File Upload Zone */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Markdown</CardTitle>
                <CardDescription>
                  Upload a .md file or paste markdown content directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Markdown files (.md, .markdown)
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{uploadedFiles[0].name}</span>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste markdown</span>
                  </div>
                </div>

                <Textarea
                  placeholder="Paste your markdown content here..."
                  value={rawMarkdown}
                  onChange={(e) => handleMarkdownPaste(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />

                {rawMarkdown && !rawMarkdown.trim().startsWith('---') && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Frontmatter</AlertTitle>
                    <AlertDescription>
                      This markdown doesn't have frontmatter. Click the button below to generate it.
                    </AlertDescription>
                  </Alert>
                )}

                {rawMarkdown && (
                  <Button onClick={generateFrontmatter} variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Frontmatter
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Split Preview Panel */}
            {rawMarkdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Raw markdown and rendered HTML</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Raw Markdown */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Raw Markdown</h3>
                      <Textarea
                        value={rawMarkdown}
                        onChange={(e) => handleMarkdownPaste(e.target.value)}
                        className="font-mono text-xs h-[400px]"
                      />
                    </div>

                    {/* Right: HTML Preview */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">HTML Preview</h3>
                      <div className="prose prose-sm max-w-none h-[400px] overflow-y-auto border rounded-lg p-4 bg-card">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {rawMarkdown}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <Badge variant="secondary">
                      {wordCount} words
                    </Badge>
                    <Badge variant="secondary">
                      ~{readTimeMinutes} min read
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata Extraction */}
            {extractedMetadata.title && (
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Metadata</CardTitle>
                  <CardDescription>Auto-detected from frontmatter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={typeof extractedMetadata.title === 'string' ? extractedMetadata.title : extractedMetadata.title.en || ''} 
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input 
                        value={extractedMetadata.author || 'NF Team'} 
                        onChange={(e) => setExtractedMetadata({...extractedMetadata, author: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date" 
                        value={extractedMetadata.date || ''} 
                        onChange={(e) => setExtractedMetadata({...extractedMetadata, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select 
                        value={extractedMetadata.theme || ''} 
                        onValueChange={(value) => setExtractedMetadata({...extractedMetadata, theme: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map(theme => (
                            <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    {extractedMetadata.tags && extractedMetadata.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {extractedMetadata.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tags in frontmatter - AI will generate them during import
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Language Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Settings</CardTitle>
                <CardDescription>
                  Select language and merge options for multilingual articles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="as">অসমীয়া (Assamese)</SelectItem>
                      <SelectItem value="pn">Pnar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mergeMode"
                      checked={isMergeMode}
                      onCheckedChange={(checked) => setIsMergeMode(checked as boolean)}
                    />
                    <Label htmlFor="mergeMode">Merge translation into existing article</Label>
                  </div>
                  {isMergeMode && (
                    <div className="space-y-2 pl-6">
                      <Label>Select Article to Merge Into</Label>
                      <Select value={selectedArticleSlug} onValueChange={setSelectedArticleSlug}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Select an article --" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingArticles.map((article) => (
                            <SelectItem key={article.slug} value={article.slug}>
                              {typeof article.title === 'object' && article.title !== null
                                ? (article.title as any).en || JSON.stringify(article.title)
                                : article.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Translation will be added to the selected article's {targetLanguage} field
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chapter Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Chapter Assignment</CardTitle>
                <CardDescription>
                  Assign this article to a book chapter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Chapter</Label>
                  <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {BOOK_CHAPTERS[0].label}
                      </SelectItem>
                      {BOOK_CHAPTERS.slice(1).map(group => (
                        <SelectGroup key={group.group}>
                          <SelectLabel>{group.group}</SelectLabel>
                          {group.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChapter !== 'none' && (
                  <div className="space-y-2">
                    <Label>Sequence Number in Chapter</Label>
                    <Input
                      type="number"
                      min={1}
                      value={sequenceNumber}
                      onChange={(e) => setSequenceNumber(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Order this article will appear in the chapter
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Import Options */}
            <Card>
              <CardHeader>
                <CardTitle>Import Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-terms" 
                    checked={autoDetectTerms}
                    onCheckedChange={(checked) => setAutoDetectTerms(checked as boolean)}
                  />
                  <Label htmlFor="auto-terms">
                    Auto-detect cultural terms (Sanskrit diacritics)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="markdown-source" 
                    checked={createMarkdownSource}
                    onCheckedChange={(checked) => setCreateMarkdownSource(checked as boolean)}
                  />
                  <Label htmlFor="markdown-source">
                    Save original markdown in srangam_markdown_sources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="overwrite" 
                    checked={overwriteExisting}
                    onCheckedChange={(checked) => setOverwriteExisting(checked as boolean)}
                  />
                  <Label htmlFor="overwrite">
                    Overwrite existing article if slug matches
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Import Progress */}
            {importSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {importSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3">
                      {step.status === 'complete' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {step.status === 'in_progress' && (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {step.status === 'pending' && (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={
                        step.status === 'complete' ? 'text-green-500' :
                        step.status === 'error' ? 'text-destructive' : ''
                      }>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Import Result */}
            {importResult && (
              <Alert variant={importResult.success ? 'default' : 'destructive'} className={importResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
                <AlertTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Import Successful!
                    </>
                  ) : (
                    '❌ Import Failed'
                  )}
                </AlertTitle>
                <AlertDescription>
                  {importResult.success ? (
                    <div className="space-y-3 mt-2">
                      <p className="font-medium">
                        Article published: <code className="bg-muted px-2 py-1 rounded text-sm">{importResult.slug}</code>
                      </p>
                      {importResult.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="bg-background rounded p-2 border">
                            <div className="font-semibold text-foreground">{importResult.stats.wordCount?.toLocaleString()}</div>
                            <div className="text-muted-foreground text-xs">Words</div>
                          </div>
                          <div className="bg-background rounded p-2 border">
                            <div className="font-semibold text-foreground">{importResult.stats.termsExtracted}</div>
                            <div className="text-muted-foreground text-xs">Terms Extracted</div>
                          </div>
                          <div className="bg-background rounded p-2 border">
                            <div className="font-semibold text-foreground">{importResult.stats.crossReferencesCreated || 0}</div>
                            <div className="text-muted-foreground text-xs">Cross-References</div>
                          </div>
                          <div className="bg-background rounded p-2 border">
                            <div className="font-semibold text-foreground">{importResult.stats.citationsCreated}</div>
                            <div className="text-muted-foreground text-xs">Citations</div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button asChild variant="default" size="sm">
                          <Link to={`/articles/${importResult.slug}`} className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            View Article
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setImportResult(null);
                            setImportSteps([]);
                          }}
                        >
                          Import Another
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p><strong>Error:</strong> {importResult.error}</p>
                      {importResult.hint && (
                        <p className="text-sm bg-background/50 p-2 rounded border border-border">
                          💡 <strong>Solution:</strong> {importResult.hint}
                        </p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Import Button */}
            <Button 
              onClick={handleImport}
              disabled={isImporting || !rawMarkdown}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing article...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Article to Database
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="book">
            <Card>
              <CardHeader>
                <CardTitle>Book Collation Manager</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Preview</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
