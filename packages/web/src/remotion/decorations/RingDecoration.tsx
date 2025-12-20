import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface RingDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Productivity theme decoration - expanding focus rings
 * Remotion version using frame-based div animations
 */
export function RingDecoration({ primaryColor, secondaryColor, accentColor }: RingDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Pulsing animation helper
  const getPulse = (delay: number, duration: number) => {
    const cycleTime = ((time - delay) % duration + duration) % duration;
    const progress = cycleTime / duration;
    const wave = Math.sin(progress * Math.PI * 2);
    return {
      scale: 0.8 + (wave + 1) * 0.15, // 0.8 to 1.1
      opacity: 0.05 + (wave + 1) * 0.05, // 0.05 to 0.15
    };
  };

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fadeIn }}>
      {/* Center expanding rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2, 3].map((i) => {
          const pulse = getPulse(i * 0.5, 4);
          const size = 100 + i * 80;
          return (
            <div
              key={`ring-${i}`}
              className="absolute rounded-full border-2"
              style={{
                borderColor: i % 2 === 0 ? primaryColor : secondaryColor,
                width: size,
                height: size,
                left: -(size / 2),
                top: -(size / 2),
                transform: `scale(${pulse.scale})`,
                opacity: pulse.opacity,
              }}
            />
          );
        })}
      </div>

      {/* Corner rings */}
      {(() => {
        const corner1Duration = 5;
        const corner1Progress = (time % corner1Duration) / corner1Duration;
        const corner1Scale = 1 + Math.sin(corner1Progress * Math.PI * 2) * 0.2;

        const corner2Duration = 6;
        const corner2Progress = (time % corner2Duration) / corner2Duration;
        const corner2Scale = 1.2 - Math.sin(corner2Progress * Math.PI * 2) * 0.2;

        return (
          <>
            <div
              className="absolute -left-16 -top-16 h-32 w-32 rounded-full border-2"
              style={{
                borderColor: primaryColor,
                opacity: 0.1,
                transform: `scale(${corner1Scale})`,
              }}
            />
            <div
              className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full border-2"
              style={{
                borderColor: secondaryColor,
                opacity: 0.1,
                transform: `scale(${corner2Scale})`,
              }}
            />
          </>
        );
      })()}

      {/* Accent dots at ring intersections */}
      {(() => {
        const dot1Duration = 2;
        const dot1Progress = (time % dot1Duration) / dot1Duration;
        const dot1Wave = Math.sin(dot1Progress * Math.PI * 2);
        const dot1Scale = 1 + dot1Wave * 0.5;
        const dot1Opacity = 0.5 + dot1Wave * 0.3;

        const dot2Duration = 2.5;
        const dot2Progress = (time % dot2Duration) / dot2Duration;
        const dot2Wave = Math.sin(dot2Progress * Math.PI * 2);
        const dot2Scale = 1.5 - dot2Wave * 0.5;
        const dot2Opacity = 0.8 - dot2Wave * 0.3;

        return (
          <>
            <div
              className="absolute h-3 w-3 rounded-full"
              style={{
                backgroundColor: accentColor,
                left: '30%',
                top: '25%',
                opacity: dot1Opacity,
                transform: `scale(${dot1Scale})`,
              }}
            />
            <div
              className="absolute h-3 w-3 rounded-full"
              style={{
                backgroundColor: primaryColor,
                right: '25%',
                bottom: '30%',
                opacity: dot2Opacity,
                transform: `scale(${dot2Scale})`,
              }}
            />
          </>
        );
      })()}
    </div>
  );
}
