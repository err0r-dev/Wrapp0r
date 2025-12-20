import { motion, useReducedMotion } from 'framer-motion';

// Ribbon path definitions - bezier curves flowing across screen
const RIBBONS = [
  {
    id: 'ribbon-1',
    path: 'M -200 100 Q 200 400 600 200 T 1400 300',
    color1: '#FF2D6A',
    color2: '#FF8C42',
    duration: 8,
    delay: 0,
    width: 80,
    opacity: 0.6,
  },
  {
    id: 'ribbon-2',
    path: 'M -100 600 Q 400 300 800 500 T 1500 200',
    color1: '#1DB954',
    color2: '#00D4FF',
    duration: 10,
    delay: 0.5,
    width: 100,
    opacity: 0.5,
  },
  {
    id: 'ribbon-3',
    path: 'M -150 800 Q 300 500 700 700 T 1400 400',
    color1: '#A855F7',
    color2: '#FF2D6A',
    duration: 12,
    delay: 1,
    width: 60,
    opacity: 0.4,
  },
  {
    id: 'ribbon-4',
    path: 'M 1500 100 Q 1000 400 600 200 T -200 350',
    color1: '#00D4FF',
    color2: '#1DB954',
    duration: 9,
    delay: 1.5,
    width: 70,
    opacity: 0.5,
  },
  {
    id: 'ribbon-5',
    path: 'M -100 400 Q 400 600 900 300 T 1600 500',
    color1: '#FF8C42',
    color2: '#A855F7',
    duration: 11,
    delay: 2,
    width: 90,
    opacity: 0.4,
  },
];

export function DataRibbons() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ filter: 'blur(1px)' }}
    >
      <defs>
        {RIBBONS.map((ribbon) => (
          <linearGradient
            key={`gradient-${ribbon.id}`}
            id={`gradient-${ribbon.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={ribbon.color1} />
            <stop offset="50%" stopColor={ribbon.color2} />
            <stop offset="100%" stopColor={ribbon.color1} />
          </linearGradient>
        ))}
      </defs>

      {RIBBONS.map((ribbon) => (
        <motion.path
          key={ribbon.id}
          d={ribbon.path}
          stroke={`url(#gradient-${ribbon.id})`}
          strokeWidth={ribbon.width}
          strokeLinecap="round"
          fill="none"
          opacity={ribbon.opacity}
          initial={{
            pathLength: 0,
            pathOffset: 0,
          }}
          animate={
            prefersReducedMotion
              ? { pathLength: 1 }
              : {
                  pathLength: [0, 1, 1, 0],
                  pathOffset: [0, 0, 0, 1],
                }
          }
          transition={{
            duration: ribbon.duration,
            delay: ribbon.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </svg>
  );
}
