import { AnimatePresence, motion } from 'framer-motion';
import type { Slide, ColorTheme, Background, DecorativeElement } from '@wrapp0r/shared';
import { getSlideComponent } from '@/lib/slide-registry';
import {
  ParticleDecoration,
  WaveDecoration,
  ShapeDecoration,
  GridDecoration,
  RingDecoration,
  SpotlightDecoration,
  GlowDecoration,
} from './decorations';

interface SlideRendererProps {
  slide: Slide;
  theme: ColorTheme;
  decorativeElement?: DecorativeElement;
}

/**
 * Adjusts a hex color's opacity by appending alpha value
 */
function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
}

/**
 * Creates a vibrant theme-based gradient
 * Always uses theme colors, ignoring AI-generated background values
 */
function getBackgroundStyle(_background: Background, theme: ColorTheme): React.CSSProperties {
  // Create a vibrant gradient using theme colors with stronger opacity
  // This ensures light themes look bright and distinctive
  const themeGradient = `linear-gradient(
    135deg,
    ${theme.background} 0%,
    ${withOpacity(theme.primary, 0.15)} 35%,
    ${withOpacity(theme.secondary, 0.2)} 65%,
    ${withOpacity(theme.accent, 0.1)} 100%
  )`;

  return { background: themeGradient };
}

/**
 * Renders the appropriate decorative element based on category
 */
function renderDecoration(
  element: DecorativeElement | undefined,
  theme: ColorTheme
): React.ReactNode {
  const props = {
    primaryColor: theme.primary,
    secondaryColor: theme.secondary,
    accentColor: theme.accent,
  };

  switch (element) {
    case 'particles':
      return <ParticleDecoration {...props} />;
    case 'waves':
      return <WaveDecoration {...props} />;
    case 'shapes':
      return <ShapeDecoration {...props} />;
    case 'grid':
      return <GridDecoration {...props} />;
    case 'rings':
      return <RingDecoration {...props} />;
    case 'spotlight':
      return <SpotlightDecoration {...props} />;
    case 'glow':
      return <GlowDecoration {...props} />;
    default:
      // Default: render generic blobs for backwards compatibility
      return null;
  }
}

export function SlideRenderer({ slide, theme, decorativeElement }: SlideRendererProps) {
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
        {/* Decorative background elements - category-specific or fallback blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {decorativeElement ? (
            renderDecoration(decorativeElement, theme)
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Slide content */}
        <div className="relative z-10 h-full w-full">
          <SlideComponent slide={slide as never} theme={theme} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
