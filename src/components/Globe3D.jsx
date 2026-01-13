import React, { useEffect, useRef } from 'react';
import './Globe3D.css';

const Globe3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let rotation = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 80;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 26, 0)';
      ctx.fillRect(0, 0, width, height);

      // Draw globe
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw sphere shading
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#0891b2');
      gradient.addColorStop(1, '#0e7490');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(-20, -20, 30, 0, Math.PI * 2);
      ctx.fill();

      // Draw continent-like shapes
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -40, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(35, 20, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-30, 30, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Draw glowing effect
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Update rotation
      rotation += 0.002;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="globe-canvas"
      width={300}
      height={300}
    />
  );
};

export default Globe3D;
