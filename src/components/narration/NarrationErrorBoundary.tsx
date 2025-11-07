import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class NarrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Enhanced error logging
    console.error('Narration Error Caught:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      name: error.name,
    });

    // Log to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Narration: ${error.message}`,
        fatal: false,
      });
    }

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 mb-2 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <strong>Narration Temporarily Unavailable</strong>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Audio playback encountered an error. The article text remains fully readable below.
            {this.state.error && (
              <span className="block mt-1 font-mono text-destructive/70">
                Error: {this.state.error.message}
              </span>
            )}
          </p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={this.handleRetry}
            className="text-xs"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
