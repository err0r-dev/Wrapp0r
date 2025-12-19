import { useState, useCallback } from 'react';
import type { WrappedExperience } from '@wrapp0r/shared';

export type ExportStatus = 'idle' | 'rendering' | 'downloading' | 'complete' | 'error';

export interface ExportOptions {
  jamendoClientId?: string;
  audioUrl?: string;
}

export interface UseVideoExportReturn {
  status: ExportStatus;
  error: string | null;
  exportVideo: (wrapped: WrappedExperience, options?: ExportOptions) => Promise<void>;
  reset: () => void;
}

export function useVideoExport(): UseVideoExportReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const exportVideo = useCallback(async (wrapped: WrappedExperience, options?: ExportOptions) => {
    setStatus('rendering');
    setError(null);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrapped,
          jamendoClientId: options?.jamendoClientId,
          audioUrl: options?.audioUrl,
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

      setStatus('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, exportVideo, reset };
}
