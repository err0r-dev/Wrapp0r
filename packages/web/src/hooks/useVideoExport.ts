import { useCallback, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { WrappedExperience } from '@wrapp0r/shared';

export type ExportStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

export interface ExportProgress {
  status: ExportStatus;
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface UseVideoExportOptions {
  wrapped: WrappedExperience;
  fps?: number;
  width?: number;
  height?: number;
  videoBitsPerSecond?: number;
}

export interface UseVideoExportReturn {
  exportProgress: ExportProgress;
  isExporting: boolean;
  canExport: boolean;
  startExport: (playerRef: PlayerRef) => Promise<void>;
  cancelExport: () => void;
  downloadUrl: string | null;
  reset: () => void;
}

const DEFAULT_FPS = 30;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_BITRATE = 5_000_000; // 5 Mbps

export function useVideoExport({
  wrapped,
  fps = DEFAULT_FPS,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  videoBitsPerSecond = DEFAULT_BITRATE,
}: UseVideoExportOptions): UseVideoExportReturn {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: 'Ready to export',
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const calculateTotalDuration = useCallback(() => {
    return wrapped.slides.reduce((total, slide) => total + slide.duration, 0);
  }, [wrapped.slides]);

  const reset = useCallback(() => {
    // Clean up previous download URL
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    setExportProgress({
      status: 'idle',
      progress: 0,
      message: 'Ready to export',
    });
    chunksRef.current = [];
    cancelledRef.current = false;
  }, [downloadUrl]);

  const cancelExport = useCallback(() => {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setExportProgress({
      status: 'idle',
      progress: 0,
      message: 'Export cancelled',
    });
  }, []);

  const startExport = useCallback(
    async (playerRef: PlayerRef) => {
      try {
        cancelledRef.current = false;
        chunksRef.current = [];

        setExportProgress({
          status: 'preparing',
          progress: 0,
          message: 'Preparing video export...',
        });

        // Get the player container element
        const playerContainer = (playerRef as unknown as { container: HTMLDivElement | null }).container;
        if (!playerContainer) {
          throw new Error('Player container not found');
        }

        // Find the canvas or video element inside the player
        const canvas = playerContainer.querySelector('canvas');
        if (!canvas) {
          throw new Error('Canvas element not found in player');
        }

        // Check if MediaRecorder is supported
        if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          if (!MediaRecorder.isTypeSupported('video/webm')) {
            throw new Error('Video recording is not supported in this browser');
          }
        }

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        // Create a stream from the canvas
        const stream = canvas.captureStream(fps);

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond,
        });

        mediaRecorderRef.current = mediaRecorder;

        // Handle data available
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Handle recording stopped
        mediaRecorder.onstop = () => {
          if (cancelledRef.current) {
            return;
          }

          setExportProgress({
            status: 'processing',
            progress: 90,
            message: 'Processing video...',
          });

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);

          setExportProgress({
            status: 'complete',
            progress: 100,
            message: 'Export complete!',
          });
        };

        // Handle errors
        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          setExportProgress({
            status: 'error',
            progress: 0,
            message: 'Recording failed',
            error: 'An error occurred during recording',
          });
        };

        setExportProgress({
          status: 'recording',
          progress: 5,
          message: 'Recording video...',
        });

        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms

        // Seek to beginning and play
        playerRef.seekTo(0);
        playerRef.play();

        // Calculate total duration in ms
        const totalDurationMs = calculateTotalDuration();

        // Track progress during playback
        const startTime = Date.now();
        const updateProgress = () => {
          if (cancelledRef.current) {
            return;
          }

          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / totalDurationMs) * 85 + 5, 85);

          setExportProgress({
            status: 'recording',
            progress,
            message: `Recording video... ${Math.round(progress)}%`,
          });

          if (elapsed < totalDurationMs) {
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateProgress);

        // Stop recording when playback ends
        setTimeout(
          () => {
            if (!cancelledRef.current && mediaRecorder.state !== 'inactive') {
              playerRef.pause();
              mediaRecorder.stop();
            }
          },
          totalDurationMs + 500 // Add small buffer
        );
      } catch (error) {
        console.error('Export error:', error);
        setExportProgress({
          status: 'error',
          progress: 0,
          message: 'Export failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [fps, videoBitsPerSecond, calculateTotalDuration]
  );

  // Check if browser supports canvas recording
  const canExport =
    typeof MediaRecorder !== 'undefined' &&
    (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
      MediaRecorder.isTypeSupported('video/webm'));

  const isExporting =
    exportProgress.status === 'preparing' ||
    exportProgress.status === 'recording' ||
    exportProgress.status === 'processing';

  return {
    exportProgress,
    isExporting,
    canExport,
    startExport,
    cancelExport,
    downloadUrl,
    reset,
  };
}
