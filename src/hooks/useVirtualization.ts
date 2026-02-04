'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface VirtualizationConfig {
  enabled?: boolean;
  threshold?: number;
  containerHeight?: number;
  itemHeight?: number;
  itemGap?: number;
}

export interface VirtualizationControls {
  enabled: boolean;
  scrollToItem: (index: number) => void;
  scrollToTop: () => void;
  getScrollPosition: () => number;
  config: Required<VirtualizationConfig>;
}

export const useVirtualization = (
  itemCount: number,
  config: VirtualizationConfig = {},
): VirtualizationControls => {
  const {
    enabled: enabledConfig,
    threshold = 100,
    containerHeight = 600,
    itemHeight = 73,
    itemGap = 32,
  } = config;

  const enabled = enabledConfig !== undefined ? enabledConfig : itemCount > threshold;

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

export const useOptimalVirtualization = (itemCount: number) => {
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const calculateHeight = () => {
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
    threshold: 50,
  });
};
