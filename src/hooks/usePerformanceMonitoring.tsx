
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetrics {
  route: string;
  loadTime: number;
  renderTime: number;
  timestamp: number;
  userAgent: string;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'input';
  element: string;
  timestamp: number;
  route: string;
}

export const usePerformanceMonitoring = () => {
  const location = useLocation();

  // Monitor navigation performance
  const trackNavigation = useCallback((route: string) => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics: PerformanceMetrics = {
        route,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
      
      // Em produção, enviar para serviço de analytics
      console.log('Performance metrics:', metrics);
      // analyticsService.track('page_performance', metrics);
    }
  }, []);

  // Monitor user interactions
  const trackInteraction = useCallback((type: UserInteraction['type'], element: string) => {
    const interaction: UserInteraction = {
      type,
      element,
      timestamp: Date.now(),
      route: location.pathname,
    };
    
    console.log('User interaction:', interaction);
    // analyticsService.track('user_interaction', interaction);
  }, [location.pathname]);

  // Track Core Web Vitals
  const trackWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
      // analyticsService.track('web_vital', { metric: 'LCP', value: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
        // analyticsService.track('web_vital', { metric: 'FID', value: entry.processingStart - entry.startTime });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
      // analyticsService.track('web_vital', { metric: 'CLS', value: clsValue });
    }).observe({ entryTypes: ['layout-shift'] });
  }, []);

  useEffect(() => {
    trackNavigation(location.pathname);
    trackWebVitals();
  }, [location.pathname, trackNavigation, trackWebVitals]);

  return {
    trackInteraction,
    trackNavigation,
  };
};
