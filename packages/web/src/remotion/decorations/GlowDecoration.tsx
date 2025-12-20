import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface GlowDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Gaming theme decoration - neon pulsing glow orbs
 * Remotion version using frame-based div animations with glow effects
 */
export function GlowDecoration({ primaryColor, secondaryColor, accentColor }: GlowDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Main orb animations
  const orb1Duration = 2;
  const orb1Progress = (time % orb1Duration) / orb1Duration;
  const orb1Wave = Math.sin(orb1Progress * Math.PI * 2);
  const orb1Scale = 1 + orb1Wave * 0.5;
  const orb1Opacity = 0.6 + orb1Wave * 0.4;

  const orb2Duration = 2.5;
  const orb2Progress = (time % orb2Duration) / orb2Duration;
  const orb2Wave = Math.sin(orb2Progress * Math.PI * 2);
  const orb2Scale = 1.5 - orb2Wave * 0.5;
  const orb2Opacity = 0.8 - orb2Wave * 0.3;

  const orb3Duration = 1.5;
  const orb3Progress = (time % orb3Duration) / orb3Duration;
  const orb3Wave = Math.sin(orb3Progress * Math.PI * 2);
  const orb3Scale = 1 + orb3Wave * 1;
  const orb3Opacity = 0.4 + orb3Wave * 0.4;

  // Neon line animations
  const line1Duration = 1;
  const line1Progress = (time % line1Duration) / line1Duration;
  const line1Wave = Math.sin(line1Progress * Math.PI * 2);
  const line1Width = 80 + line1Wave * 40;
  const line1Opacity = 0.5 + line1Wave * 0.5;

  const line2Duration = 1.2;
  const line2Progress = ((time - 0.3) % line2Duration + line2Duration) % line2Duration / line2Duration;
  const line2Wave = Math.sin(line2Progress * Math.PI * 2);
  const line2Width = 96 + line2Wave * 44;
  const line2Opacity = 0.7 + line2Wave * 0.3;

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fadeIn }}>
      {/* Main glow orbs */}
      <div
        className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${primaryColor}60 0%, ${primaryColor}00 70%)`,
          filter: 'blur(20px)',
          transform: `scale(${orb1Scale})`,
          opacity: orb1Opacity,
        }}
      />

      <div
        className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}50 0%, ${secondaryColor}00 70%)`,
          filter: 'blur(25px)',
          transform: `scale(${orb2Scale})`,
          opacity: orb2Opacity,
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}00 70%)`,
          filter: 'blur(15px)',
          transform: `translate(-50%, -50%) scale(${orb3Scale})`,
          opacity: orb3Opacity,
        }}
      />

      {/* Fast-moving small orbs */}
      {[0, 1, 2, 3].map((i) => {
        const duration = 1.5 + i * 0.3;
        const cycleTime = ((time) % duration) / duration;
        const wave = Math.sin(cycleTime * Math.PI * 2);
        const color = i % 2 === 0 ? primaryColor : secondaryColor;

        return (
          <div
            key={`orb-${i}`}
            className="absolute h-4 w-4 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 20px ${color}`,
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 3) * 20}%`,
              transform: `translateY(${wave * -50}px) translateX(${(i % 2 === 0 ? wave : -wave) * 30}px)`,
              opacity: 0.6 + wave * 0.4,
            }}
          />
        );
      })}

      {/* Neon line accents */}
      <div
        className="absolute left-10 top-1/3 h-0.5"
        style={{
          width: line1Width,
          backgroundColor: primaryColor,
          boxShadow: `0 0 10px ${primaryColor}`,
          opacity: line1Opacity,
        }}
      />

      <div
        className="absolute bottom-1/4 right-10 h-0.5"
        style={{
          width: line2Width,
          backgroundColor: secondaryColor,
          boxShadow: `0 0 10px ${secondaryColor}`,
          opacity: line2Opacity,
        }}
      />

      {/* Corner glow (static) */}
      <div
        className="absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: primaryColor, opacity: 0.15 }}
      />
      <div
        className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: secondaryColor, opacity: 0.15 }}
      />
    </div>
  );
}
