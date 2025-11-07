import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
    console.error('Narration error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-sm text-destructive">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <strong>Narration Temporarily Unavailable</strong>
          </div>
          <p className="text-xs text-muted-foreground">
            We're working to restore audio playback. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
