import { useEffect, useRef, RefObject } from 'react';

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeOptions {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

const defaultOptions: SwipeOptions = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  preventDefaultTouchmoveEvent: false,
};

export const useSwipeGesture = <T extends HTMLElement>(
   callbacks: SwipeCallbacks,
   options: SwipeOptions = {}
 ): RefObject<T | null> => {
  const ref = useRef<T>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const opts = { ...defaultOptions, ...options };

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

      if (deltaTime > opts.maxSwipeTime!) {
        touchStartRef.current = null;
        return;
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        if (absDeltaX >= opts.minSwipeDistance!) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        }
      } else {
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
  }, [callbacks, options]);

  return ref;
};

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
