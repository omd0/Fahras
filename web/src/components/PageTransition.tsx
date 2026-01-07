import React from 'react';
import { Fade, Slide, Zoom, Box } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
}

/**
 * PageTransition component for smooth page navigation animations
 * Uses MUI's built-in animation components
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 500,
  delay = 0,
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Trigger animation after a small delay
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (type === 'fade') {
    return (
      <Fade in={show} timeout={duration}>
        <Box>{children}</Box>
      </Fade>
    );
  }

  if (type === 'zoom') {
    return (
      <Zoom in={show} timeout={duration}>
        <Box>{children}</Box>
      </Zoom>
    );
  }

  // Default to slide
  return (
    <Slide
      in={show}
      direction={direction}
      timeout={duration}
      mountOnEnter
      unmountOnExit={false}
    >
      <Box>{children}</Box>
    </Slide>
  );
};

/**
 * Staggered animation wrapper for multiple children
 * Animates children one after another with a delay
 */
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          type="fade"
          duration={400}
          delay={delay + index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </>
  );
};
