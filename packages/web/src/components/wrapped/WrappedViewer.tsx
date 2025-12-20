import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Video, Palette } from 'lucide-react';
import type { WrappedExperience, ColorTheme, DecorativeElement, MusicMood } from '@wrapp0r/shared';
import { CATEGORY_THEMES, type CategoryTheme } from '@wrapp0r/shared';
import { SlideRenderer } from './SlideRenderer';
import { useWrappedNavigation } from '@/hooks/useWrappedNavigation';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VideoExportModal } from '@/components/VideoExportModal';
import { AUDIO_ENABLED } from '@/lib/audio-tracks';

// Theme options for the selector
const THEME_OPTIONS: Array<{ id: string; name: string; theme: CategoryTheme }> = [
  { id: 'fitness', name: 'Fitness', theme: CATEGORY_THEMES.fitness },
  { id: 'music', name: 'Music', theme: CATEGORY_THEMES.music },
  { id: 'food', name: 'Food', theme: CATEGORY_THEMES.food },
  { id: 'finance', name: 'Finance', theme: CATEGORY_THEMES.finance },
  { id: 'productivity', name: 'Work', theme: CATEGORY_THEMES.productivity },
  { id: 'entertainment', name: 'Media', theme: CATEGORY_THEMES.entertainment },
  { id: 'gaming', name: 'Gaming', theme: CATEGORY_THEMES.gaming },
];

// Map theme IDs to music moods
const THEME_TO_MOOD: Record<string, MusicMood> = {
  fitness: 'energetic',
  music: 'upbeat',
  food: 'warm',
  finance: 'professional',
  productivity: 'chill',
  entertainment: 'dramatic',
  gaming: 'energetic',
};

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
  // Get Pixabay API key from settings
  const { settings } = useSettings();
  // Only enable audio if files are available or we have a Pixabay key
  const audioEnabled = enableAudio && (AUDIO_ENABLED || !!settings.pixabayApiKey);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  // Always use light themes - match by primary color or default to food theme
  const getInitialTheme = (): { theme: ColorTheme; decoration: DecorativeElement } => {
    // Try to match wrapped theme to a category theme by primary color
    const matchedEntry = Object.entries(CATEGORY_THEMES).find(
      ([, t]) => t.primary === wrapped.theme.primary
    );

    if (matchedEntry) {
      const [, categoryTheme] = matchedEntry;
      return {
        theme: {
          primary: categoryTheme.primary,
          secondary: categoryTheme.secondary,
          accent: categoryTheme.accent,
          background: categoryTheme.background,
          text: categoryTheme.text,
        },
        decoration: categoryTheme.decorativeElement,
      };
    }

    // Default to food theme if no match (warm, welcoming)
    const defaultTheme = CATEGORY_THEMES.food;
    return {
      theme: {
        primary: defaultTheme.primary,
        secondary: defaultTheme.secondary,
        accent: defaultTheme.accent,
        background: defaultTheme.background,
        text: defaultTheme.text,
      },
      decoration: defaultTheme.decorativeElement,
    };
  };

  const initial = getInitialTheme();
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(initial.theme);
  const [currentDecoration, setCurrentDecoration] = useState<DecorativeElement>(initial.decoration);
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
    autoPlay: audioEnabled,
    loop: true,
    volume: 0.4,
    pixabayApiKey: settings.pixabayApiKey,
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
    if (audioEnabled && audio.canAutoplay) {
      audio.play();
      audio.fadeIn(1500);
    }
  }, [audioEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle close - immediately close
  const handleClose = () => {
    console.log('handleClose called, onClose:', !!onClose);
    if (audio.isPlaying) {
      audio.pause();
    }
    if (onClose) {
      onClose();
    }
  };

  // Calculate swipe offset for visual feedback
  const swipeOffset = swipeState.isSwiping ? swipeState.deltaX * 0.3 : 0;

  return createPortal(
    <>
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Content container - 90% of screen */}
        <div
          className="relative h-[90vh] w-[90vw] max-w-7xl overflow-hidden rounded-2xl shadow-2xl"
          style={{ backgroundColor: currentTheme.background }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar at top */}
          <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-4">
            <div className="mx-auto max-w-3xl">
              <Progress
                value={progress}
                className="h-1"
                style={{ backgroundColor: `${currentTheme.text}33` }}
              />
            </div>
          </div>

          {/* Top controls - higher z-index to be above slide content */}
          <div className="pointer-events-auto absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-4 pt-8">
            <div className="flex items-center gap-2">
              {audioEnabled && (
                <AudioPlayer
                  isPlaying={audio.isPlaying}
                  isMuted={audio.isMuted}
                  isLoading={audio.isLoading}
                  hasError={audio.hasError}
                  canAutoplay={audio.canAutoplay}
                  currentTrack={audio.currentTrack}
                  onToggleMute={audio.toggleMute}
                  onPlay={audio.play}
                  onTogglePlay={audio.toggle}
                  onSkip={audio.skipTrack}
                  variant="pill"
                  className="text-white"
                />
              )}
            </div>

            <div
              className="text-sm drop-shadow-sm"
              style={{ color: `${currentTheme.text}B3` }}
            >
              {currentIndex + 1} / {totalSlides}
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsThemeSelectorOpen(!isThemeSelectorOpen);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-black/30"
                  style={{ color: currentTheme.text }}
                >
                  <Palette className="h-4 w-4" />
                  <span>Theme</span>
                </button>

                {/* Theme dropdown */}
                <AnimatePresence>
                  {isThemeSelectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-lg backdrop-blur-xl border p-2 shadow-xl ${
                        currentTheme.text === '#FFFFFF'
                          ? 'bg-black/90 border-white/20'
                          : 'bg-white/90 border-black/20'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {THEME_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setCurrentTheme({
                              primary: option.theme.primary,
                              secondary: option.theme.secondary,
                              accent: option.theme.accent,
                              background: option.theme.background,
                              text: option.theme.text,
                            });
                            setCurrentDecoration(option.theme.decorativeElement);
                            // Change music to match the new theme
                            const mood = THEME_TO_MOOD[option.id];
                            if (mood && audioEnabled) {
                              audio.changeMood(mood);
                            }
                            setIsThemeSelectorOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            currentTheme.text === '#FFFFFF'
                              ? 'text-white hover:bg-white/10'
                              : 'text-gray-900 hover:bg-black/10'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border ${
                              currentTheme.text === '#FFFFFF' ? 'border-white/30' : 'border-black/30'
                            }`}
                            style={{ backgroundColor: option.theme.primary }}
                          />
                          {option.name}
                        </button>
                      ))}
                      {/* Reset to original */}
                      <div className={`border-t mt-2 pt-2 ${
                        currentTheme.text === '#FFFFFF' ? 'border-white/10' : 'border-black/10'
                      }`}>
                        <button
                          onClick={() => {
                            const resetTheme = getInitialTheme();
                            setCurrentTheme(resetTheme.theme);
                            setCurrentDecoration(resetTheme.decoration);
                            // Reset music to original mood
                            if (audioEnabled && wrapped.musicMood) {
                              audio.changeMood(wrapped.musicMood);
                            }
                            setIsThemeSelectorOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            currentTheme.text === '#FFFFFF'
                              ? 'text-white/70 hover:bg-white/10 hover:text-white'
                              : 'text-gray-600 hover:bg-black/10 hover:text-gray-900'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border ${
                              currentTheme.text === '#FFFFFF' ? 'border-white/30' : 'border-black/30'
                            }`}
                            style={{ backgroundColor: initial.theme.primary }}
                          />
                          Original
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {enableVideoExport && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExportModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-black/30"
                  style={{ color: currentTheme.text }}
                >
                  <Video className="h-4 w-4" />
                  <span>Export video</span>
                </button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  style={{ color: currentTheme.text }}
                  className={`drop-shadow-sm ${currentTheme.text === '#FFFFFF' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Slide content with swipe feedback - z-10 to stay below controls at z-50 */}
          <motion.div
            className="z-10 h-full w-full touch-pan-y"
            animate={{ x: swipeOffset }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            {...swipeHandlers}
          >
            <AnimatePresence mode="wait">
              <SlideRenderer
                key={currentSlide.id}
                slide={currentSlide}
                theme={currentTheme}
                decorativeElement={currentDecoration}
              />
            </AnimatePresence>
          </motion.div>

          {/* Swipe hint indicators */}
          <AnimatePresence>
            {swipeState.isSwiping && (
              <>
                {swipeState.direction === 'right' && !isFirst && (
                  <motion.div
                    className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full p-3"
                    style={{ backgroundColor: `${currentTheme.text}33` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: Math.min(Math.abs(swipeState.deltaX) / 100, 1), scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <ChevronLeft className="h-6 w-6" style={{ color: currentTheme.text }} />
                  </motion.div>
                )}
                {swipeState.direction === 'left' && !isLast && (
                  <motion.div
                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full p-3"
                    style={{ backgroundColor: `${currentTheme.text}33` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: Math.min(Math.abs(swipeState.deltaX) / 100, 1), scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <ChevronRight className="h-6 w-6" style={{ color: currentTheme.text }} />
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
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={isFirst}
              style={{ color: currentTheme.text }}
              className={`ml-2 h-12 w-12 opacity-50 transition-opacity hover:opacity-100 disabled:opacity-0 md:ml-4 drop-shadow-sm ${
                currentTheme.text === '#FFFFFF' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-0 z-20 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={isLast}
              style={{ color: currentTheme.text }}
              className={`mr-2 h-12 w-12 opacity-50 transition-opacity hover:opacity-100 disabled:opacity-0 md:mr-4 drop-shadow-sm ${
                currentTheme.text === '#FFFFFF' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Dots navigation */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center gap-2 pb-6">
            {wrapped.slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className="h-2 rounded-full transition-all drop-shadow-sm"
                style={{
                  width: index === currentIndex ? '1.5rem' : '0.5rem',
                  backgroundColor: index === currentIndex
                    ? currentTheme.text
                    : `${currentTheme.text}66`,
                }}
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
                className="rounded-full px-4 py-2 text-xs backdrop-blur-sm"
                style={{
                  backgroundColor: `${currentTheme.text}1A`,
                  color: `${currentTheme.text}B3`,
                }}
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: 3, ease: 'easeInOut' }}
              >
                Swipe to navigate
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Export Modal */}
      {enableVideoExport && (
        <VideoExportModal
          wrapped={wrapped}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          currentAudioUrl={audio.currentTrack?.originalUrl}
          currentTheme={currentTheme}
        />
      )}
    </>,
    document.body
  );
}
