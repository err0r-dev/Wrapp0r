import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, AlertCircle, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AudioTrack } from '@/lib/audio-tracks';

interface AudioPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  canAutoplay: boolean;
  currentTrack: AudioTrack | null;
  onToggleMute: () => void;
  onPlay: () => void;
  onTogglePlay?: () => void;
  onSkip?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'pill';
}

export function AudioPlayer({
  isPlaying,
  isMuted,
  isLoading,
  hasError,
  canAutoplay,
  currentTrack,
  onToggleMute,
  onPlay,
  onTogglePlay,
  onSkip,
  className = '',
  variant = 'default',
}: AudioPlayerProps) {
  // Show play prompt if autoplay was blocked
  if (!canAutoplay && !isPlaying) {
    return (
      <motion.div
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={onPlay}
          className="gap-2"
        >
          <Music className="h-4 w-4" />
          <span>Play Music</span>
        </Button>
      </motion.div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <motion.div
        className={`flex items-center gap-2 text-muted-foreground ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs">Audio unavailable</span>
      </motion.div>
    );
  }

  // Minimal variant - just the mute button
  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className={className}
        disabled={isLoading}
      >
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.div
              key="muted"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <VolumeX className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="unmuted"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Volume2 className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  // Pill variant - compact with track name and full controls
  if (variant === 'pill') {
    return (
      <motion.div
        className={`flex items-center gap-1 rounded-full bg-black/20 px-2 py-1.5 backdrop-blur-sm ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Play/Pause button */}
        {onTogglePlay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePlay}
            className="h-6 w-6 p-0 hover:bg-white/10"
            disabled={isLoading}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}

        {/* Skip button */}
        {onSkip && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-6 w-6 p-0 hover:bg-white/10"
            disabled={isLoading}
            title="Skip to different track"
          >
            {isLoading ? (
              <motion.div
                className="h-3 w-3 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <SkipForward className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Mute button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className="h-6 w-6 p-0 hover:bg-white/10"
          disabled={isLoading}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>

        {/* Track info and visualiser */}
        {currentTrack && (
          <motion.div
            className="flex items-center gap-2 pl-1"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
          >
            <span className="max-w-[120px] truncate text-xs font-medium">
              {currentTrack.artist || currentTrack.name}
            </span>
          </motion.div>
        )}

        {isPlaying && !isMuted && (
          <motion.div
            className="flex items-center gap-0.5 pl-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-3 w-0.5 rounded-full bg-current"
                animate={{
                  scaleY: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default variant - full controls
  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        disabled={isLoading}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      {currentTrack && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentTrack.name}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {currentTrack.mood}
          </span>
        </div>
      )}

      {isPlaying && !isMuted && (
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-4 w-1 rounded-full bg-primary"
              animate={{
                scaleY: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {isLoading && (
        <motion.div
          className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}
