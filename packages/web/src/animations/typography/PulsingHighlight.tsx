import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PulsingHighlightProps {
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  speed?: number;
}

/**
 * Pulsing glow highlight effect
 * Creates an attention-grabbing glow animation around text
 */
export function PulsingHighlight({
  children,
  className = '',
  color = '#1DB954',
  intensity = 20,
  speed = 2,
}: PulsingHighlightProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={{
        textShadow: [
          `0 0 ${intensity * 0.5}px ${color}`,
          `0 0 ${intensity}px ${color}`,
          `0 0 ${intensity * 0.5}px ${color}`,
        ],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Shimmer text effect
 * Creates a shimmering gradient sweep across text
 */
export function ShimmerText({
  children,
  className = '',
  colors = ['#1DB954', '#1ED760', '#FFFFFF', '#1ED760', '#1DB954'],
  speed = 2,
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const gradient = colors.join(', ');

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradient})`,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
      animate={{
        backgroundPosition: ['200% 0%', '-200% 0%'],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

// Note: PulsingHighlightRemotion and ShimmerTextRemotion are in a separate file
// See PulsingHighlightRemotion.tsx for the Remotion-compatible versions
