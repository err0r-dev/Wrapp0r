import { motion } from 'framer-motion';

interface GlowDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Gaming theme decoration - neon pulsing glow orbs
 * Creates a dynamic, electric feel with glowing elements
 */
export function GlowDecoration({ primaryColor, secondaryColor, accentColor }: GlowDecorationProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main glow orbs */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${primaryColor}60 0%, ${primaryColor}00 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}50 0%, ${secondaryColor}00 70%)`,
          filter: 'blur(25px)',
        }}
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

      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, ${accentColor}00 70%)`,
          filter: 'blur(15px)',
        }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Fast-moving small orbs */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute h-4 w-4 rounded-full"
          style={{
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            boxShadow: `0 0 20px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, i % 2 === 0 ? 30 : -30, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Neon line accents */}
      <motion.div
        className="absolute left-10 top-1/3 h-0.5 w-20"
        style={{
          backgroundColor: primaryColor,
          boxShadow: `0 0 10px ${primaryColor}`,
        }}
        animate={{
          width: [80, 120, 80],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-10 h-0.5 w-24"
        style={{
          backgroundColor: secondaryColor,
          boxShadow: `0 0 10px ${secondaryColor}`,
        }}
        animate={{
          width: [96, 140, 96],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: primaryColor, opacity: 0.15 }}
      />
      <div
        className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: secondaryColor, opacity: 0.15 }}
      />
    </div>
  );
}
