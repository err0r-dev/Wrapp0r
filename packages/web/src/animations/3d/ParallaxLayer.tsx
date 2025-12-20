import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  depth?: number;  // 0-1, where 0 is no parallax and 1 is maximum
  direction?: 'vertical' | 'horizontal';
}

/**
 * Parallax layer that creates depth effect on scroll
 * For creating layered visual experiences
 */
export function ParallaxLayer({
  children,
  className = '',
  depth = 0.3,
  direction = 'vertical',
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = 100 * depth;
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const x = useTransform(scrollYProgress, [0, 1], [-range, range]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: direction === 'vertical' ? y : 0,
        x: direction === 'horizontal' ? x : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Static depth layer for visual hierarchy
 * Uses CSS transforms for subtle 3D positioning
 */
export function DepthLayer({
  children,
  className = '',
  depth = 1,
  blur = false,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;  // 0 = background, 1 = foreground
  blur?: boolean;
}) {
  const scale = 0.95 + depth * 0.05;
  const translateZ = depth * 50;
  const opacity = 0.3 + depth * 0.7;

  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${translateZ}px) scale(${scale})`,
        opacity,
        filter: blur ? `blur(${(1 - depth) * 2}px)` : undefined,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}

// Note: ParallaxLayerRemotion is in a separate file to avoid import issues
// See ParallaxLayerRemotion.tsx for the Remotion-compatible version
