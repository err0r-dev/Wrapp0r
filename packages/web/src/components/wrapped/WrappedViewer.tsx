import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Video } from 'lucide-react';
import type { WrappedExperience } from '@wrapp0r/shared';
import { SlideRenderer } from './SlideRenderer';
import { useWrappedNavigation } from '@/hooks/useWrappedNavigation';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VideoExportModal } from '@/components/VideoExportModal';

interface WrappedViewerProps {
  wrapped: WrappedExperience;
  onClose?: () => void;
  autoAdvance?: boolean;
  enableAudio?: boolean;
  enableVideoExport?: boolean;
}

export function WrappedViewer({
  wrapped,
  onClose,
  autoAdvance = false,
  enableAudio = true,
  enableVideoExport = true,
}: WrappedViewerProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  // Swipe navigation for mobile
  const { handlers: swipeHandlers, swipeState } = useSwipeNavigation({
    onSwipeLeft: () => !isLast && goNext(),
    onSwipeRight: () => !isFirst && goPrev(),
    threshold: 50,
    enabled: true,
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

  // Calculate swipe offset for visual feedback
  const swipeOffset = swipeState.isSwiping ? swipeState.deltaX * 0.3 : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black touch-pan-y"
      {...swipeHandlers}
    >
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
          {enableVideoExport && isLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Video className="mr-2 h-4 w-4" />
              Export Video
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

      {/* Slide content with swipe feedback */}
      <motion.div
        className="h-full w-full"
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          <SlideRenderer
            key={currentSlide.id}
            slide={currentSlide}
            theme={wrapped.theme}
          />
        </AnimatePresence>
      </motion.div>

      {/* Swipe hint indicators */}
      <AnimatePresence>
        {swipeState.isSwiping && (
          <>
            {swipeState.direction === 'right' && !isFirst && (
              <motion.div
                className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 p-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: Math.min(Math.abs(swipeState.deltaX) / 100, 1), scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </motion.div>
            )}
            {swipeState.direction === 'left' && !isLast && (
              <motion.div
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/20 p-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: Math.min(Math.abs(swipeState.deltaX) / 100, 1), scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </>
        )}
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

      {/* Touch hint on first load (mobile only) */}
      {currentIndex === 0 && (
        <motion.div
          className="pointer-events-none absolute bottom-20 left-0 right-0 z-20 flex justify-center md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 backdrop-blur-sm"
            animate={{ x: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: 3, ease: 'easeInOut' }}
          >
            Swipe to navigate
          </motion.div>
        </motion.div>
      )}

      {/* Video Export Modal */}
      {enableVideoExport && (
        <VideoExportModal
          wrapped={wrapped}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
