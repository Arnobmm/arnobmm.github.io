import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';

interface MazeGameProps {
  onBackToLevels: () => void;
}

export const MazeGame: React.FC<MazeGameProps> = ({ onBackToLevels }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // References to keep game instance data clean
  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    minimapScene: THREE.Scene;
    minimapCamera: THREE.OrthographicCamera;
    minimapRenderer: THREE.WebGLRenderer;
    playerMarker: THREE.Mesh | null;
    playerLight: THREE.PointLight | null;
    exitMarker: THREE.Group | null;
    exitLight: THREE.SpotLight | null;
    landmarks: THREE.Mesh[];
    collisionWalls: { minX: number; maxX: number; minZ: number; maxZ: number }[];
    player: { x: number; z: number; height: number; speed: number };
    controls: {
      moveForward: boolean;
      moveBackward: boolean;
      moveLeft: boolean;
      moveRight: boolean;
      yaw: number;
      pitch: number;
      mouseLocked: boolean;
      mouseSensitivity: number;
    };
    mobileControls: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
    };
    mazeSize: number;
    cellSize: number;
    wallHeight: number;
    goalPosition: { x: number; z: number };
    animationFrameId: number | null;
  }>({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(),
    renderer: null as any,
    minimapScene: new THREE.Scene(),
    minimapCamera: null as any,
    minimapRenderer: null as any,
    playerMarker: null,
    playerLight: null,
    exitMarker: null,
    exitLight: null,
    landmarks: [],
    collisionWalls: [],
    player: { x: 0, z: 2, height: 1.0, speed: 0.1 },
    controls: {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      yaw: 0,
      pitch: 0,
      mouseLocked: false,
      mouseSensitivity: 0.002,
    },
    mobileControls: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    mazeSize: 15,
    cellSize: 2,
    wallHeight: 2,
    goalPosition: { x: 0, z: 0 },
    animationFrameId: null,
  });

  const updateCamera = useCallback(() => {
    const { camera, player, controls } = gameRef.current;
    if (!camera) return;

    camera.position.x = player.x;
    camera.position.y = player.height;
    camera.position.z = player.z;

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(controls.pitch, controls.yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
  }, []);

  const generateMaze = useCallback(() => {
    const { mazeSize, cellSize } = gameRef.current;
    const maze: number[][] = [];

    // Initialize walls
    for (let i = 0; i < mazeSize; i++) {
      maze[i] = [];
      for (let j = 0; j < mazeSize; j++) {
        maze[i][j] = 1;
      }
    }

    const startX = 1;
    const startZ = 1;
    maze[startZ][startX] = 0;

    // Entrance
    maze[1][0] = 0;

    // Exit
    const exitX = mazeSize - 2;
    const exitZ = mazeSize - 2;
    maze[exitZ][exitX] = 0;
    maze[exitZ][exitX + 1] = 0;

    gameRef.current.goalPosition = {
      x: exitX * cellSize,
      z: exitZ * cellSize,
    };

    const stack = [{ x: startX, z: startZ }];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const directions: { x: number; z: number }[] = [];

      if (current.z > 2 && maze[current.z - 2][current.x] === 1) directions.push({ x: 0, z: -2 });
      if (current.z < mazeSize - 3 && maze[current.z + 2][current.x] === 1) directions.push({ x: 0, z: 2 });
      if (current.x > 2 && maze[current.z][current.x - 2] === 1) directions.push({ x: -2, z: 0 });
      if (current.x < mazeSize - 3 && maze[current.z][current.x + 2] === 1) directions.push({ x: 2, z: 0 });

      if (directions.length > 0) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        maze[current.z + dir.z / 2][current.x + dir.x / 2] = 0;
        maze[current.z + dir.z][current.x + dir.x] = 0;
        stack.push({ x: current.x + dir.x, z: current.z + dir.z });
      } else {
        stack.pop();
      }
    }

    // Ensure path to exit
    let exitPathX = exitX;
    let exitPathZ = exitZ;
    for (let i = 0; i < 3; i++) {
      if (exitPathX > 0) {
        maze[exitPathZ][exitPathX - 1] = 0;
        exitPathX--;
      }
      if (exitPathZ > 0) {
        maze[exitPathZ - 1][exitPathX] = 0;
        exitPathZ--;
      }
    }

    maze[1][0] = 0;
    maze[0][0] = 1;
    maze[0][1] = 1;
    maze[2][0] = 1;

    return maze;
  }, []);

  const buildMazeGeometry = useCallback((maze: number[][]) => {
    const { scene, mazeSize, cellSize, wallHeight, goalPosition } = gameRef.current;
    gameRef.current.collisionWalls = [];
    gameRef.current.landmarks = [];

    // Floor
    const floorGeo = new THREE.PlaneGeometry(mazeSize * cellSize + 2, mazeSize * cellSize + 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((mazeSize * cellSize) / 2 - cellSize / 2, 0, (mazeSize * cellSize) / 2 - cellSize / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(mazeSize * cellSize + 2, mazeSize * cellSize + 2);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set((mazeSize * cellSize) / 2 - cellSize / 2, wallHeight, (mazeSize * cellSize) / 2 - cellSize / 2);
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // Walls
    const wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x6a0dad,
      roughness: 0.6,
      metalness: 0.2,
    });

    for (let z = 0; z < mazeSize; z++) {
      for (let x = 0; x < mazeSize; x++) {
        if (maze[z][x] === 1) {
          const wallX = x * cellSize;
          const wallZ = z * cellSize;
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(wallX, wallHeight / 2, wallZ);
          wall.castShadow = true;
          wall.receiveShadow = true;
          scene.add(wall);

          gameRef.current.collisionWalls.push({
            minX: wallX - cellSize / 2,
            maxX: wallX + cellSize / 2,
            minZ: wallZ - cellSize / 2,
            maxZ: wallZ + cellSize / 2,
          });
        }
      }
    }

    // Exit Marker
    const exitBaseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
    const exitBaseMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(exitBaseGeo, exitBaseMat);
    base.position.y = 0.05;

    const ringGeo = new THREE.TorusGeometry(1, 0.1, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1;

    const exitMarker = new THREE.Group();
    exitMarker.add(base);
    exitMarker.add(ring);
    exitMarker.position.set(goalPosition.x, 0, goalPosition.z);
    scene.add(exitMarker);
    gameRef.current.exitMarker = exitMarker;

    const exitLight = new THREE.SpotLight(0xff0000, 2);
    exitLight.position.set(goalPosition.x, wallHeight - 0.5, goalPosition.z);
    exitLight.target = base;
    exitLight.angle = Math.PI / 6;
    exitLight.penumbra = 0.5;
    exitLight.distance = 10;
    scene.add(exitLight);
    gameRef.current.exitLight = exitLight;

    // Landmarks
    const geometries = [
      new THREE.TorusKnotGeometry(0.3, 0.1, 32, 8),
      new THREE.OctahedronGeometry(0.4),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.IcosahedronGeometry(0.3),
    ];
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x44ff44, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x4444ff, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xffff44, metalness: 0.7, roughness: 0.3 }),
    ];

    for (let z = 2; z < mazeSize - 2; z += 3) {
      for (let x = 2; x < mazeSize - 2; x += 3) {
        if (maze[z][x] === 0) {
          const idx = Math.floor(Math.random() * geometries.length);
          const landmark = new THREE.Mesh(geometries[idx], materials[idx]);
          landmark.position.set(x * cellSize, wallHeight / 2, z * cellSize);
          landmark.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            floatSpeed: (Math.random() - 0.5) * 0.005,
            floatOffset: Math.random() * Math.PI * 2,
          };
          scene.add(landmark);
          gameRef.current.landmarks.push(landmark);
        }
      }
    }
  }, []);

  const buildMinimap = useCallback((maze: number[][]) => {
    const { minimapScene, mazeSize, cellSize, goalPosition } = gameRef.current;

    // Clear previous
    while (minimapScene.children.length > 0) {
      minimapScene.remove(minimapScene.children[0]);
    }

    // Player marker
    const markerGeo = new THREE.CircleGeometry(0.4, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
    const playerMarker = new THREE.Mesh(markerGeo, markerMat);
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.position.y = 45;
    minimapScene.add(playerMarker);
    gameRef.current.playerMarker = playerMarker;

    // Walls
    const wallGeo = new THREE.PlaneGeometry(cellSize, cellSize);
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    for (let z = 0; z < mazeSize; z++) {
      for (let x = 0; x < mazeSize; x++) {
        if (maze[z][x] === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(x * cellSize, 40, z * cellSize);
          wall.rotation.x = -Math.PI / 2;
          minimapScene.add(wall);
        }
      }
    }

    // Goal marker
    const goalGeo = new THREE.CircleGeometry(1, 32);
    const goalMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const goalMarker = new THREE.Mesh(goalGeo, goalMat);
    goalMarker.position.set(goalPosition.x, 40, goalPosition.z);
    goalMarker.rotation.x = -Math.PI / 2;
    minimapScene.add(goalMarker);
  }, []);

  const checkCollision = useCallback((newX: number, newZ: number) => {
    const { mazeSize, cellSize, collisionWalls, player } = gameRef.current;
    if (newX < -cellSize / 2 || newX > mazeSize * cellSize || newZ < -cellSize / 2 || newZ > mazeSize * cellSize) {
      return { collided: true, allowX: false, allowZ: false };
    }

    const playerSize = 0.3;
    const result = { collided: false, allowX: true, allowZ: true };

    for (const wall of collisionWalls) {
      if (
        newX + playerSize > wall.minX &&
        newX - playerSize < wall.maxX &&
        newZ + playerSize > wall.minZ &&
        newZ - playerSize < wall.maxZ
      ) {
        result.collided = true;
        if (player.z + playerSize > wall.minZ && player.z - playerSize < wall.maxZ) {
          result.allowX = false;
        }
        if (player.x + playerSize > wall.minX && player.x - playerSize < wall.maxX) {
          result.allowZ = false;
        }
      }
    }

    return result;
  }, []);

  const movePlayer = useCallback(() => {
    const { camera, player, controls, mobileControls, cellSize, goalPosition, playerLight } = gameRef.current;

    let moveX = 0;
    let moveZ = 0;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (controls.moveForward || mobileControls.up) {
      moveX += forward.x;
      moveZ += forward.z;
    }
    if (controls.moveBackward || mobileControls.down) {
      moveX -= forward.x;
      moveZ -= forward.z;
    }
    if (controls.moveLeft) {
      moveX -= right.x;
      moveZ -= right.z;
    }
    if (controls.moveRight) {
      moveX += right.x;
      moveZ += right.z;
    }

    if (mobileControls.left) {
      controls.yaw += 0.05;
      updateCamera();
    }
    if (mobileControls.right) {
      controls.yaw -= 0.05;
      updateCamera();
    }

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX = (moveX / len) * player.speed;
      moveZ = (moveZ / len) * player.speed;

      const newX = player.x + moveX;
      const newZ = player.z + moveZ;
      const collision = checkCollision(newX, newZ);

      if (!collision.collided) {
        player.x = newX;
        player.z = newZ;
      } else {
        if (collision.allowX) player.x = newX;
        if (collision.allowZ) player.z = newZ;
      }

      updateCamera();

      if (playerLight) {
        playerLight.position.x = player.x;
        playerLight.position.z = player.z;
      }

      // Check exit reached
      if (Math.abs(player.x - goalPosition.x) < cellSize / 2 && Math.abs(player.z - goalPosition.z) < cellSize / 2) {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        setHasWon(true);
      }
    }
  }, [updateCamera, checkCollision]);

  const resetGame = useCallback(() => {
    setHasWon(false);
    const { scene, cellSize } = gameRef.current;

    // Reset player
    gameRef.current.player.x = 0;
    gameRef.current.player.z = cellSize;
    gameRef.current.controls.yaw = 0;
    gameRef.current.controls.pitch = 0;
    updateCamera();

    // Clear scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Re-add lights
    const ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(15, 20, 15);
    scene.add(dirLight);

    const playerLight = new THREE.PointLight(0xffffff, 1, 15);
    playerLight.position.set(0, 0.8, 0);
    scene.add(playerLight);
    gameRef.current.playerLight = playerLight;

    // Regenerate
    const maze = generateMaze();
    buildMazeGeometry(maze);
    buildMinimap(maze);
  }, [updateCamera, generateMaze, buildMazeGeometry, buildMinimap]);

  // Main init effect
  useEffect(() => {
    if (!containerRef.current || !minimapRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Main 3D Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    gameRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.y = gameRef.current.player.height;
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    // Minimap
    const minimapScene = new THREE.Scene();
    minimapScene.background = new THREE.Color(0x000000);
    gameRef.current.minimapScene = minimapScene;

    const minimapSize = 150;
    const { mazeSize, cellSize } = gameRef.current;
    const minimapCamera = new THREE.OrthographicCamera(
      (-mazeSize * cellSize) / 2,
      (mazeSize * cellSize) / 2,
      (mazeSize * cellSize) / 2,
      (-mazeSize * cellSize) / 2,
      1,
      1000
    );
    minimapCamera.position.set(0, 50, 0);
    minimapCamera.lookAt(0, 0, 0);
    minimapCamera.up.set(0, 0, -1);
    gameRef.current.minimapCamera = minimapCamera;

    const minimapRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    minimapRenderer.setSize(minimapSize, minimapSize);
    minimapRef.current.appendChild(minimapRenderer.domElement);
    gameRef.current.minimapRenderer = minimapRenderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(15, 20, 15);
    scene.add(dirLight);

    const playerLight = new THREE.PointLight(0xffffff, 1, 15);
    playerLight.position.set(0, 0.8, 0);
    scene.add(playerLight);
    gameRef.current.playerLight = playerLight;

    // Build Maze
    const maze = generateMaze();
    buildMazeGeometry(maze);
    buildMinimap(maze);

    // Initial position
    gameRef.current.player.x = 0;
    gameRef.current.player.z = cellSize;
    updateCamera();

    setIsLoading(false);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      const { controls } = gameRef.current;
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          controls.moveForward = true;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          controls.moveBackward = true;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          controls.moveLeft = true;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          controls.moveRight = true;
          break;
        case 'q':
        case 'Q':
          if (document.pointerLockElement) {
            document.exitPointerLock();
          } else {
            containerRef.current?.requestPointerLock();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const { controls } = gameRef.current;
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          controls.moveForward = false;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          controls.moveBackward = false;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          controls.moveLeft = false;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          controls.moveRight = false;
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === containerRef.current) {
        const { controls } = gameRef.current;
        controls.yaw -= e.movementX * controls.mouseSensitivity;
        controls.pitch -= e.movementY * controls.mouseSensitivity;
        controls.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, controls.pitch));
        updateCamera();
      }
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === containerRef.current;
      setIsPointerLocked(locked);
      gameRef.current.controls.mouseLocked = locked;
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

      // Animate landmarks
      gameRef.current.landmarks.forEach((landmark) => {
        landmark.rotation.y += landmark.userData.rotationSpeed || 0.01;
        landmark.position.y =
          gameRef.current.wallHeight / 2 +
          Math.sin(Date.now() * landmark.userData.floatSpeed + landmark.userData.floatOffset) * 0.2;
      });

      // Animate Exit marker
      const exitMarker = gameRef.current.exitMarker;
      if (exitMarker && exitMarker.children[1]) {
        exitMarker.children[1].position.y = 1 + Math.sin(Date.now() * 0.002) * 0.3;
        exitMarker.children[1].rotation.z += 0.01;
      }
      if (gameRef.current.exitLight) {
        gameRef.current.exitLight.intensity = 2 + Math.sin(Date.now() * 0.003) * 0.5;
      }

      // Render main
      renderer.render(scene, camera);

      // Render minimap
      const playerMarker = gameRef.current.playerMarker;
      if (playerMarker) {
        playerMarker.position.x = gameRef.current.player.x;
        playerMarker.position.z = gameRef.current.player.z;
        playerMarker.rotation.z = gameRef.current.controls.yaw;
      }
      minimapCamera.position.x = gameRef.current.player.x;
      minimapCamera.position.z = gameRef.current.player.z;
      minimapRenderer.render(minimapScene, minimapCamera);
    };

    animId = requestAnimationFrame(animate);
    gameRef.current.animationFrameId = animId;

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
  }, [generateMaze, buildMazeGeometry, buildMinimap, updateCamera, movePlayer]);

  const handleContainerClick = () => {
    if (!isPointerLocked && !hasWon) {
      containerRef.current?.requestPointerLock();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="w-full h-full cursor-crosshair"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 text-white text-2xl font-bold font-['Orbitron']">
          Generating 3D Maze...
        </div>
      )}

      {/* Minimap radar */}
      <div
        ref={minimapRef}
        className="absolute top-5 right-5 w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-white/50 bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-30"
      />

      {/* Top Left Game HUD */}
      <div className="absolute top-5 left-5 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white text-sm max-w-sm z-30 pointer-events-auto">
        <h3 className="text-base font-bold text-yellow-300 font-['Orbitron'] mb-1">
          Level 1: Standard Maze
        </h3>
        <p className="text-neutral-300 mb-2">
          {isPointerLocked
            ? 'Mouse look active. Use WASD to move. Press Q or ESC to release cursor.'
            : 'Click on screen to lock mouse look. Use WASD to move.'}
        </p>
        <button
          onClick={onBackToLevels}
          className="inline-flex items-center text-xs text-cyan-300 hover:text-cyan-100 underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Level Selection
        </button>
      </div>

      {/* Mobile Controls (shown on small or touch screens) */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-auto">
        <button
          onPointerDown={() => { gameRef.current.mobileControls.up = true; }}
          onPointerUp={() => { gameRef.current.mobileControls.up = false; }}
          onPointerLeave={() => { gameRef.current.mobileControls.up = false; }}
          className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
        >
          &uarr;
        </button>
        <div className="flex gap-8">
          <button
            onPointerDown={() => { gameRef.current.mobileControls.left = true; }}
            onPointerUp={() => { gameRef.current.mobileControls.left = false; }}
            onPointerLeave={() => { gameRef.current.mobileControls.left = false; }}
            className="w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white text-white font-bold text-2xl flex items-center justify-center touch-none"
          >
            &larr;
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-yellow-400/50 p-8 rounded-2xl text-center max-w-sm w-full shadow-[0_0_30px_rgba(255,255,0,0.3)] animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-extrabold text-green-400 font-['Orbitron'] mb-3">
              Congratulations!
            </h2>
            <p className="text-neutral-300 mb-6">
              You navigated the 3D maze and reached the beacon!
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
