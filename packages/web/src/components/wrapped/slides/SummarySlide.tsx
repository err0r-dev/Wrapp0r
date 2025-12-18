import { motion } from 'framer-motion';
import type { SummarySlide as SummarySlideType } from '@wrapp0r/shared';
import { getAnimationVariants, staggerContainer, staggerChild } from '@/lib/animation-variants';
import { getIconByName } from '@/lib/icons';

interface SummarySlideProps {
  slide: SummarySlideType;
}

export function SummarySlide({ slide }: SummarySlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { title, highlights, closingMessage } = slide.content;

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-4 md:px-8"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.h2
        className="mb-8 text-center text-2xl font-bold md:mb-12 md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="mb-8 grid w-full max-w-3xl gap-4 md:mb-12 md:grid-cols-2 md:gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {highlights.map((highlight, index) => {
          const IconComponent = getIconByName(highlight.icon);

          return (
            <motion.div
              key={index}
              className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              variants={staggerChild}
            >
              {IconComponent && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <IconComponent className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                  {highlight.label}
                </span>
                <span className="text-lg font-bold md:text-xl">{highlight.value}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        className="max-w-xl text-center text-lg font-medium opacity-80 md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {closingMessage}
      </motion.p>
    </motion.div>
  );
}
