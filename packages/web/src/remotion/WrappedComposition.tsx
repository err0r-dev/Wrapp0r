import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Audio } from 'remotion';
import type { WrappedExperience, Slide, ColorTheme, DecorativeElement } from '@wrapp0r/shared';
import { CATEGORY_THEMES } from '@wrapp0r/shared';
import {
  TitleSlide,
  StatSlide,
  ChartSlide,
  ListSlide,
  ComparisonSlide,
  QuoteSlide,
  SummarySlide,
} from './slides';
import {
  ParticleDecoration,
  WaveDecoration,
  ShapeDecoration,
  GridDecoration,
  RingDecoration,
  SpotlightDecoration,
  GlowDecoration,
} from './decorations';

export interface WrappedCompositionProps {
  wrapped: WrappedExperience;
  includeAudio?: boolean;
  audioSrc?: string;
}

// Derive decorative element from theme (same logic as WrappedViewer)
function getDecorativeElement(theme: ColorTheme): DecorativeElement | undefined {
  const matched = Object.entries(CATEGORY_THEMES).find(
    ([, t]) => t.primary === theme.primary
  );
  return matched ? matched[1].decorativeElement : undefined;
}

/**
 * Adjusts a hex color's opacity by appending alpha value
 */
function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
}

/**
 * Creates a subtle theme-based gradient
 * Always uses theme colors, ignoring AI-generated background values
 * (matches web SlideRenderer behavior)
 */
function getBackgroundStyle(_background: Slide['background'], theme: ColorTheme): React.CSSProperties {
  // Create a subtle gradient using theme colors with low opacity
  // This ensures themes look consistent between viewer and export
  const themeGradient = `linear-gradient(
    135deg,
    ${theme.background} 0%,
    ${withOpacity(theme.primary, 0.15)} 35%,
    ${withOpacity(theme.secondary, 0.2)} 65%,
    ${withOpacity(theme.accent, 0.1)} 100%
  )`;

  return { background: themeGradient };
}

// Map slide types to components
function SlideRenderer({ slide, theme }: { slide: Slide; theme: ColorTheme }) {
  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} theme={theme} />;
    case 'stat':
      return <StatSlide slide={slide} theme={theme} />;
    case 'chart':
      return <ChartSlide slide={slide} theme={theme} />;
    case 'list':
      return <ListSlide slide={slide} theme={theme} />;
    case 'comparison':
      return <ComparisonSlide slide={slide} theme={theme} />;
    case 'quote':
      return <QuoteSlide slide={slide} theme={theme} />;
    case 'summary':
      return <SummarySlide slide={slide} theme={theme} />;
    default:
      return null;
  }
}

// Render decoration based on type
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
      return <FallbackDecoration theme={theme} />;
  }
}

// Fallback animated background decoration (generic blobs)
function FallbackDecoration({ theme }: { theme: ColorTheme }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow floating animation matching web version
  // Web uses: duration 8s (primary), 10s (secondary), 6s (accent)
  const primaryOffset = {
    x: Math.sin(frame / fps / 8 * 2 * Math.PI) * 30,
    y: Math.sin(frame / fps / 8 * 2 * Math.PI + 0.5) * 20,
  };
  const secondaryOffset = {
    x: Math.cos(frame / fps / 10 * 2 * Math.PI) * 20,
    y: Math.cos(frame / fps / 10 * 2 * Math.PI + 0.5) * 30,
  };
  const accentScale = 1 + Math.sin(frame / fps / 6 * 2 * Math.PI) * 0.2;

  return (
    <>
      {/* Primary blob - top left */}
      <div
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: theme.primary,
          transform: `translate(${primaryOffset.x}px, ${primaryOffset.y}px)`,
        }}
      />
      {/* Secondary blob - bottom right - matches web h-96 and opacity-20 */}
      <div
        className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: theme.secondary,
          transform: `translate(${secondaryOffset.x}px, ${secondaryOffset.y}px)`,
        }}
      />
      {/* Accent blob - center - matches web blur-3xl */}
      <div
        className="absolute left-1/2 top-1/2 h-48 w-48 rounded-full opacity-10 blur-3xl"
        style={{
          backgroundColor: theme.accent,
          transform: `translate(-50%, -50%) scale(${accentScale})`,
        }}
      />
    </>
  );
}

// Transition overlay between slides
function SlideTransition({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame();

  // Fade out at the end of the slide
  const fadeOutStart = durationInFrames - 15;
  const opacity = interpolate(
    frame,
    [fadeOutStart, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'black',
        opacity,
      }}
    />
  );
}

export function WrappedComposition({ wrapped, includeAudio = true, audioSrc }: WrappedCompositionProps) {
  const { fps } = useVideoConfig();

  // Derive decorative element from theme (matches web viewer behavior)
  const decorativeElement = getDecorativeElement(wrapped.theme);

  // Calculate frame positions for each slide
  const slideFrames = wrapped.slides.map((slide) => {
    // Convert duration from ms to frames
    return Math.round((slide.duration / 1000) * fps);
  });

  // Calculate cumulative start frames
  let currentFrame = 0;
  const slideStartFrames = slideFrames.map((frames) => {
    const start = currentFrame;
    currentFrame += frames;
    return start;
  });

  return (
    <AbsoluteFill
      style={{
        color: wrapped.theme.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Background base color */}
      <AbsoluteFill style={{ backgroundColor: wrapped.theme.background }} />

      {/* Render each slide as a sequence */}
      {wrapped.slides.map((slide, index) => (
        <Sequence
          key={slide.id}
          from={slideStartFrames[index]}
          durationInFrames={slideFrames[index]}
        >
          {/* Slide background */}
          <AbsoluteFill style={getBackgroundStyle(slide.background, wrapped.theme)} />

          {/* Animated background decoration - category-specific (rendered per slide, after background) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {renderDecoration(decorativeElement, wrapped.theme)}
          </div>

          {/* Slide content */}
          <SlideRenderer slide={slide} theme={wrapped.theme} />

          {/* Transition overlay */}
          <SlideTransition durationInFrames={slideFrames[index]} />
        </Sequence>
      ))}

      {/* Audio track */}
      {includeAudio && audioSrc && (
        <Audio
          src={audioSrc}
          volume={(f) => {
            // Fade in over first 2 seconds
            const fadeIn = interpolate(f, [0, fps * 2], [0, 0.4], {
              extrapolateRight: 'clamp',
            });
            // Fade out over last 2 seconds
            const totalFrames = slideStartFrames[slideStartFrames.length - 1] + slideFrames[slideFrames.length - 1];
            const fadeOut = interpolate(f, [totalFrames - fps * 2, totalFrames], [0.4, 0], {
              extrapolateLeft: 'clamp',
            });
            return Math.min(fadeIn, fadeOut > 0 ? fadeOut : fadeIn);
          }}
        />
      )}
    </AbsoluteFill>
  );
}

// Calculate total duration in frames for the composition
export function calculateTotalDuration(wrapped: WrappedExperience, fps: number): number {
  return wrapped.slides.reduce((total, slide) => {
    return total + Math.round((slide.duration / 1000) * fps);
  }, 0);
}
