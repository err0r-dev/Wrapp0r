import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Audio } from 'remotion';
import type { WrappedExperience, Slide, ColorTheme } from '@wrapp0r/shared';
import {
  TitleSlide,
  StatSlide,
  ChartSlide,
  ListSlide,
  ComparisonSlide,
  QuoteSlide,
  SummarySlide,
} from './slides';

export interface WrappedCompositionProps {
  wrapped: WrappedExperience;
  includeAudio?: boolean;
  audioSrc?: string;
}

// Get background style from slide and theme
function getBackgroundStyle(background: Slide['background'], theme: ColorTheme): React.CSSProperties {
  switch (background.type) {
    case 'gradient':
      return { background: background.value };
    case 'pattern':
      // For patterns, use a subtle gradient as fallback
      return {
        background: `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)`,
      };
    case 'solid':
    default:
      return { backgroundColor: background.value || theme.background };
  }
}

// Map slide types to components
function SlideRenderer({ slide, theme }: { slide: Slide; theme: ColorTheme }) {
  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} />;
    case 'stat':
      return <StatSlide slide={slide} />;
    case 'chart':
      return <ChartSlide slide={slide} />;
    case 'list':
      return <ListSlide slide={slide} />;
    case 'comparison':
      return <ComparisonSlide slide={slide} />;
    case 'quote':
      return <QuoteSlide slide={slide} />;
    case 'summary':
      return <SummarySlide slide={slide} />;
    default:
      return null;
  }
}

// Animated background decoration - matches web SlideRenderer decorations
function BackgroundDecoration({ theme }: { theme: ColorTheme }) {
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

      {/* Animated background decoration */}
      <BackgroundDecoration theme={wrapped.theme} />

      {/* Render each slide as a sequence */}
      {wrapped.slides.map((slide, index) => (
        <Sequence
          key={slide.id}
          from={slideStartFrames[index]}
          durationInFrames={slideFrames[index]}
        >
          {/* Slide background */}
          <AbsoluteFill style={getBackgroundStyle(slide.background, wrapped.theme)} />

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
