import { motion } from 'framer-motion';

interface RingDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Productivity theme decoration - expanding focus rings
 * Creates a clean, minimal feel with concentric circles
 */
export function RingDecoration({ primaryColor, secondaryColor, accentColor }: RingDecorationProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Center expanding rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border-2"
            style={{
              borderColor: i % 2 === 0 ? primaryColor : secondaryColor,
              width: 100 + i * 80,
              height: 100 + i * 80,
              left: -(50 + i * 40),
              top: -(50 + i * 40),
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.1, 0.8],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Corner rings */}
      <motion.div
        className="absolute -left-16 -top-16 h-32 w-32 rounded-full border-2"
        style={{ borderColor: primaryColor, opacity: 0.1 }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full border-2"
        style={{ borderColor: secondaryColor, opacity: 0.1 }}
        animate={{
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Accent dots at ring intersections */}
      <motion.div
        className="absolute h-3 w-3 rounded-full"
        style={{ backgroundColor: accentColor, left: '30%', top: '25%', opacity: 0.5 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute h-3 w-3 rounded-full"
        style={{ backgroundColor: primaryColor, right: '25%', bottom: '30%', opacity: 0.5 }}
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.8, 0.5, 0.8],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
