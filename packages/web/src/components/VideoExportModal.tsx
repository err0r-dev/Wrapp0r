import { useCallback, useRef, useState, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Video, Loader2, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';
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

  const {
    exportProgress,
    isExporting,
    canExport,
    startExport,
    cancelExport,
    downloadUrl,
    reset,
  } = useVideoExport({
    wrapped,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
  });

  // Calculate total duration in frames
  const durationInFrames = calculateTotalDuration(wrapped, FPS);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    if (isExporting) {
      cancelExport();
    }
    reset();
    onClose();
  }, [isExporting, cancelExport, reset, onClose]);

  // Start export
  const handleStartExport = useCallback(async () => {
    if (playerRef.current) {
      setIsPlaying(false);
      await startExport(playerRef.current);
    }
  }, [startExport]);

  // Download the video
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${wrapped.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_wrapped.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadUrl, wrapped.title]);

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
    }
  }, [isOpen]);

  // Get status icon
  const getStatusIcon = () => {
    switch (exportProgress.status) {
      case 'preparing':
      case 'recording':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Video className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
              {getStatusIcon()}
              <div>
                <h2 className="text-lg font-semibold text-white">Export Video</h2>
                <p className="text-sm text-white/60">{exportProgress.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white/60 hover:text-white"
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
            {!isExporting && isPreviewReady && (
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

            {/* Recording indicator */}
            {isExporting && (
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-xs font-medium text-white">Recording</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="px-6 py-4">
              <Progress value={exportProgress.progress} className="h-2" />
              <p className="mt-2 text-center text-sm text-white/60">
                {Math.round(exportProgress.progress)}% complete
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <div className="text-sm text-white/60">
              {canExport ? (
                <>
                  Output: {WIDTH}x{HEIGHT} @ {FPS}fps (WebM)
                </>
              ) : (
                <span className="text-red-400">
                  Video export is not supported in this browser
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {exportProgress.status === 'complete' && downloadUrl ? (
                <>
                  <Button variant="outline" onClick={reset} className="gap-2">
                    Export Again
                  </Button>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Video
                  </Button>
                </>
              ) : isExporting ? (
                <Button variant="destructive" onClick={cancelExport}>
                  Cancel
                </Button>
              ) : (
                <Button
                  onClick={handleStartExport}
                  disabled={!canExport || !isPreviewReady}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Start Export
                </Button>
              )}
            </div>
          </div>

          {/* Error message */}
          {exportProgress.status === 'error' && exportProgress.error && (
            <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-3">
              <p className="text-sm text-red-400">{exportProgress.error}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
