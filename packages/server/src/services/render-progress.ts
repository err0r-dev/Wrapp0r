import { EventEmitter } from 'events';

interface RenderProgress {
  renderId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading_audio' | 'rendering' | 'complete' | 'error' | 'cancelled';
  message?: string;
}

class RenderProgressTracker extends EventEmitter {
  private renders: Map<string, RenderProgress> = new Map();
  private cancelFunctions: Map<string, () => void> = new Map();

  updateProgress(renderId: string, progress: Partial<RenderProgress>) {
    const current = this.renders.get(renderId) || {
      renderId,
      progress: 0,
      status: 'pending' as const,
    };

    const updated = { ...current, ...progress };
    this.renders.set(renderId, updated);
    this.emit(`progress:${renderId}`, updated);
  }

  getProgress(renderId: string): RenderProgress | undefined {
    return this.renders.get(renderId);
  }

  setCancelFunction(renderId: string, cancelFn: () => void) {
    this.cancelFunctions.set(renderId, cancelFn);
  }

  cancelRender(renderId: string): boolean {
    const cancelFn = this.cancelFunctions.get(renderId);
    if (cancelFn) {
      cancelFn();
      this.cancelFunctions.delete(renderId);
      this.updateProgress(renderId, {
        status: 'cancelled',
        message: 'Render cancelled by user',
      });
      return true;
    }
    return false;
  }

  removeRender(renderId: string) {
    this.renders.delete(renderId);
    this.cancelFunctions.delete(renderId);
  }
}

export const renderProgressTracker = new RenderProgressTracker();
