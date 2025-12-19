import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  size: number;
  opacity: number;
  color: string;
  speedX: number;
  speedY: number;
}

interface ParticleFieldRemotionProps {
  count?: number;
  colors?: string[];
  speed?: number;
  seed?: number;
}

// Seeded random for deterministic animations in Remotion
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Floating particle field animation for Remotion video export
 * Uses deterministic seeded random for consistent renders
 */
export function ParticleFieldRemotion({
  count = 30,
  colors = ['#1DB954', '#1ED760', '#FFFFFF'],
  speed = 0.3,
  seed = 12345,
}: ParticleFieldRemotionProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate particles with seeded random (memoized for performance)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const s = seed + i * 1000;
      return {
        id: i,
        startX: seededRandom(s) * width,
        startY: seededRandom(s + 1) * height,
        size: seededRandom(s + 2) * 3 + 1,
        opacity: seededRandom(s + 3) * 0.5 + 0.2,
        color: colors[Math.floor(seededRandom(s + 4) * colors.length)],
        speedX: (seededRandom(s + 5) - 0.5) * speed * 2,
        speedY: (seededRandom(s + 6) - 0.5) * speed * 2,
      };
    });
  }, [count, colors, speed, seed, width, height]);

  // Fade in animation
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        opacity,
      }}
    >
      {particles.map((particle) => {
        // Calculate position based on frame
        const time = frame / fps;
        let x = particle.startX + particle.speedX * time * 100;
        let y = particle.startY + particle.speedY * time * 100;

        // Wrap around edges
        x = ((x % width) + width) % width;
        y = ((y % height) + height) % height;

        return (
          <circle
            key={particle.id}
            cx={x}
            cy={y}
            r={particle.size}
            fill={particle.color}
            opacity={particle.opacity}
          />
        );
      })}
    </svg>
  );
}
