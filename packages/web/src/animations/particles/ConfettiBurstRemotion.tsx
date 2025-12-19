import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { useMemo } from 'react';

interface ConfettiBurstRemotionProps {
  count?: number;
  colors?: string[];
  spread?: number;
  seed?: number;
}

// Seeded random for deterministic animation
function seededRandom(s: number) {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
}

/**
 * Remotion-compatible confetti burst
 * Uses frame-based animation for video export
 */
export function ConfettiBurstRemotion({
  count = 50,
  colors = ['#1DB954', '#FF6B9D', '#FFD700', '#FF8C42', '#A855F7', '#00D4FF'],
  spread = 400,
  seed = 42,
}: ConfettiBurstRemotionProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate confetti pieces (memoized)
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const s = seed + i * 100;
      return {
        id: i,
        targetX: (seededRandom(s) - 0.5) * spread,
        targetY: seededRandom(s + 1) * spread + 200,
        rotation: (seededRandom(s + 2) - 0.5) * 720,
        color: colors[Math.floor(seededRandom(s + 3) * colors.length)],
        scale: seededRandom(s + 4) * 0.5 + 0.5,
        delay: seededRandom(s + 5) * fps * 0.3,
      };
    });
  }, [count, colors, spread, seed, fps]);

  // Overall opacity fade in/out
  const opacity = interpolate(
    frame,
    [0, fps * 0.2, fps * 2, fps * 2.5],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

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
      {pieces.map((piece) => {
        const adjustedFrame = Math.max(0, frame - piece.delay);
        const duration = fps * 1.5;

        const progress = interpolate(adjustedFrame, [0, duration], [0, 1], {
          extrapolateRight: 'clamp',
        });

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        const x = width / 2 + piece.targetX * eased;
        const y = height / 2 + piece.targetY * eased;
        const rotation = piece.rotation * eased;
        const scale = piece.scale * interpolate(progress, [0, 0.2, 1], [0, 1, 1]);

        return (
          <rect
            key={piece.id}
            x={x - 6}
            y={y - 6}
            width={12}
            height={12}
            rx={2}
            fill={piece.color}
            transform={`rotate(${rotation} ${x} ${y}) scale(${scale})`}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
    </svg>
  );
}
