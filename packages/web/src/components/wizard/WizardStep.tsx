import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface WizardStepProps {
  title: string;
  subtitle?: string;
  direction: 'forward' | 'backward';
  children: React.ReactNode;
}

export function WizardStep({ title, subtitle, direction, children }: WizardStepProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: prefersReducedMotion ? 0 : dir === 'forward' ? 100 : -100,
      opacity: prefersReducedMotion ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: prefersReducedMotion ? 0 : dir === 'forward' ? -100 : 100,
      opacity: prefersReducedMotion ? 1 : 0,
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="flex flex-col"
    >
      {/* Step header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}
