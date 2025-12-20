import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ListSlide as ListSlideType, ColorTheme } from '@wrapp0r/shared';
import { useEasedProgress, useStaggeredProgress } from '../animations';

interface ListSlideProps {
  slide: ListSlideType;
  theme?: ColorTheme;
}

export function ListSlide({ slide, theme }: ListSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, items, layout } = slide.content;

  // Title animation
  const titleProgress = useEasedProgress({ delay: 0, duration: 0.3, easing: 'easeOut' });

  // Subtitle animation
  const subtitleProgress = useEasedProgress({ delay: 0.15, duration: 0.3, easing: 'easeOut' });

  // Staggered item animations
  const itemProgresses = useStaggeredProgress(items.length, {
    staggerDelay: 0.1,
    startDelay: 0.4,
    duration: 0.35,
    easing: 'easeOutBack',
  });

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
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [-20, 0])}px)`,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mb-8 text-lg md:text-xl"
          style={{ opacity: subtitleProgress * 0.7 }}
        >
          {subtitle}
        </p>
      )}

      <div className={`w-full max-w-2xl ${getLayoutClasses()}`}>
        {items.map((item, index) => {
          const progress = itemProgresses[index];
          const translateY = interpolate(progress, [0, 1], [20, 0]);
          const scale = interpolate(progress, [0, 1], [0.9, 1]);

          if (layout === 'ranked') {
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm"
                style={{
                  opacity: progress,
                  transform: `translateY(${translateY}px) scale(${scale})`,
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
                className="flex flex-col items-center justify-center rounded-lg bg-white/10 p-4 text-center backdrop-blur-sm"
                style={{
                  opacity: progress,
                  transform: `scale(${scale})`,
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
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
              style={{
                opacity: progress,
                transform: `scale(${scale})`,
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
