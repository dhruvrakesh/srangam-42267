import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentMountTime: number;
  renderCount: number;
  lastRenderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorOptions {
  componentName: string;
  trackMemory?: boolean;
  logToConsole?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = ({ 
  componentName, 
  trackMemory = false,
  logToConsole = process.env.NODE_ENV === 'development',
  onMetrics 
}: PerformanceMonitorOptions) => {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(Date.now());
  const metricsRef = useRef<PerformanceMetrics>({
    componentMountTime: 0,
    renderCount: 0,
    lastRenderTime: 0
  });

  // Performance mark utilities
  const mark = useCallback((label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${componentName}-${label}`);
    }
  }, [componentName]);

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      const fullStartMark = `${componentName}-${startMark}`;
      const fullEndMark = endMark ? `${componentName}-${endMark}` : undefined;
      
      try {
        performance.measure(`${componentName}-${name}`, fullStartMark, fullEndMark);
        const measurements = performance.getEntriesByName(`${componentName}-${name}`);
        const latest = measurements[measurements.length - 1];
        return latest?.duration || 0;
      } catch (e) {
        console.warn(`Performance measurement failed for ${name}:`, e);
        return 0;
      }
    }
    return 0;
  }, [componentName]);

  // Update metrics on each render
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    lastRenderTime.current = now;

    const metrics: PerformanceMetrics = {
      componentMountTime: now - mountTime.current,
      renderCount: renderCount.current,
      lastRenderTime: now,
    };

    // Track memory usage if requested and available
    if (trackMemory && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = memInfo.usedJSHeapSize;
    }

    metricsRef.current = metrics;

    // Log to console in development
    if (logToConsole && renderCount.current % 10 === 0) {
      console.group(`📊 Performance Monitor: ${componentName}`);
      console.log(`Renders: ${metrics.renderCount}`);
      console.log(`Mount time: ${metrics.componentMountTime}ms`);
      if (metrics.memoryUsage) {
        console.log(`Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
      console.groupEnd();
    }

    // Call custom metrics handler
    if (onMetrics) {
      onMetrics(metrics);
    }
  });

  // Cleanup performance entries on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.performance) {
        // Clean up performance entries
        const entries = performance.getEntriesByName(`${componentName}`, 'mark');
        entries.forEach(entry => {
          try {
            performance.clearMarks(entry.name);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      }
    };
  }, [componentName]);

  const getMetrics = useCallback(() => metricsRef.current, []);

  return {
    mark,
    measure,
    getMetrics,
    renderCount: renderCount.current
  };
};

// Global performance utilities
export const performanceUtils = {
  // Mark critical user interactions
  markUserInteraction: (action: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`user-${action}-${Date.now()}`);
    }
  },

  // Track page load performance
  trackPageLoad: (pageName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventStart - navigation.responseStart,
          load: navigation.loadEventStart - navigation.domContentLoadedEventStart,
          total: navigation.loadEventEnd - navigation.fetchStart
        };

        console.group(`📈 Page Load Performance: ${pageName}`);
        console.log('DNS Lookup:', metrics.dns + 'ms');
        console.log('TCP Connect:', metrics.tcp + 'ms');
        console.log('Request:', metrics.request + 'ms');
        console.log('Response:', metrics.response + 'ms');
        console.log('DOM Processing:', metrics.dom + 'ms');
        console.log('Load Event:', metrics.load + 'ms');
        console.log('Total Load Time:', metrics.total + 'ms');
        console.groupEnd();

        return metrics;
      }
    }
    return null;
  },

  // Track Core Web Vitals
  trackWebVitals: () => {
    if (typeof window !== 'undefined') {
      // Track Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        console.log('LCP (Largest Contentful Paint):', Math.round(lcpEntry.startTime) + 'ms');
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // Use any for compatibility
          if (fidEntry.processingStart) {
            console.log('FID (First Input Delay):', Math.round(fidEntry.processingStart - fidEntry.startTime) + 'ms');
          }
        }
      }).observe({ entryTypes: ['first-input'] });
    }
  }
};