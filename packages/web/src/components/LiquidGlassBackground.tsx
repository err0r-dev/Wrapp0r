import { useState, useCallback, memo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DataRibbons } from './splash/DataRibbons';
import { FloatingData } from './splash/FloatingData';
import { DataVortex } from './splash/DataVortex';
import { useTheme } from './layout/ThemeProvider';

/**
 * Apple-style liquid glass background effect.
 * Uses the same visual elements as the splash screen but heavily blurred
 * to create a frosted glass aesthetic behind the main content.
 */
export const LiquidGlassBackground = memo(function LiquidGlassBackground() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a12 0%, #1A1A2E 50%, #0f0f1a 100%)'
    : 'linear-gradient(135deg, #FFFFFF 0%, #F0F2F5 50%, #E8ECF0 100%)';

  const vignette = isDark
    ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
    : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.4) 100%)';

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Throttle updates for performance
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: bgGradient,
        }}
      />

      {/* Animated elements container - light blur for visible movement */}
      <div
        className="absolute inset-0"
        style={{
          filter: 'blur(25px) saturate(1.6)',
          opacity: 1,
        }}
      >
        {/* Ribbons - the main flowing gradients */}
        <DataRibbons />

        {/* Floating data elements */}
        <FloatingData mousePos={mousePos} />
      </div>

      {/* Particle vortex layer - minimal blur for clear movement */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            filter: 'blur(8px)',
            opacity: 0.75,
          }}
        >
          <DataVortex mousePos={mousePos} isDark={isDark} />
        </div>
      )}

      {/* Subtle noise texture overlay for glass effect */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: vignette,
        }}
      />
    </div>
  );
});
