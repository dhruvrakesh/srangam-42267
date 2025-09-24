import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface I18nLoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const I18nLoadingBoundary: React.FC<I18nLoadingBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      if (i18n.isInitialized && i18n.language) {
        setIsReady(true);
      }
    };

    // Check immediately
    checkReady();

    // Listen for initialization
    i18n.on('initialized', checkReady);
    i18n.on('languageChanged', checkReady);

    return () => {
      i18n.off('initialized', checkReady);
      i18n.off('languageChanged', checkReady);
    };
  }, [i18n]);

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
          <p className="text-muted-foreground">Initializing languages...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};