import { useState, useCallback, useRef, useEffect } from 'react';

export interface VirtualizationConfig {
  /** Enable virtualization for large lists (default: true for >100 items) */
  enabled?: boolean;
  /** Threshold for enabling virtualization automatically */
  threshold?: number;
  /** Container height in pixels */
  containerHeight?: number;
  /** Item height for table rows */
  itemHeight?: number;
  /** Gap between grid items */
  itemGap?: number;
}

export interface VirtualizationControls {
  /** Whether virtualization is enabled */
  enabled: boolean;
  /** Scroll to a specific item index */
  scrollToItem: (index: number) => void;
  /** Scroll to top of list */
  scrollToTop: () => void;
  /** Get current scroll position */
  getScrollPosition: () => number;
  /** Configuration */
  config: Required<VirtualizationConfig>;
}

/**
 * Custom hook for managing virtualization state and controls
 * 
 * @example
 * ```tsx
 * const { enabled, scrollToItem, scrollToTop } = useVirtualization({
 *   threshold: 100,
 *   containerHeight: 800,
 * });
 * 
 * // Use in component
 * {enabled ? (
 *   <VirtualizedProjectGrid projects={projects} scrollToItem={scrollToItem} />
 * ) : (
 *   <ProjectGrid projects={projects} />
 * )}
 * ```
 */
export const useVirtualization = (
  itemCount: number,
  config: VirtualizationConfig = {}
): VirtualizationControls => {
  const {
    enabled: enabledConfig,
    threshold = 100,
    containerHeight = 600,
    itemHeight = 73,
    itemGap = 32,
  } = config;

  // Determine if virtualization should be enabled
  const enabled = enabledConfig !== undefined 
    ? enabledConfig 
    : itemCount > threshold;

  // Refs for scroll control
  const scrollCallbackRef = useRef<((index: number) => void) | null>(null);
  const scrollToTopCallbackRef = useRef<(() => void) | null>(null);
  const getScrollPositionCallbackRef = useRef<(() => number) | null>(null);

  const scrollToItem = useCallback((index: number) => {
    if (scrollCallbackRef.current) {
      scrollCallbackRef.current(index);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollToTopCallbackRef.current) {
      scrollToTopCallbackRef.current();
    } else {
      scrollToItem(0);
    }
  }, [scrollToItem]);

  const getScrollPosition = useCallback((): number => {
    if (getScrollPositionCallbackRef.current) {
      return getScrollPositionCallbackRef.current();
    }
    return 0;
  }, []);

  const fullConfig: Required<VirtualizationConfig> = {
    enabled,
    threshold,
    containerHeight,
    itemHeight,
    itemGap,
  };

  return {
    enabled,
    scrollToItem,
    scrollToTop,
    getScrollPosition,
    config: fullConfig,
  };
};

/**
 * Hook for registering scroll callbacks from virtualized components
 * This is used by virtualized components to expose their scroll methods
 */
export const useVirtualizationCallbacks = () => {
  const scrollCallbackRef = useRef<((index: number) => void) | null>(null);
  const scrollToTopCallbackRef = useRef<(() => void) | null>(null);
  const getScrollPositionCallbackRef = useRef<(() => number) | null>(null);

  const registerScrollCallback = useCallback((callback: (index: number) => void) => {
    scrollCallbackRef.current = callback;
  }, []);

  const registerScrollToTopCallback = useCallback((callback: () => void) => {
    scrollToTopCallbackRef.current = callback;
  }, []);

  const registerGetScrollPositionCallback = useCallback((callback: () => number) => {
    getScrollPositionCallbackRef.current = callback;
  }, []);

  return {
    registerScrollCallback,
    registerScrollToTopCallback,
    registerGetScrollPositionCallback,
  };
};

/**
 * Hook for calculating optimal virtualization settings based on viewport
 */
export const useOptimalVirtualization = (itemCount: number) => {
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const calculateHeight = () => {
      // Use 70% of viewport height, with min 400px and max 1000px
      const viewportHeight = window.innerHeight;
      const calculatedHeight = Math.floor(viewportHeight * 0.7);
      const optimalHeight = Math.max(400, Math.min(1000, calculatedHeight));
      setContainerHeight(optimalHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  return useVirtualization(itemCount, {
    containerHeight,
    threshold: 50, // Lower threshold for better performance
  });
};

/**
 * Performance tracking for virtualization
 */
export const useVirtualizationPerformance = (enabled: boolean, itemCount: number) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    itemsRendered: 0,
    itemsTotal: itemCount,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const endTime = performance.now();
      setMetrics({
        renderTime: endTime - startTime,
        itemsRendered: enabled ? Math.min(20, itemCount) : itemCount, // Estimate
        itemsTotal: itemCount,
      });
    });
  }, [enabled, itemCount]);

  return metrics;
};
