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
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'highp' });
      
      renderer.setSize(320, 320);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      camera.position.z = 2.2;

      // Create high-resolution Earth texture
      const createEarthTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Ocean gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0a3a52');
        oceanGradient.addColorStop(0.5, '#1a5a7a');
        oceanGradient.addColorStop(1, '#0a3a52');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add ocean noise
        for (let i = 0; i < 10000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
          ctx.fillRect(x, y, size, size);
        }

        // Realistic continent colors with gradients
        const landColor1 = '#1a4d2e'; // Dark green
        const landColor2 = '#2d6a4f'; // Medium green
        const landColor3 = '#40916c'; // Light green
        const desertColor = '#c9a961'; // Desert
        const mountainColor = '#6b4423'; // Mountain

        // Draw continents with better detail
        const continents = [
          // North America
          { x: canvas.width * 0.18, y: canvas.height * 0.35, w: 200, h: 280, rot: -0.3, color: landColor2 },
          // Central America
          { x: canvas.width * 0.25, y: canvas.height * 0.52, w: 80, h: 120, rot: 0.2, color: landColor1 },
          // South America
          { x: canvas.width * 0.28, y: canvas.height * 0.70, w: 120, h: 180, rot: 0.1, color: landColor3 },
          // Europe
          { x: canvas.width * 0.52, y: canvas.height * 0.25, w: 140, h: 100, rot: 0.1, color: landColor1 },
          // Africa
          { x: canvas.width * 0.55, y: canvas.height * 0.55, w: 160, h: 220, rot: 0.05, color: landColor2 },
          // Middle East
          { x: canvas.width * 0.60, y: canvas.height * 0.40, w: 100, h: 80, rot: 0, color: desertColor },
          // Asia
          { x: canvas.width * 0.75, y: canvas.height * 0.38, w: 280, h: 200, rot: 0.15, color: landColor3 },
          // India
          { x: canvas.width * 0.68, y: canvas.height * 0.45, w: 80, h: 100, rot: 0.2, color: landColor2 },
          // Australia
          { x: canvas.width * 0.85, y: canvas.height * 0.68, w: 100, h: 120, rot: 0.3, color: landColor1 },
          // New Zealand
          { x: canvas.width * 0.92, y: canvas.height * 0.75, w: 40, h: 60, rot: 0.4, color: landColor2 },
          // Greenland
          { x: canvas.width * 0.42, y: canvas.height * 0.12, w: 80, h: 140, rot: 0.3, color: mountainColor },
        ];

        continents.forEach(cont => {
          ctx.fillStyle = cont.color;
          ctx.save();
          ctx.translate(cont.x, cont.y);
          ctx.rotate(cont.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, cont.w, cont.h, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Add polar ice caps with better detail
        ctx.fillStyle = '#f5f5f0';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.04, canvas.width * 0.45, canvas.height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.96, canvas.width * 0.45, canvas.height * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add atmospheric clouds with multiple layers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 100 + 40;
          const h = Math.random() * 30 + 15;
          ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add cloud highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 60 + 20;
          const h = Math.random() * 20 + 8;
          ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
      };

      // Create bump map for depth
      const createBumpMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add terrain bumps
        ctx.fillStyle = '#666666';
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 40 + 10;
          ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
      };

      // Create specular map for water shine
      const createSpecularMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Ocean is shinier
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Land is less shiny
        ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.ellipse(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 100 + 50,
            Math.random() * 80 + 40,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
      };

      const earthTexture = createEarthTexture();
      const bumpMap = createBumpMap();
      const specularMap = createSpecularMap();

      // Create sphere with advanced material
      const geometry = new THREE.IcosahedronGeometry(1, 128);
      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpMap,
        bumpScale: 0.05,
        specularMap: specularMap,
        shininess: 25,
        side: THREE.FrontSide
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);

      // Create cloud layer
      const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 2048;
      cloudCanvas.height = 1024;
      const cloudCtx = cloudCanvas.getContext('2d');
      cloudCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      cloudCtx.fillRect(0, 0, cloudCanvas.width, cloudCanvas.height);
      
      cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 100; i++) {
        cloudCtx.beginPath();
        cloudCtx.ellipse(
          Math.random() * cloudCanvas.width,
          Math.random() * cloudCanvas.height,
          Math.random() * 150 + 50,
          Math.random() * 50 + 20,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        cloudCtx.fill();
      }

      const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.4,
        side: THREE.FrontSide,
        shininess: 50
      });
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.add(cloudMesh);

      // Professional lighting setup
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(8, 5, 8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.6);
      rimLight.position.set(-8, -3, -8);
      scene.add(rimLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x2d5016, 0.6);
      scene.add(hemisphereLight);

      // Animation loop
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        sphere.rotation.y += 0.0003;
        cloudMesh.rotation.y += 0.0005;
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
        earthTexture.dispose();
        bumpMap.dispose();
        specularMap.dispose();
        cloudGeometry.dispose();
        cloudMaterial.dispose();
        cloudTexture.dispose();
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
