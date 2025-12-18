import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';
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

// Animated background decoration
function BackgroundDecoration({ theme }: { theme: ColorTheme }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow rotating/floating circles
  const rotation = (frame / fps) * 10; // 10 degrees per second
  const float1 = Math.sin(frame / fps) * 20;
  const float2 = Math.cos(frame / fps * 0.7) * 15;

  return (
    <>
      <div
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: theme.primary,
          transform: `translate(${float1}px, ${float2}px) rotate(${rotation}deg)`,
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{
          backgroundColor: theme.secondary,
          transform: `translate(${-float2}px, ${-float1}px) rotate(${-rotation}deg)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-2xl"
        style={{
          backgroundColor: theme.accent,
          transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / fps * 0.5) * 0.1})`,
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

export function WrappedComposition({ wrapped, includeAudio = true }: WrappedCompositionProps) {
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

  // Get audio file path based on music mood
  const audioSrc = `/audio/${wrapped.musicMood}.mp3`;

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
      {includeAudio && (
        <Audio
          src={staticFile(audioSrc)}
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
