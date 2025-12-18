import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SummarySlide as SummarySlideType } from '@wrapp0r/shared';
import { getIconByName } from '@/lib/icons';

interface SummarySlideProps {
  slide: SummarySlideType;
}

export function SummarySlide({ slide }: SummarySlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, highlights, closingMessage } = slide.content;

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.3],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const titleY = interpolate(
    frame,
    [0, fps * 0.3],
    [-20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Closing message animation
  const closingOpacity = interpolate(
    frame,
    [fps * 2, fps * 2.5],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const closingY = interpolate(
    frame,
    [fps * 2, fps * 2.5],
    [20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <h2
        className="mb-8 text-3xl font-bold md:text-4xl"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h2>

      <div className={`mb-8 grid gap-4 ${highlights.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {highlights.map((highlight, index) => {
          const itemDelay = fps * 0.4 + index * (fps * 0.15);
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.3],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const itemScale = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.3],
            [0.8, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );

          const IconComponent = getIconByName(highlight.icon);

          return (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg bg-white/10 p-4 text-center"
              style={{
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
              }}
            >
              {IconComponent && (
                <IconComponent className="mb-2 h-6 w-6 opacity-70" />
              )}
              <span className="text-2xl font-bold">{highlight.value}</span>
              <span className="text-sm opacity-70">{highlight.label}</span>
            </div>
          );
        })}
      </div>

      <p
        className="max-w-xl text-center text-xl md:text-2xl"
        style={{
          opacity: closingOpacity,
          transform: `translateY(${closingY}px)`,
        }}
      >
        {closingMessage}
      </p>
    </AbsoluteFill>
  );
}
