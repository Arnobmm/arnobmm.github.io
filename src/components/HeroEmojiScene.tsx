import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { sounds } from '../utils/soundEffects';

interface EmojiToken {
  mesh: THREE.Group;
  initialPos: THREE.Vector3;
  floatSpeed: number;
  floatOffset: number;
  rotSpeed: { x: number; y: number; z: number };
  spinVelocity: number;
}

export const HeroEmojiScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    // WebGL Renderer with alpha transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 2.5); // Purple rim light
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.0); // Cyan fill light
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xfacc15, 1.8); // Golden rim light
    dirLight3.position.set(0, 10, -5);
    scene.add(dirLight3);

    // Helper to generate a crisp 3D badge texture with an emoji
    const createEmojiTexture = (emoji: string, bgColor: string, ringColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Background gradient circle
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, '#0b0d1e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.fill();

      // Outer vibrant ring
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 18;
      ctx.stroke();

      // Inner subtle glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(256, 256, 215, 0, Math.PI * 2);
      ctx.stroke();

      // Emoji glyph
      ctx.font = '210px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 256, 275);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Emoji token definitions
    const emojiConfigs = [
      { emoji: '🚀', bg: '#4c1d95', ring: '#a855f7', pos: [-8.5, 4.2, 0], scale: 1.4 },
      { emoji: '💡', bg: '#713f12', ring: '#facc15', pos: [8.8, 3.8, -1], scale: 1.3 },
      { emoji: '🎮', bg: '#581c87', ring: '#c084fc', pos: [-9.0, -3.2, 1], scale: 1.5 },
      { emoji: '⚡', bg: '#365314', ring: '#a3e635', pos: [8.2, -3.4, 0.5], scale: 1.35 },
      { emoji: '🎨', bg: '#881337', ring: '#f43f5e', pos: [4.8, 5.5, -2], scale: 1.15 },
      { emoji: '🧬', bg: '#083344', ring: '#06b6d4', pos: [-4.5, -5.2, -1.5], scale: 1.2 },
    ];

    const tokens: EmojiToken[] = [];
    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2(-1000, -1000);
    const targetParallax = new THREE.Vector2(0, 0);
    const currentParallax = new THREE.Vector2(0, 0);

    emojiConfigs.forEach((cfg, idx) => {
      const group = new THREE.Group();

      // 3D Cylinder Coin geometry
      const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.35, 32);
      const faceMat = new THREE.MeshStandardMaterial({
        map: createEmojiTexture(cfg.emoji, cfg.bg, cfg.ring),
        metalness: 0.3,
        roughness: 0.25,
      });
      const sideMat = new THREE.MeshStandardMaterial({
        color: cfg.ring,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Materials array: 0=side, 1=top face, 2=bottom face
      const coinMesh = new THREE.Mesh(cylinderGeo, [sideMat, faceMat, faceMat]);
      coinMesh.rotation.x = Math.PI / 2.2;
      group.add(coinMesh);

      // Subtle backing glow disc
      const glowGeo = new THREE.RingGeometry(1.55, 1.85, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: cfg.ring,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      group.add(glowMesh);

      group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      group.scale.set(cfg.scale, cfg.scale, cfg.scale);
      group.userData = { id: idx, emoji: cfg.emoji };

      scene.add(group);

      tokens.push({
        mesh: group,
        initialPos: new THREE.Vector3(cfg.pos[0], cfg.pos[1], cfg.pos[2]),
        floatSpeed: 0.0015 + (idx % 3) * 0.0005,
        floatOffset: idx * 1.2,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.006,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.005,
        },
        spinVelocity: 0,
      });
    });

    // Mouse movement listener for parallax and raycasting
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouse2D.x = x;
      mouse2D.y = y;

      targetParallax.x = x * 1.5;
      targetParallax.y = y * 1.5;
    };

    // Click on 3D emoji to spin with sound
    const handleClick = () => {
      raycaster.setFromCamera(mouse2D, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root.parent && root.parent !== scene) {
          root = root.parent;
        }

        const found = tokens.find((t) => t.mesh === root);
        if (found) {
          found.spinVelocity = 0.35; // Trigger fast spin
          sounds.playPop();
        }
      }
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera parallax
      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.04;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.04;
      camera.position.x = currentParallax.x;
      camera.position.y = currentParallax.y;
      camera.lookAt(0, 0, 0);

      const time = Date.now();

      tokens.forEach((token) => {
        // Floating kinematics
        token.mesh.position.y =
          token.initialPos.y + Math.sin(time * token.floatSpeed + token.floatOffset) * 0.45;
        token.mesh.position.x =
          token.initialPos.x + Math.cos(time * (token.floatSpeed * 0.7) + token.floatOffset) * 0.25;

        // Continuous subtle rotation
        token.mesh.rotation.y += token.rotSpeed.y + token.spinVelocity;
        token.mesh.rotation.x += token.rotSpeed.x;

        // Spin damping
        if (token.spinVelocity > 0) {
          token.spinVelocity *= 0.94;
          if (token.spinVelocity < 0.002) token.spinVelocity = 0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
      title="Click floating emoji tokens to spin!"
    />
  );
};
