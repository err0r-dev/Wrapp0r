import { motion } from 'framer-motion';
import type { ListSlide as ListSlideType } from '@wrapp0r/shared';
import { getAnimationVariants, staggerContainer, staggerChild } from '@/lib/animation-variants';

interface ListSlideProps {
  slide: ListSlideType;
}

export function ListSlide({ slide }: ListSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { title, subtitle, items, layout } = slide.content;

  // Sort items by rank if rank is defined (rank 1 = highest/first)
  const sortedItems = [...items].sort((a, b) => {
    if (a.rank !== undefined && b.rank !== undefined) {
      return a.rank - b.rank;
    }
    // Items with rank come before items without
    if (a.rank !== undefined) return -1;
    if (b.rank !== undefined) return 1;
    return 0;
  });

  const renderItems = () => {
    switch (layout) {
      case 'grid':
        return (
          <motion.div
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sortedItems.map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-4 backdrop-blur-sm md:p-6"
                variants={staggerChild}
              >
                {item.emoji && (
                  <span className="mb-2 text-3xl md:text-4xl">{item.emoji}</span>
                )}
                <span className="text-center text-sm font-medium md:text-base">
                  {item.label}
                </span>
                {item.value && (
                  <span className="mt-1 text-xs opacity-70 md:text-sm">
                    {item.value}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        );

      case 'horizontal':
        return (
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sortedItems.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm md:px-6 md:py-3"
                variants={staggerChild}
              >
                {item.emoji && <span className="text-xl md:text-2xl">{item.emoji}</span>}
                <span className="text-sm font-medium md:text-base">{item.label}</span>
                {item.value && (
                  <span className="text-xs opacity-70 md:text-sm">{item.value}</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        );

      case 'ranked':
      default:
        return (
          <motion.div
            className="flex w-full max-w-lg flex-col gap-3 md:gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sortedItems.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-white/10 p-3 backdrop-blur-sm md:p-4"
                variants={staggerChild}
              >
                {item.rank !== undefined && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold md:h-10 md:w-10 md:text-xl">
                    {item.rank}
                  </span>
                )}
                {item.emoji && (
                  <span className="shrink-0 text-2xl md:text-3xl">{item.emoji}</span>
                )}
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold md:text-base">
                    {item.label}
                  </span>
                  {item.value && (
                    <span className="text-xs opacity-70 md:text-sm">{item.value}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-4 md:px-8"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.h2
        className="mb-2 text-center text-2xl font-bold md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          className="mb-6 text-center text-sm opacity-70 md:mb-8 md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
      )}

      {renderItems()}
    </motion.div>
  );
}
