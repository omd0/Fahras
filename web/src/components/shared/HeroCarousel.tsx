import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useLanguage } from '@/providers/LanguageContext';
import { colorPalette } from '@/styles/theme/colorPalette';

export interface HeroSlide {
  id: string;
  backgroundImage: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: () => void;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplayInterval?: number;
  height?: { xs: string; sm: string; md: string };
}

/**
 * HeroCarousel Component - Full-Bleed Hero Section with Carousel
 *
 * Features:
 * - Full-width background photo
 * - Cool blue overlay: rgba(27, 125, 153, 0.55) → rgba(27, 125, 153, 0.75)
 * - Centered Arabic headline + supporting line (white text)
 * - Carousel dots (semi-transparent inactive, solid white active)
 * - Optional CTA button
 * - Auto-play with pause on hover
 * - RTL-compatible
 */
export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoplayInterval = 5000,
  height = { xs: '300px', sm: '400px', md: '500px' },
}) => {
  const { language } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const maxSteps = slides.length;

  // Auto-play carousel
  useEffect(() => {
    if (isHovering || maxSteps <= 1) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isHovering, maxSteps, autoplayInterval]);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[activeStep];

  return (
    <Box
      component="section"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        backgroundColor: colorPalette.surface.elevated,
      }}
    >
      {/* Background Image with Overlay */}
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === activeStep ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(27, 125, 153, 0.65)', // Cool blue overlay
              zIndex: 1,
            },
          }}
        />
      ))}

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="md">
          {/* Headline */}
          <Typography
            component="h1"
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '28px', sm: '36px', md: '48px' },
              lineHeight: { xs: 1.2, md: 1.3 },
              mb: 1.5,
              direction: language === 'ar' ? 'rtl' : 'ltr',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {currentSlide.title}
          </Typography>

          {/* Subtitle */}
          <Typography
            component="p"
            variant="h5"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              fontSize: { xs: '14px', sm: '16px', md: '18px' },
              lineHeight: 1.5,
              mb: 3,
              direction: language === 'ar' ? 'rtl' : 'ltr',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            {currentSlide.subtitle}
          </Typography>

          {/* CTA Button */}
          {currentSlide.ctaText && currentSlide.ctaAction && (
            <Button
              variant="contained"
              onClick={currentSlide.ctaAction}
              sx={{
                backgroundColor: colorPalette.teal.light,
                color: 'white',
                borderRadius: 9999,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: colorPalette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                },
                transition: 'all 0.2s ease-out',
              }}
            >
              {currentSlide.ctaText}
            </Button>
          )}
        </Container>
      </Box>

      {/* Navigation Arrows (Desktop) */}
      {maxSteps > 1 && (
        <>
          <Box
            onClick={handleBack}
            sx={{
              position: 'absolute',
              top: '50%',
              [language === 'ar' ? 'right' : 'left']: 20,
              transform: 'translateY(-50%)',
              zIndex: 3,
              cursor: 'pointer',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.2s ease-out',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {language === 'ar' ? (
              <ChevronRightIcon sx={{ color: 'white', fontSize: 32 }} />
            ) : (
              <ChevronLeftIcon sx={{ color: 'white', fontSize: 32 }} />
            )}
          </Box>

          <Box
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              [language === 'ar' ? 'left' : 'right']: 20,
              transform: 'translateY(-50%)',
              zIndex: 3,
              cursor: 'pointer',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.2s ease-out',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {language === 'ar' ? (
              <ChevronLeftIcon sx={{ color: 'white', fontSize: 32 }} />
            ) : (
              <ChevronRightIcon sx={{ color: 'white', fontSize: 32 }} />
            )}
          </Box>
        </>
      )}

      {/* Carousel Dots (Mobile Stepper) */}
      {maxSteps > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 1,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setActiveStep(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === activeStep
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HeroCarousel;
