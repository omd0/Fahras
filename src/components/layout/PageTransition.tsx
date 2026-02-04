'use client';

import React from 'react';
import { Fade, Slide, Zoom, Box } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 500,
  delay = 0,
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
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
