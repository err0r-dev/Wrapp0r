import { useEffect, useRef, useCallback } from 'react';

interface DataVortexProps {
  mousePos: { x: number; y: number };
}

// Spotify Wrapped color palette
const COLORS = ['#FF2D6A', '#FF8C42', '#1DB954', '#00D4FF', '#A855F7', '#FFD700'];

interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  angularSpeed: number;
  size: number;
  color: string;
  alpha: number;
  maxRadius: number;
}

function createParticle(width: number, height: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const maxRadius = Math.max(width, height) * 0.6;
  const radius = maxRadius * (0.8 + Math.random() * 0.4);

  return {
    x: 0,
    y: 0,
    angle,
    radius,
    maxRadius,
    speed: 0.3 + Math.random() * 0.5, // How fast it moves toward center
    angularSpeed: 0.01 + Math.random() * 0.02, // How fast it spirals
    size: 1 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.3 + Math.random() * 0.5,
  };
}

export function DataVortex({ mousePos }: DataVortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mousePosRef = useRef(mousePos);

  // Keep mouse position ref updated
  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.min(150, Math.floor((width * height) / 8000));
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(width, height)
    );
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas with slight trail effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Mouse influence (normalized to canvas coords)
    const mouseX = mousePosRef.current.x * width;
    const mouseY = mousePosRef.current.y * height;
    const cursorInfluence = 0.015;

    particlesRef.current.forEach((particle) => {
      // Update angle (spiral)
      particle.angle += particle.angularSpeed;

      // Decrease radius (move toward center)
      particle.radius -= particle.speed;

      // Calculate position from polar coordinates
      particle.x = centerX + Math.cos(particle.angle) * particle.radius;
      particle.y = centerY + Math.sin(particle.angle) * particle.radius;

      // Subtle cursor attraction
      particle.x += (mouseX - particle.x) * cursorInfluence;
      particle.y += (mouseY - particle.y) * cursorInfluence;

      // Fade as approaching center
      const fadeStart = particle.maxRadius * 0.3;
      if (particle.radius < fadeStart) {
        particle.alpha = (particle.radius / fadeStart) * (0.3 + Math.random() * 0.5);
      }

      // Respawn at edge when reaching center
      if (particle.radius < 30) {
        Object.assign(particle, createParticle(width, height));
      }

      // Draw particle with glow
      ctx.save();
      ctx.globalAlpha = particle.alpha;

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = particle.color;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      ctx.restore();
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    handleResize();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
