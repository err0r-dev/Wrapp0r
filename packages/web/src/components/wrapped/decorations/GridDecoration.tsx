import { motion } from 'framer-motion';

interface GridDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Finance theme decoration - subtle professional grid lines
 * Creates a confident, trustworthy feel with clean geometry
 */
export function GridDecoration({ primaryColor, secondaryColor }: GridDecorationProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Horizontal lines */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.line
            key={`h-${i}`}
            x1="0%"
            y1={`${20 + i * 15}%`}
            x2="100%"
            y2={`${20 + i * 15}%`}
            stroke={primaryColor}
            strokeWidth="1"
            strokeOpacity="0.08"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Vertical lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.line
            key={`v-${i}`}
            x1={`${15 + i * 14}%`}
            y1="0%"
            x2={`${15 + i * 14}%`}
            y2="100%"
            stroke={secondaryColor}
            strokeWidth="1"
            strokeOpacity="0.06"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.15,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      {/* Corner accents */}
      <motion.div
        className="absolute left-8 top-8 h-20 w-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div
          className="absolute left-0 top-0 h-full w-0.5"
          style={{ backgroundColor: primaryColor, opacity: 0.2 }}
        />
        <div
          className="absolute left-0 top-0 h-0.5 w-full"
          style={{ backgroundColor: primaryColor, opacity: 0.2 }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-8 right-8 h-20 w-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <div
          className="absolute bottom-0 right-0 h-full w-0.5"
          style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
        />
        <div
          className="absolute bottom-0 right-0 h-0.5 w-full"
          style={{ backgroundColor: secondaryColor, opacity: 0.2 }}
        />
      </motion.div>

      {/* Subtle moving dot */}
      <motion.div
        className="absolute h-2 w-2 rounded-full"
        style={{ backgroundColor: primaryColor, opacity: 0.4 }}
        initial={{ left: '10%', top: '50%' }}
        animate={{
          left: ['10%', '90%', '10%'],
          top: ['50%', '30%', '50%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
