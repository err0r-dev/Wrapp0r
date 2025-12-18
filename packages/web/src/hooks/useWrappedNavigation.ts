import { useCallback, useEffect, useState } from 'react';
import type { Slide } from '@wrapp0r/shared';

interface UseWrappedNavigationOptions {
  slides: Slide[];
  autoAdvance?: boolean;
  onSlideChange?: (index: number) => void;
}

interface UseWrappedNavigationReturn {
  currentIndex: number;
  currentSlide: Slide;
  totalSlides: number;
  isFirst: boolean;
  isLast: boolean;
  goToSlide: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  progress: number;
}

export function useWrappedNavigation({
  slides,
  autoAdvance = false,
  onSlideChange,
}: UseWrappedNavigationOptions): UseWrappedNavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;
  const progress = ((currentIndex + 1) / totalSlides) * 100;

  const goToSlide = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        onSlideChange?.(newIndex);
      }
    },
    [currentIndex, totalSlides, onSlideChange]
  );

  const goNext = useCallback(() => {
    if (!isLast) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, isLast, goToSlide]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, isFirst, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          event.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goPrev();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, goToSlide, totalSlides]);

  // Auto-advance functionality
  useEffect(() => {
    if (!autoAdvance || isLast) return;

    const duration = currentSlide?.duration || 5000;
    const timer = setTimeout(goNext, duration);

    return () => clearTimeout(timer);
  }, [autoAdvance, currentSlide, goNext, isLast]);

  return {
    currentIndex,
    currentSlide,
    totalSlides,
    isFirst,
    isLast,
    goToSlide,
    goNext,
    goPrev,
    progress,
  };
}
