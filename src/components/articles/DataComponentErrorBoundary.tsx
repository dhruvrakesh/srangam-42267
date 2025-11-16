import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DataComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`DataComponent Error in ${this.props.componentName}:`, error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full my-8 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {this.props.componentName}
            </CardTitle>
            <CardDescription>
              This interactive component encountered an error and could not be displayed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Component Temporarily Unavailable</AlertTitle>
              <AlertDescription>
                The {this.props.componentName} component failed to load. This may be due to a temporary issue.
                The rest of the article remains fully accessible.
              </AlertDescription>
            </Alert>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="bg-muted/50 p-4 rounded-md text-sm font-mono overflow-x-auto">
                <p className="text-destructive font-semibold mb-2">Error Details (Development Only):</p>
                <p className="text-muted-foreground">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Reloading Component
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              If this issue persists, the component may require a browser refresh or update.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
