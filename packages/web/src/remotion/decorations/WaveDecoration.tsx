import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface WaveDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Music theme decoration - pulsing sound wave arcs
 * Remotion version using frame-based SVG path animations
 */
export function WaveDecoration({ primaryColor, secondaryColor, accentColor }: WaveDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Wave path animation - use strokeDasharray for path drawing effect
  const getWaveProgress = (index: number, offset: number = 0) => {
    const duration = 2; // 2 second cycle
    const delay = index * 0.3 + offset;
    const cycleTime = (time - delay) % duration;
    if (cycleTime < 0) return 0;

    // Triangle wave: 0 -> 1 -> 0
    const progress = cycleTime / duration;
    return progress <= 0.5 ? progress * 2 : 2 - progress * 2;
  };

  // Equalizer bar heights
  const getBarHeight = (index: number) => {
    const duration = 0.8;
    const delay = index * 0.1;
    const cycleTime = ((time - delay) % duration + duration) % duration;
    const progress = cycleTime / duration;
    const wave = Math.sin(progress * Math.PI);
    const baseHeight = 10;
    const maxExtra = 30 + (index % 3) * 10; // Variation per bar
    return baseHeight + wave * maxExtra;
  };

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fadeIn }}>
      {/* Left side waves */}
      <svg
        className="absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2"
        viewBox="0 0 200 200"
        fill="none"
      >
        {[0, 1, 2, 3].map((i) => {
          const pathLength = 150; // Approximate path length
          const progress = getWaveProgress(i);
          const opacity = 0.3 + progress * 0.4;

          return (
            <path
              key={`left-${i}`}
              d={`M 100 ${50 + i * 25} Q 150 100, 100 ${150 - i * 25}`}
              stroke={i % 2 === 0 ? primaryColor : secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - progress)}
              opacity={opacity}
            />
          );
        })}
      </svg>

      {/* Right side waves */}
      <svg
        className="absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rotate-180"
        viewBox="0 0 200 200"
        fill="none"
      >
        {[0, 1, 2, 3].map((i) => {
          const pathLength = 150;
          const progress = getWaveProgress(i, 0.5);
          const opacity = 0.3 + progress * 0.4;

          return (
            <path
              key={`right-${i}`}
              d={`M 100 ${50 + i * 25} Q 150 100, 100 ${150 - i * 25}`}
              stroke={i % 2 === 0 ? secondaryColor : accentColor}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - progress)}
              opacity={opacity}
            />
          );
        })}
      </svg>

      {/* Center equalizer bars */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-end gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const height = getBarHeight(i);
          const opacity = 0.4 + (height - 10) / 50 * 0.4;
          const color = i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : accentColor;

          return (
            <div
              key={`bar-${i}`}
              className="w-2 rounded-full"
              style={{
                backgroundColor: color,
                height: `${height}px`,
                opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
