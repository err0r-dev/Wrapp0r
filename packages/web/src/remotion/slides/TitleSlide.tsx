import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TitleSlide as TitleSlideType } from '@wrapp0r/shared';
import { useAnimationStyle } from '../animations';

interface TitleSlideProps {
  slide: TitleSlideType;
}

export function TitleSlide({ slide }: TitleSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { headline, subtitle, year, emoji } = slide.content;

  // Emoji animation with spring
  const emojiProgress = spring({
    frame: Math.max(0, frame - fps * 0.2),
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Year animation
  const yearOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 0.5],
    [0, 0.7],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const yearY = interpolate(
    frame,
    [fps * 0.3, fps * 0.5],
    [-20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Headline animation
  const headlineOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 0.7],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const headlineY = interpolate(
    frame,
    [fps * 0.4, fps * 0.7],
    [30, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Subtitle animation
  const subtitleOpacity = interpolate(
    frame,
    [fps * 0.6, fps * 0.9],
    [0, 0.8],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const subtitleY = interpolate(
    frame,
    [fps * 0.6, fps * 0.9],
    [20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8 text-center">
      {emoji && (
        <span
          className="mb-6 text-6xl md:text-8xl"
          style={{
            transform: `scale(${emojiProgress}) rotate(${interpolate(emojiProgress, [0, 1], [-180, 0])}deg)`,
          }}
        >
          {emoji}
        </span>
      )}

      {year && (
        <span
          className="mb-4 text-lg font-medium uppercase tracking-widest md:text-xl"
          style={{
            opacity: yearOpacity,
            transform: `translateY(${yearY}px)`,
          }}
        >
          {year}
        </span>
      )}

      <h1
        className="mb-4 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
        style={{
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        {headline}
      </h1>

      {subtitle && (
        <p
          className="max-w-2xl text-xl md:text-2xl"
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
}
