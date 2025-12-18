import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import type { WrappedExperience } from '@wrapp0r/shared';
import { SlideRenderer } from './SlideRenderer';
import { useWrappedNavigation } from '@/hooks/useWrappedNavigation';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AudioPlayer } from '@/components/AudioPlayer';

interface WrappedViewerProps {
  wrapped: WrappedExperience;
  onClose?: () => void;
  onExport?: () => void;
  autoAdvance?: boolean;
  enableAudio?: boolean;
}

export function WrappedViewer({
  wrapped,
  onClose,
  onExport,
  autoAdvance = false,
  enableAudio = true,
}: WrappedViewerProps) {
  const {
    currentIndex,
    currentSlide,
    totalSlides,
    isFirst,
    isLast,
    goNext,
    goPrev,
    goToSlide,
    progress,
  } = useWrappedNavigation({
    slides: wrapped.slides,
    autoAdvance,
  });

  const audio = useAudioPlayer({
    mood: wrapped.musicMood,
    autoPlay: enableAudio,
    loop: true,
    volume: 0.4,
  });

  // Start playing when the viewer opens
  useEffect(() => {
    if (enableAudio && audio.canAutoplay) {
      audio.play();
      audio.fadeIn(1500);
    }
  }, [enableAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup: fade out audio when closing
  const handleClose = () => {
    if (audio.isPlaying) {
      audio.fadeOut(500);
      setTimeout(() => {
        onClose?.();
      }, 500);
    } else {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bar at top */}
      <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-4">
        <div className="mx-auto max-w-3xl">
          <Progress value={progress} className="h-1 bg-white/20" />
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 pt-8">
        <div className="flex items-center gap-2">
          {enableAudio && (
            <AudioPlayer
              isPlaying={audio.isPlaying}
              isMuted={audio.isMuted}
              isLoading={audio.isLoading}
              hasError={audio.hasError}
              canAutoplay={audio.canAutoplay}
              currentTrack={audio.currentTrack}
              onToggleMute={audio.toggleMute}
              onPlay={audio.play}
              variant="pill"
              className="text-white"
            />
          )}
        </div>

        <div className="text-sm text-white/70">
          {currentIndex + 1} / {totalSlides}
        </div>

        <div className="flex items-center gap-2">
          {onExport && isLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-white hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <SlideRenderer
          key={currentSlide.id}
          slide={currentSlide}
          theme={wrapped.theme}
        />
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={isFirst}
          className="ml-2 h-12 w-12 text-white opacity-50 transition-opacity hover:bg-white/10 hover:opacity-100 disabled:opacity-0 md:ml-4"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 z-20 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={isLast}
          className="mr-2 h-12 w-12 text-white opacity-50 transition-opacity hover:bg-white/10 hover:opacity-100 disabled:opacity-0 md:mr-4"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center gap-2 pb-6">
        {wrapped.slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-6 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Touch areas for mobile */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-pointer md:hidden"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-pointer md:hidden"
        onClick={goNext}
      />
    </div>
  );
}
