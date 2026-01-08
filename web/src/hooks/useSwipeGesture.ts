import { useEffect, useRef, RefObject } from 'react';

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeOptions {
  minSwipeDistance?: number; // Minimum distance in pixels to register a swipe
  maxSwipeTime?: number;     // Maximum time in ms for a swipe gesture
  preventDefaultTouchmoveEvent?: boolean;
}

const defaultOptions: SwipeOptions = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  preventDefaultTouchmoveEvent: false,
};

/**
 * Custom hook for detecting swipe gestures on mobile devices
 * 
 * @param callbacks - Object containing swipe direction callbacks
 * @param options - Customization options for swipe detection
 * @returns RefObject to attach to the swipeable element
 * 
 * @example
 * const handleSwipeLeft = () => console.log('Swiped left!');
 * const handleSwipeRight = () => console.log('Swiped right!');
 * 
 * const swipeRef = useSwipeGesture({
 *   onSwipeLeft: handleSwipeLeft,
 *   onSwipeRight: handleSwipeRight,
 * });
 * 
 * return <div ref={swipeRef}>Swipeable content</div>;
 */
export const useSwipeGesture = <T extends HTMLElement>(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
): RefObject<T> => {
  const ref = useRef<T>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const opts = { ...defaultOptions, ...options };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (opts.preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Check if swipe was fast enough
      if (deltaTime > opts.maxSwipeTime!) {
        touchStartRef.current = null;
        return;
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine swipe direction based on dominant axis
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (absDeltaX >= opts.minSwipeDistance!) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (absDeltaY >= opts.minSwipeDistance!) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: !opts.preventDefaultTouchmoveEvent 
    });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callbacks, opts]);

  return ref;
};

/**
 * Hook specifically for carousel/slider swipe gestures
 * Provides callbacks for next/previous navigation
 */
export const useCarouselSwipe = (
  onNext: () => void,
  onPrevious: () => void,
  options?: SwipeOptions
) => {
  return useSwipeGesture(
    {
      onSwipeLeft: onNext,
      onSwipeRight: onPrevious,
    },
    options
  );
};
