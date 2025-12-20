import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingDataProps {
  mousePos: { x: number; y: number };
}

// Data visualization icons as SVG components
function BarChartIcon({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="24" width="8" height="20" rx="2" fill={color} opacity="0.8" />
      <rect x="16" y="16" width="8" height="28" rx="2" fill={color} opacity="0.9" />
      <rect x="28" y="8" width="8" height="36" rx="2" fill={color} />
      <rect x="40" y="20" width="4" height="24" rx="1" fill={color} opacity="0.7" />
    </svg>
  );
}

function PieSliceIcon({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4C35.046 4 44 12.954 44 24H24V4Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M24 24H44C44 35.046 35.046 44 24 44C12.954 44 4 35.046 4 24C4 12.954 12.954 4 24 4V24Z"
        fill={color}
        opacity="0.5"
      />
    </svg>
  );
}

function LineChartIcon({ color }: { color: string }) {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
      <path
        d="M4 32L16 20L28 28L44 8L52 16"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="20" r="4" fill={color} />
      <circle cx="28" cy="28" r="4" fill={color} />
      <circle cx="44" cy="8" r="4" fill={color} />
    </svg>
  );
}

function SpreadsheetIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
      <rect x="2" y="2" width="36" height="44" rx="4" stroke={color} strokeWidth="2" fill="none" />
      <line x1="2" y1="14" x2="38" y2="14" stroke={color} strokeWidth="2" />
      <line x1="2" y1="26" x2="38" y2="26" stroke={color} strokeWidth="2" />
      <line x1="2" y1="38" x2="38" y2="38" stroke={color} strokeWidth="2" />
      <line x1="14" y1="14" x2="14" y2="46" stroke={color} strokeWidth="2" />
      <line x1="26" y1="14" x2="26" y2="46" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2L20 12L30 12L22 19L25 30L16 23L7 30L10 19L2 12L12 12L16 2Z"
        fill={color}
      />
    </svg>
  );
}

function DonutIcon({ color }: { color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="8" fill="none" opacity="0.3" />
      <path
        d="M24 4C35.046 4 44 12.954 44 24"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Floating data elements configuration
const FLOATING_ELEMENTS = [
  // Top left area
  { id: 1, type: 'bar', x: 8, y: 15, depth: 0.3, color: '#FF2D6A', scale: 0.9 },
  { id: 2, type: 'number', x: 15, y: 25, depth: 0.5, color: '#00D4FF', value: '42K', scale: 1 },
  { id: 3, type: 'star', x: 5, y: 40, depth: 0.2, color: '#FFD700', scale: 0.7 },

  // Top right area
  { id: 4, type: 'pie', x: 85, y: 12, depth: 0.4, color: '#1DB954', scale: 0.85 },
  { id: 5, type: 'number', x: 90, y: 30, depth: 0.6, color: '#FF8C42', value: '1.2M', scale: 0.9 },
  { id: 6, type: 'line', x: 78, y: 22, depth: 0.35, color: '#A855F7', scale: 0.8 },

  // Bottom left area
  { id: 7, type: 'spreadsheet', x: 12, y: 75, depth: 0.45, color: '#00D4FF', scale: 0.85 },
  { id: 8, type: 'number', x: 8, y: 60, depth: 0.25, color: '#1DB954', value: '365', scale: 1.1 },
  { id: 9, type: 'donut', x: 20, y: 85, depth: 0.55, color: '#FF2D6A', scale: 0.75 },

  // Bottom right area
  { id: 10, type: 'bar', x: 88, y: 70, depth: 0.4, color: '#A855F7', scale: 0.95 },
  { id: 11, type: 'star', x: 92, y: 85, depth: 0.3, color: '#FFD700', scale: 0.6 },
  { id: 12, type: 'number', x: 80, y: 80, depth: 0.5, color: '#00D4FF', value: '99%', scale: 0.85 },

  // Mid areas (not overlapping center)
  { id: 13, type: 'pie', x: 25, y: 35, depth: 0.35, color: '#FF8C42', scale: 0.7 },
  { id: 14, type: 'line', x: 75, y: 55, depth: 0.45, color: '#1DB954', scale: 0.9 },
  { id: 15, type: 'star', x: 30, y: 70, depth: 0.2, color: '#FF2D6A', scale: 0.5 },
  { id: 16, type: 'donut', x: 70, y: 35, depth: 0.55, color: '#00D4FF', scale: 0.8 },

  // Extra sparkles
  { id: 17, type: 'star', x: 50, y: 10, depth: 0.15, color: '#FFD700', scale: 0.4 },
  { id: 18, type: 'star', x: 55, y: 90, depth: 0.25, color: '#FFD700', scale: 0.5 },
];

function DataElement({ type, color, value, scale }: { type: string; color: string; value?: string; scale: number }) {
  const style = { transform: `scale(${scale})` };

  switch (type) {
    case 'bar':
      return <div style={style}><BarChartIcon color={color} /></div>;
    case 'pie':
      return <div style={style}><PieSliceIcon color={color} /></div>;
    case 'line':
      return <div style={style}><LineChartIcon color={color} /></div>;
    case 'spreadsheet':
      return <div style={style}><SpreadsheetIcon color={color} /></div>;
    case 'star':
      return <div style={style}><StarIcon color={color} /></div>;
    case 'donut':
      return <div style={style}><DonutIcon color={color} /></div>;
    case 'number':
      return (
        <span
          className="font-bold"
          style={{ color, fontSize: `${scale * 1.5}rem`, textShadow: `0 0 20px ${color}50` }}
        >
          {value}
        </span>
      );
    default:
      return null;
  }
}

export function FloatingData({ mousePos }: FloatingDataProps) {
  const prefersReducedMotion = useReducedMotion();

  // Randomize float animation duration for each element
  const animationDurations = useMemo(() =>
    FLOATING_ELEMENTS.map(() => 3 + Math.random() * 3),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {FLOATING_ELEMENTS.map((element, index) => {
        // Parallax offset based on mouse position and depth
        const parallaxX = prefersReducedMotion ? 0 : (mousePos.x - 0.5) * element.depth * -80;
        const parallaxY = prefersReducedMotion ? 0 : (mousePos.y - 0.5) * element.depth * -80;

        return (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              x: parallaxX,
              y: parallaxY,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: 1,
              y: prefersReducedMotion ? parallaxY : [parallaxY - 10, parallaxY + 10, parallaxY - 10],
              rotate: prefersReducedMotion ? 0 : [0, 5, -5, 0],
            }}
            transition={{
              opacity: { duration: animationDurations[index], repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 0.5, delay: 0.5 + index * 0.1 },
              y: { duration: animationDurations[index], repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: animationDurations[index] * 1.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <DataElement
              type={element.type}
              color={element.color}
              value={element.type === 'number' ? element.value : undefined}
              scale={element.scale}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
