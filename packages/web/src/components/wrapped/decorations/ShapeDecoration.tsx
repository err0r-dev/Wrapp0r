import { motion } from 'framer-motion';

interface ShapeDecorationProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Food theme decoration - floating organic shapes
 * Creates a playful, appetizing feel with bouncy circles and soft shapes
 */
export function ShapeDecoration({ primaryColor, secondaryColor, accentColor }: ShapeDecorationProps) {
  const shapes = [
    { x: '10%', y: '20%', size: 60, color: primaryColor, delay: 0 },
    { x: '85%', y: '15%', size: 45, color: secondaryColor, delay: 0.2 },
    { x: '75%', y: '70%', size: 70, color: accentColor, delay: 0.4 },
    { x: '20%', y: '75%', size: 50, color: primaryColor, delay: 0.6 },
    { x: '50%', y: '10%', size: 35, color: secondaryColor, delay: 0.3 },
    { x: '90%', y: '45%', size: 40, color: accentColor, delay: 0.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            opacity: 0.25,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -15, 0],
            opacity: 0.25,
          }}
          transition={{
            duration: 3,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating dots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute h-3 w-3 rounded-full"
          style={{
            left: `${15 + i * 20}%`,
            top: `${40 + (i % 3) * 15}%`,
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            opacity: 0.4,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 2 + i * 0.3,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Soft blob shapes */}
      <motion.div
        className="absolute -left-10 top-1/3 h-40 w-40 rounded-full blur-2xl"
        style={{ backgroundColor: primaryColor, opacity: 0.15 }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -right-10 bottom-1/4 h-48 w-48 rounded-full blur-2xl"
        style={{ backgroundColor: secondaryColor, opacity: 0.15 }}
        animate={{
          scale: [1, 1.15, 1],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
