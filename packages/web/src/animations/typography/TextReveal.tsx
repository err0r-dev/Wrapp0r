import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  type?: 'character' | 'word';
}

/**
 * Character-by-character text reveal animation
 * Creates a typewriter-like effect
 */
export function TextReveal({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  type = 'character',
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const items = type === 'character' ? children.split('') : children.split(' ');

  return (
    <span className={className}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + index * staggerDelay,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: 'inline-block' }}
        >
          {item}
          {type === 'word' && index < items.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Gradient text reveal animation
 * Text appears with a gradient sweep effect
 */
export function GradientTextReveal({
  children,
  className = '',
  delay = 0,
  duration = 1,
  colors = ['#1DB954', '#1ED760'],
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  colors?: string[];
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{
        backgroundImage: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 0%, transparent 0%)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
      animate={{
        backgroundImage: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 100%, transparent 100%)`,
      }}
      transition={{
        delay,
        duration,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.span>
  );
}
