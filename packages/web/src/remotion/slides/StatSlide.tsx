import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { StatSlide as StatSlideType } from '@wrapp0r/shared';
import { getIconByName } from '../../lib/icons';
import { useCounterValue } from '../animations';

interface StatSlideProps {
  slide: StatSlideType;
}

export function StatSlide({ slide }: StatSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { label, value, suffix, comparison, icon } = slide.content;

  const IconComponent = getIconByName(icon);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value as string));

  // Counter animation
  const animatedValue = useCounterValue(numericValue, { delay: fps * 0.4, durationFrames: fps * 2 });

  // Format the animated value
  const formattedValue = isNumeric
    ? numericValue >= 1000
      ? animatedValue.toLocaleString()
      : numericValue % 1 !== 0
        ? (animatedValue / (numericValue / (numericValue % 1 !== 0 ? numericValue : 1))).toFixed(1)
        : animatedValue.toString()
    : value;

  // Icon animation
  const iconOpacity = interpolate(
    frame,
    [0, fps * 0.3],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const iconScale = interpolate(
    frame,
    [0, fps * 0.3],
    [0.5, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Label animation
  const labelOpacity = interpolate(
    frame,
    [fps * 0.2, fps * 0.5],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const labelY = interpolate(
    frame,
    [fps * 0.2, fps * 0.5],
    [20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Value animation
  const valueOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 0.6],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const valueScale = interpolate(
    frame,
    [fps * 0.3, fps * 0.6],
    [0.5, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Comparison animation
  const comparisonOpacity = interpolate(
    frame,
    [fps * 2.5, fps * 3],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const comparisonY = interpolate(
    frame,
    [fps * 2.5, fps * 3],
    [15, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8 text-center">
      {IconComponent && (
        <div
          className="mb-6"
          style={{
            opacity: iconOpacity,
            transform: `scale(${iconScale})`,
          }}
        >
          <IconComponent className="h-16 w-16 opacity-70 md:h-20 md:w-20" />
        </div>
      )}

      <p
        className="mb-4 text-lg font-medium uppercase tracking-wider opacity-70 md:text-xl"
        style={{
          opacity: labelOpacity * 0.7,
          transform: `translateY(${labelY}px)`,
        }}
      >
        {label}
      </p>

      <div
        className="flex items-baseline gap-2"
        style={{
          opacity: valueOpacity,
          transform: `scale(${valueScale})`,
        }}
      >
        <span className="text-6xl font-bold md:text-8xl lg:text-9xl">
          {formattedValue}
        </span>
        {suffix && (
          <span className="text-2xl font-medium opacity-70 md:text-4xl">
            {suffix}
          </span>
        )}
      </div>

      {comparison && (
        <p
          className="mt-6 text-lg md:text-xl"
          style={{
            opacity: comparisonOpacity,
            transform: `translateY(${comparisonY}px)`,
          }}
        >
          {comparison}
        </p>
      )}
    </AbsoluteFill>
  );
}
