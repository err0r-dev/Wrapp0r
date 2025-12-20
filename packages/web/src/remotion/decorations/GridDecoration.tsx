import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface GridDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Finance theme decoration - subtle professional grid lines
 * Remotion version using frame-based SVG animations
 */
export function GridDecoration({ primaryColor, secondaryColor }: GridDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Line drawing animation (one-time draw-in effect)
  const getLineProgress = (delay: number, duration: number = 2) => {
    return interpolate(frame, [fps * delay, fps * (delay + duration)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  // Corner accent fade in
  const corner1Opacity = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const corner2Opacity = interpolate(frame, [fps * 0.7, fps * 1.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Moving dot animation
  const dotDuration = 15; // 15 second cycle
  const dotProgress = (time % dotDuration) / dotDuration;
  const dotX = 10 + dotProgress * 80; // 10% to 90%
  const dotY = 50 - Math.sin(dotProgress * Math.PI) * 20; // Slight arc

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {/* Horizontal lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const progress = getLineProgress(i * 0.2);
          return (
            <line
              key={`h-${i}`}
              x1="0%"
              y1={`${20 + i * 15}%`}
              x2={`${progress * 100}%`}
              y2={`${20 + i * 15}%`}
              stroke={primaryColor}
              strokeWidth="1"
              strokeOpacity="0.08"
            />
          );
        })}

        {/* Vertical lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const progress = getLineProgress(0.5 + i * 0.15);
          return (
            <line
              key={`v-${i}`}
              x1={`${15 + i * 14}%`}
              y1="0%"
              x2={`${15 + i * 14}%`}
              y2={`${progress * 100}%`}
              stroke={secondaryColor}
              strokeWidth="1"
              strokeOpacity="0.06"
            />
          );
        })}
      </svg>

      {/* Corner accents */}
      <div
        className="absolute left-8 top-8 h-20 w-20"
        style={{ opacity: corner1Opacity }}
      >
        <div
          className="absolute left-0 top-0 h-full w-0.5"
          style={{ backgroundColor: primaryColor, opacity: 0.2 }}
        />
        <div
          className="absolute left-0 top-0 h-0.5 w-full"
          style={{ backgroundColor: primaryColor, opacity: 0.2 }}
        />
      </div>

      <div
        className="absolute bottom-8 right-8 h-20 w-20"
        style={{ opacity: corner2Opacity }}
      >
        <div
          className="absolute bottom-0 right-0 h-full w-0.5"
          style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
        />
        <div
          className="absolute bottom-0 right-0 h-0.5 w-full"
          style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
        />
      </div>

      {/* Subtle moving dot */}
      <div
        className="absolute h-2 w-2 rounded-full"
        style={{
          backgroundColor: primaryColor,
          opacity: 0.4,
          left: `${dotX}%`,
          top: `${dotY}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
