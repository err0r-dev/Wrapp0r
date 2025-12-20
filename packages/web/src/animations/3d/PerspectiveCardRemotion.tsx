import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { ReactNode } from 'react';

interface PerspectiveCardRemotionProps {
  children: ReactNode;
  className?: string;
  rotateXDeg?: number;
  rotateYDeg?: number;
  animateCycle?: boolean;
}

/**
 * Remotion-compatible perspective card
 * Uses frame-based animation for video export
 */
export function PerspectiveCardRemotion({
  children,
  className = '',
  rotateXDeg = 5,
  rotateYDeg = 5,
  animateCycle = true,
}: PerspectiveCardRemotionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let rotateX = 0;
  let rotateY = 0;

  if (animateCycle) {
    // Gentle oscillating rotation
    const cycleProgress = (frame % (fps * 4)) / (fps * 4);
    const angle = cycleProgress * Math.PI * 2;

    rotateX = Math.sin(angle) * rotateXDeg;
    rotateY = Math.cos(angle) * rotateYDeg;
  }

  // Entrance animation
  const entranceProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.95, 1]);
  const opacity = entranceProgress;

  return (
    <div
      className={className}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          opacity,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
