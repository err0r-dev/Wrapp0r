import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { ColorTheme } from '@wrapp0r/shared';

interface BrandingFooterProps {
  theme: ColorTheme;
}

export function BrandingFooter({ theme }: BrandingFooterProps) {
  const { height } = useVideoConfig();

  // Scale font size based on video height
  // Base: 14px at 720p, scales proportionally
  const baseFontSize = Math.round(height * 0.019);
  const smallFontSize = Math.round(baseFontSize * 0.85);
  const bottomPadding = Math.round(height * 0.028);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: bottomPadding,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: Math.round(height * 0.004),
          opacity: 0.6,
        }}
      >
        <span
          style={{
            color: theme.text,
            fontSize: baseFontSize,
            fontWeight: 500,
          }}
        >
          Wrapp0r, powered by err0r.dev
        </span>
        <span
          style={{
            color: theme.text,
            fontSize: smallFontSize,
          }}
        >
          Available at err0r.dev/wrapp0r
        </span>
      </div>
    </AbsoluteFill>
  );
}
