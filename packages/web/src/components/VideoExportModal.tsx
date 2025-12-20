import { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Video,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Monitor,
  Smartphone,
  Square,
} from 'lucide-react';
import type { WrappedExperience, ColorTheme } from '@wrapp0r/shared';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVideoExport, formatTimeRemaining } from '@/hooks/useVideoExport';
import { useSettings } from '@/hooks/useSettings';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { exportPresets, defaultPreset, type ExportPreset } from '@/lib/export-presets';
import { cn } from '@/lib/utils';

interface VideoExportModalProps {
  wrapped: WrappedExperience;
  isOpen: boolean;
  onClose: () => void;
  currentAudioUrl?: string;
  currentTheme?: ColorTheme;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function VideoExportModal({ wrapped, isOpen, onClose, currentAudioUrl, currentTheme }: VideoExportModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>(defaultPreset);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { status, progress, progressMessage, estimatedTimeRemaining, error, exportVideo, reset } = useVideoExport();
  const { settings } = useSettings();

  // Handle close
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  // Start export
  const handleExport = useCallback(() => {
    // Use current theme if provided, otherwise fall back to wrapped's original theme
    const wrappedWithTheme: WrappedExperience = currentTheme
      ? { ...wrapped, theme: currentTheme }
      : wrapped;

    exportVideo(wrappedWithTheme, {
      jamendoClientId: settings.pixabayApiKey,
      audioUrl: currentAudioUrl,
      width: selectedPreset.width,
      height: selectedPreset.height,
      fps: selectedPreset.fps,
    });
  }, [exportVideo, wrapped, currentTheme, settings.pixabayApiKey, currentAudioUrl, selectedPreset]);

  // Reset to default preset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(defaultPreset);
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus first focusable element
    const focusableElements = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status]);

  if (!isOpen) return null;

  const isExporting = status === 'rendering' || status === 'downloading';

  // Get status display info
  const getStatusDisplay = () => {
    switch (status) {
      case 'rendering':
        return {
          icon: <Loader2 className="h-6 w-6 animate-spin text-blue-400" />,
          title: 'Rendering Video',
          subtitle: `${selectedPreset.width}x${selectedPreset.height}`,
        };
      case 'downloading':
        return {
          icon: <Download className="h-6 w-6 animate-bounce text-blue-400" />,
          title: 'Downloading',
          subtitle: 'Your video is almost ready...',
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: 'Export Complete!',
          subtitle: 'Your video has been downloaded',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          title: 'Export Failed',
          subtitle: error || 'Something went wrong',
        };
      default:
        return {
          icon: <Video className="h-6 w-6 text-white" />,
          title: 'Export Video',
          subtitle: 'Choose a format and export',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="relative w-full max-w-md overflow-hidden rounded-xl bg-zinc-900 shadow-2xl"
          initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              {statusDisplay.icon}
              <div>
                <h2 id="export-modal-title" className="text-lg font-semibold text-white">{statusDisplay.title}</h2>
                <p className="text-sm text-white/60">{statusDisplay.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white/60 hover:text-white"
              disabled={isExporting}
              aria-label="Close export dialog"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Export in progress */}
            {isExporting && (
              <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="text-center">
                  <p className="text-sm text-white/70">
                    {progressMessage || `${progress}%`}
                  </p>
                  {estimatedTimeRemaining !== null && (
                    <p className="mt-1 text-xs text-white/40">
                      {formatTimeRemaining(estimatedTimeRemaining)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Success state */}
            {status === 'complete' && (
              <div className="flex flex-col items-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="mt-4 text-lg font-medium text-white">Video Downloaded!</p>
                <p className="mt-1 text-sm text-white/60">
                  {selectedPreset.name} ({selectedPreset.width}x{selectedPreset.height})
                </p>
              </div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Format selection - only show when idle */}
            {status === 'idle' && (
              <div className="space-y-3">
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
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            {status === 'complete' ? (
              <>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Export Again
                </Button>
                <Button onClick={handleClose}>Done</Button>
              </>
            ) : status === 'error' ? (
              <>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button onClick={handleExport} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            ) : isExporting ? (
              <>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
