import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Animation } from '@wrapp0r/shared';

// Convert frame to animation progress (0-1) with optional delay
export function useAnimationProgress(delayFrames = 0, durationFrames?: number) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const effectiveDuration = durationFrames ?? Math.min(fps * 0.6, durationInFrames - delayFrames);
  const adjustedFrame = Math.max(0, frame - delayFrames);

  return interpolate(adjustedFrame, [0, effectiveDuration], [0, 1], {
    extrapolateRight: 'clamp',
  });
}

// Spring animation helper
export function useSpring(options?: { delay?: number; damping?: number; stiffness?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = options?.delay ?? 0;
  const adjustedFrame = Math.max(0, frame - delay);

  return spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: options?.damping ?? 15,
      stiffness: options?.stiffness ?? 200,
    },
  });
}

// Get animation style based on animation type
export function useAnimationStyle(animation: Animation, options?: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = options?.delay ?? 0;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = interpolate(adjustedFrame, [0, fps * 0.6], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const springProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  switch (animation) {
    case 'fadeIn':
      return {
        opacity: progress,
      };

    case 'slideUp':
      return {
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px)`,
      };

    case 'slideDown':
      return {
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [-50, 0])}px)`,
      };

    case 'slideLeft':
      return {
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [50, 0])}px)`,
      };

    case 'slideRight':
      return {
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
      };

    case 'scale':
      return {
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
      };

    case 'bounce':
      return {
        opacity: springProgress,
        transform: `scale(${interpolate(springProgress, [0, 1], [0.3, 1])}) translateY(${interpolate(springProgress, [0, 1], [20, 0])}px)`,
      };

    case 'counter':
      return {
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
      };

    case 'typewriter':
    case 'stagger':
    default:
      return {
        opacity: progress,
      };
  }
}

// Stagger animation helper for list items
export function useStaggeredStyle(index: number, options?: { baseDelay?: number; staggerDelay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseDelay = options?.baseDelay ?? fps * 0.2;
  const staggerDelay = options?.staggerDelay ?? fps * 0.1;
  const totalDelay = baseDelay + index * staggerDelay;

  const adjustedFrame = Math.max(0, frame - totalDelay);
  const progress = interpolate(adjustedFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  };
}

// Counter animation - returns the current number to display
export function useCounterValue(targetValue: number, options?: { delay?: number; durationFrames?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = options?.delay ?? fps * 0.4;
  const duration = options?.durationFrames ?? fps * 2;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = interpolate(adjustedFrame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3), // easeOut cubic
  });

  return Math.round(targetValue * progress);
}
