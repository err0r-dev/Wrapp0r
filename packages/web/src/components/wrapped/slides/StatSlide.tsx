import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import type { StatSlide as StatSlideType } from '@wrapp0r/shared';
import { getAnimationVariants, counterTransition } from '@/lib/animation-variants';
import { getIconByName } from '@/lib/icons';

interface StatSlideProps {
  slide: StatSlideType;
}

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (value >= 1000) {
      return Math.round(latest).toLocaleString();
    }
    if (value % 1 !== 0) {
      return latest.toFixed(1);
    }
    return Math.round(latest).toString();
  });

  useEffect(() => {
    const controls = animate(count, value, counterTransition);
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatSlide({ slide }: StatSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { label, value, suffix, comparison, icon } = slide.content;

  // Remove commas from string values before parsing (e.g., "15,897" -> "15897")
  const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const numericValue = typeof cleanValue === 'number' ? cleanValue : parseFloat(cleanValue);
  const isNumeric = !isNaN(numericValue);

  // Dynamically get the icon component
  const IconComponent = getIconByName(icon);

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-8 text-center"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {IconComponent && (
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <IconComponent className="h-16 w-16 opacity-70 md:h-20 md:w-20" />
        </motion.div>
      )}

      <motion.p
        className="mb-4 text-lg font-medium uppercase tracking-wider opacity-70 md:text-xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {label}
      </motion.p>

      <motion.div
        className="mb-4 flex items-baseline justify-center gap-2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        <span className="text-6xl font-bold md:text-8xl lg:text-9xl">
          {isNumeric ? <AnimatedCounter value={numericValue} /> : value}
        </span>
        {suffix && (
          <span className="text-2xl font-medium opacity-70 md:text-4xl">
            {suffix}
          </span>
        )}
      </motion.div>

      {comparison && (
        <motion.p
          className="text-lg opacity-60 md:text-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          {comparison}
        </motion.p>
      )}
    </motion.div>
  );
}
