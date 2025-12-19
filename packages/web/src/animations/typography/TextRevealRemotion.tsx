import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { useMemo } from 'react';
import { EASING } from '../../remotion/animations';

interface TextRevealRemotionProps {
  children: string;
  className?: string;
  delay?: number;         // Delay in seconds
  staggerDelay?: number;  // Delay between characters in seconds
  type?: 'character' | 'word';
}

/**
 * Character-by-character text reveal animation for Remotion
 * Frame-based version of TextReveal
 */
export function TextRevealRemotion({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  type = 'character',
}: TextRevealRemotionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = useMemo(() => {
    return type === 'character' ? children.split('') : children.split(' ');
  }, [children, type]);

  const delayFrames = delay * fps;
  const staggerFrames = staggerDelay * fps;
  const itemDuration = fps * 0.3;

  return (
    <span className={className}>
      {items.map((item, index) => {
        const itemDelay = delayFrames + index * staggerFrames;
        const adjustedFrame = Math.max(0, frame - itemDelay);

        const rawProgress = interpolate(adjustedFrame, [0, itemDuration], [0, 1], {
          extrapolateRight: 'clamp',
        });
        const progress = EASING.easeOut(rawProgress);

        const opacity = progress;
        const translateY = interpolate(progress, [0, 1], [20, 0]);

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {item}
            {type === 'word' && index < items.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Rolling counter animation for numbers
 * Creates a slot machine-like effect
 */
export function RollingCounterRemotion({
  value,
  className = '',
  delay = 0,
  duration = 1.5,
  prefix = '',
  suffix = '',
}: {
  value: number;
  className?: string;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = delay * fps;
  const durationFrames = duration * fps;
  const adjustedFrame = Math.max(0, frame - delayFrames);

  const rawProgress = interpolate(adjustedFrame, [0, durationFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Use easeOut for smooth deceleration
  const progress = EASING.easeOut(rawProgress);
  const currentValue = Math.round(value * progress);

  // Format number with commas
  const formattedValue = currentValue.toLocaleString();

  // Scale animation
  const scale = interpolate(rawProgress, [0, 0.3, 1], [0.5, 1.1, 1]);
  const opacity = interpolate(rawProgress, [0, 0.1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
