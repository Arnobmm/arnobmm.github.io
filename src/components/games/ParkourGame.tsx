import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';

interface ParkourGameProps {
  level: 2 | 3 | 4;
  onBackToLevels: () => void;
}

export const ParkourGame: React.FC<ParkourGameProps> = ({ level, onBackToLevels }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [cheatMessage, setCheatMessage] = useState<string | null>(null);

  const levelTitles: Record<number, { title: string; subtitle: string; bg: number }> = {
    2: { title: 'Level 2: Parkour in Sky', subtitle: 'Find the golden/green platform!', bg: 0x87ceeb },
    3: { title: 'Level 3: Parkour in Lava', subtitle: 'Fiery platforming challenge! Find the beacon!', bg: 0x220500 },
    4: { title: 'Level 4: Minecraft Parkour', subtitle: 'Minecraft block course! Reach the Diamond block!', bg: 0x5c94fc },
  };

  const levelInfo = levelTitles[level] || levelTitles[2];

  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    minimapScene: THREE.Scene;
    minimapCamera: THREE.OrthographicCamera;
    minimapRenderer: THREE.WebGLRenderer;
    playerMarker: THREE.Mesh | null;
    platforms: THREE.Mesh[];
    goalPlatform: THREE.Mesh | THREE.Group | null;
    player: {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      onGround: boolean;
      canDoubleJump: boolean;
      sprintSpeed: number;
      walkSpeed: number;
      jumpForce: number;
      gravity: number;
    };
    controls: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
      jump: boolean;
      sprint: boolean;
      yaw: number;
      pitch: number;
    };
    mobileControls: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      jump: boolean;
    };
    isFlying: boolean;
    isBoosted: boolean;
    audioContext: AudioContext | null;
    animId: number | null;
  }>({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(),
    renderer: null as any,
    minimapScene: new THREE.Scene(),
    minimapCamera: null as any,
    minimapRenderer: null as any,
    playerMarker: null,
    platforms: [],
    goalPlatform: null,
    player: {
      position: new THREE.Vector3(0, 1, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      onGround: false,
      canDoubleJump: true,
      sprintSpeed: 0.2,
      walkSpeed: 0.1,
      jumpForce: 0.3,
      gravity: 0.015,
    },
    controls: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      yaw: Math.PI,
      pitch: 0,
    },
    mobileControls: {
      up: false,
      down: false,
      left: false,
      right: false,
      jump: false,
    },
    isFlying: false,
    isBoosted: false,
    audioContext: null,
    animId: null,
  });

  const showCheat = (msg: string) => {
    setCheatMessage(msg);
    setTimeout(() => {
      setCheatMessage((current) => (current === msg ? null : current));
    }, 2000);
  };

  const playSprintSound = useCallback(() => {
    try {
      if (!gameRef.current.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          gameRef.current.audioContext = new AudioCtx();
        }
      }
      const ctx = gameRef.current.audioContext;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio playback might be restricted
    }
  }, []);

  const updateCamera = useCallback(() => {
    const { camera, player, controls } = gameRef.current;
    if (!camera) return new THREE.Vector3(0, 0, -1);

    camera.position.copy(player.position);
    camera.position.y += 1.7;

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(controls.pitch, controls.yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
    return forward;
  }, []);

  const createStartPlatform = useCallback((x: number, y: number, z: number, radius: number) => {
    const { scene, platforms } = gameRef.current;
    const geo = new THREE.CylinderGeometry(radius, radius, 0.5, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: level === 3 ? 0x4a1500 : 0x8b4513,
      metalness: 0.5,
      roughness: 0.5,
    });
    const platform = new THREE.Mesh(geo, mat);
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    platform.userData = {
      width: radius * 2,
      height: 0.5,
      depth: radius * 2,
    };
    scene.add(platform);
    platforms.push(platform);
  }, [level]);

  const createPlatformObject = useCallback((x: number, y: number, z: number, index: number) => {
    const { scene, platforms } = gameRef.current;
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let mesh: THREE.Mesh | THREE.Group;
    let collisionSize = { width: 1, height: 1, depth: 1 };
    let customData: Record<string, any> = {};

    const type = index % 16;

    if (level === 4) {
      // Minecraft themed blocks
      const colors = [
        0x55aa55, // Grass
        0x808080, // Stone
        0x8b4513, // Dirt
        0x9c5a2c, // Wood
        0xf4a460, // Sand
        0x707070, // Gravel
        0x696969, // Cobblestone
        0xb22222, // Brick
        0x4caf50, // Moving
        0xe91e63, // Disappearing
        0x00ff00, // Slime (Bouncing)
        0xadd8e6, // Ice
        0x101015, // Obsidian
        0x00ffff, // Diamond
        0xffd700, // Gold
        0x50c878, // Emerald
      ];

      geometry = new THREE.BoxGeometry(1, 1, 1);
      material = new THREE.MeshStandardMaterial({
        color: colors[type],
        metalness: type >= 13 ? 0.8 : 0.2,
        roughness: type >= 13 ? 0.2 : 0.8,
        transparent: type === 10 || type === 11,
        opacity: type === 10 || type === 11 ? 0.85 : 1,
      });
      mesh = new THREE.Mesh(geometry, material);

      if (type === 8) {
        customData = { moveSpeed: 0.02, moveRange: 2, startX: x, startZ: z };
      } else if (type === 9) {
        customData = { disappearTime: 2000, reappearTime: 1000, lastDisappear: 0 };
      } else if (type === 10) {
        customData = { bounceSpeed: 0.03, bounceHeight: 1 };
      }
    } else {
      // Level 2 (Sky) or Level 3 (Lava)
      const isLava = level === 3;
      const themeColors = isLava
        ? [0xff4500, 0xff2200, 0x8b0000, 0xd2691e, 0xff8c00, 0xcc3300, 0xffa500, 0x990000]
        : [0xff4081, 0x4caf50, 0x2196f3, 0x9c27b0, 0xffd700, 0x00bcd4, 0xff5722, 0x673ab7];

      const chosenColor = themeColors[index % themeColors.length];

      switch (type % 8) {
        case 0:
          geometry = new THREE.TorusGeometry(1.6, 0.4, 16, 32);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.4 });
          mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.x = Math.PI / 2;
          collisionSize = { width: 3.2, height: 0.8, depth: 3.2 };
          break;
        case 1:
          geometry = new THREE.BoxGeometry(5, 0.5, 2);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 5, height: 0.5, depth: 2 };
          break;
        case 2:
          geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
          material = new THREE.MeshStandardMaterial({
            color: chosenColor,
            emissive: chosenColor,
            emissiveIntensity: 0.2,
          });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 1.5, height: 1, depth: 1.5 };
          break;
        case 3:
          geometry = new THREE.OctahedronGeometry(1.4);
          material = new THREE.MeshStandardMaterial({
            color: chosenColor,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
          });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 2, height: 2, depth: 2 };
          break;
        case 4:
          geometry = new THREE.BoxGeometry(2.5, 0.5, 2.5);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 2.5, height: 0.5, depth: 2.5 };
          customData = { moveSpeed: 0.02, moveRange: 2.5, startX: x, startZ: z };
          break;
        case 5:
          geometry = new THREE.BoxGeometry(2, 0.5, 2);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 2, height: 0.5, depth: 2 };
          customData = { bounceSpeed: 0.03, bounceHeight: 1 };
          break;
        case 6:
          geometry = new THREE.BoxGeometry(2, 0.5, 2);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 2, height: 0.5, depth: 2 };
          customData = { disappearTime: 2000, reappearTime: 1000, lastDisappear: 0 };
          break;
        default:
          geometry = new THREE.BoxGeometry(2.5, 0.5, 2.5);
          material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: 0.5 });
          mesh = new THREE.Mesh(geometry, material);
          collisionSize = { width: 2.5, height: 0.5, depth: 2.5 };
          customData = { rotationSpeed: 0.015 };
          break;
      }
    }

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      ...collisionSize,
      ...customData,
    };

    scene.add(mesh);
    platforms.push(mesh as THREE.Mesh);
  }, [level]);

  const createGoalPlatform = useCallback((x: number, y: number, z: number) => {
    const { scene, platforms } = gameRef.current;
    let goalMesh: THREE.Mesh;

    if (level === 4) {
      // Diamond Block goal
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
      });
      goalMesh = new THREE.Mesh(geo, mat);
      goalMesh.userData = { width: 1.5, height: 1.5, depth: 1.5, isGoal: true };
    } else {
      // Glowing emerald/gold platform
      const geo = new THREE.BoxGeometry(8, 1, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: level === 3 ? 0xffaa00 : 0x00ff00,
        emissive: level === 3 ? 0xff5500 : 0x00ff00,
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.5,
      });
      goalMesh = new THREE.Mesh(geo, mat);
      goalMesh.userData = { width: 8, height: 1, depth: 8, isGoal: true };
    }

    goalMesh.position.set(x, y, z);
    goalMesh.castShadow = true;
    goalMesh.receiveShadow = true;

    // Add 30 orbiting particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const pGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({
        color: level === 4 ? 0x00ffff : level === 3 ? 0xff4500 : 0x00ff00,
        transparent: true,
        opacity: 0.8,
      });
      const particle = new THREE.Mesh(pGeo, pMat);
      const angle = (i / particleCount) * Math.PI * 2;
      particle.position.x = Math.cos(angle) * 4.5;
      particle.position.z = Math.sin(angle) * 4.5;
      particle.userData = {
        baseY: 0,
        angle: angle,
        speed: 0.02 + Math.random() * 0.02,
      };
      goalMesh.add(particle);
    }

    scene.add(goalMesh);
    platforms.push(goalMesh);
    gameRef.current.goalPlatform = goalMesh;
  }, [level]);

  const checkPlatformCollision = useCallback(() => {
    const { player, platforms } = gameRef.current;
    let onPlatform = false;
    let platformY = -Infinity;
    let wallCollision = false;
    const wallNormal = new THREE.Vector3();
    const adjustedPos = player.position.clone();

    const playerWidth = 0.5;
    const playerHeight = 1.8;
    const playerDepth = 0.5;

    for (const p of platforms) {
      if (!p.visible) continue;
      const w = p.userData.width || 1;
      const h = p.userData.height || 1;
      const d = p.userData.depth || 1;

      const halfW = w / 2;
      const halfD = d / 2;

      const dx = player.position.x - p.position.x;
      const dy = player.position.y - p.position.y;
      const dz = player.position.z - p.position.z;

      const buffer = 0.3;
      const isWithinX = Math.abs(dx) < halfW + playerWidth + buffer;
      const isWithinZ = Math.abs(dz) < halfD + playerDepth + buffer;
      const isWithinY = dy >= -playerHeight && dy <= h + buffer;

      if (isWithinX && isWithinZ && isWithinY) {
        // Landing on platform top
        if (dy <= h && player.velocity.y <= 0) {
          const top = p.position.y + h;
          if (player.position.y + playerHeight > top) {
            platformY = Math.max(platformY, top);
            onPlatform = true;
            adjustedPos.y = top - playerHeight;

            if (p.userData.isGoal) {
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist < 4.5 && Math.abs(dy) < 3.5) {
                if (document.pointerLockElement) {
                  document.exitPointerLock();
                }
                setHasWon(true);
              }
            }
          }
        }

        // Side collisions
        const leftDist = dx + halfW + playerWidth;
        const rightDist = halfW + playerWidth - dx;
        const frontDist = dz + halfD + playerDepth;
        const backDist = halfD + playerDepth - dz;

        const minDist = Math.min(leftDist, rightDist, frontDist, backDist);
        if (minDist <= buffer && dy < h - 0.1) {
          wallCollision = true;
          if (minDist === leftDist) {
            wallNormal.set(-1, 0, 0);
            adjustedPos.x = p.position.x - halfW - playerWidth - buffer;
          } else if (minDist === rightDist) {
            wallNormal.set(1, 0, 0);
            adjustedPos.x = p.position.x + halfW + playerWidth + buffer;
          } else if (minDist === frontDist) {
            wallNormal.set(0, 0, -1);
            adjustedPos.z = p.position.z - halfD - playerDepth - buffer;
          } else {
            wallNormal.set(0, 0, 1);
            adjustedPos.z = p.position.z + halfD + playerDepth + buffer;
          }
        }
      }
    }

    player.position.copy(adjustedPos);
    return { onPlatform, platformY, wallCollision, wallNormal };
  }, []);

  const movePlayer = useCallback(() => {
    const { player, controls, mobileControls, isFlying, isBoosted } = gameRef.current;
    const forward = updateCamera();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    let moveX = 0;
    let moveZ = 0;

    if (controls.forward || mobileControls.up) {
      moveX += forward.x;
      moveZ += forward.z;
    }
    if (controls.backward || mobileControls.down) {
      moveX -= forward.x;
      moveZ -= forward.z;
    }
    if (controls.left || mobileControls.left) {
      moveX -= right.x;
      moveZ -= right.z;
    }
    if (controls.right || mobileControls.right) {
      moveX += right.x;
      moveZ += right.z;
    }

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      let currentSpeed = controls.sprint ? player.sprintSpeed : player.walkSpeed;
      if (isBoosted) currentSpeed *= 2.0;

      moveX = (moveX / length) * currentSpeed;
      moveZ = (moveZ / length) * currentSpeed;

      if (controls.sprint && !isFlying) {
        playSprintSound();
      }
    }

    if (!isFlying) {
      player.velocity.y = Math.max(player.velocity.y - player.gravity, -0.5);
    }

    // Jumping with double jump
    if (!isFlying && (controls.jump || mobileControls.jump)) {
      if (player.onGround) {
        player.velocity.y = player.jumpForce;
        player.onGround = false;
        player.canDoubleJump = true;
        controls.jump = false;
        mobileControls.jump = false;
      } else if (player.canDoubleJump) {
        player.velocity.y = player.jumpForce * 0.8;
        player.canDoubleJump = false;
        controls.jump = false;
        mobileControls.jump = false;
      }
    }

    player.position.x += moveX;
    player.position.z += moveZ;
    player.position.y += player.velocity.y;

    if (!isFlying) {
      const collision = checkPlatformCollision();

      if (collision.onPlatform) {
        player.position.y = collision.platformY;
        player.velocity.y = 0;
        player.onGround = true;
        player.canDoubleJump = true;
      } else {
        player.onGround = false;
      }

      // Check fall below void
      if (player.position.y < -20) {
        player.position.set(0, 1.5, 0);
        player.velocity.set(0, 0, 0);
        player.onGround = false;
        player.canDoubleJump = true;
        controls.yaw = Math.PI;
        controls.pitch = 0;
        updateCamera();
      }
    }
  }, [updateCamera, playSprintSound, checkPlatformCollision]);

  const resetGame = useCallback(() => {
    setHasWon(false);
    const { player, controls } = gameRef.current;
    player.position.set(0, 1.5, 0);
    player.velocity.set(0, 0, 0);
    player.onGround = false;
    player.canDoubleJump = true;
    controls.yaw = Math.PI;
    controls.pitch = 0;
    updateCamera();
  }, [updateCamera]);

  // Main 3D Initialization
  useEffect(() => {
    if (!containerRef.current || !minimapRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(levelInfo.bg);
    if (level === 3) {
      scene.fog = new THREE.FogExp2(0x330000, 0.015);
    }
    gameRef.current.scene = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 0);
    gameRef.current.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    // Minimap
    const minimapScene = new THREE.Scene();
    minimapScene.background = new THREE.Color(0x000000);
    gameRef.current.minimapScene = minimapScene;

    const minimapSize = 150;
    const minimapCamera = new THREE.OrthographicCamera(-40, 40, 40, -40, 1, 1000);
    minimapCamera.position.set(0, 60, 0);
    minimapCamera.lookAt(0, 0, 0);
    minimapCamera.up.set(0, 0, -1);
    gameRef.current.minimapCamera = minimapCamera;

    const minimapRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    minimapRenderer.setSize(minimapSize, minimapSize);
    minimapRef.current.appendChild(minimapRenderer.domElement);
    gameRef.current.minimapRenderer = minimapRenderer;

    // Player marker on minimap
    const markerGeo = new THREE.CircleGeometry(0.8, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const playerMarker = new THREE.Mesh(markerGeo, markerMat);
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.position.y = 50;
    minimapScene.add(playerMarker);
    gameRef.current.playerMarker = playerMarker;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, level === 3 ? 0.8 : 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    scene.add(sunLight);

    if (level === 3) {
      // Warm lava light
      const lavaLight = new THREE.PointLight(0xff4500, 2, 80);
      lavaLight.position.set(0, -5, 20);
      scene.add(lavaLight);

      // Add lava floor surface below
      const lavaFloorGeo = new THREE.PlaneGeometry(300, 300);
      const lavaFloorMat = new THREE.MeshBasicMaterial({ color: 0xcc2200, side: THREE.DoubleSide });
      const lavaFloor = new THREE.Mesh(lavaFloorGeo, lavaFloorMat);
      lavaFloor.rotation.x = -Math.PI / 2;
      lavaFloor.position.y = -18;
      scene.add(lavaFloor);
    }

    // Platforms generation
    gameRef.current.platforms = [];
    createStartPlatform(0, 0, 0, 4);

    let currentX = 0;
    let currentY = 1;
    let currentZ = 6;

    for (let i = 0; i < 40; i++) {
      const angle = i * 0.5;
      const radius = 2 + i * 0.3;

      currentX = Math.cos(angle) * radius;
      currentZ = Math.sin(angle) * radius + 6;
      currentY += 0.5 + Math.random() * 0.5;

      createPlatformObject(currentX, currentY, currentZ, i);

      // Random floating obstacles
      if (i % 5 === 0 && i > 5) {
        const obsX = currentX + (Math.random() - 0.5) * 4;
        const obsY = currentY + 2;
        const obsZ = currentZ + (Math.random() - 0.5) * 4;
        createPlatformObject(obsX, obsY, obsZ, i + 16);
      }
    }

    // Create Goal Platform
    createGoalPlatform(currentX, currentY + 2, currentZ + 5);

    // Build minimap platforms
    gameRef.current.platforms.forEach((p) => {
      const miniGeo = new THREE.CircleGeometry(1, 16);
      const miniMat = new THREE.MeshBasicMaterial({
        color: p.userData.isGoal ? 0x00ff00 : 0xffffff,
        side: THREE.DoubleSide,
      });
      const miniMesh = new THREE.Mesh(miniGeo, miniMat);
      miniMesh.position.set(p.position.x, 40, p.position.z);
      miniMesh.rotation.x = -Math.PI / 2;
      minimapScene.add(miniMesh);
    });

    setIsLoading(false);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const { controls, player } = gameRef.current;
      switch (e.key) {
        case 'w':
        case 'W':
          controls.forward = true;
          break;
        case 's':
        case 'S':
          controls.backward = true;
          break;
        case 'a':
        case 'A':
          controls.left = true;
          break;
        case 'd':
        case 'D':
          controls.right = true;
          break;
        case ' ':
          if (gameRef.current.isFlying) {
            player.velocity.y = 0.2;
          } else {
            controls.jump = true;
          }
          break;
        case 'Shift':
          if (gameRef.current.isFlying) {
            player.velocity.y = -0.2;
          } else {
            controls.sprint = true;
          }
          break;
        case 'q':
        case 'Q':
          if (document.pointerLockElement) {
            document.exitPointerLock();
          } else {
            containerRef.current?.requestPointerLock();
          }
          break;
        case 'r':
        case 'R':
          gameRef.current.isFlying = !gameRef.current.isFlying;
          if (gameRef.current.isFlying) {
            player.velocity.y = 0;
            showCheat('Flying Mode: ON');
          } else {
            showCheat('Flying Mode: OFF');
          }
          break;
        case 'e':
        case 'E':
          gameRef.current.isBoosted = true;
          showCheat('Speed Boost: ON');
          break;
        case 'f':
        case 'F':
          gameRef.current.isBoosted = false;
          showCheat('Speed Boost: OFF');
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const { controls, player } = gameRef.current;
      switch (e.key) {
        case 'w':
        case 'W':
          controls.forward = false;
          break;
        case 's':
        case 'S':
          controls.backward = false;
          break;
        case 'a':
        case 'A':
          controls.left = false;
          break;
        case 'd':
        case 'D':
          controls.right = false;
          break;
        case ' ':
        case 'Shift':
          if (gameRef.current.isFlying) {
            player.velocity.y = 0;
          }
          if (e.key === 'Shift') controls.sprint = false;
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === containerRef.current) {
        const { controls } = gameRef.current;
        controls.yaw -= e.movementX * 0.002;
        controls.pitch -= e.movementY * 0.002;
        controls.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, controls.pitch));
        updateCamera();
      }
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === containerRef.current;
      setIsPointerLocked(locked);
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      movePlayer();

      // Animate goal particles
      const goalPlatform = gameRef.current.goalPlatform;
      if (goalPlatform) {
        goalPlatform.children.forEach((child) => {
          if (child.userData && child.userData.angle !== undefined) {
            child.position.y =
              child.userData.baseY + Math.sin(Date.now() * 0.002 + child.userData.angle) * 0.5;
            child.rotation.y += child.userData.speed;
          }
        });
      }

      // Animate special platform properties
      gameRef.current.platforms.forEach((p) => {
        if (p.userData) {
          if (p.userData.moveSpeed) {
            p.position.x =
              p.userData.startX +
              Math.sin(Date.now() * p.userData.moveSpeed) * p.userData.moveRange;
            p.position.z =
              p.userData.startZ +
              Math.cos(Date.now() * p.userData.moveSpeed) * p.userData.moveRange;
          }
          if (p.userData.bounceSpeed) {
            p.position.y += Math.sin(Date.now() * p.userData.bounceSpeed) * 0.05;
          }
          if (p.userData.disappearTime) {
            const now = Date.now();
            if (
              now - p.userData.lastDisappear >
              p.userData.disappearTime + p.userData.reappearTime
            ) {
              p.visible = true;
              p.userData.lastDisappear = now;
            } else if (now - p.userData.lastDisappear > p.userData.disappearTime) {
              p.visible = false;
            }
          }
          if (p.userData.rotationSpeed) {
            p.rotation.y += p.userData.rotationSpeed;
          }
        }
      });

      // Render
      renderer.render(scene, camera);

      // Render minimap
      const playerMarker = gameRef.current.playerMarker;
      if (playerMarker) {
        playerMarker.position.x = gameRef.current.player.position.x;
        playerMarker.position.z = gameRef.current.player.position.z;
        playerMarker.rotation.z = gameRef.current.controls.yaw;
      }
      minimapCamera.position.x = gameRef.current.player.position.x;
      minimapCamera.position.z = gameRef.current.player.position.z;
      minimapRenderer.render(minimapScene, minimapCamera);
    };

    animId = requestAnimationFrame(animate);
    gameRef.current.animId = animId;

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      minimapRenderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
      if (minimapRef.current) minimapRef.current.innerHTML = '';
    };
  }, [level, levelInfo.bg, createStartPlatform, createPlatformObject, createGoalPlatform, updateCamera, movePlayer]);

  const handleContainerClick = () => {
    if (!isPointerLocked && !hasWon) {
      containerRef.current?.requestPointerLock();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="w-full h-full cursor-crosshair"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 text-white text-2xl font-bold font-['Orbitron']">
          Loading 3D Parkour Course...
        </div>
      )}

      {/* Cheat message toast */}
      {cheatMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 border border-green-400 px-6 py-3 rounded-xl text-green-400 font-mono text-2xl font-bold z-50 shadow-[0_0_20px_rgba(0,255,0,0.5)] animate-in fade-in zoom-in">
          {cheatMessage}
        </div>
      )}

      {/* Minimap radar */}
      <div
        ref={minimapRef}
        className="absolute top-5 right-5 w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-white/50 bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-30"
      />

      {/* Top Left Game HUD */}
      <div className="absolute top-5 left-5 bg-black/75 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white text-sm max-w-sm z-30 pointer-events-auto">
        <h3 className="text-base font-bold text-yellow-300 font-['Orbitron'] mb-1">
          {levelInfo.title}
        </h3>
        <p className="text-neutral-300 text-xs mb-2">
          {levelInfo.subtitle}
        </p>
        <p className="text-neutral-400 text-xs mb-2">
          {isPointerLocked
            ? 'WASD to move, SPACE to jump (double jump!), SHIFT to sprint. Press Q or ESC to release cursor.'
            : 'Click screen to activate mouse look. R: Fly mode, E/F: Boost.'}
        </p>
        <button
          onClick={onBackToLevels}
          className="inline-flex items-center text-xs text-cyan-300 hover:text-cyan-100 underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Level Selection
        </button>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-auto">
        <button
          onPointerDown={() => { gameRef.current.mobileControls.up = true; }}
          onPointerUp={() => { gameRef.current.mobileControls.up = false; }}
          onPointerLeave={() => { gameRef.current.mobileControls.up = false; }}
          className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
        >
          &uarr;
        </button>
        <div className="flex gap-4">
          <button
            onPointerDown={() => { gameRef.current.mobileControls.left = true; }}
            onPointerUp={() => { gameRef.current.mobileControls.left = false; }}
            onPointerLeave={() => { gameRef.current.mobileControls.left = false; }}
            className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
          >
            &larr;
          </button>
          <button
            onPointerDown={() => { gameRef.current.mobileControls.jump = true; }}
            onPointerUp={() => { gameRef.current.mobileControls.jump = false; }}
            className="w-16 h-16 rounded-full bg-yellow-400/50 active:bg-yellow-400 border-2 border-yellow-300 text-black font-extrabold text-sm flex items-center justify-center touch-none"
          >
            JUMP
          </button>
          <button
            onPointerDown={() => { gameRef.current.mobileControls.right = true; }}
            onPointerUp={() => { gameRef.current.mobileControls.right = false; }}
            onPointerLeave={() => { gameRef.current.mobileControls.right = false; }}
            className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
          >
            &rarr;
          </button>
        </div>
        <button
          onPointerDown={() => { gameRef.current.mobileControls.down = true; }}
          onPointerUp={() => { gameRef.current.mobileControls.down = false; }}
          onPointerLeave={() => { gameRef.current.mobileControls.down = false; }}
          className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
        >
          &darr;
        </button>
      </div>

      {/* Victory Modal */}
      {hasWon && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-green-400 p-8 rounded-2xl text-center max-w-sm w-full shadow-[0_0_30px_rgba(0,255,0,0.4)] animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-extrabold text-green-400 font-['Orbitron'] mb-3">
              Level Complete!
            </h2>
            <p className="text-neutral-300 mb-6">
              You conquered the parkour challenge and reached the beacon!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={resetGame}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Play Again
              </button>
              <button
                onClick={onBackToLevels}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Choose Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
