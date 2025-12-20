import { EventEmitter } from 'events';

interface RenderProgress {
  renderId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading_audio' | 'rendering' | 'complete' | 'error';
  message?: string;
}

class RenderProgressTracker extends EventEmitter {
  private renders: Map<string, RenderProgress> = new Map();

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

  removeRender(renderId: string) {
    this.renders.delete(renderId);
  }
}

export const renderProgressTracker = new RenderProgressTracker();
