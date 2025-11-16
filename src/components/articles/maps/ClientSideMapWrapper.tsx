import React, { useState, useEffect } from 'react';

interface ClientSideMapWrapperProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

/**
 * Wrapper component that ensures map components only render on the client-side.
 * This prevents SSR-related issues with react-leaflet's context initialization.
 */
export function ClientSideMapWrapper({ children, fallback }: ClientSideMapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side only after component mounts
    setIsClient(true);
  }, []);

  // During SSR or initial render, show fallback
  if (!isClient) {
    return <>{fallback}</>;
  }

  // Once confirmed client-side, render the map
  return <>{children}</>;
}
