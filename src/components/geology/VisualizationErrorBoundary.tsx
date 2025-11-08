import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  visualizationName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`${this.props.visualizationName} Error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="my-8 border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-destructive mb-2">
                  Visualization Temporarily Unavailable
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The {this.props.visualizationName} couldn't load. The article text remains fully readable.
                </p>
                {this.state.error && (
                  <details className="text-xs mb-3">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <code className="block mt-2 p-2 bg-muted rounded text-destructive">
                      {this.state.error.message}
                    </code>
                  </details>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
