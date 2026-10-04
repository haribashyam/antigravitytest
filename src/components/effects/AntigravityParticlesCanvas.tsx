'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ANTIGRAVITY_CONFIG } from './AntigravityConfig';
import { useSmoothScroll } from './SmoothScrollProvider';

/**
 * AntigravityParticlesCanvas
 * 
 * High-performance Three.js 3D space particle tunnel canvas.
 * - Fixed full-screen background behind the DOM content
 * - ~2,000 particles (desktop) or ~600 particles (mobile)
 * - Flying-through-space effect on scroll down, smooth reversal on scroll up
 * - Locked to 60fps with capped pixel ratio (2.0) and visibility-based rAF pausing
 * - Honors prefers-reduced-motion
 */
export function AntigravityParticlesCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, isReducedMotion } = useSmoothScroll();
  const scrollYRef = useRef(scrollY);
  scrollYRef.current = scrollY;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Detect device width & determine particle budget
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile
      ? ANTIGRAVITY_CONFIG.particles.mobileCount
      : ANTIGRAVITY_CONFIG.particles.desktopCount;

    // 2. Setup Three.js Scene, Camera, and Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(
      0x000000,
      ANTIGRAVITY_CONFIG.particles.fogNear,
      ANTIGRAVITY_CONFIG.particles.fogFar
    );

    const fov = 65;
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 3500);
    const initialCameraZ = 1000;
    camera.position.z = initialCameraZ;

    // 3. Setup WebGL Renderer with performance caps
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, ANTIGRAVITY_CONFIG.particles.maxPixelRatio)
    );
    container.appendChild(renderer.domElement);

    // 4. Generate circular glowing particle sprite texture for antialiased circles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // 5. Construct Geometry & Color Buffers
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const { spreadX, spreadY, depthZ, palette } = ANTIGRAVITY_CONFIG.particles;
    const threeColors = palette.map((hex) => new THREE.Color(hex));

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical / tunnel distribution with subtle random spread
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (spreadX * 0.45) + 30;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i3 + 2] = -Math.random() * depthZ + 600;

      // Assign palette color (Nothing Red, star white, cyan/amber telemetry sparks)
      const selectedColor = threeColors[Math.floor(Math.random() * threeColors.length)];
      colors[i3] = selectedColor.r;
      colors[i3 + 1] = selectedColor.g;
      colors[i3 + 2] = selectedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 6. Create Points Material with Additive Blending
    const material = new THREE.PointsMaterial({
      size: isMobile ? 2.0 : ANTIGRAVITY_CONFIG.particles.size * 1.4,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 7. Render Loop with Smooth Camera Interpolation
    let animationFrameId: number;
    let targetCameraZ = initialCameraZ;
    let currentCameraZ = initialCameraZ;
    let isTabVisible = true;

    const render = () => {
      if (!isTabVisible) return;

      if (!isReducedMotion) {
        // Tie camera Z position to scroll position with flight speed
        const currentScroll = scrollYRef.current;
        targetCameraZ = initialCameraZ - currentScroll * ANTIGRAVITY_CONFIG.particles.scrollFlightSpeed;

        // Smooth camera dampening / lerp for cinematic space flight
        currentCameraZ += (targetCameraZ - currentCameraZ) * 0.08;
        camera.position.z = currentCameraZ;

        // Particle infinite depth wrapping
        const posAttr = geometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        const bufferDistance = 300;

        for (let i = 0; i < particleCount; i++) {
          const zIdx = i * 3 + 2;
          // If particle has passed behind the camera, wrap it to the far depth
          if (posArray[zIdx] > camera.position.z + bufferDistance) {
            posArray[zIdx] -= depthZ;
            posAttr.needsUpdate = true;
          } else if (posArray[zIdx] < camera.position.z - depthZ) {
            // When scrolling back up, wrap particles back into view ahead of camera
            posArray[zIdx] += depthZ;
            posAttr.needsUpdate = true;
          }
        }

        // Ambient idle rotation of starfield
        particles.rotation.z += 0.0003;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 8. Handle Window Resizes
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, ANTIGRAVITY_CONFIG.particles.maxPixelRatio)
      );
    };
    window.addEventListener('resize', handleResize);

    // 9. Pause Render Loop on Tab Hidden to maintain 60fps & battery
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 10. Clean up everything on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      scene.remove(particles);
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
    />
  );
}
