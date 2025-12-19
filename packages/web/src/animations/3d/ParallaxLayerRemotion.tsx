import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { ReactNode } from 'react';

interface ParallaxLayerRemotionProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  direction?: 'vertical' | 'horizontal';
}

/**
 * Remotion-compatible parallax layer
 * Uses frame-based animation for video export
 */
export function ParallaxLayerRemotion({
  children,
  className = '',
  depth = 0.3,
  direction = 'vertical',
}: ParallaxLayerRemotionProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate parallax offset based on frame progress
  const progress = frame / durationInFrames;
  const range = 30 * depth;
  const offset = interpolate(progress, [0, 1], [-range, range]);

  return (
    <div
      className={className}
      style={{
        transform:
          direction === 'vertical'
            ? `translateY(${offset}px)`
            : `translateX(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
}
