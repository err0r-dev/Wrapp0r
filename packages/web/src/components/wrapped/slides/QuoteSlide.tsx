import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { QuoteSlide as QuoteSlideType } from '@wrapp0r/shared';
import { getAnimationVariants } from '@/lib/animation-variants';

interface QuoteSlideProps {
  slide: QuoteSlideType;
}

export function QuoteSlide({ slide }: QuoteSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { quote, attribution } = slide.content;

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-6 md:px-12"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="relative max-w-3xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <motion.div
          className="absolute -left-6 -top-6 opacity-20 md:-left-10 md:-top-10"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Quote className="h-12 w-12 md:h-20 md:w-20" />
        </motion.div>

        <motion.blockquote
          className="text-center text-xl font-medium leading-relaxed md:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          "{quote}"
        </motion.blockquote>

        <motion.div
          className="absolute -bottom-6 -right-6 rotate-180 opacity-20 md:-bottom-10 md:-right-10"
          initial={{ scale: 0, rotate: 30 }}
          animate={{ scale: 1, rotate: 180 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Quote className="h-12 w-12 md:h-20 md:w-20" />
        </motion.div>
      </motion.div>

      {attribution && (
        <motion.p
          className="mt-8 text-sm font-medium uppercase tracking-wider opacity-60 md:mt-12 md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          — {attribution}
        </motion.p>
      )}
    </motion.div>
  );
}
