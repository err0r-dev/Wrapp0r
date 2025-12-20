import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface ShapeDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Food theme decoration - floating organic shapes
 * Remotion version using frame-based div animations
 */
export function ShapeDecoration({ primaryColor, secondaryColor, accentColor }: ShapeDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const shapes = [
    { x: '10%', y: '20%', size: 60, color: primaryColor, delay: 0, duration: 3 },
    { x: '85%', y: '15%', size: 45, color: secondaryColor, delay: 0.2, duration: 3.5 },
    { x: '75%', y: '70%', size: 70, color: accentColor, delay: 0.4, duration: 4 },
    { x: '20%', y: '75%', size: 50, color: primaryColor, delay: 0.6, duration: 3.2 },
    { x: '50%', y: '10%', size: 35, color: secondaryColor, delay: 0.3, duration: 3.8 },
    { x: '90%', y: '45%', size: 40, color: accentColor, delay: 0.5, duration: 3.3 },
  ];

  // Bounce animation helper
  const getBounceAnimation = (delay: number, duration: number) => {
    const cycleTime = ((time - delay) % duration + duration) % duration;
    const progress = cycleTime / duration;
    // Smooth sine wave for scale and position
    const wave = Math.sin(progress * Math.PI * 2);
    return {
      scale: 1 + wave * 0.15,
      yOffset: wave * -15,
    };
  };

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fadeIn }}>
      {/* Main shapes */}
      {shapes.map((shape, i) => {
        const anim = getBounceAnimation(shape.delay, shape.duration);
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.size,
              height: shape.size,
              backgroundColor: shape.color,
              opacity: 0.25,
              transform: `translate(-50%, -50%) scale(${anim.scale}) translateY(${anim.yOffset}px)`,
            }}
          />
        );
      })}

      {/* Floating dots */}
      {[0, 1, 2, 3, 4].map((i) => {
        const duration = 2 + i * 0.3;
        const delay = i * 0.2;
        const cycleTime = ((time - delay) % duration + duration) % duration;
        const progress = cycleTime / duration;
        const wave = Math.sin(progress * Math.PI * 2);

        return (
          <div
            key={`dot-${i}`}
            className="absolute h-3 w-3 rounded-full"
            style={{
              left: `${15 + i * 20}%`,
              top: `${40 + (i % 3) * 15}%`,
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              opacity: 0.4,
              transform: `translateY(${wave * -20}px) translateX(${wave * 10}px)`,
            }}
          />
        );
      })}

      {/* Soft blob shapes */}
      {(() => {
        const blob1Duration = 5;
        const blob1Progress = (time % blob1Duration) / blob1Duration;
        const blob1Wave = Math.sin(blob1Progress * Math.PI * 2);

        const blob2Duration = 6;
        const blob2Progress = (time % blob2Duration) / blob2Duration;
        const blob2Wave = Math.sin(blob2Progress * Math.PI * 2);

        return (
          <>
            <div
              className="absolute -left-10 top-1/3 h-40 w-40 rounded-full blur-2xl"
              style={{
                backgroundColor: primaryColor,
                opacity: 0.15,
                transform: `scale(${1 + blob1Wave * 0.2}) translateX(${blob1Wave * 20}px)`,
              }}
            />
            <div
              className="absolute -right-10 bottom-1/4 h-48 w-48 rounded-full blur-2xl"
              style={{
                backgroundColor: secondaryColor,
                opacity: 0.15,
                transform: `scale(${1 + blob2Wave * 0.15}) translateY(${blob2Wave * -15}px)`,
              }}
            />
          </>
        );
      })()}
    </div>
  );
}
