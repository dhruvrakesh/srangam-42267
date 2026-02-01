import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * Phase 1.4: Error state component for article page
 */

interface ArticleErrorProps {
  error: string;
  slug?: string;
}

export function ArticleError({ error, slug }: ArticleErrorProps) {
  const navigate = useNavigate();
  const isNotFound = error === 'Article not found' || error.includes('not found');
  const isTimeout = error.includes('timeout') || error.includes('Timeout');
  
  const handleRetry = () => {
    window.location.reload();
  };
  
  const handleBack = () => {
    const isOceanic = window.location.pathname.includes('/oceanic/');
    navigate(isOceanic ? '/oceanic' : '/articles');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {isNotFound ? 'Article Not Found' : 'Error Loading Article'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {isNotFound 
              ? 'The requested article could not be found in our database.'
              : isTimeout
              ? 'The request took too long. Please check your connection and try again.'
              : error || 'An unexpected error occurred while loading the article.'
            }
          </p>
          
          {slug && (
            <p className="text-sm text-muted-foreground/70 mb-4 font-mono">
              Slug: {slug}
            </p>
          )}
          
          <div className="flex flex-col gap-2">
            {!isNotFound && (
              <Button onClick={handleRetry} variant="default" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
            
            <Button onClick={handleBack} variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              {window.location.pathname.includes('/oceanic/') 
                ? 'Return to Oceanic Bharat' 
                : 'Return to Articles'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
