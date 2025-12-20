import { motion } from 'framer-motion';
import type { TitleSlide as TitleSlideType } from '@wrapp0r/shared';
import { getAnimationVariants } from '@/lib/animation-variants';

interface TitleSlideProps {
  slide: TitleSlideType;
}

export function TitleSlide({ slide }: TitleSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { headline, subtitle, year, emoji } = slide.content;

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-8 text-center"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {emoji && (
        <motion.span
          className="mb-6 text-6xl md:text-8xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          {emoji}
        </motion.span>
      )}

      {year && (
        <motion.span
          className="mb-4 text-lg font-medium uppercase tracking-widest opacity-70 md:text-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {year}
        </motion.span>
      )}

      <motion.h1
        className="mb-4 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
      >
        {headline}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="max-w-2xl text-xl opacity-80 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
