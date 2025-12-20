import { motion } from 'framer-motion';
import type { ComparisonSlide as ComparisonSlideType } from '@wrapp0r/shared';
import { getAnimationVariants, staggerContainer, staggerChild } from '@/lib/animation-variants';
import { getIconByName } from '@/lib/icons';

interface ComparisonSlideProps {
  slide: ComparisonSlideType;
}

export function ComparisonSlide({ slide }: ComparisonSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { title, items } = slide.content;

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
        className={`grid w-full max-w-4xl gap-4 md:gap-6 ${
          items.length === 2
            ? 'grid-cols-2'
            : items.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-2 md:grid-cols-4'
        }`}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {items.map((item, index) => {
          const IconComponent = getIconByName(item.icon);

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm md:p-8"
              variants={staggerChild}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {IconComponent && (
                <IconComponent className="mb-3 h-8 w-8 opacity-70 md:mb-4 md:h-12 md:w-12" />
              )}
              <span className="text-center text-3xl font-bold md:text-5xl">
                {item.value}
              </span>
              <span className="mt-2 text-center text-xs font-medium uppercase tracking-wider opacity-70 md:text-sm">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
