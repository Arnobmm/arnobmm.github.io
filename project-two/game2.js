// Wait for everything to load
window.addEventListener('load', init);

// Global variables
let scene, camera, renderer, controls;
let player = {
    position: new THREE.Vector3(0, 1, 0),
    velocity: new THREE.Vector3(),
    onGround: false,
    canDoubleJump: true,
    sprintSpeed: 0.2,
    walkSpeed: 0.1,
    jumpForce: 0.3,
    gravity: 0.015
};

let platforms = [];
let goalPlatform;
let minimapScene, minimapCamera, minimapRenderer, playerMarker;
const minimapSize = 150;
const mazeSize = 50;
const cellSize = 2;

// Audio context and nodes
let audioContext;
let sprintOscillator;
let sprintGain;
let isSprintSoundPlaying = false;

// Sound effects
let sprintSound;

// Control variables
controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    yaw: 0,
    pitch: 0
};

// Mobile control states
let mobileControls = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false
};

let isInitialized = false;
let isPointerLocked = false;

// Add texture loader at the top with other global variables
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('https://w7.pngwing.com/pngs/193/172/png-transparent-minecraft-grass-brick-block-grass-grass-coub-thumbnail.png');

function init() {
    // Remove any existing loading indicator
    const existingLoading = document.getElementById('loading');
    if (existingLoading) {
        existingLoading.remove();
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Camera setup with initial orientation towards the course
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 0);
    
    // Set initial controls orientation to face the parkour course
    controls = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
        yaw: Math.PI, // Rotate 180 degrees to face the course
        pitch: 0
    };
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.innerHTML = ''; // Clear any existing content
        gameContainer.appendChild(renderer.domElement);
    }
    
    // Create info text
    const infoText = document.createElement('div');
    infoText.id = 'info';
    infoText.style.position = 'fixed';
    infoText.style.top = '10px';
    infoText.style.left = '10px';
    infoText.style.color = 'white';
    infoText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    infoText.style.padding = '10px';
    infoText.style.borderRadius = '5px';
    infoText.style.fontFamily = 'Arial, sans-serif';
    infoText.style.zIndex = '1000';
    infoText.innerHTML = 'Click to start. WASD to move, SPACE to jump, SHIFT to sprint.<br>Press Q or ESC to toggle mouse lock.';
    document.body.appendChild(infoText);
    
    // Setup everything else
    setupControls();
    setupLighting();
    createPlatforms();
    setupMinimap();
    setupSounds();
    
    isInitialized = true;
    animate();
}

function setupSounds() {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create sprint sound (a whooshing effect)
    sprintOscillator = audioContext.createOscillator();
    sprintGain = audioContext.createGain();
    
    sprintOscillator.connect(sprintGain);
    sprintGain.connect(audioContext.destination);
    
    // Configure sound
    sprintOscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    sprintGain.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Start the oscillator
    sprintOscillator.start();
    
    // Function to play sprint sound
    window.playSprintSound = function() {
        if (!isSprintSoundPlaying) {
            sprintGain.gain.setValueAtTime(0.1, audioContext.currentTime);
            sprintGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            isSprintSoundPlaying = true;
            setTimeout(() => { isSprintSoundPlaying = false; }, 300);
        }
    };
}

function createPlatforms() {
    // Create starting platform
    createStartPlatform(0, 0, 0, 4);
    
    // Create path of platforms with various shapes and directions
    let currentX = 0;
    let currentY = 1;
    let currentZ = 6;
    let direction = 1; // 1 for forward, 2 for right, 3 for left, 4 for diagonal
    
    for (let i = 0; i < 40; i++) {
        // Change direction every few platforms
        if (i % 5 === 0) {
            direction = Math.floor(Math.random() * 4) + 1;
        }
        
        // Update position based on direction
        switch(direction) {
            case 1: // Forward
                currentZ += 4 + Math.random() * 2;
                currentX += (Math.random() - 0.5) * 2;
                break;
            case 2: // Right
                currentX += 4 + Math.random() * 2;
                currentZ += (Math.random() - 0.5) * 2;
                break;
            case 3: // Left
                currentX -= 4 + Math.random() * 2;
                currentZ += (Math.random() - 0.5) * 2;
                break;
            case 4: // Diagonal
                currentX += (Math.random() * 2) * (Math.random() < 0.5 ? 1 : -1);
                currentZ += 4 + Math.random() * 2;
                break;
        }
        
        // Gradually increase height
        currentY += (Math.random() - 0.3) * 2;
        if (i > 30) currentY += 1; // Make platforms go higher near the end
        
        createRandomPlatform(currentX, currentY, currentZ, i);
    }
    
    // Create final grass block platform higher in the sky
    createGrassBlockPlatform(currentX, currentY + 10, currentZ + 10);
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    
    // Adjust shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    
    scene.add(sunLight);
    
    // Add some colored point lights for atmosphere
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    colors.forEach((color, i) => {
        const light = new THREE.PointLight(color, 0.5, 20);
        light.position.set(
            Math.sin(i * Math.PI * 2 / 3) * 10,
            5,
            Math.cos(i * Math.PI * 2 / 3) * 10
        );
        scene.add(light);
    });
}

function createPlatform(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.5,
        roughness: 0.5
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    
    // Add collision data
    platform.userData = {
        width: width,
        height: height,
        depth: depth
    };
    
    scene.add(platform);
    platforms.push(platform);
    return platform;
}

function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Directional sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    
    // Improve shadow quality
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    
    scene.add(sunLight);
}

function setupControls() {
    const mouseSensitivity = 0.002;
    
    // Game container click handler
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.addEventListener('click', () => {
            if (!isPointerLocked && isInitialized) {
                gameContainer.requestPointerLock();
            }
        });
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!isInitialized) return;
        
        switch(event.key) {
            case 'w': case 'W':
                controls.forward = true;
                break;
            case 's': case 'S':
                controls.backward = true;
                break;
            case 'a': case 'A':
                controls.left = true;
                break;
            case 'd': case 'D':
                controls.right = true;
                break;
            case ' ': // Spacebar
                if (player.onGround || player.canDoubleJump) {
                    controls.jump = true;
                }
                break;
            case 'Shift': // Sprint
                controls.sprint = true;
                if (!isSprintSoundPlaying) {
                    playSprintSound();
                }
                break;
            case 'q': case 'Q': case 'Escape':
                if (isPointerLocked) {
                    document.exitPointerLock();
                } else if (isInitialized) {
                    gameContainer.requestPointerLock();
                }
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'w': case 'W':
                controls.forward = false;
                break;
            case 's': case 'S':
                controls.backward = false;
                break;
            case 'a': case 'A':
                controls.left = false;
                break;
            case 'd': case 'D':
                controls.right = false;
                break;
            case ' ': // Spacebar
                controls.jump = false;
                break;
            case 'Shift': // Sprint
                controls.sprint = false;
                break;
        }
    });
    
    // Mouse controls
    document.addEventListener('mousemove', (event) => {
        if (isPointerLocked && isInitialized) {
            controls.yaw -= event.movementX * mouseSensitivity;
            controls.pitch -= event.movementY * mouseSensitivity;
            
            // Limit pitch to prevent camera flipping
            controls.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.pitch));
        }
    });
    
    // Pointer lock change handler
    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === gameContainer;
        const infoText = document.getElementById('info');
        if (infoText) {
            if (isPointerLocked) {
                infoText.innerHTML = 'WASD to move, SPACE to jump, SHIFT to sprint.<br>Press Q or ESC to release cursor.';
                infoText.style.opacity = '0.5';
            } else {
                infoText.innerHTML = 'Click to start. WASD to move, SPACE to jump, SHIFT to sprint.<br>Press Q or ESC to toggle mouse lock.';
                infoText.style.opacity = '1';
            }
        }
    });
    
    // Mobile controls
    setupMobileControls();
    
    // Window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        minimapRenderer.setSize(minimapSize, minimapSize);
    });
}

// Mobile controls setup
function setupMobileControls() {
    const mobileControls = {
        up: false,
        down: false,
        left: false,
        right: false,
        jump: false,
        touchStartX: 0,
        touchStartY: 0
    };
    
    // Add touch event listeners for mobile controls
    document.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        mobileControls.touchStartX = touch.clientX;
        mobileControls.touchStartY = touch.clientY;
    });
    
    document.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - mobileControls.touchStartX;
        const deltaY = touch.clientY - mobileControls.touchStartY;
        
        // Update controls based on touch movement
        mobileControls.up = deltaY < -20;
        mobileControls.down = deltaY > 20;
        mobileControls.left = deltaX < -20;
        mobileControls.right = deltaX > 20;
        
        // Update camera rotation
        controls.yaw -= deltaX * 0.01;
        controls.pitch -= deltaY * 0.01;
        
        // Limit pitch to prevent camera flipping
        controls.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.pitch));
    });
    
    document.addEventListener('touchend', () => {
        mobileControls.up = false;
        mobileControls.down = false;
        mobileControls.left = false;
        mobileControls.right = false;
    });
    
    // Double tap to jump
    let lastTap = 0;
    document.addEventListener('touchend', (event) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            mobileControls.jump = true;
            setTimeout(() => { mobileControls.jump = false; }, 100);
        }
        lastTap = currentTime;
    });
    
    return mobileControls;
}

function checkPlatformCollision() {
    let onPlatform = false;
    let platformY = -Infinity;
    let wallCollision = false;
    let wallNormal = new THREE.Vector3();
    let adjustedPosition = player.position.clone();
    
    for(const platform of platforms) {
        const halfWidth = platform.userData.width / 2;
        const halfDepth = platform.userData.depth / 2;
        const height = platform.userData.height;
        
        // Calculate distances to platform surfaces
        const dx = player.position.x - platform.position.x;
        const dy = player.position.y - platform.position.y;
        const dz = player.position.z - platform.position.z;
        
        // Check if player is within platform bounds (with small buffer)
        const buffer = 0.3; // Collision buffer to prevent clipping
        if (Math.abs(dx) < halfWidth + buffer && 
            Math.abs(dz) < halfDepth + buffer && 
            dy >= 0 && dy <= height + buffer) {
            
            // Top collision (landing on platform)
            if (dy <= height && player.velocity.y <= 0) {
                platformY = Math.max(platformY, platform.position.y + height);
                onPlatform = true;
            }
            
            // Side collisions
            const leftDist = dx + halfWidth;
            const rightDist = halfWidth - dx;
            const frontDist = dz + halfDepth;
            const backDist = halfDepth - dz;
            
            // Find the smallest penetration distance
            const minDist = Math.min(leftDist, rightDist, frontDist, backDist);
            
            if (minDist <= buffer && dy < height - 0.1) { // Side collision
                wallCollision = true;
                
                // Determine which side was hit and set wall normal
                if (minDist === leftDist) {
                    wallNormal.set(-1, 0, 0);
                    adjustedPosition.x = platform.position.x - halfWidth - buffer;
                } else if (minDist === rightDist) {
                    wallNormal.set(1, 0, 0);
                    adjustedPosition.x = platform.position.x + halfWidth + buffer;
                } else if (minDist === frontDist) {
                    wallNormal.set(0, 0, -1);
                    adjustedPosition.z = platform.position.z - halfDepth - buffer;
                } else if (minDist === backDist) {
                    wallNormal.set(0, 0, 1);
                    adjustedPosition.z = platform.position.z + halfDepth + buffer;
                }
            }
            
            // Bottom collision (hitting platform from below)
            if (dy < 0 && player.velocity.y > 0) {
                player.velocity.y = 0;
                adjustedPosition.y = platform.position.y - buffer;
            }
        }
    }
    
    // Apply position adjustments to prevent clipping
    player.position.copy(adjustedPosition);
    
    return { onPlatform, platformY, wallCollision, wallNormal };
}

function movePlayer() {
    // Get forward direction from camera
    const forward = updateCamera();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    
    // Calculate movement direction
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
    
    // Store previous position for collision resolution
    const previousPosition = player.position.clone();
    
    // Normalize movement vector if moving diagonally
    if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const currentSpeed = controls.sprint ? player.sprintSpeed : player.walkSpeed;
        moveX = (moveX / length) * currentSpeed;
        moveZ = (moveZ / length) * currentSpeed;
        
        if (controls.sprint && !isSprintSoundPlaying) {
            playSprintSound();
        }
    }
    
    // Apply gravity with terminal velocity
    player.velocity.y = Math.max(player.velocity.y - player.gravity, -0.5);
    
    // Handle jumping with double jump
    if (controls.jump || mobileControls.jump) {
        if (player.onGround) {
            // First jump
            player.velocity.y = player.jumpForce;
            player.onGround = false;
            player.canDoubleJump = true;
            controls.jump = false;
            mobileControls.jump = false;
        } else if (player.canDoubleJump) {
            // Second jump
            player.velocity.y = player.jumpForce * 0.8;
            player.canDoubleJump = false;
            controls.jump = false;
            mobileControls.jump = false;
        }
    }
    
    // Update position
    player.position.x += moveX;
    player.position.z += moveZ;
    player.position.y += player.velocity.y;
    
    // Check platform collision
    const collision = checkPlatformCollision();
    
    // Handle wall collision
    if (collision.wallCollision) {
        // Slide along walls instead of stopping completely
        const dot = moveX * collision.wallNormal.x + moveZ * collision.wallNormal.z;
        moveX -= dot * collision.wallNormal.x;
        moveZ -= dot * collision.wallNormal.z;
        
        // Allow wall jump
        if (controls.jump || mobileControls.jump) {
            player.velocity.y = player.jumpForce;
            player.velocity.x = collision.wallNormal.x * player.jumpForce;
            player.velocity.z = collision.wallNormal.z * player.jumpForce;
            controls.jump = false;
            mobileControls.jump = false;
            player.canDoubleJump = true;
        }
    }
    
    // Handle ground collision
    if (collision.onPlatform) {
        player.position.y = collision.platformY;
        player.velocity.y = 0;
        player.onGround = true;
        player.canDoubleJump = true;
        
        // Check if reached goal platform
        if (goalPlatform) {
            const distance = Math.sqrt(
                Math.pow(player.position.x - goalPlatform.position.x, 2) +
                Math.pow(player.position.z - goalPlatform.position.z, 2)
            );
            
            if (distance < 3 && Math.abs(player.position.y - goalPlatform.position.y) < 2) {
                showVictoryMenu();
            }
        }
    } else {
        player.onGround = false;
    }
    
    // Check if player fell
    if (player.position.y < -20) {
        resetPlayer();
    }
}

function resetPlayer() {
    player.position.set(0, 1, 0);
    player.velocity.set(0, 0, 0);
    player.onGround = false;
    player.canDoubleJump = true;
    controls.yaw = Math.PI;
    controls.pitch = 0;
    updateCamera();
}

function showVictoryMenu() {
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
    
    const message = document.createElement('h2');
    message.textContent = 'Level Complete!';
    message.style.marginBottom = '20px';
    menuOverlay.appendChild(message);
    
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
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    };
    menuOverlay.appendChild(playAgainBtn);
    
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
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        window.location.href = 'index.html';
    };
    menuOverlay.appendChild(levelSelectBtn);
    
    document.body.appendChild(menuOverlay);
}

function resetGame() {
    // Clear existing platforms
    while(platforms.length > 0) {
        const platform = platforms.pop();
        scene.remove(platform);
    }
    
    // Reset player position and state
    resetPlayer();
    
    // Recreate platforms
    createPlatforms();
    setupLighting();
    
    // Reset controls
    controls = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
        yaw: Math.PI,
        pitch: 0
    };
    
    // Update minimap
    setupMinimap();
}

function createStartPlatform(x, y, z, radius) {
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.5, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        metalness: 0.5,
        roughness: 0.5
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    
    platform.userData = {
        width: radius * 2,
        height: 0.5,
        depth: radius * 2
    };
    
    scene.add(platform);
    platforms.push(platform);
}

function createRandomPlatform(x, y, z, index) {
    let geometry, material, platform;
    const type = index % 8; // More platform types
    
    switch(type) {
        case 0: // Donut platform
            geometry = new THREE.TorusGeometry(2, 0.5, 16, 32);
            material = new THREE.MeshStandardMaterial({
                color: 0xFF4081,
                metalness: 0.5,
                roughness: 0.5
            });
            platform = new THREE.Mesh(geometry, material);
            platform.rotation.x = Math.PI / 2;
            break;
            
        case 1: // Mouse-shaped platform
            platform = new THREE.Group();
            // Mouse body
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(1.5, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0x808080 })
            );
            // Mouse ears
            const ear1 = new THREE.Mesh(
                new THREE.CircleGeometry(0.5, 16),
                new THREE.MeshStandardMaterial({ color: 0x808080 })
            );
            ear1.position.set(-1, 1, 0);
            const ear2 = ear1.clone();
            ear2.position.set(1, 1, 0);
            platform.add(body, ear1, ear2);
            break;
            
        case 2: // Long platform
            geometry = new THREE.BoxGeometry(8, 0.5, 2);
            material = new THREE.MeshStandardMaterial({
                color: 0x4CAF50,
                metalness: 0.6,
                roughness: 0.4
            });
            platform = new THREE.Mesh(geometry, material);
            break;
            
        case 3: // Small floating cube
            geometry = new THREE.BoxGeometry(1, 1, 1);
            material = new THREE.MeshStandardMaterial({
                color: 0x2196F3,
                metalness: 0.7,
                roughness: 0.3,
                emissive: 0x2196F3,
                emissiveIntensity: 0.2
            });
            platform = new THREE.Mesh(geometry, material);
            break;
            
        case 4: // Spiral platform
            geometry = new THREE.TorusKnotGeometry(1.5, 0.3, 64, 16);
            material = new THREE.MeshStandardMaterial({
                color: 0x9C27B0,
                metalness: 0.8,
                roughness: 0.2
            });
            platform = new THREE.Mesh(geometry, material);
            break;
            
        case 5: // Star platform
            platform = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const point = new THREE.Mesh(
                    new THREE.ConeGeometry(0.5, 2, 4),
                    new THREE.MeshStandardMaterial({ color: 0xFFD700 })
                );
                point.rotation.z = (i * Math.PI * 2) / 5;
                point.position.x = Math.cos((i * Math.PI * 2) / 5) * 2;
                point.position.y = Math.sin((i * Math.PI * 2) / 5) * 2;
                platform.add(point);
            }
            break;
            
        case 6: // Cloud platform
            platform = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const cloud = new THREE.Mesh(
                    new THREE.SphereGeometry(1, 16, 16),
                    new THREE.MeshStandardMaterial({
                        color: 0xFFFFFF,
                        metalness: 0.1,
                        roughness: 0.9
                    })
                );
                cloud.position.x = i * 1.5 - 3;
                cloud.position.y = Math.sin(i) * 0.5;
                platform.add(cloud);
            }
            break;
            
        case 7: // Crystal platform
            geometry = new THREE.OctahedronGeometry(1.5);
            material = new THREE.MeshStandardMaterial({
                color: 0x00BCD4,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.8
            });
            platform = new THREE.Mesh(geometry, material);
            break;
    }
    
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    
    // Add collision data based on platform type
    let collisionSize = type === 2 ? { width: 8, height: 0.5, depth: 2 } : // Long platform
                       type === 3 ? { width: 1, height: 1, depth: 1 } : // Small cube
                       { width: 4, height: 1, depth: 4 }; // Default size
    
    platform.userData = collisionSize;
    
    scene.add(platform);
    platforms.push(platform);
}

function createGrassBlockPlatform(x, y, z) {
    // Create a cube geometry for the grass block
    const geometry = new THREE.BoxGeometry(6, 6, 6);
    const material = new THREE.MeshStandardMaterial({
        map: grassTexture,
        metalness: 0.0,
        roughness: 1.0
    });
    
    goalPlatform = new THREE.Mesh(geometry, material);
    goalPlatform.position.set(x, y, z);
    goalPlatform.castShadow = true;
    goalPlatform.receiveShadow = true;
    
    // Add glowing particles around the grass block
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.7
            })
        );
        
        // Position particles in a circle around the platform
        const angle = (i / particleCount) * Math.PI * 2;
        particle.position.x = Math.cos(angle) * 4;
        particle.position.z = Math.sin(angle) * 4;
        particle.userData = {
            baseY: particle.position.y,
            angle: angle,
            speed: 0.02 + Math.random() * 0.02
        };
        
        goalPlatform.add(particle);
    }
    
    goalPlatform.userData = {
        width: 6,
        height: 6,
        depth: 6
    };
    
    scene.add(goalPlatform);
    platforms.push(goalPlatform);
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
    
    // Style the minimap container
    const minimapContainer = document.createElement('div');
    minimapContainer.style.position = 'absolute';
    minimapContainer.style.top = '20px';
    minimapContainer.style.right = '20px';
    minimapContainer.style.width = minimapSize + 'px';
    minimapContainer.style.height = minimapSize + 'px';
    minimapContainer.style.borderRadius = '50%';
    minimapContainer.style.overflow = 'hidden';
    minimapContainer.style.border = '3px solid rgba(255, 255, 255, 0.5)';
    minimapContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    minimapContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    // Add renderer to container
    minimapRenderer.domElement.style.borderRadius = '50%';
    minimapContainer.appendChild(minimapRenderer.domElement);
    document.getElementById('game-container').appendChild(minimapContainer);
    
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
    
    // Create improved player marker for minimap
    const markerGeometry = new THREE.CircleGeometry(0.6, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    playerMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    
    // Add direction indicator
    const arrowGeometry = new THREE.ConeGeometry(0.4, 0.8, 3);
    const arrowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.y = 0.1;
    playerMarker.add(arrow);
    
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.position.y = 45;
    minimapScene.add(playerMarker);
    
    // Create simplified platform representations for minimap
    createMinimapPlatforms();
}

function createMinimapPlatforms() {
    // Create simplified representations of platforms for minimap
    platforms.forEach(platform => {
        const minimapGeometry = new THREE.CircleGeometry(1, 16);
        const minimapMaterial = new THREE.MeshBasicMaterial({
            color: platform === goalPlatform ? 0xff0000 : 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const minimapPlatform = new THREE.Mesh(minimapGeometry, minimapMaterial);
        minimapPlatform.position.set(
            platform.position.x,
            40,
            platform.position.z
        );
        minimapPlatform.rotation.x = -Math.PI / 2;
        minimapScene.add(minimapPlatform);
    });
}

function updateCamera() {
    // Update camera position to match player
    camera.position.copy(player.position);
    camera.position.y += 1.7; // Eye height
    
    // Create quaternion from Euler angles
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(controls.pitch, controls.yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    
    // Update player's forward direction for movement
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(quaternion);
    
    // Update minimap player marker
    if (playerMarker) {
        playerMarker.position.x = player.position.x;
        playerMarker.position.z = player.position.z;
        playerMarker.rotation.y = -controls.yaw;
    }
    
    return forward;
}

// Update animate function to include platform animations
function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    
    // Animate goal platform rings
    if (goalPlatform) {
        goalPlatform.children.forEach((ring, index) => {
            ring.rotation.y += ring.userData.rotationSpeed;
            ring.position.y = 1 + index * 0.5 + Math.sin(Date.now() * 0.002) * 0.2;
        });
    }
    
    // Animate platforms
    platforms.forEach(platform => {
        if (platform !== goalPlatform) {
            platform.rotation.y += 0.001;
        }
    });
    
    renderer.render(scene, camera);
    minimapRenderer.render(minimapScene, minimapCamera);
} 