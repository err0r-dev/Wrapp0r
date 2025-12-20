import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ComparisonSlide as ComparisonSlideType, ColorTheme } from '@wrapp0r/shared';
import { getIconByName } from '../../lib/icons';

interface ComparisonSlideProps {
  slide: ComparisonSlideType;
  theme?: ColorTheme;
}

export function ComparisonSlide({ slide, theme }: ComparisonSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, items } = slide.content;

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

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <h2
        className="mb-12 text-3xl font-bold md:text-4xl"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h2>

      <div className={`grid gap-6 ${items.length === 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {items.map((item, index) => {
          const itemDelay = fps * 0.3 + index * (fps * 0.2);
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.4],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const itemScale = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.4],
            [0.8, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );

          const IconComponent = getIconByName(item.icon);

          return (
            <div
              key={index}
              className="flex flex-col items-center text-center"
              style={{
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
              }}
            >
              {IconComponent && (
                <div className="mb-4 rounded-full bg-white/10 p-4">
                  <IconComponent className="h-8 w-8 md:h-10 md:w-10" />
                </div>
              )}

              <span className="text-3xl font-bold md:text-4xl lg:text-5xl">
                {item.value}
              </span>

              <span className="mt-2 text-sm opacity-70 md:text-base">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
