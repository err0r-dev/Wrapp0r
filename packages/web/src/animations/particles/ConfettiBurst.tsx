import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  delay: number;
}

interface ConfettiBurstProps {
  trigger?: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
  spread?: number;
  className?: string;
}

/**
 * Confetti burst animation for celebration moments
 * Triggered on mount or via trigger prop
 */
export function ConfettiBurst({
  trigger = true,
  count = 50,
  colors = ['#1DB954', '#FF6B9D', '#FFD700', '#FF8C42', '#A855F7', '#00D4FF'],
  duration = 2,
  spread = 400,
  className = '',
}: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!trigger || shouldReduceMotion) return;

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * spread,
      y: -Math.random() * spread - 100,
      rotation: Math.random() * 720 - 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.3,
    }));

    setPieces(newPieces);
    setIsVisible(true);

    // Clean up after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration * 1000 + 500);

    return () => clearTimeout(timer);
  }, [trigger, count, colors, duration, spread, shouldReduceMotion]);

  if (shouldReduceMotion || !isVisible) {
    return null;
  }

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute left-1/2 top-1/2"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: piece.x,
              y: piece.y + 600,
              scale: piece.scale,
              rotate: piece.rotation,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: duration,
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Note: ConfettiBurstRemotion is in a separate file to avoid import issues
// See ConfettiBurstRemotion.tsx for the Remotion-compatible version
