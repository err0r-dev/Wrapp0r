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
  error: string | null;
  exportVideo: (wrapped: WrappedExperience, options?: ExportOptions) => Promise<void>;
  reset: () => void;
}

function generateRenderId(): string {
  return `render-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useVideoExport(): UseVideoExportReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const renderIdRef = useRef<string | null>(null);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const exportVideo = useCallback(async (wrapped: WrappedExperience, options?: ExportOptions) => {
    // Generate a unique render ID
    const renderId = generateRenderId();
    renderIdRef.current = renderId;

    setStatus('rendering');
    setProgress(0);
    setProgressMessage('Starting export...');
    setError(null);

    // Set up SSE connection for progress updates
    const eventSource = new EventSource(`/api/render/progress/${renderId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress || 0);
        setProgressMessage(data.message || '');

        if (data.status === 'complete') {
          setStatus('complete');
          eventSource.close();
        } else if (data.status === 'error') {
          setError(data.message || 'Render failed');
          setStatus('error');
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
      });

      if (!response.ok) {
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
    setStatus('idle');
    setProgress(0);
    setProgressMessage('');
    setError(null);
    renderIdRef.current = null;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { status, progress, progressMessage, error, exportVideo, reset };
}
