import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Performance monitoring
    if (performance.mark) {
      performance.mark('error-boundary-triggered');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="text-destructive" size={48} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Sacred Knowledge Loading Error
            </h2>
            <p className="text-muted-foreground mb-6">
              An error occurred while loading this dharmic content. This might be due to heavy resources or network issues.
            </p>
            
            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Technical Details
                </summary>
                <code className="text-xs text-muted-foreground break-all">
                  {this.state.error.message}
                </code>
              </details>
            )}
            
            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-6">
              If this error persists, try refreshing the page or check your internet connection.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}