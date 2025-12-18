import { useCallback, useRef, useState, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Play, Pause, Download, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { WrappedExperience } from '@wrapp0r/shared';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WrappedComposition, calculateTotalDuration } from '@/remotion';
import { useVideoExport } from '@/hooks/useVideoExport';

interface VideoExportModalProps {
  wrapped: WrappedExperience;
  isOpen: boolean;
  onClose: () => void;
}

const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;

export function VideoExportModal({ wrapped, isOpen, onClose }: VideoExportModalProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const { status, error, exportVideo, reset } = useVideoExport();

  // Calculate total duration in frames
  const durationInFrames = calculateTotalDuration(wrapped, FPS);

  // Handle close
  const handleClose = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    reset();
    onClose();
  }, [onClose, reset]);

  // Toggle preview playback
  const togglePreview = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Start export
  const handleExport = useCallback(() => {
    // Pause preview when exporting
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    exportVideo(wrapped);
  }, [exportVideo, wrapped]);

  // Track when player is ready
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure player is mounted
      const timer = setTimeout(() => {
        setIsPreviewReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsPreviewReady(false);
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isExporting = status === 'rendering' || status === 'downloading';

  // Get status display info
  const getStatusDisplay = () => {
    switch (status) {
      case 'rendering':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-blue-400" />,
          title: 'Rendering Video',
          subtitle: 'This may take a moment...',
        };
      case 'downloading':
        return {
          icon: <Download className="h-5 w-5 animate-bounce text-blue-400" />,
          title: 'Preparing Download',
          subtitle: 'Your video is almost ready...',
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Export Complete!',
          subtitle: 'Your video has been downloaded',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: 'Export Failed',
          subtitle: error || 'Something went wrong',
        };
      default:
        return {
          icon: <Video className="h-5 w-5 text-white" />,
          title: 'Export Video',
          subtitle: `${WIDTH}x${HEIGHT} @ ${FPS}fps MP4`,
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-zinc-900 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              {statusDisplay.icon}
              <div>
                <h2 className="text-lg font-semibold text-white">{statusDisplay.title}</h2>
                <p className="text-sm text-white/60">{statusDisplay.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white/60 hover:text-white"
              disabled={isExporting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Preview Area */}
          <div className="relative aspect-video bg-black">
            <Player
              ref={playerRef}
              component={WrappedComposition}
              inputProps={{ wrapped, includeAudio: false }}
              durationInFrames={durationInFrames}
              fps={FPS}
              compositionWidth={WIDTH}
              compositionHeight={HEIGHT}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls={false}
            />

            {/* Preview controls overlay */}
            {isPreviewReady && !isExporting && status !== 'complete' && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                initial={{ opacity: 0 }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={togglePreview}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" /> Pause Preview
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" /> Play Preview
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Export progress overlay */}
            {isExporting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="mt-4 text-lg font-medium text-white">
                  {status === 'rendering' ? 'Rendering video...' : 'Preparing download...'}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Please wait, this may take up to a minute
                </p>
              </div>
            )}

            {/* Success overlay */}
            {status === 'complete' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="mt-4 text-lg font-medium text-white">Video Downloaded!</p>
              </div>
            )}
          </div>

          {/* Progress bar during export */}
          {isExporting && (
            <div className="px-6 py-4">
              <Progress value={status === 'downloading' ? 90 : 50} className="h-2" />
            </div>
          )}

          {/* Error message */}
          {status === 'error' && error && (
            <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <div className="text-sm text-white/60">
              Output: {WIDTH}x{HEIGHT} @ {FPS}fps (MP4)
            </div>

            <div className="flex items-center gap-3">
              {status === 'complete' ? (
                <>
                  <Button variant="outline" onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Export Again
                  </Button>
                  <Button onClick={handleClose} className="gap-2">
                    Done
                  </Button>
                </>
              ) : status === 'error' ? (
                <>
                  <Button variant="outline" onClick={reset} className="gap-2">
                    Cancel
                  </Button>
                  <Button onClick={handleExport} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </>
              ) : isExporting ? (
                <Button variant="outline" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={togglePreview}
                    disabled={!isPreviewReady}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={!isPreviewReady}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Video
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
