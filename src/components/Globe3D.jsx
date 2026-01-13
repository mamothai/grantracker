import React, { useEffect, useRef } from 'react';
import './Globe3D.css';

const Globe3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dynamically import Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      const THREE = window.THREE;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 320 / 320, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      renderer.setSize(320, 320);
      renderer.setClearColor(0x000000, 0);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      camera.position.z = 2.5;

      // Create Earth sphere
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      // Create canvas texture for Earth
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Draw ocean blue background
      ctx.fillStyle = '#1a4d7a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw continents with realistic shapes
      ctx.fillStyle = '#2d5016';

      // North America
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.2, canvas.height * 0.35, 120, 150, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Central America
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.25, canvas.height * 0.52, 40, 60, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.27, canvas.height * 0.68, 60, 90, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Europe
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.52, canvas.height * 0.28, 80, 60, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Africa
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.55, canvas.height * 0.55, 100, 120, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Asia
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.72, canvas.height * 0.38, 150, 110, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Australia
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.82, canvas.height * 0.65, 50, 60, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Greenland
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.42, canvas.height * 0.15, 40, 70, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Add polar ice caps
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, canvas.height * 0.05, canvas.width * 0.4, canvas.height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, canvas.height * 0.95, canvas.width * 0.4, canvas.height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add cloud layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 60 + 20,
          Math.random() * 20 + 10,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      // Add lighting
      const light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 3, 5);
      scene.add(light1);

      const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
      light2.position.set(-5, -3, -5);
      scene.add(light2);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Animation loop
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        sphere.rotation.y += 0.0005;
        renderer.render(scene, camera);
      };

      animate();

      // Cleanup function
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        texture.dispose();
      };
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} className="globe-container" />;
};

export default Globe3D;
