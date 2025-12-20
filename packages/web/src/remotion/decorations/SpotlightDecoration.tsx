import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface SpotlightDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Entertainment theme decoration - theatrical spotlight beams
 * Remotion version using frame-based div animations
 */
export function SpotlightDecoration({ primaryColor, secondaryColor, accentColor }: SpotlightDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  // Main spotlight animation
  const spotlight1Duration = 6;
  const spotlight1Progress = (time % spotlight1Duration) / spotlight1Duration;
  const spotlight1Wave = Math.sin(spotlight1Progress * Math.PI * 2);
  const spotlight1Opacity = 0.3 + spotlight1Wave * 0.3;
  const spotlight1X = spotlight1Wave * 50;

  // Secondary spotlight animation
  const spotlight2Duration = 8;
  const spotlight2Progress = ((time - 2) % spotlight2Duration + spotlight2Duration) % spotlight2Duration / spotlight2Duration;
  const spotlight2Wave = Math.sin(spotlight2Progress * Math.PI * 2);
  const spotlight2Opacity = 0.2 + spotlight2Wave * 0.3;
  const spotlight2X = spotlight2Wave * -30;

  // Film strip entrance animation
  const filmStripProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Star animations
  const star1Duration = 4;
  const star1Progress = (time % star1Duration) / star1Duration;
  const star1Scale = 0.8 + Math.sin(star1Progress * Math.PI * 2) * 0.4;
  const star1Opacity = 0.3 + Math.sin(star1Progress * Math.PI * 2) * 0.4;
  const star1Rotation = star1Progress * 360;

  const star2Duration = 5;
  const star2Progress = (time % star2Duration) / star2Duration;
  const star2Scale = 1.2 - Math.sin(star2Progress * Math.PI * 2) * 0.4;
  const star2Opacity = 0.5 - Math.sin(star2Progress * Math.PI * 2) * 0.3;
  const star2Rotation = 360 - star2Progress * 360;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main spotlight beam from top-left */}
      <div
        className="absolute -left-20 -top-20 origin-top-left"
        style={{
          width: '150%',
          height: 200,
          background: `linear-gradient(135deg, ${primaryColor}30 0%, transparent 70%)`,
          transform: `rotate(45deg) translateX(${spotlight1X}px)`,
          opacity: spotlight1Opacity,
        }}
      />

      {/* Secondary spotlight from top-right */}
      <div
        className="absolute -right-20 -top-20 origin-top-right"
        style={{
          width: '150%',
          height: 150,
          background: `linear-gradient(-135deg, ${secondaryColor}25 0%, transparent 60%)`,
          transform: `rotate(-45deg) translateX(${spotlight2X}px)`,
          opacity: spotlight2Opacity,
        }}
      />

      {/* Film strip decoration on left side */}
      <div className="absolute left-4 top-1/4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => {
          const itemProgress = interpolate(
            frame,
            [fps * (i * 0.1), fps * (i * 0.1 + 0.5)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={`strip-l-${i}`}
              className="h-2 w-6 rounded-sm"
              style={{
                backgroundColor: primaryColor,
                opacity: 0.2 * itemProgress,
                transform: `translateX(${-20 * (1 - itemProgress)}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Film strip decoration on right side */}
      <div className="absolute right-4 bottom-1/4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => {
          const itemProgress = interpolate(
            frame,
            [fps * (0.5 + i * 0.1), fps * (0.5 + i * 0.1 + 0.5)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={`strip-r-${i}`}
              className="h-2 w-6 rounded-sm"
              style={{
                backgroundColor: secondaryColor,
                opacity: 0.2 * itemProgress,
                transform: `translateX(${20 * (1 - itemProgress)}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Star bursts */}
      <div
        className="absolute"
        style={{
          left: '15%',
          top: '20%',
          transform: `scale(${star1Scale}) rotate(${star1Rotation}deg)`,
          opacity: star1Opacity,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={accentColor}>
          <polygon points="12,0 14,10 24,10 16,16 18,24 12,20 6,24 8,16 0,10 10,10" />
        </svg>
      </div>

      <div
        className="absolute"
        style={{
          right: '20%',
          bottom: '25%',
          transform: `scale(${star2Scale}) rotate(${star2Rotation}deg)`,
          opacity: star2Opacity,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={primaryColor}>
          <polygon points="12,0 14,10 24,10 16,16 18,24 12,20 6,24 8,16 0,10 10,10" />
        </svg>
      </div>
    </div>
  );
}
