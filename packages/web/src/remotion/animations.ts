import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Animation } from '@wrapp0r/shared';

// ============================================
// EASING FUNCTIONS (Framer Motion-inspired)
// ============================================

export const EASING = {
  // Standard easing
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Bounce easing (like Framer Motion's spring)
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Elastic easing
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Smooth spring-like easing
  spring: (t: number) => {
    const c1 = Math.sin(t * Math.PI * (0.2 + 2.5 * t * t * t));
    const c2 = Math.pow(1 - t, 2.2);
    const c3 = t;
    return c1 * c2 + c3;
  },
} as const;

// ============================================
// STAGGER UTILITIES
// ============================================

/**
 * Calculate staggered delays for a list of items
 * Returns an array of delay values in frames
 */
export function getStaggerDelays(
  itemCount: number,
  fps: number,
  options?: {
    staggerDelay?: number; // Seconds between items (default 0.1)
    startDelay?: number;   // Seconds before first item (default 0.2)
  }
): number[] {
  const staggerDelay = (options?.staggerDelay ?? 0.1) * fps;
  const startDelay = (options?.startDelay ?? 0.2) * fps;

  return Array.from({ length: itemCount }, (_, i) => startDelay + i * staggerDelay);
}

/**
 * Hook to get staggered progress values for multiple items
 * Returns an array of progress values (0-1) for each item
 */
export function useStaggeredProgress(
  itemCount: number,
  options?: {
    staggerDelay?: number;  // Seconds between items
    startDelay?: number;    // Seconds before first
    duration?: number;      // Duration of each item's animation in seconds
    easing?: keyof typeof EASING;
  }
): number[] {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delays = getStaggerDelays(itemCount, fps, options);
  const duration = (options?.duration ?? 0.4) * fps;
  const easingFn = EASING[options?.easing ?? 'easeOut'];

  return delays.map((delay) => {
    const adjustedFrame = Math.max(0, frame - delay);
    const progress = interpolate(adjustedFrame, [0, duration], [0, 1], {
      extrapolateRight: 'clamp',
    });
    return easingFn(progress);
  });
}

// ============================================
// ANIMATION PROGRESS HOOKS
// ============================================

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

// ============================================
// CHART ANIMATION UTILITIES
// ============================================

/**
 * Hook to get animated chart data
 * Animates values from 0 to their target values
 */
export function useAnimatedChartData<T extends { value: number }>(
  data: T[],
  options?: {
    delay?: number;      // Delay in seconds before animation starts
    duration?: number;   // Duration in seconds
    stagger?: number;    // Stagger delay between bars in seconds
    easing?: keyof typeof EASING;
  }
): T[] {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = (options?.delay ?? 0.3) * fps;
  const duration = (options?.duration ?? 0.8) * fps;
  const stagger = (options?.stagger ?? 0.05) * fps;
  const easingFn = EASING[options?.easing ?? 'easeOut'];

  return data.map((item, index) => {
    const itemDelay = delay + index * stagger;
    const adjustedFrame = Math.max(0, frame - itemDelay);
    const rawProgress = interpolate(adjustedFrame, [0, duration], [0, 1], {
      extrapolateRight: 'clamp',
    });
    const progress = easingFn(rawProgress);

    return {
      ...item,
      value: item.value * progress,
    };
  });
}

/**
 * Hook to get animation progress with custom easing
 * More flexible than useAnimationProgress
 */
export function useEasedProgress(
  options?: {
    delay?: number;      // Delay in seconds
    duration?: number;   // Duration in seconds
    easing?: keyof typeof EASING;
  }
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = (options?.delay ?? 0) * fps;
  const duration = (options?.duration ?? 0.5) * fps;
  const easingFn = EASING[options?.easing ?? 'easeOut'];

  const adjustedFrame = Math.max(0, frame - delay);
  const rawProgress = interpolate(adjustedFrame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return easingFn(rawProgress);
}
