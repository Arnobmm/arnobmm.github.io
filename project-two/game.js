// Wait for everything to load
window.addEventListener('load', init);

// Game variables
let scene, camera, renderer;
let player = { 
    x: 0, 
    z: 0, 
    height: 1.0, 
    speed: 0.1 
};
let maze = [];
let mazeSize = 15; // Size of the maze (width and height)
let wallHeight = 2;
let cellSize = 2; // Size of each cell in the maze
let isLoading = true;
let collisionWalls = []; // Array to store wall positions for collision detection
let goalPosition = { x: 0, z: 0 }; // Position of the goal/exit

// Add minimap variables
let minimapCamera, minimapRenderer, minimapScene;
let minimapSize = 150; // pixels
let landmarks = []; // Array to store landmark objects
let playerMarker; // Player indicator for minimap

// Control variables - completely rebuilt
let controls = {
    // Movement flags
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    // Look angles
    yaw: 0, // Left/right rotation (horizontal)
    pitch: 0, // Up/down rotation (vertical)
    // Mouse settings
    mouseLocked: false,
    mouseSensitivity: 0.002,
    // Camera direction vector
    direction: new THREE.Vector3()
};

// Mobile control states
let mobileControls = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Add at the top with other game variables
let exitMarker;
let exitLight;

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = player.height;
    
    // Set up renderer with improved shadows
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        logarithmicDepthBuffer: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Generate the maze
    generateMaze();
    
    // Create maze in 3D
    createMazeGeometry();
    
    // Set player starting position (near the entrance)
    resetPlayerPosition();
    
    // Set up minimap
    setupMinimap();
    
    // Add lights
    addLighting();
    
    // Set up event listeners - completely rebuilt
    setupControls();
    
    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
    isLoading = false;
    
    // Start game loop
    animate();
}

function generateMaze() {
    // Initialize maze with walls
    for(let i = 0; i < mazeSize; i++) {
        maze[i] = [];
        for(let j = 0; j < mazeSize; j++) {
            maze[i][j] = 1; // 1 represents a wall
        }
    }
    
    // Create paths using a simple algorithm
    // Start at a random position
    let x = 1;
    let z = 1;
    maze[z][x] = 0; // 0 represents a path
    
    // Set entrance (near 0,0)
    maze[1][0] = 0;
    
    // Define exit at the opposite corner (properly positioned)
    const exitX = mazeSize - 2;
    const exitZ = mazeSize - 2;
    maze[exitZ][exitX] = 0;
    maze[exitZ][exitX + 1] = 0; // Create exit path
    
    // Set goal position in world coordinates (properly scaled)
    goalPosition.x = exitX * cellSize;
    goalPosition.z = exitZ * cellSize;
    
    // Create random paths using a simple backtracking algorithm
    let stack = [{x, z}];
    
    while(stack.length > 0) {
        // Get current position
        let current = stack[stack.length - 1];
        
        // Find available directions
        let directions = [];
        
        if(current.z > 2 && maze[current.z - 2][current.x] === 1) directions.push({x: 0, z: -2});
        if(current.z < mazeSize - 3 && maze[current.z + 2][current.x] === 1) directions.push({x: 0, z: 2});
        if(current.x > 2 && maze[current.z][current.x - 2] === 1) directions.push({x: -2, z: 0});
        if(current.x < mazeSize - 3 && maze[current.z][current.x + 2] === 1) directions.push({x: 2, z: 0});
        
        if(directions.length > 0) {
            // Choose random direction
            let dir = directions[Math.floor(Math.random() * directions.length)];
            
            // Create path
            maze[current.z + dir.z/2][current.x + dir.x/2] = 0;
            maze[current.z + dir.z][current.x + dir.x] = 0;
            
            // Push new position
            stack.push({x: current.x + dir.x, z: current.z + dir.z});
        } else {
            // Backtrack
            stack.pop();
        }
    }
    
    // Ensure path to exit
    let exitPathX = exitX;
    let exitPathZ = exitZ;
    // Create a path leading to the exit
    for(let i = 0; i < 3; i++) {
        if(exitPathX > 0) {
            maze[exitPathZ][exitPathX - 1] = 0;
            exitPathX--;
        }
        if(exitPathZ > 0) {
            maze[exitPathZ - 1][exitPathX] = 0;
            exitPathZ--;
        }
    }
    
    // Block the area directly behind the starting position to prevent going outside the maze
    maze[1][0] = 0; // Entrance
    maze[0][0] = 1; // Block to the left of entrance
    maze[0][1] = 1; // Block behind entrance
    maze[2][0] = 1; // Block to the right of entrance
}

function createMazeGeometry() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(mazeSize * cellSize + 2, mazeSize * cellSize + 2);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((mazeSize * cellSize) / 2 - cellSize / 2, 0, (mazeSize * cellSize) / 2 - cellSize / 2);
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Create walls
    const wallGeometry = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
    
    // Use a darker purple color for walls to make them visually distinct
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a0dad,
        roughness: 0.6,
        metalness: 0.2
    });
    
    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(mazeSize * cellSize + 2, mazeSize * cellSize + 2);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        side: THREE.DoubleSide,
        roughness: 0.8
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set((mazeSize * cellSize) / 2 - cellSize / 2, wallHeight, (mazeSize * cellSize) / 2 - cellSize / 2);
    ceiling.receiveShadow = true;
    scene.add(ceiling);
    
    // Add walls based on maze data
    collisionWalls = []; // Reset collision walls
    
    for(let z = 0; z < mazeSize; z++) {
        for(let x = 0; x < mazeSize; x++) {
            if(maze[z][x] === 1) {
                const wallX = x * cellSize;
                const wallZ = z * cellSize;
                
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(wallX, wallHeight/2, wallZ);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
                
                // Add to collision walls
                collisionWalls.push({
                    minX: wallX - cellSize/2,
                    maxX: wallX + cellSize/2,
                    minZ: wallZ - cellSize/2,
                    maxZ: wallZ + cellSize/2
                });
            }
        }
    }
    
    // Create a more visible exit marker
    const exitBaseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
    const exitBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create floating ring for the exit
    const ringGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create exit marker group
    exitMarker = new THREE.Group();
    
    // Add base cylinder
    const base = new THREE.Mesh(exitBaseGeometry, exitBaseMaterial);
    base.position.y = 0.05;
    exitMarker.add(base);
    
    // Add floating ring
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI/2;
    ring.position.y = 1;
    exitMarker.add(ring);
    
    // Position the exit marker
    exitMarker.position.set(goalPosition.x, 0, goalPosition.z);
    exitMarker.castShadow = true;
    exitMarker.receiveShadow = true;
    scene.add(exitMarker);
    
    // Add a spotlight above the exit
    exitLight = new THREE.SpotLight(0xff0000, 2);
    exitLight.position.set(goalPosition.x, wallHeight - 0.5, goalPosition.z);
    exitLight.target = base;
    exitLight.angle = Math.PI/6;
    exitLight.penumbra = 0.5;
    exitLight.distance = 10;
    exitLight.castShadow = true;
    scene.add(exitLight);
    
    // After creating the maze, add landmarks
    createLandmarks();
}

function setupMinimap() {
    // Create minimap scene
    minimapScene = new THREE.Scene();
    minimapScene.background = new THREE.Color(0x000000);
    minimapScene.background.alpha = 0.5;
    
    // Create minimap renderer with transparency
    minimapRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    minimapRenderer.setSize(minimapSize, minimapSize);
    minimapRenderer.domElement.style.position = 'absolute';
    minimapRenderer.domElement.style.top = '20px';
    minimapRenderer.domElement.style.right = '20px';
    minimapRenderer.domElement.style.borderRadius = '50%';
    minimapRenderer.domElement.style.overflow = 'hidden';
    minimapRenderer.domElement.style.border = '3px solid rgba(255, 255, 255, 0.5)';
    minimapRenderer.domElement.style.background = 'rgba(0, 0, 0, 0.5)';
    document.getElementById('game-container').appendChild(minimapRenderer.domElement);
    
    // Create minimap camera (orthographic for 2D view)
    minimapCamera = new THREE.OrthographicCamera(
        -mazeSize * cellSize / 2,
        mazeSize * cellSize / 2,
        mazeSize * cellSize / 2,
        -mazeSize * cellSize / 2,
        1,
        1000
    );
    minimapCamera.position.set(0, 50, 0);
    minimapCamera.lookAt(0, 0, 0);
    minimapCamera.up.set(0, 0, -1);
    
    // Create player marker for minimap
    const markerGeometry = new THREE.CircleGeometry(0.4, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        side: THREE.DoubleSide
    });
    playerMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.position.y = 45; // Just below camera
    minimapScene.add(playerMarker);
    
    // Create simplified maze representation for minimap
    createMinimapMaze();
}

function createMinimapMaze() {
    // Create simplified walls for minimap
    const wallGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const wallMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    
    // Add walls to minimap scene
    for(let z = 0; z < mazeSize; z++) {
        for(let x = 0; x < mazeSize; x++) {
            if(maze[z][x] === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(
                    x * cellSize,
                    40, // Below camera but above player marker
                    z * cellSize
                );
                wall.rotation.x = -Math.PI / 2;
                minimapScene.add(wall);
            }
        }
    }
    
    // Add goal marker to minimap (larger and more visible)
    const goalGeometry = new THREE.CircleGeometry(1, 32);
    const goalMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const goalMarker = new THREE.Mesh(goalGeometry, goalMaterial);
    goalMarker.position.set(goalPosition.x, 40, goalPosition.z);
    goalMarker.rotation.x = -Math.PI / 2;
    minimapScene.add(goalMarker);
    
    // Add pulsing ring around the goal on minimap
    const pulseGeometry = new THREE.RingGeometry(1.2, 1.4, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const pulseRing = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulseRing.position.set(goalPosition.x, 40, goalPosition.z);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.userData.pulseScale = 1;
    minimapScene.add(pulseRing);
}

function createLandmarks() {
    // Create different types of landmark objects
    const landmarkGeometries = [
        new THREE.TorusKnotGeometry(0.3, 0.1, 32, 8),
        new THREE.OctahedronGeometry(0.4),
        new THREE.TetrahedronGeometry(0.4),
        new THREE.IcosahedronGeometry(0.3)
    ];
    
    const landmarkMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.7, roughness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x44ff44, metalness: 0.7, roughness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x4444ff, metalness: 0.7, roughness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0xffff44, metalness: 0.7, roughness: 0.3 })
    ];
    
    // Place landmarks at strategic locations
    for(let z = 2; z < mazeSize - 2; z += 3) {
        for(let x = 2; x < mazeSize - 2; x += 3) {
            if(maze[z][x] === 0) { // Only place on paths
                const geometryIndex = Math.floor(Math.random() * landmarkGeometries.length);
                const landmark = new THREE.Mesh(
                    landmarkGeometries[geometryIndex],
                    landmarkMaterials[geometryIndex]
                );
                
                landmark.position.set(
                    x * cellSize,
                    wallHeight / 2,
                    z * cellSize
                );
                
                landmark.castShadow = true;
                landmark.receiveShadow = true;
                
                // Add subtle animation
                landmark.rotation.y = Math.random() * Math.PI * 2;
                landmark.userData.rotationSpeed = (Math.random() - 0.5) * 0.02;
                landmark.userData.floatSpeed = (Math.random() - 0.5) * 0.005;
                landmark.userData.floatOffset = Math.random() * Math.PI * 2;
                
                scene.add(landmark);
                landmarks.push(landmark);
            }
        }
    }
}

function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);
    
    // Directional light (simulating sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 15);
    directionalLight.castShadow = true;
    
    // Improve shadow quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 1;
    
    scene.add(directionalLight);
    
    // Player light with improved shadows
    const playerLight = new THREE.PointLight(0xffffff, 1, 15);
    playerLight.position.set(0, player.height - 0.2, 0);
    playerLight.castShadow = true;
    playerLight.shadow.mapSize.width = 1024;
    playerLight.shadow.mapSize.height = 1024;
    playerLight.shadow.camera.near = 0.1;
    playerLight.shadow.camera.far = 15;
    playerLight.shadow.bias = -0.001;
    scene.add(playerLight);
    
    window.playerLight = playerLight;
}

function resetPlayerPosition() {
    // Place player at entrance
    player.x = 0;
    player.z = cellSize;
    
    // Reset camera rotation
    controls.yaw = 0;
    controls.pitch = 0;
    
    updateCamera();
}

function updateCamera() {
    // Update camera position
    camera.position.x = player.x;
    camera.position.y = player.height;
    camera.position.z = player.z;
    
    // Create a quaternion for rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(controls.pitch, controls.yaw, 0, 'YXZ'));
    
    // Update camera rotation using quaternion
    camera.quaternion.copy(quaternion);
    
    // Update direction vector for movement
    controls.direction.set(0, 0, -1).applyQuaternion(quaternion);
}

function checkCollision(newX, newZ) {
    // Check boundaries to prevent going outside the maze
    if(newX < -cellSize/2 || newX > mazeSize * cellSize || 
       newZ < -cellSize/2 || newZ > mazeSize * cellSize) {
        return { collided: true, allowX: false, allowZ: false };
    }
    
    // Size of player collision box
    const playerSize = 0.3;
    
    let collisionResult = {
        collided: false,
        allowX: true,
        allowZ: true
    };
    
    // Check collision with walls
    for(const wall of collisionWalls) {
        if(newX + playerSize > wall.minX && newX - playerSize < wall.maxX &&
           newZ + playerSize > wall.minZ && newZ - playerSize < wall.maxZ) {
            collisionResult.collided = true;
            
            // Check if we can slide along X axis
            if(player.z + playerSize > wall.minZ && player.z - playerSize < wall.maxZ) {
                collisionResult.allowX = false;
            }
            
            // Check if we can slide along Z axis
            if(player.x + playerSize > wall.minX && player.x - playerSize < wall.maxX) {
                collisionResult.allowZ = false;
            }
        }
    }
    
    return collisionResult;
}

// Completely rebuilt controls setup
function setupControls() {
    const gameContainer = document.getElementById('game-container');
    
    // Keyboard controls - down
    window.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'w': case 'W':
                controls.moveForward = true;
                break;
            case 's': case 'S':
                controls.moveBackward = true;
                break;
            case 'a': case 'A':
                controls.moveLeft = true;
                break;
            case 'd': case 'D':
                controls.moveRight = true;
                break;
            case 'q': case 'Q':
                toggleMouseLock();
                break;
        }
    });
    
    // Keyboard controls - up
    window.addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'w': case 'W':
                controls.moveForward = false;
                break;
            case 's': case 'S':
                controls.moveBackward = false;
                break;
            case 'a': case 'A':
                controls.moveLeft = false;
                break;
            case 'd': case 'D':
                controls.moveRight = false;
                break;
        }
    });
    
    // Mouse controls
    gameContainer.addEventListener('click', () => {
        if (!controls.mouseLocked) {
            lockMouse();
        }
    });
    
    // Track mouse movement
    document.addEventListener('mousemove', (event) => {
        if (controls.mouseLocked) {
            // Get mouse movement
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            
            // Update look direction - horizontal movement (left/right)
            controls.yaw -= movementX * controls.mouseSensitivity;
            
            // Update look direction - vertical movement (up/down)
            controls.pitch -= movementY * controls.mouseSensitivity;
            
            // Limit looking up/down to avoid flipping
            controls.pitch = Math.max(-Math.PI/2.1, Math.min(Math.PI/2.1, controls.pitch));
            
            updateCamera();
        }
    });
    
    // Pointer lock change handler
    document.addEventListener('pointerlockchange', updateMouseLockStatus);
    document.addEventListener('mozpointerlockchange', updateMouseLockStatus);
    document.addEventListener('webkitpointerlockchange', updateMouseLockStatus);
    
    // Mobile control events
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Touch events for mobile buttons
    upBtn.addEventListener('touchstart', () => { mobileControls.up = true; });
    upBtn.addEventListener('touchend', () => { mobileControls.up = false; });
    
    downBtn.addEventListener('touchstart', () => { mobileControls.down = true; });
    downBtn.addEventListener('touchend', () => { mobileControls.down = false; });
    
    leftBtn.addEventListener('touchstart', () => { mobileControls.left = true; });
    leftBtn.addEventListener('touchend', () => { mobileControls.left = false; });
    
    rightBtn.addEventListener('touchstart', () => { mobileControls.right = true; });
    rightBtn.addEventListener('touchend', () => { mobileControls.right = false; });
    
    // Mouse events as fallback for testing
    upBtn.addEventListener('mousedown', () => { mobileControls.up = true; });
    upBtn.addEventListener('mouseup', () => { mobileControls.up = false; });
    
    downBtn.addEventListener('mousedown', () => { mobileControls.down = true; });
    downBtn.addEventListener('mouseup', () => { mobileControls.down = false; });
    
    leftBtn.addEventListener('mousedown', () => { mobileControls.left = true; });
    leftBtn.addEventListener('mouseup', () => { mobileControls.left = false; });
    
    rightBtn.addEventListener('mousedown', () => { mobileControls.right = true; });
    rightBtn.addEventListener('mouseup', () => { mobileControls.right = false; });
    
    // Window resize event
    window.addEventListener('resize', () => {
        // Main view
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Minimap (maintain aspect ratio and size)
        minimapRenderer.setSize(minimapSize, minimapSize);
    });
}

// Lock mouse to enable camera control
function lockMouse() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.requestPointerLock = gameContainer.requestPointerLock || 
                                      gameContainer.mozRequestPointerLock || 
                                      gameContainer.webkitRequestPointerLock;
    gameContainer.requestPointerLock();
}

// Unlock mouse to disable camera control
function unlockMouse() {
    document.exitPointerLock = document.exitPointerLock || 
                              document.mozExitPointerLock || 
                              document.webkitExitPointerLock;
    document.exitPointerLock();
}

// Toggle mouse lock state
function toggleMouseLock() {
    if (controls.mouseLocked) {
        unlockMouse();
    } else {
        lockMouse();
    }
}

// Update mouse lock status
function updateMouseLockStatus() {
    const gameContainer = document.getElementById('game-container');
    const infoElement = document.getElementById('info');
    
    if (document.pointerLockElement === gameContainer || 
        document.mozPointerLockElement === gameContainer || 
        document.webkitPointerLockElement === gameContainer) {
        // Mouse is locked
        controls.mouseLocked = true;
        infoElement.innerHTML = 
            '<p>Mouse look active. Use WASD to move. Press Q or ESC to release cursor.</p>' +
            '<p>W/S = forward/backward, A/D = left/right</p>' +
            '<p><a href="index.html" style="color: white; text-decoration: underline;">Back to Level Selection</a></p>';
    } else {
        // Mouse is unlocked
        controls.mouseLocked = false;
        infoElement.innerHTML = 
            '<p>Click on the game to activate mouse look.</p>' +
            '<p>Use WASD to move. Find the exit!</p>' +
            '<p>Mobile users: Use on-screen controls</p>' +
            '<p><a href="index.html" style="color: white; text-decoration: underline;">Back to Level Selection</a></p>';
    }
}

function movePlayer() {
    // Direction vectors
    let moveX = 0;
    let moveZ = 0;
    
    // Calculate forward vector
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.y = 0; // Keep movement horizontal
    forward.normalize();
    
    // Calculate right vector
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0; // Keep movement horizontal
    right.normalize();
    
    // Apply movement based on controls
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
    
    // Handle rotation with mobile controls
    if (mobileControls.left) {
        controls.yaw += 0.05;
        updateCamera();
    }
    if (mobileControls.right) {
        controls.yaw -= 0.05;
        updateCamera();
    }
    
    // Normalize movement to prevent faster diagonal movement
    if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX = moveX / length * player.speed;
        moveZ = moveZ / length * player.speed;
        
        // Apply movement with wall sliding
        const newX = player.x + moveX;
        const newZ = player.z + moveZ;
        
        const collision = checkCollision(newX, newZ);
        
        // Update position based on collision result
        if (!collision.collided) {
            // No collision, move freely
            player.x = newX;
            player.z = newZ;
        } else {
            // Allow sliding along walls
            if (collision.allowX) {
                player.x = newX;
            }
            if (collision.allowZ) {
                player.z = newZ;
            }
        }
        
        updateCamera();
        
        // Move player light
        if (window.playerLight) {
            window.playerLight.position.x = player.x;
            window.playerLight.position.z = player.z;
        }
        
        // Check if player reached the goal
        if (Math.abs(player.x - goalPosition.x) < cellSize/2 && 
            Math.abs(player.z - goalPosition.z) < cellSize/2) {
            // Unlock mouse when maze is completed
            if (controls.mouseLocked) {
                unlockMouse();
            }
            showVictoryMenu();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (!isLoading) {
        movePlayer();
        
        // Animate landmarks
        landmarks.forEach(landmark => {
            landmark.rotation.y += landmark.userData.rotationSpeed;
            landmark.position.y = wallHeight/2 + 
                Math.sin(Date.now() * landmark.userData.floatSpeed + 
                landmark.userData.floatOffset) * 0.2;
        });
        
        // Animate exit marker
        if (exitMarker) {
            // Float the ring up and down
            exitMarker.children[1].position.y = 1 + Math.sin(Date.now() * 0.002) * 0.3;
            // Rotate the ring
            exitMarker.children[1].rotation.z += 0.01;
            
            // Pulse the exit light intensity
            if (exitLight) {
                exitLight.intensity = 2 + Math.sin(Date.now() * 0.003) * 0.5;
            }
        }
        
        // Update minimap
        updateMinimap();
    }
    
    renderer.render(scene, camera);
}

function updateMinimap() {
    // Update minimap camera to follow player
    minimapCamera.position.x = player.x;
    minimapCamera.position.z = player.z;
    
    // Update player marker position
    if (playerMarker) {
        playerMarker.position.x = player.x;
        playerMarker.position.z = player.z;
        
        // Add direction indicator
        playerMarker.rotation.z = controls.yaw;
    }
    
    // Render minimap scene
    minimapRenderer.render(minimapScene, minimapCamera);
}

function showVictoryMenu() {
    // Create and show the victory menu
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'victory-menu';
    menuOverlay.style.position = 'fixed';
    menuOverlay.style.top = '50%';
    menuOverlay.style.left = '50%';
    menuOverlay.style.transform = 'translate(-50%, -50%)';
    menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menuOverlay.style.padding = '20px';
    menuOverlay.style.borderRadius = '10px';
    menuOverlay.style.color = 'white';
    menuOverlay.style.textAlign = 'center';
    menuOverlay.style.zIndex = '1000';

    // Add congratulations message
    const message = document.createElement('h2');
    message.textContent = 'Congratulations!';
    message.style.marginBottom = '20px';
    menuOverlay.appendChild(message);

    // Add play again button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.margin = '10px';
    playAgainBtn.style.padding = '10px 20px';
    playAgainBtn.style.fontSize = '16px';
    playAgainBtn.style.cursor = 'pointer';
    playAgainBtn.style.backgroundColor = '#4CAF50';
    playAgainBtn.style.border = 'none';
    playAgainBtn.style.borderRadius = '5px';
    playAgainBtn.style.color = 'white';
    playAgainBtn.onclick = () => {
        document.body.removeChild(menuOverlay);
        resetGame();
    };
    menuOverlay.appendChild(playAgainBtn);

    // Add level selection button
    const levelSelectBtn = document.createElement('button');
    levelSelectBtn.textContent = 'Choose Level';
    levelSelectBtn.style.margin = '10px';
    levelSelectBtn.style.padding = '10px 20px';
    levelSelectBtn.style.fontSize = '16px';
    levelSelectBtn.style.cursor = 'pointer';
    levelSelectBtn.style.backgroundColor = '#2196F3';
    levelSelectBtn.style.border = 'none';
    levelSelectBtn.style.borderRadius = '5px';
    levelSelectBtn.style.color = 'white';
    levelSelectBtn.onclick = () => {
        window.location.href = 'index.html';
    };
    menuOverlay.appendChild(levelSelectBtn);

    document.body.appendChild(menuOverlay);
}

function resetGame() {
    // Reset player position and controls
    resetPlayerPosition();
    
    // Regenerate the maze
    generateMaze();
    
    // Clear existing maze geometry
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Rebuild the maze
    createMazeGeometry();
    addLighting();
    
    // Reset minimap
    setupMinimap();
    
    // Reset controls
    controls.mouseLocked = false;
    updateMouseLockStatus();
} 