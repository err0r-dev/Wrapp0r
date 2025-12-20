import { motion } from 'framer-motion';

interface SpotlightDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Entertainment theme decoration - theatrical spotlight beams
 * Creates a dramatic, cinematic feel with sweeping lights
 */
export function SpotlightDecoration({ primaryColor, secondaryColor, accentColor }: SpotlightDecorationProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main spotlight beam from top-left */}
      <motion.div
        className="absolute -left-20 -top-20 origin-top-left"
        style={{
          width: '150%',
          height: 200,
          background: `linear-gradient(135deg, ${primaryColor}30 0%, transparent 70%)`,
          transform: 'rotate(45deg)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary spotlight from top-right */}
      <motion.div
        className="absolute -right-20 -top-20 origin-top-right"
        style={{
          width: '150%',
          height: 150,
          background: `linear-gradient(-135deg, ${secondaryColor}25 0%, transparent 60%)`,
          transform: 'rotate(-45deg)',
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Film strip decoration on sides */}
      <div className="absolute left-4 top-1/4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`strip-l-${i}`}
            className="h-2 w-6 rounded-sm"
            style={{ backgroundColor: primaryColor, opacity: 0.2 }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      </div>

      <div className="absolute right-4 bottom-1/4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`strip-r-${i}`}
            className="h-2 w-6 rounded-sm"
            style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.2 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
          />
        ))}
      </div>

      {/* Star bursts */}
      <motion.div
        className="absolute"
        style={{ left: '15%', top: '20%' }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={accentColor}>
          <polygon points="12,0 14,10 24,10 16,16 18,24 12,20 6,24 8,16 0,10 10,10" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute"
        style={{ right: '20%', bottom: '25%' }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.5, 0.2, 0.5],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={primaryColor}>
          <polygon points="12,0 14,10 24,10 16,16 18,24 12,20 6,24 8,16 0,10 10,10" />
        </svg>
      </motion.div>
    </div>
  );
}
