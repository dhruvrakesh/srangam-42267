import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Phase 1.4: Skeleton loaders for article sections
 * Provides visual feedback during data loading
 */

export function ArticleHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-4">
      {/* Back button */}
      <Skeleton className="h-10 w-32" />
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Title */}
      <Skeleton className="h-12 w-3/4" />
      
      {/* Meta info */}
      <div className="flex gap-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function ArticleHeroSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="w-full h-48 md:h-64 lg:h-72 rounded-lg" />
      <Skeleton className="h-4 w-48 mx-auto mt-2" />
    </div>
  );
}

export function ArticleContentSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Simulate paragraph lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <div className="h-4" /> {/* Paragraph break */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[88%]" />
        <div className="h-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[75%]" />
      </CardContent>
    </Card>
  );
}

export function ArticleGeographySkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export function ArticleBibliographySkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3 p-4 rounded border">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-40 mt-4" />
      </CardContent>
    </Card>
  );
}

export function ArticleSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-28 mb-2" />
          <Skeleton className="h-16 w-full mb-3" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function ArticleFullSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ArticleHeaderSkeleton />
        <ArticleHeroSkeleton />
        
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <ArticleContentSkeleton />
            <ArticleGeographySkeleton />
            <ArticleBibliographySkeleton />
          </div>
          <ArticleSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
