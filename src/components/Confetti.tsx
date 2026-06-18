import React, { useEffect, useRef } from "react";

interface ConfettiProps {
  trigger: number; // Increment this to fire the confetti explosion!
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "triangle" | "star";
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

const COLORS = [
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#d946ef", // Fuchsia
  "#a855f7", // Purple
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#eab308", // Yellow
  "#f97316", // Orange
];

const SHAPES: Array<"circle" | "square" | "triangle" | "star"> = [
  "circle",
  "square",
  "triangle",
  "star",
];

export default function Confetti({ trigger }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    const count = 100; // Number of particles per corner
    const newParticles: Particle[] = [];

    // Left explosion (aiming upwards-right)
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 12 + Math.random() * 16;
      newParticles.push({
        x: 0,
        y: height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 8,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.005 + Math.random() * 0.005,
      });
    }

    // Right explosion (aiming upwards-left)
    for (let i = 0; i < count; i++) {
      const angle = -3 * Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 12 + Math.random() * 16;
      newParticles.push({
        x: width,
        y: height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 8,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.005 + Math.random() * 0.005,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (trigger > 0) {
      initParticles();

      const update = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          // Move particle
          p.x += p.vx;
          p.y += p.vy;

          // Apply physical properties
          p.vy += 0.32; // Gravity pull downwards
          p.vx *= 0.982; // Lateral drag resistance
          p.vy *= 0.982; // Vertical drag resistance

          p.rotation += p.rotationSpeed;
          p.opacity -= p.decay;

          // Remove out of bounds or invisible particles
          if (
            p.opacity <= 0 ||
            p.x < -100 ||
            p.x > canvas.width + 100 ||
            p.y > canvas.height + 100
          ) {
            particles.splice(i, 1);
            continue;
          }

          // Draw the custom particle shape
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          if (p.shape === "circle") {
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          } else if (p.shape === "square") {
            ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === "triangle") {
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
          } else if (p.shape === "star") {
            // Draw a pretty 5-point star
            const spikes = 5;
            const outerRadius = p.size / 2;
            const innerRadius = p.size / 4;
            let rot = (Math.PI / 2) * 3;
            let cx = 0;
            let cy = 0;
            const step = Math.PI / spikes;

            ctx.moveTo(0, -outerRadius);
            for (let j = 0; j < spikes; j++) {
              cx = Math.cos(rot) * outerRadius;
              cy = Math.sin(rot) * outerRadius;
              ctx.lineTo(cx, cy);
              rot += step;

              cx = Math.cos(rot) * innerRadius;
              cy = Math.sin(rot) * innerRadius;
              ctx.lineTo(cx, cy);
              rot += step;
            }
            ctx.closePath();
          }
          ctx.fill();
          ctx.restore();
        }

        if (particles.length > 0) {
          animationFrameRef.current = requestAnimationFrame(update);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(update);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
    />
  );
}
