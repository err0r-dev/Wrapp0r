import { motion } from 'framer-motion';

interface WaveDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Music theme decoration - pulsing sound wave arcs
 * Creates a rhythmic, beat-synced feel
 */
export function WaveDecoration({ primaryColor, secondaryColor, accentColor }: WaveDecorationProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Left side waves */}
      <svg
        className="absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2"
        viewBox="0 0 200 200"
        fill="none"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`left-${i}`}
            d={`M 100 ${50 + i * 25} Q 150 100, 100 ${150 - i * 25}`}
            stroke={i % 2 === 0 ? primaryColor : secondaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Right side waves */}
      <svg
        className="absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rotate-180"
        viewBox="0 0 200 200"
        fill="none"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`right-${i}`}
            d={`M 100 ${50 + i * 25} Q 150 100, 100 ${150 - i * 25}`}
            stroke={i % 2 === 0 ? secondaryColor : accentColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3 + 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Center equalizer bars */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-end gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={`bar-${i}`}
            className="w-2 rounded-full"
            style={{ backgroundColor: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : accentColor }}
            initial={{ height: 10, opacity: 0.4 }}
            animate={{
              height: [10, 30 + Math.random() * 30, 10],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
