import { AnimatePresence, motion } from 'framer-motion';
import type { Slide, ColorTheme, Background } from '@wrapp0r/shared';
import { getSlideComponent } from '@/lib/slide-registry';

interface SlideRendererProps {
  slide: Slide;
  theme: ColorTheme;
}

function getBackgroundStyle(background: Background, theme: ColorTheme): React.CSSProperties {
  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.value || theme.background };
    case 'gradient':
      return { background: background.value };
    case 'pattern':
      // For pattern, we could expand this later with SVG patterns
      return { backgroundColor: theme.background };
    default:
      return { backgroundColor: theme.background };
  }
}

export function SlideRenderer({ slide, theme }: SlideRendererProps) {
  const SlideComponent = getSlideComponent(slide.type);
  const backgroundStyle = getBackgroundStyle(slide.background, theme);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slide.id}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          ...backgroundStyle,
          color: theme.text,
          '--theme-primary': theme.primary,
          '--theme-secondary': theme.secondary,
          '--theme-accent': theme.accent,
        } as React.CSSProperties}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: theme.primary }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: theme.secondary }}
            animate={{
              x: [0, -20, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: theme.accent }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Slide content */}
        <div className="relative z-10 h-full w-full">
          <SlideComponent slide={slide as never} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
