import { useCallback, useRef, useState, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Video,
  Play,
  Pause,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Monitor,
  Smartphone,
  Square,
} from 'lucide-react';
import type { WrappedExperience } from '@wrapp0r/shared';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WrappedComposition, calculateTotalDuration } from '@/remotion';
import { useVideoExport } from '@/hooks/useVideoExport';
import { useSettings } from '@/hooks/useSettings';
import { exportPresets, defaultPreset, type ExportPreset } from '@/lib/export-presets';
import { cn } from '@/lib/utils';

interface VideoExportModalProps {
  wrapped: WrappedExperience;
  isOpen: boolean;
  onClose: () => void;
  currentAudioUrl?: string;
}

// Group presets by aspect ratio for the UI
const presetGroups = {
  landscape: exportPresets.filter((p) => p.aspectRatio === '16:9'),
  portrait: exportPresets.filter((p) => p.aspectRatio === '9:16'),
  square: exportPresets.filter((p) => p.aspectRatio === '1:1'),
};

export function VideoExportModal({ wrapped, isOpen, onClose, currentAudioUrl }: VideoExportModalProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>(defaultPreset);

  const { status, progress, progressMessage, error, exportVideo, reset } = useVideoExport();
  const { settings } = useSettings();

  // Calculate total duration in frames
  const durationInFrames = calculateTotalDuration(wrapped, selectedPreset.fps);

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
    // Pass Jamendo client ID, audio URL, and resolution
    exportVideo(wrapped, {
      jamendoClientId: settings.pixabayApiKey,
      audioUrl: currentAudioUrl,
      width: selectedPreset.width,
      height: selectedPreset.height,
      fps: selectedPreset.fps,
    });
  }, [exportVideo, wrapped, settings.pixabayApiKey, currentAudioUrl, selectedPreset]);

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

  // Reset to default preset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(defaultPreset);
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
          subtitle: progressMessage || `${selectedPreset.width}x${selectedPreset.height} - This may take a moment...`,
        };
      case 'downloading':
        return {
          icon: <Download className="h-5 w-5 animate-bounce text-blue-400" />,
          title: 'Downloading',
          subtitle: progressMessage || 'Your video is almost ready...',
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
          subtitle: 'Choose a format and export your video',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Calculate preview container style based on aspect ratio
  const getPreviewStyle = () => {
    const aspectRatio = selectedPreset.width / selectedPreset.height;
    if (aspectRatio > 1) {
      // Landscape
      return { aspectRatio: `${selectedPreset.width}/${selectedPreset.height}` };
    } else if (aspectRatio < 1) {
      // Portrait - limit height
      return {
        aspectRatio: `${selectedPreset.width}/${selectedPreset.height}`,
        maxHeight: '50vh',
      };
    } else {
      // Square
      return {
        aspectRatio: '1/1',
        maxHeight: '50vh',
      };
    }
  };

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
          className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-zinc-900 shadow-2xl"
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

          <div className="flex flex-col lg:flex-row">
            {/* Preview Area */}
            <div className="flex-1 p-4">
              <div
                className="relative mx-auto overflow-hidden rounded-lg bg-black"
                style={getPreviewStyle()}
              >
                <Player
                  ref={playerRef}
                  component={WrappedComposition}
                  inputProps={{ wrapped, includeAudio: false }}
                  durationInFrames={durationInFrames}
                  fps={selectedPreset.fps}
                  compositionWidth={selectedPreset.width}
                  compositionHeight={selectedPreset.height}
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
                    <Button variant="secondary" size="lg" onClick={togglePreview} className="gap-2">
                      {isPlaying ? (
                        <>
                          <Pause className="h-5 w-5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" /> Preview
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
                      {progressMessage || (status === 'rendering' ? 'Rendering video...' : 'Preparing download...')}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {selectedPreset.width}x{selectedPreset.height} @ {selectedPreset.fps}fps
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
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-center text-xs text-white/50">{progress}%</p>
                </div>
              )}

              {/* Error message */}
              {status === 'error' && error && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Preset Selection Panel */}
            {status === 'idle' && (
              <div className="w-full border-t border-white/10 p-4 lg:w-80 lg:border-l lg:border-t-0">
                <h3 className="mb-4 text-sm font-medium text-white">Export Format</h3>

                {/* All presets in a single list */}
                <div className="space-y-2">
                  {exportPresets.map((preset) => {
                    const AspectIcon =
                      preset.aspectRatio === '16:9'
                        ? Monitor
                        : preset.aspectRatio === '9:16'
                          ? Smartphone
                          : Square;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset)}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition-all',
                          selectedPreset.id === preset.id
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <AspectIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{preset.name}</span>
                              <span className="text-xs text-white/50">
                                {preset.width}x{preset.height}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-white/50">{preset.description}</p>
                            {preset.platforms && preset.platforms.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {preset.platforms.map((platform) => (
                                  <span
                                    key={platform}
                                    className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60"
                                  >
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected preset info */}
                <div className="mt-4 rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Resolution</span>
                    <span className="text-xs font-medium text-white">
                      {selectedPreset.width}x{selectedPreset.height}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-white/50">Frame Rate</span>
                    <span className="text-xs font-medium text-white">{selectedPreset.fps}fps</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-white/50">Format</span>
                    <span className="text-xs font-medium text-white">MP4 (H.264)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <div className="text-sm text-white/60">
              {selectedPreset.name} - {selectedPreset.width}x{selectedPreset.height} @ {selectedPreset.fps}fps
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
                  <Button onClick={handleExport} disabled={!isPreviewReady} className="gap-2">
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
