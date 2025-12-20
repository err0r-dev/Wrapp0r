import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { Quote } from 'lucide-react';
import type { QuoteSlide as QuoteSlideType, ColorTheme } from '@wrapp0r/shared';
import { useEasedProgress } from '../animations';

interface QuoteSlideProps {
  slide: QuoteSlideType;
  theme?: ColorTheme;
}

export function QuoteSlide({ slide, theme }: QuoteSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { quote, attribution } = slide.content;

  // Quote icon animation with spring
  const iconSpring = spring({
    frame: Math.max(0, frame - fps * 0.2),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Quote text animation
  const quoteProgress = useEasedProgress({ delay: 0.3, duration: 0.5, easing: 'easeOut' });

  // Attribution animation
  const attrProgress = useEasedProgress({ delay: 0.7, duration: 0.4, easing: 'easeOut' });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-6 md:px-12">
      <div className="relative max-w-3xl">
        {/* Top-left Quote icon */}
        <div
          className="absolute -left-6 -top-6 md:-left-10 md:-top-10"
          style={{
            opacity: iconSpring * 0.2,
            transform: `scale(${iconSpring}) rotate(${interpolate(iconSpring, [0, 1], [-30, 0])}deg)`,
          }}
        >
          <Quote className="h-12 w-12 md:h-20 md:w-20" />
        </div>

        <blockquote
          className="relative z-10 text-center text-xl font-medium leading-relaxed md:text-3xl lg:text-4xl"
          style={{
            opacity: quoteProgress,
            transform: `translateY(${interpolate(quoteProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          "{quote}"
        </blockquote>

        {/* Bottom-right Quote icon (rotated) */}
        <div
          className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10"
          style={{
            opacity: iconSpring * 0.2,
            transform: `scale(${iconSpring}) rotate(${interpolate(iconSpring, [0, 1], [210, 180])}deg)`,
          }}
        >
          <Quote className="h-12 w-12 md:h-20 md:w-20" />
        </div>
      </div>

      {attribution && (
        <p
          className="mt-8 text-sm font-medium uppercase tracking-wider md:mt-12 md:text-base"
          style={{
            opacity: attrProgress * 0.6,
            transform: `translateY(${interpolate(attrProgress, [0, 1], [10, 0])}px)`,
          }}
        >
          — {attribution}
        </p>
      )}
    </AbsoluteFill>
  );
}
