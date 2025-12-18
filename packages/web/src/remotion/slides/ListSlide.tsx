import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ListSlide as ListSlideType } from '@wrapp0r/shared';

interface ListSlideProps {
  slide: ListSlideType;
}

export function ListSlide({ slide }: ListSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, items, layout } = slide.content;

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

  // Subtitle animation
  const subtitleOpacity = interpolate(
    frame,
    [fps * 0.2, fps * 0.5],
    [0, 0.7],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-2 gap-4 md:grid-cols-3';
      case 'horizontal':
        return 'flex flex-wrap justify-center gap-4';
      case 'ranked':
      default:
        return 'flex flex-col gap-3';
    }
  };

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <h2
        className="mb-2 text-3xl font-bold md:text-4xl"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mb-8 text-lg md:text-xl"
          style={{ opacity: subtitleOpacity }}
        >
          {subtitle}
        </p>
      )}

      <div className={`w-full max-w-2xl ${getLayoutClasses()}`}>
        {items.map((item, index) => {
          const itemDelay = fps * 0.4 + index * (fps * 0.15);
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.3],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const itemY = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.3],
            [20, 0],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const itemScale = interpolate(
            frame,
            [itemDelay, itemDelay + fps * 0.3],
            [0.9, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );

          if (layout === 'ranked') {
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg bg-white/10 p-4"
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px) scale(${itemScale})`,
                }}
              >
                {item.rank && (
                  <span className="text-3xl font-bold opacity-50">#{item.rank}</span>
                )}
                {item.emoji && <span className="text-2xl">{item.emoji}</span>}
                <div className="flex-1">
                  <span className="text-lg font-medium">{item.label}</span>
                  {item.value && (
                    <span className="ml-2 text-sm opacity-70">{item.value}</span>
                  )}
                </div>
              </div>
            );
          }

          if (layout === 'grid') {
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center rounded-lg bg-white/10 p-4 text-center"
                style={{
                  opacity: itemOpacity,
                  transform: `scale(${itemScale})`,
                }}
              >
                {item.emoji && <span className="mb-2 text-3xl">{item.emoji}</span>}
                <span className="font-medium">{item.label}</span>
                {item.value && (
                  <span className="mt-1 text-sm opacity-70">{item.value}</span>
                )}
              </div>
            );
          }

          // Horizontal layout
          return (
            <div
              key={index}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"
              style={{
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
              }}
            >
              {item.emoji && <span className="text-xl">{item.emoji}</span>}
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
