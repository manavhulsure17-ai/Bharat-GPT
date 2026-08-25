import React, { useEffect, useRef, useState } from "react";
import { AppTheme } from "../types";

interface SacredParticlesBackgroundProps {
  theme?: AppTheme;
  density?: "minimal" | "subtle" | "rich";
  showOm?: boolean;
  showLotus?: boolean;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  type: "om" | "lotus" | "prana" | "bindu";
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
  colorVariant: number; // 0: saffron, 1: gold, 2: warm amber
}

export const SacredParticlesBackground: React.FC<SacredParticlesBackgroundProps> = ({
  theme = "deep_night",
  density = "subtle",
  showOm = true,
  showLotus = true,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; active: boolean }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
  });
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<Array<{ x: number; y: number; opacity: number; size: number; color: string }>>([]);

  const isLight = theme === "temple_ivory";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Determine particle count based on screen width & density
    let count = 28;
    if (width > 1200) count = density === "rich" ? 45 : density === "minimal" ? 18 : 34;
    else if (width > 768) count = density === "rich" ? 30 : density === "minimal" ? 14 : 24;
    else count = density === "rich" ? 20 : density === "minimal" ? 10 : 16;

    // Available types
    const types: Particle["type"][] = [];
    if (showOm) types.push("om", "om");
    if (showLotus) types.push("lotus", "lotus");
    types.push("prana", "prana", "bindu");

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)] || "prana";
      
      let size = 18;
      if (type === "om") size = Math.random() * 12 + 18; // 18 - 30px
      else if (type === "lotus") size = Math.random() * 14 + 20; // 20 - 34px
      else if (type === "prana") size = Math.random() * 3 + 2; // 2 - 5px
      else if (type === "bindu") size = Math.random() * 4 + 3; // 3 - 7px

      const baseSpeed = Math.random() * 0.25 + 0.1;
      const angle = Math.random() * Math.PI * 2;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        baseVx: Math.cos(angle) * baseSpeed * 0.4,
        baseVy: -Math.abs(Math.sin(angle) * baseSpeed * 0.5) - 0.08, // slow upward celestial drift
        size,
        opacity: Math.random() * 0.25 + 0.08,
        targetOpacity: Math.random() * 0.25 + 0.12,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.018 + 0.008,
        colorVariant: Math.floor(Math.random() * 3),
      });
    }
    particlesRef.current = particles;

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;

      // Add gentle micro trail particle
      if (interactive && Math.random() < 0.25) {
        trailRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 16,
          y: e.clientY + (Math.random() - 0.5) * 16,
          opacity: isLight ? 0.35 : 0.55,
          size: Math.random() * 2.5 + 1.5,
          color: isLight ? "rgba(217, 119, 6, " : "rgba(245, 158, 11, ",
        });
        if (trailRef.current.length > 20) {
          trailRef.current.shift();
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Lotus Drawing Helper
    const drawLotus = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      alpha: number,
      colorHex: string
    ) => {
      c.save();
      c.translate(x, y);
      c.globalAlpha = alpha;

      const strokeCol = isLight
        ? `rgba(180, 83, 9, ${alpha})`
        : `rgba(245, 158, 11, ${alpha * 1.2})`;
      const fillCol = isLight
        ? `rgba(245, 158, 11, ${alpha * 0.25})`
        : `rgba(251, 191, 36, ${alpha * 0.2})`;

      c.strokeStyle = strokeCol;
      c.fillStyle = fillCol;
      c.lineWidth = 1.2;

      const petals = 6;
      for (let p = 0; p < petals; p++) {
        c.save();
        c.rotate((p * Math.PI * 2) / petals);

        // Petal shape using bezier curves
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(radius * 0.45, -radius * 0.45, 0, -radius);
        c.quadraticCurveTo(-radius * 0.45, -radius * 0.45, 0, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      }

      // Center glowing core (Karnika)
      c.beginPath();
      c.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
      c.fillStyle = isLight
        ? `rgba(217, 119, 6, ${alpha * 0.8})`
        : `rgba(253, 230, 138, ${alpha * 0.9})`;
      c.fill();

      c.restore();
    };

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const mouseActive = mouseRef.current.active && mouseX > 0 && mouseY > 0;

      // Draw Mouse Micro Prana Trail
      if (trailRef.current.length > 0) {
        for (let i = trailRef.current.length - 1; i >= 0; i--) {
          const t = trailRef.current[i];
          t.opacity -= 0.015;
          t.y -= 0.3;
          if (t.opacity <= 0) {
            trailRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
          ctx.fillStyle = `${t.color}${t.opacity})`;
          ctx.fill();
        }
      }

      // Parallax center offset
      const parallaxX = mouseActive ? ((mouseX - width / 2) / width) * 18 : 0;
      const parallaxY = mouseActive ? ((mouseY - height / 2) / height) * 18 : 0;

      const particlesList = particlesRef.current;
      for (let i = 0; i < particlesList.length; i++) {
        const p = particlesList[i];

        // Pulse phase
        p.pulsePhase += p.pulseSpeed;
        const currentOpacity =
          p.opacity * (0.75 + 0.25 * Math.sin(p.pulsePhase));

        // Rotation
        p.rotation += p.rotationSpeed;

        // Mouse physics interaction (gentle repulsion & aura)
        if (mouseActive) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist && dist > 1) {
            const force = (1 - dist / maxDist) * 1.2;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.25;
            p.vy += Math.sin(angle) * force * 0.25;
          }
        }

        // Apply velocity damping
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Move particle
        p.x += p.baseVx + p.vx;
        p.y += p.baseVy + p.vy;

        // Screen boundary wrap with smooth reappear
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;

        const renderX = p.x + parallaxX * 0.4;
        const renderY = p.y + parallaxY * 0.4;

        // Color schemes
        let colorStr = isLight
          ? "rgba(180, 83, 9, "
          : "rgba(245, 158, 11, ";
        if (p.colorVariant === 1) {
          colorStr = isLight
            ? "rgba(217, 119, 6, "
            : "rgba(251, 191, 36, ";
        } else if (p.colorVariant === 2) {
          colorStr = isLight
            ? "rgba(194, 65, 12, "
            : "rgba(249, 115, 22, ";
        }

        // Render according to particle type
        if (p.type === "om") {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = isLight
            ? Math.min(0.22, currentOpacity * 0.85)
            : Math.min(0.35, currentOpacity * 1.1);

          ctx.font = `bold ${Math.round(p.size)}px 'Noto Sans Devanagari', 'Cinzel', serif, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Subtle sacred glow
          if (!isLight) {
            ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
            ctx.shadowBlur = 8;
          } else {
            ctx.shadowColor = "rgba(217, 119, 6, 0.25)";
            ctx.shadowBlur = 4;
          }

          ctx.fillStyle = `${colorStr}${currentOpacity})`;
          ctx.fillText("ॐ", 0, 0);
          ctx.restore();
        } else if (p.type === "lotus") {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.rotation);
          drawLotus(
            ctx,
            0,
            0,
            p.size * 0.7,
            isLight
              ? Math.min(0.18, currentOpacity * 0.75)
              : Math.min(0.28, currentOpacity),
            colorStr
          );
          ctx.restore();
        } else if (p.type === "prana") {
          // Soft glowing orb
          ctx.save();
          ctx.beginPath();
          const rad = p.size * (0.85 + 0.15 * Math.sin(p.pulsePhase));
          ctx.arc(renderX, renderY, rad, 0, Math.PI * 2);

          const grad = ctx.createRadialGradient(
            renderX,
            renderY,
            0,
            renderX,
            renderY,
            rad * 2.2
          );
          grad.addColorStop(0, `${colorStr}${currentOpacity * 1.3})`);
          grad.addColorStop(0.5, `${colorStr}${currentOpacity * 0.5})`);
          grad.addColorStop(1, `${colorStr}0)`);

          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        } else if (p.type === "bindu") {
          // Starry sacred sparkle
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.rotation * 2);
          ctx.globalAlpha = isLight
            ? Math.min(0.25, currentOpacity * 0.9)
            : Math.min(0.4, currentOpacity * 1.2);

          ctx.fillStyle = `${colorStr}${currentOpacity})`;
          ctx.fillRect(-p.size * 0.4, -p.size * 0.4, p.size * 0.8, p.size * 0.8);

          // Star cross arms
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.2);
          ctx.lineTo(0, p.size * 1.2);
          ctx.moveTo(-p.size * 1.2, 0);
          ctx.lineTo(p.size * 1.2, 0);
          ctx.strokeStyle = `${colorStr}${currentOpacity * 0.8})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [theme, density, showOm, showLotus, interactive, isLight]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full transition-opacity duration-1000"
    />
  );
};
