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
      const radius = 85;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 26, 0)';
      ctx.fillRect(0, 0, width, height);

      // Draw globe
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw ocean (base sphere)
      const oceanGradient = ctx.createRadialGradient(-15, -15, 20, 0, 0, radius);
      oceanGradient.addColorStop(0, '#1e90ff');
      oceanGradient.addColorStop(0.6, '#0066cc');
      oceanGradient.addColorStop(1, '#003d99');
      
      ctx.fillStyle = oceanGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents (North America)
      ctx.fillStyle = '#2d5016';
      ctx.beginPath();
      ctx.ellipse(-35, -15, 22, 25, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents (South America)
      ctx.fillStyle = '#3a6b1f';
      ctx.beginPath();
      ctx.ellipse(-25, 20, 12, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents (Europe/Africa)
      ctx.fillStyle = '#2d5016';
      ctx.beginPath();
      ctx.ellipse(15, -10, 18, 30, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents (Asia)
      ctx.fillStyle = '#3a6b1f';
      ctx.beginPath();
      ctx.ellipse(30, 5, 28, 22, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Draw Australia
      ctx.fillStyle = '#2d5016';
      ctx.beginPath();
      ctx.ellipse(50, 30, 8, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Add cloud texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(-20, -30, 35, 20, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(25, 15, 25, 15, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Add atmospheric glow
      ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Add top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-20, -70, 35, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle side lighting
      const sideGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
      sideGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      sideGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      sideGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      
      ctx.fillStyle = sideGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Update rotation
      rotation += 0.001;

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
      width={320}
      height={320}
    />
  );
};

export default Globe3D;
