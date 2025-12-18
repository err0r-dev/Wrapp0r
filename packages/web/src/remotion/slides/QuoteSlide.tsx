import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { QuoteSlide as QuoteSlideType } from '@wrapp0r/shared';

interface QuoteSlideProps {
  slide: QuoteSlideType;
}

export function QuoteSlide({ slide }: QuoteSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { quote, attribution } = slide.content;

  // Quote mark animation
  const quoteMarkOpacity = interpolate(
    frame,
    [0, fps * 0.3],
    [0, 0.2],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const quoteMarkScale = interpolate(
    frame,
    [0, fps * 0.5],
    [0.5, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Quote text animation
  const quoteOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 0.8],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const quoteY = interpolate(
    frame,
    [fps * 0.3, fps * 0.8],
    [30, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Attribution animation
  const attrOpacity = interpolate(
    frame,
    [fps * 1, fps * 1.3],
    [0, 0.6],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <div className="relative max-w-3xl text-center">
        {/* Decorative quote marks */}
        <span
          className="absolute -left-8 -top-8 font-serif text-8xl md:-left-12 md:-top-12 md:text-9xl"
          style={{
            opacity: quoteMarkOpacity,
            transform: `scale(${quoteMarkScale})`,
          }}
        >
          "
        </span>

        <blockquote
          className="relative z-10 text-2xl font-medium italic leading-relaxed md:text-3xl lg:text-4xl"
          style={{
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
          }}
        >
          {quote}
        </blockquote>

        <span
          className="absolute -bottom-8 -right-8 font-serif text-8xl md:-bottom-12 md:-right-12 md:text-9xl"
          style={{
            opacity: quoteMarkOpacity,
            transform: `scale(${quoteMarkScale}) rotate(180deg)`,
          }}
        >
          "
        </span>

        {attribution && (
          <p
            className="mt-8 text-lg md:text-xl"
            style={{ opacity: attrOpacity }}
          >
            — {attribution}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
}
