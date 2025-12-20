import { useState, useCallback, useRef, useEffect } from 'react';
import type { WrappedExperience } from '@wrapp0r/shared';

export type ExportStatus = 'idle' | 'rendering' | 'downloading' | 'complete' | 'error';

export interface ExportOptions {
  jamendoClientId?: string;
  audioUrl?: string;
  width?: number;
  height?: number;
  fps?: number;
}

export interface UseVideoExportReturn {
  status: ExportStatus;
  progress: number;
  progressMessage: string;
  estimatedTimeRemaining: number | null; // seconds, null if not available
  error: string | null;
  exportVideo: (wrapped: WrappedExperience, options?: ExportOptions) => Promise<void>;
  reset: () => void;
}

function generateRenderId(): string {
  return `render-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s remaining`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  if (minutes < 60) {
    return secs > 0 ? `${minutes}m ${secs}s remaining` : `${minutes}m remaining`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m remaining`;
}

export function useVideoExport(): UseVideoExportReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const renderIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastEstimateRef = useRef<number | null>(null);
  const lastEstimateUpdateRef = useRef<number>(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const exportVideo = useCallback(async (wrapped: WrappedExperience, options?: ExportOptions) => {
    // Generate a unique render ID
    const renderId = generateRenderId();
    renderIdRef.current = renderId;

    // Create abort controller for cancellation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Initialize timing
    startTimeRef.current = Date.now();
    lastEstimateRef.current = null;
    lastEstimateUpdateRef.current = 0;

    setStatus('rendering');
    setProgress(0);
    setProgressMessage('Starting export...');
    setEstimatedTimeRemaining(null);
    setError(null);

    // Set up SSE connection for progress updates
    const eventSource = new EventSource(`/api/render/progress/${renderId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentProgress = data.progress || 0;
        const now = Date.now();

        setProgress(currentProgress);
        setProgressMessage(data.message || '');

        // Calculate estimated time remaining using total elapsed time
        // This is more stable than rate-based calculation
        if (currentProgress >= 10 && currentProgress < 95 && startTimeRef.current) {
          const elapsedMs = now - startTimeRef.current;
          const elapsedSeconds = elapsedMs / 1000;

          // Calculate rate based on total elapsed time (more stable)
          const progressRate = currentProgress / elapsedSeconds; // % per second
          const remainingProgress = 95 - currentProgress;
          const rawEstimate = remainingProgress / progressRate;

          // Only update estimate every 2 seconds to reduce jumpiness
          if (now - lastEstimateUpdateRef.current >= 2000) {
            lastEstimateUpdateRef.current = now;

            // Smooth with previous estimate using exponential moving average
            const smoothingFactor = 0.3; // Lower = smoother but slower to react
            let smoothedEstimate = rawEstimate;

            if (lastEstimateRef.current !== null) {
              smoothedEstimate = smoothingFactor * rawEstimate + (1 - smoothingFactor) * lastEstimateRef.current;
            }

            lastEstimateRef.current = smoothedEstimate;

            // Cap at reasonable bounds (1 second to 1 hour)
            if (smoothedEstimate > 0 && smoothedEstimate < 3600) {
              setEstimatedTimeRemaining(smoothedEstimate);
            }
          }
        } else if (currentProgress >= 95) {
          setEstimatedTimeRemaining(null); // Almost done, hide estimate
        }

        if (data.status === 'complete') {
          setStatus('complete');
          setEstimatedTimeRemaining(null);
          eventSource.close();
        } else if (data.status === 'error') {
          setError(data.message || 'Render failed');
          setStatus('error');
          setEstimatedTimeRemaining(null);
          eventSource.close();
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // SSE connection error - this is normal when the connection closes
      eventSource.close();
    };

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrapped,
          jamendoClientId: options?.jamendoClientId,
          audioUrl: options?.audioUrl,
          width: options?.width,
          height: options?.height,
          fps: options?.fps,
          renderId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        // 499 = Client Closed Request (user cancelled)
        if (response.status === 499) {
          return;
        }

        let errorMessage = 'Render failed';
        try {
          const err = await response.json();
          console.error('Server render error:', err);
          errorMessage = err.details || err.error || errorMessage;
          if (err.stack) {
            console.error('Server stack trace:', err.stack);
          }
        } catch {
          // Response wasn't JSON
          console.error('Non-JSON error response:', response.status, response.statusText);
        }
        throw new Error(errorMessage);
      }

      setStatus('downloading');
      setProgressMessage('Downloading video...');

      // Download the video
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = `${wrapped.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_wrapped.mp4`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressMessage('Complete!');
      setStatus('complete');
    } catch (err) {
      // Don't show error if user cancelled
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Export failed');
      setStatus('error');
    } finally {
      // Clean up EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, []);

  const reset = useCallback(() => {
    // Call server's cancel endpoint to stop the render
    if (renderIdRef.current) {
      fetch(`/api/render/cancel/${renderIdRef.current}`, {
        method: 'POST',
      }).catch(() => {}); // Silently ignore errors
    }

    // Abort any in-progress fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setStatus('idle');
    setProgress(0);
    setProgressMessage('');
    setEstimatedTimeRemaining(null);
    setError(null);
    renderIdRef.current = null;
    startTimeRef.current = null;
    lastEstimateRef.current = null;
    lastEstimateUpdateRef.current = 0;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { status, progress, progressMessage, estimatedTimeRemaining, error, exportVideo, reset };
}

export { formatTimeRemaining };
