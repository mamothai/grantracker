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

      // Scene setup with realistic colors
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 320 / 320, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'highp' });
      
      renderer.setSize(320, 320);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      camera.position.z = 2.2;

      // Realistic color palette from satellite imagery
      const colors = {
        oceanDeep: '#0A1F4A',
        oceanMedium: '#1E6BA8',
        oceanTropical: '#00B4D8',
        rainforest: '#1B4D2B',
        forest: '#3A6B3A',
        grassland: '#9FBF3F',
        desert: '#E8D4A0',
        sand: '#D4AF8F',
        rock: '#8B7355',
        snow: '#F0F5FA',
        seaIce: '#D4E8F0',
        clouds: '#FFFFFF',
        cloudShadow: '#D3D3D3'
      };

      // Create ultra-realistic Earth texture with accurate geography
      const createEarthTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 8192;
        canvas.height = 4096;
        const ctx = canvas.getContext('2d');

        // Ocean base with realistic gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0A1F4A');
        oceanGradient.addColorStop(0.4, '#1E6BA8');
        oceanGradient.addColorStop(0.5, '#1A4D7A');
        oceanGradient.addColorStop(0.6, '#1E6BA8');
        oceanGradient.addColorStop(1, '#0A1F4A');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add ocean texture with depth simulation
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 1.5;
          const opacity = Math.random() * 0.03;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fillRect(x, y, size, size);
        }

        // Geographic regions with realistic positions and colors
        const regions = [
          // North America - Forests and terrain
          { name: 'northern_forests', x: 0.18, y: 0.25, w: 250, h: 150, color: '#3A6B3A', rot: -0.2 },
          { name: 'central_america', x: 0.22, y: 0.42, w: 80, h: 60, color: '#2D6A3E', rot: 0.3 },
          { name: 'amazon', x: 0.28, y: 0.58, w: 200, h: 180, color: '#1B4D2B', rot: -0.1 },
          
          // Europe
          { name: 'europe_north', x: 0.52, y: 0.22, w: 120, h: 80, color: '#3A6B3A', rot: 0.1 },
          { name: 'europe_south', x: 0.55, y: 0.30, w: 100, h: 60, color: '#4A8A4A', rot: 0.05 },
          
          // Africa
          { name: 'sahara', x: 0.53, y: 0.42, w: 180, h: 120, color: '#E8D4A0', rot: 0 },
          { name: 'congo', x: 0.60, y: 0.50, w: 140, h: 120, color: '#2D6A3E', rot: 0.08 },
          { name: 'southern_africa', x: 0.62, y: 0.65, w: 120, h: 140, color: '#9FBF3F', rot: 0.05 },
          
          // Middle East
          { name: 'arabian', x: 0.63, y: 0.40, w: 100, h: 80, color: '#D4AF8F', rot: -0.1 },
          
          // Asia
          { name: 'siberia', x: 0.72, y: 0.20, w: 200, h: 180, color: '#5A7A4A', rot: 0.15 },
          { name: 'central_asia', x: 0.70, y: 0.35, w: 140, h: 100, color: '#C4A46D', rot: 0.1 },
          { name: 'southeast_asia', x: 0.78, y: 0.42, w: 100, h: 80, color: '#2D6A3E', rot: 0.2 },
          { name: 'himalayas', x: 0.72, y: 0.32, w: 60, h: 40, color: '#F0F5FA', rot: 0 },
          { name: 'indian_peninsula', x: 0.68, y: 0.42, w: 70, h: 100, color: '#4A8A4A', rot: 0.2 },
          
          // Australia
          { name: 'australia_outback', x: 0.85, y: 0.62, w: 110, h: 130, color: '#D4AF8F', rot: 0.25 },
          
          // New Zealand
          { name: 'new_zealand', x: 0.93, y: 0.72, w: 45, h: 70, color: '#4A8A4A', rot: 0.35 },
          
          // Greenland - Large ice sheet
          { name: 'greenland', x: 0.42, y: 0.08, w: 100, h: 160, color: '#F0F5FA', rot: 0.4 },
          
          // Island chains
          { name: 'japan', x: 0.88, y: 0.32, w: 40, h: 60, color: '#3A6B3A', rot: 0.3 },
          { name: 'philippines', x: 0.82, y: 0.44, w: 35, h: 55, color: '#2D6A3E', rot: 0.4 },
          { name: 'caribbean', x: 0.25, y: 0.48, w: 60, h: 40, color: '#4A8A4A', rot: 0.2 },
        ];

        regions.forEach(region => {
          ctx.fillStyle = region.color;
          ctx.save();
          ctx.translate(region.x * canvas.width, region.y * canvas.height);
          ctx.rotate(region.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, region.w, region.h, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Add terrain variation with gradients for depth
        regions.forEach(region => {
          const gradient = ctx.createRadialGradient(
            region.x * canvas.width,
            region.y * canvas.height,
            region.w * 0.3,
            region.x * canvas.width,
            region.y * canvas.height,
            region.w
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
          ctx.fillStyle = gradient;
          ctx.save();
          ctx.translate(region.x * canvas.width, region.y * canvas.height);
          ctx.rotate(region.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, region.w, region.h, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Polar ice caps - realistic coverage
        ctx.fillStyle = '#F0F5FA';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.02, canvas.width * 0.48, canvas.height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.98, canvas.width * 0.48, canvas.height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add Antarctic ice with more detail
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.97, canvas.width * 0.45, canvas.height * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add Arctic Sea ice variation
        ctx.fillStyle = '#D4E8F0';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.04, canvas.width * 0.42, canvas.height * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Realistic cloud formations with multiple layers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        const cloudPatterns = [
          { x: 0.3, y: 0.35, w: 200, h: 60 },
          { x: 0.65, y: 0.45, w: 180, h: 50 },
          { x: 0.15, y: 0.55, w: 150, h: 70 },
          { x: 0.8, y: 0.25, w: 160, h: 55 },
          { x: 0.45, y: 0.70, w: 140, h: 65 },
        ];

        cloudPatterns.forEach(cloud => {
          ctx.beginPath();
          ctx.ellipse(
            cloud.x * canvas.width,
            cloud.y * canvas.height,
            cloud.w,
            cloud.h,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });

        // Add subtle cloud highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        for (let i = 0; i < 80; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 120 + 30;
          const h = Math.random() * 40 + 10;
          ctx.beginPath();
          ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add atmospheric haze at poles
        const poleHaze = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.02, 100, canvas.width * 0.5, canvas.height * 0.02, 400);
        poleHaze.addColorStop(0, 'rgba(240, 245, 250, 0.15)');
        poleHaze.addColorStop(1, 'rgba(240, 245, 250, 0)');
        ctx.fillStyle = poleHaze;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);

        const southPoleHaze = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.98, 100, canvas.width * 0.5, canvas.height * 0.98, 400);
        southPoleHaze.addColorStop(0, 'rgba(240, 245, 250, 0.12)');
        southPoleHaze.addColorStop(1, 'rgba(240, 245, 250, 0)');
        ctx.fillStyle = southPoleHaze;
        ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height);

        return new THREE.CanvasTexture(canvas);
      };

      // Create advanced bump map for realistic terrain
      const createBumpMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Base ocean (smooth)
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mountain regions (high bumps)
        ctx.fillStyle = '#888888';
        const mountains = [
          { x: 0.72, y: 0.32, w: 60, h: 40 }, // Himalayas
          { x: 0.18, y: 0.25, w: 80, h: 50 }, // Rockies
          { x: 0.52, y: 0.22, w: 40, h: 30 }, // Alps
          { x: 0.93, y: 0.32, w: 30, h: 40 }, // Japan
        ];

        mountains.forEach(m => {
          ctx.beginPath();
          ctx.ellipse(m.x * canvas.width, m.y * canvas.height, m.w, m.h, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // Terrain texture (medium bumps)
        ctx.fillStyle = '#555555';
        for (let i = 0; i < 500; i++) {
          ctx.beginPath();
          ctx.ellipse(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 50 + 10,
            Math.random() * 30 + 5,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
      };

      // Create realistic specular map
      const createSpecularMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Ocean is very shiny
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add ocean wave patterns
        ctx.fillStyle = '#555555';
        for (let i = 0; i < 3000; i++) {
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2 + 1,
            Math.random() * 1
          );
        }

        // Land is less shiny
        ctx.fillStyle = '#1a1a1a';
        const landAreas = [
          { x: 0.18, y: 0.25, w: 250, h: 150 },
          { x: 0.28, y: 0.58, w: 200, h: 180 },
          { x: 0.72, y: 0.20, w: 200, h: 180 },
          { x: 0.85, y: 0.62, w: 110, h: 130 },
        ];

        landAreas.forEach(land => {
          ctx.beginPath();
          ctx.ellipse(
            land.x * canvas.width,
            land.y * canvas.height,
            land.w,
            land.h,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });

        // Polar regions have intermediate shine
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.02, canvas.width * 0.48, canvas.height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.98, canvas.width * 0.48, canvas.height * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
      };

      const earthTexture = createEarthTexture();
      const bumpMap = createBumpMap();
      const specularMap = createSpecularMap();

      // Create high-quality sphere with realistic proportions
      const geometry = new THREE.IcosahedronGeometry(1, 256);
      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpMap,
        bumpScale: 0.08,
        specularMap: specularMap,
        shininess: 30,
        side: THREE.FrontSide
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);

      // Create realistic cloud layer with animation
      const cloudGeometry = new THREE.SphereGeometry(1.015, 128, 128);
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 4096;
      cloudCanvas.height = 2048;
      const cloudCtx = cloudCanvas.getContext('2d');
      
      cloudCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      cloudCtx.fillRect(0, 0, cloudCanvas.width, cloudCanvas.height);
      
      // Add realistic cloud coverage
      cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 150; i++) {
        cloudCtx.beginPath();
        const x = Math.random() * cloudCanvas.width;
        const y = Math.random() * cloudCanvas.height;
        const w = Math.random() * 200 + 60;
        const h = Math.random() * 70 + 20;
        cloudCtx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
        cloudCtx.fill();
      }

      // Cloud shadow layer
      cloudCtx.fillStyle = 'rgba(100, 100, 100, 0.15)';
      for (let i = 0; i < 80; i++) {
        cloudCtx.beginPath();
        const x = Math.random() * cloudCanvas.width;
        const y = Math.random() * cloudCanvas.height;
        const w = Math.random() * 150 + 40;
        const h = Math.random() * 50 + 10;
        cloudCtx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
        cloudCtx.fill();
      }

      const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.5,
        side: THREE.FrontSide,
        shininess: 60
      });
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.add(cloudMesh);

      // Professional triple-light setup for realistic depth
      // Main sun light
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
      sunLight.position.set(10, 6, 8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.camera.far = 100;
      scene.add(sunLight);

      // Rim/fill light for edge definition
      const rimLight = new THREE.DirectionalLight(0x87CEEB, 0.8);
      rimLight.position.set(-12, -4, -10);
      scene.add(rimLight);

      // Atmospheric blue light from above
      const atmosphereLight = new THREE.DirectionalLight(0x87CEEB, 0.5);
      atmosphereLight.position.set(0, 15, 0);
      scene.add(atmosphereLight);

      // Ambient fill light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambientLight);

      // Hemisphere light for realistic day/night gradient
      const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x1a1a1a, 0.7);
      scene.add(hemisphereLight);

      // Animation loop
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        sphere.rotation.y += 0.0002;
        cloudMesh.rotation.y += 0.00035;
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
