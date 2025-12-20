import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface ParticleDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface Particle {
  id: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  alpha: number;
  speedX: number;
  speedY: number;
  phase: number;
}

/**
 * Fitness theme decoration - floating energy particles
 * Remotion version using positioned divs instead of Canvas
 */
export function ParticleDecoration({ primaryColor, secondaryColor, accentColor }: ParticleDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Generate consistent particles (seeded by index)
  const colors = [primaryColor, secondaryColor, accentColor];
  const particles: Particle[] = Array.from({ length: 25 }, (_, i) => {
    // Use deterministic pseudo-random based on index
    const seed = (i * 13 + 7) % 100;
    const seed2 = (i * 17 + 11) % 100;
    const seed3 = (i * 23 + 5) % 100;

    return {
      id: i,
      startX: (seed / 100) * 100, // percentage
      startY: (seed2 / 100) * 100, // percentage
      size: 3 + (seed3 / 100) * 6,
      color: colors[i % colors.length],
      alpha: 0.3 + (seed / 100) * 0.5,
      speedX: ((seed / 50) - 1) * 2, // -2 to 2
      speedY: ((seed2 / 50) - 1) * 2,
      phase: (seed3 / 100) * Math.PI * 2,
    };
  });

  // Fade in animation
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: fadeIn }}>
      {particles.map((particle) => {
        // Calculate bouncing position
        const period = 4 + (particle.id % 3); // 4-6 second periods
        const cycleProgress = ((time + particle.phase) % period) / period;

        // Ping-pong effect for x and y
        const bounce = (progress: number) => {
          const cycle = progress * 2;
          return cycle <= 1 ? cycle : 2 - cycle;
        };

        const xOffset = bounce(cycleProgress) * particle.speedX * 30;
        const yOffset = bounce((cycleProgress + 0.3) % 1) * particle.speedY * 30;

        // Keep within bounds (10% to 90%)
        const x = Math.max(5, Math.min(95, particle.startX + xOffset));
        const y = Math.max(5, Math.min(95, particle.startY + yOffset));

        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.alpha,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
}
