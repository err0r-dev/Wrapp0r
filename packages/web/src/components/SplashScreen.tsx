import { useState, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DataRibbons } from './splash/DataRibbons';
import { FloatingData } from './splash/FloatingData';
import { DataVortex } from './splash/DataVortex';

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  // Track normalized mouse position (0-1)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  // Calculate 3D tilt based on mouse position
  const tiltX = prefersReducedMotion ? 0 : (mousePos.y - 0.5) * -15;
  const tiltY = prefersReducedMotion ? 0 : (mousePos.x - 0.5) * 15;

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
      onClick={onContinue}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      role="button"
      tabIndex={0}
      aria-label="Click to continue to Wrapp0r"
    >
      {/* Layer 1: Animated gradient ribbons */}
      <DataRibbons />

      {/* Layer 2: Particle vortex (canvas) */}
      {!prefersReducedMotion && <DataVortex mousePos={mousePos} />}

      {/* Layer 3: Floating data elements with parallax */}
      <FloatingData mousePos={mousePos} />

      {/* Layer 4: Center content with 3D tilt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Logo container with 3D perspective */}
        <motion.div
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            type: 'spring',
            stiffness: 150,
            damping: 15,
          }}
        >
          <motion.div
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="relative">
              {/* Main logo */}
              <div
                className="flex h-32 w-32 items-center justify-center rounded-3xl shadow-2xl md:h-36 md:w-36"
                style={{
                  background: 'linear-gradient(135deg, #1DB954 0%, #00D4FF 100%)',
                  boxShadow: '0 25px 50px -12px rgba(29, 185, 84, 0.4)',
                }}
              >
                <span className="text-7xl font-bold text-white md:text-8xl">W</span>
              </div>

              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl -z-10"
                style={{
                  background: 'linear-gradient(135deg, #1DB954 0%, #00D4FF 100%)',
                  filter: 'blur(40px)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Secondary glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl -z-20"
                style={{
                  background: 'radial-gradient(circle, #FF2D6A 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
                animate={{
                  scale: [1.2, 1.6, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="mt-8 text-5xl font-bold text-white md:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
        >
          Wrapp<span style={{ color: '#1DB954' }}>0</span>r
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mt-3 text-xl text-white/70 md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Your Data, Wrapped
        </motion.p>

        {/* Click prompt */}
        <motion.div
          className="mt-16 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <motion.p
            className="text-base text-white/50"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Click anywhere to begin
          </motion.p>
        </motion.div>

        {/* Subtle hint arrow */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 2.2, duration: 0.5 },
            y: { delay: 2.2, duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute left-4 top-4 h-16 w-16 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
      <div className="absolute right-4 top-4 h-16 w-16 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 h-16 w-16 border-b-2 border-l-2 border-white/10 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 h-16 w-16 border-b-2 border-r-2 border-white/10 rounded-br-lg" />
    </motion.div>
  );
}
