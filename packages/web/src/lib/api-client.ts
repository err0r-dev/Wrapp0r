import type { GenerateRequest, SSEEvent, WrappedExperience } from '@wrapp0r/shared';

// Use empty string for Docker (nginx proxies /api), or localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3001';

// Timeout for API requests (2 minutes for generation which can be slow)
const API_TIMEOUT_MS = 120000;

export type GenerationStage = 'preparing' | 'analyzing' | 'generating' | 'designing' | 'finalizing' | 'complete';

export interface GenerationProgress {
  stage: GenerationStage;
  progress: number;
  message?: string;
}

export interface GenerationCallbacks {
  onProgress?: (progress: GenerationProgress) => void;
  onChunk?: (content: string) => void;
  onComplete?: (data: WrappedExperience) => void;
  onError?: (error: string) => void;
}

/**
 * Generates a Wrapped experience by streaming from the API
 */
export async function generateWrapped(
  request: GenerateRequest,
  callbacks: GenerationCallbacks = {}
): Promise<WrappedExperience> {
  const { onProgress, onChunk, onComplete, onError } = callbacks;

  // Notify start
  onProgress?.({ stage: 'preparing', progress: 0, message: 'Preparing your data...' });

  // Set up timeout with AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      const timeoutMessage = 'Request timed out. Please try again with a smaller file.';
      onError?.(timeoutMessage);
      throw new Error(timeoutMessage);
    }
    throw fetchError;
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error ${response.status}`;
    onError?.(errorMessage);
    throw new Error(errorMessage);
  }

  // Handle SSE stream
  const reader = response.body?.getReader();
  if (!reader) {
    clearTimeout(timeoutId);
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let result: WrappedExperience | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events in the buffer
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const eventStr of events) {
        if (!eventStr.trim()) continue;

        // Parse SSE format: "data: {...}"
        const dataMatch = eventStr.match(/^data:\s*(.+)$/m);
        if (!dataMatch) continue;

        try {
          const event = JSON.parse(dataMatch[1]) as SSEEvent;

          switch (event.type) {
            case 'progress':
              onProgress?.({
                stage: mapStage(event.stage),
                progress: event.progress,
                message: getStageMessage(event.stage, event.progress),
              });
              break;

            case 'chunk':
              onChunk?.(event.content);
              break;

            case 'complete':
              result = event.data as WrappedExperience;
              onProgress?.({ stage: 'complete', progress: 100, message: 'Done!' });
              onComplete?.(result);
              break;

            case 'error':
              onError?.(event.message);
              throw new Error(event.message);
          }
        } catch (parseError) {
          // Ignore parsing errors for malformed events
          console.warn('Failed to parse SSE event:', parseError);
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
    reader.releaseLock();
  }

  if (!result) {
    throw new Error('Generation completed without result');
  }

  return result;
}

function mapStage(stage: string): GenerationStage {
  switch (stage) {
    case 'analyzing':
      return 'analyzing';
    case 'generating':
      return 'generating';
    case 'designing':
      return 'designing';
    case 'finalizing':
      return 'finalizing';
    case 'complete':
      return 'complete';
    default:
      return 'preparing';
  }
}

function getStageMessage(stage: string, progress: number): string {
  switch (stage) {
    case 'analyzing':
      return 'Analyzing your data...';
    case 'generating':
      if (progress < 50) return 'Finding interesting patterns...';
      if (progress < 70) return 'Creating insights...';
      return 'Generating visualizations...';
    case 'designing':
      return 'Designing your slides...';
    case 'finalizing':
      return 'Adding finishing touches...';
    case 'complete':
      return 'Your Wrapped is ready!';
    default:
      return 'Preparing...';
  }
}

/**
 * Check if the API server is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
