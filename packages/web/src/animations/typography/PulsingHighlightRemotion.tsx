import { useCurrentFrame } from 'remotion';
import type { ReactNode } from 'react';

interface PulsingHighlightRemotionProps {
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  cycleFrames?: number;
}

/**
 * Remotion-compatible pulsing highlight
 * Frame-based version for video export
 */
export function PulsingHighlightRemotion({
  children,
  className = '',
  color = '#1DB954',
  intensity = 20,
  cycleFrames = 60,
}: PulsingHighlightRemotionProps) {
  const frame = useCurrentFrame();

  // Calculate pulsing effect
  const cycleProgress = (frame % cycleFrames) / cycleFrames;
  const pulseValue = Math.sin(cycleProgress * Math.PI * 2) * 0.5 + 0.5;
  const glowIntensity = intensity * 0.5 + pulseValue * intensity * 0.5;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        textShadow: `0 0 ${glowIntensity}px ${color}`,
      }}
    >
      {children}
    </span>
  );
}

interface ShimmerTextRemotionProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  cycleFrames?: number;
}

/**
 * Remotion-compatible shimmer text
 * Frame-based gradient animation for video export
 */
export function ShimmerTextRemotion({
  children,
  className = '',
  colors = ['#1DB954', '#1ED760', '#FFFFFF', '#1ED760', '#1DB954'],
  cycleFrames = 90,
}: ShimmerTextRemotionProps) {
  const frame = useCurrentFrame();

  const gradient = colors.join(', ');
  const cycleProgress = (frame % cycleFrames) / cycleFrames;
  const position = 200 - cycleProgress * 400;

  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradient})`,
        backgroundSize: '200% 100%',
        backgroundPosition: `${position}% 0%`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </span>
  );
}
