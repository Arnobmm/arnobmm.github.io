// Wait for everything to load
window.addEventListener('load', initGame);

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
// const textureLoader = new THREE.TextureLoader();
// const grassTexture = textureLoader.load('https://w7.pngwing.com/pngs/193/172/png-transparent-minecraft-grass-brick-block-grass-grass-coub-thumbnail.png');

// Add to global variables at the top
let isFlying = false;
const flySpeed = 0.2;
let isBoosted = false;
const BOOST_MULTIPLIER = 2.0;
const BOOST_DURATION = 1000; // 1 second

// Add to global variables at the top
let gameLoop = null;
let isGameActive = true;

function initGame() {
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
    isGameActive = true;
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
    
    // Check if we're in Level 4
    const isLevel4 = window.location.pathname.includes('level4.html');
    
    if (isLevel4) {
        // Create Minecraft-themed platform layout
        let currentX = 0;
        let currentY = 1;
        let currentZ = 6;
        
        // Create a more challenging path with Minecraft blocks
        for (let i = 0; i < 40; i++) {
            // Calculate spiral position
            const angle = i * 0.5;
            const radius = 2 + i * 0.3;
            
            currentX = Math.cos(angle) * radius;
            currentZ = Math.sin(angle) * radius + 6;
            
            // Gradually increase height with some randomness
            currentY += 0.5 + Math.random() * 0.5;
            
            // Create different platform types based on position
            if (i < 10) {
                // First section: Basic blocks
                createRandomPlatform(currentX, currentY, currentZ, i);
            } else if (i < 20) {
                // Second section: More challenging blocks
                createRandomPlatform(currentX, currentY, currentZ, i + 4);
            } else if (i < 30) {
                // Third section: Even more challenging blocks
                createRandomPlatform(currentX, currentY, currentZ, i + 8);
            } else {
                // Final section: Most challenging blocks
                createRandomPlatform(currentX, currentY, currentZ, i + 12);
            }
            
            // Add some floating obstacles
            if (i % 5 === 0 && i > 5) {
                const obstacleX = currentX + (Math.random() - 0.5) * 4;
                const obstacleY = currentY + 2;
                const obstacleZ = currentZ + (Math.random() - 0.5) * 4;
                
                createRandomPlatform(obstacleX, obstacleY, obstacleZ, i + 16);
            }
        }
        
        // Create final platform (Diamond Block)
        createGrassBlockPlatform(currentX, currentY + 2, currentZ + 5);
    } else {
        // Create a more challenging path for level 3
        let currentX = 0;
        let currentY = 1;
        let currentZ = 6;
        
        // Create a spiral pattern with increasing difficulty
        for (let i = 0; i < 40; i++) {
            // Calculate spiral position
            const angle = i * 0.5;
            const radius = 2 + i * 0.3;
            
            currentX = Math.cos(angle) * radius;
            currentZ = Math.sin(angle) * radius + 6;
            
            // Gradually increase height with some randomness
            currentY += 0.5 + Math.random() * 0.5;
            
            // Create different platform types based on position
            if (i < 10) {
                // First section: Basic platforms
                createRandomPlatform(currentX, currentY, currentZ, i);
            } else if (i < 20) {
                // Second section: More challenging platforms
                createRandomPlatform(currentX, currentY, currentZ, i + 4);
            } else if (i < 30) {
                // Third section: Even more challenging platforms
                createRandomPlatform(currentX, currentY, currentZ, i + 8);
            } else {
                // Final section: Most challenging platforms
                createRandomPlatform(currentX, currentY, currentZ, i + 12);
            }
            
            // Add some floating obstacles
            if (i % 5 === 0 && i > 5) {
                const obstacleX = currentX + (Math.random() - 0.5) * 4;
                const obstacleY = currentY + 2;
                const obstacleZ = currentZ + (Math.random() - 0.5) * 4;
                
                createRandomPlatform(obstacleX, obstacleY, obstacleZ, i + 16);
            }
        }
        
        // Create final platform at a challenging height
        createGrassBlockPlatform(currentX, currentY + 2, currentZ + 5);
    }
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
                if (isFlying) {
                    player.velocity.y = flySpeed;
                } else if (player.onGround || player.canDoubleJump) {
                    controls.jump = true;
                }
                break;
            case 'Shift': // Sprint
                if (isFlying) {
                    player.velocity.y = -flySpeed;
                } else {
                    controls.sprint = true;
                    if (!isSprintSoundPlaying) {
                        playSprintSound();
                    }
                }
                break;
            case 'q': case 'Q': case 'Escape':
                if (isPointerLocked) {
                    document.exitPointerLock();
                } else if (isInitialized) {
                    gameContainer.requestPointerLock();
                }
                break;
            case 'r': case 'R': // Toggle flying cheat
                isFlying = !isFlying;
                if (isFlying) {
                    player.velocity.y = 0;
                    showCheatMessage('Flying Mode: ON');
                } else {
                    showCheatMessage('Flying Mode: OFF');
                }
                break;
            case 'e': case 'E': // Toggle boost ON
                if (!isBoosted) {
                    isBoosted = true;
                    showCheatMessage('Speed Boost: ON');
                }
                break;
            case 'f': case 'F': // Toggle boost OFF
                if (isBoosted) {
                    isBoosted = false;
                    showCheatMessage('Speed Boost: OFF');
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
                if (isFlying) {
                    player.velocity.y = 0;
                } else {
                    controls.jump = false;
                }
                break;
            case 'Shift': // Sprint
                if (isFlying) {
                    player.velocity.y = 0;
                } else {
                    controls.sprint = false;
                }
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
    
    // Update pointer lock change handler
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
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
    
    // Player collision box dimensions
    const playerWidth = 0.5;
    const playerHeight = 1.8;
    const playerDepth = 0.5;
    
    for(const platform of platforms) {
        const halfWidth = platform.userData.width / 2;
        const halfDepth = platform.userData.depth / 2;
        const height = platform.userData.height;
        
        // Calculate distances to platform surfaces
        const dx = player.position.x - platform.position.x;
        const dy = player.position.y - platform.position.y;
        const dz = player.position.z - platform.position.z;
        
        // Check if player is within platform bounds (with small buffer)
        const buffer = 0.3;
        const isWithinX = Math.abs(dx) < halfWidth + playerWidth + buffer;
        const isWithinZ = Math.abs(dz) < halfDepth + playerDepth + buffer;
        const isWithinY = dy >= -playerHeight && dy <= height + buffer;
        
        if (isWithinX && isWithinZ && isWithinY) {
            // Top collision (landing on platform)
            if (dy <= height && player.velocity.y <= 0) {
                const platformTop = platform.position.y + height;
                if (player.position.y + playerHeight > platformTop) {
                    platformY = Math.max(platformY, platformTop);
                    onPlatform = true;
                    adjustedPosition.y = platformTop - playerHeight;
                    
                    // Check for goal platform collision
                    if (platform.userData.isGoal) {
                        const distance = Math.sqrt(
                            Math.pow(dx, 2) +
                            Math.pow(dz, 2)
                        );
                        
                        // More lenient victory condition for the flat platform
                        if (distance < 4 && Math.abs(dy) < 3) {
                            showVictoryMenu();
                        }
                    }
                }
            }
            
            // Side collisions with improved detection
            const leftDist = dx + halfWidth + playerWidth;
            const rightDist = halfWidth + playerWidth - dx;
            const frontDist = dz + halfDepth + playerDepth;
            const backDist = halfDepth + playerDepth - dz;
            
            const minDist = Math.min(leftDist, rightDist, frontDist, backDist);
            
            if (minDist <= buffer && dy < height - 0.1) {
                wallCollision = true;
                
                if (minDist === leftDist) {
                    wallNormal.set(-1, 0, 0);
                    adjustedPosition.x = platform.position.x - halfWidth - playerWidth - buffer;
                } else if (minDist === rightDist) {
                    wallNormal.set(1, 0, 0);
                    adjustedPosition.x = platform.position.x + halfWidth + playerWidth + buffer;
                } else if (minDist === frontDist) {
                    wallNormal.set(0, 0, -1);
                    adjustedPosition.z = platform.position.z - halfDepth - playerDepth - buffer;
                } else if (minDist === backDist) {
                    wallNormal.set(0, 0, 1);
                    adjustedPosition.z = platform.position.z + halfDepth + playerDepth + buffer;
                }
            }
            
            // Bottom collision
            if (dy < -playerHeight && player.velocity.y > 0) {
                player.velocity.y = 0;
                adjustedPosition.y = platform.position.y - playerHeight - buffer;
            }
        }
    }
    
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
        let currentSpeed = controls.sprint ? player.sprintSpeed : player.walkSpeed;
        
        // Apply speed boost if active
        if (isBoosted) {
            currentSpeed *= BOOST_MULTIPLIER;
        }
        
        moveX = (moveX / length) * currentSpeed;
        moveZ = (moveZ / length) * currentSpeed;
        
        if (controls.sprint && !isSprintSoundPlaying && !isFlying) {
            playSprintSound();
        }
    }
    
    // Apply gravity or flying physics
    if (!isFlying) {
        player.velocity.y = Math.max(player.velocity.y - player.gravity, -0.5);
    }
    
    // Handle jumping with double jump (only when not flying)
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
    
    // Update position
    player.position.x += moveX;
    player.position.z += moveZ;
    player.position.y += player.velocity.y;
    
    // Check platform collision (only when not flying)
    if (!isFlying) {
        const collision = checkPlatformCollision();
        
        // Handle wall collision
        if (collision.wallCollision) {
            const dot = moveX * collision.wallNormal.x + moveZ * collision.wallNormal.z;
            moveX -= dot * collision.wallNormal.x;
            moveZ -= dot * collision.wallNormal.z;
            
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
        } else {
            player.onGround = false;
        }
    }
    
    // Check if player fell (only when not flying)
    if (!isFlying && player.position.y < -20) {
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
    // Pause the game loop
    isGameActive = false;
    
    // Create a simple modal dialog
    const dialog = document.createElement('dialog');
    dialog.id = 'victory-dialog';
    dialog.style.padding = '30px';
    dialog.style.border = 'none';
    dialog.style.borderRadius = '15px';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    dialog.style.color = 'white';
    dialog.style.textAlign = 'center';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.minWidth = '300px';
    dialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    
    // Create content
    dialog.innerHTML = `
        <h2 style="margin-bottom: 30px; font-size: 28px; color: #4CAF50;">Level Complete!</h2>
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <button id="play-again-btn" style="
                padding: 12px 24px;
                font-size: 18px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            ">Play Again</button>
            <button id="choose-level-btn" style="
                padding: 12px 24px;
                font-size: 18px;
                background-color: #2196F3;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            ">Choose Level</button>
        </div>
    `;
    
    // Add hover effects to buttons
    const playAgainBtn = dialog.querySelector('#play-again-btn');
    const chooseLevelBtn = dialog.querySelector('#choose-level-btn');
    
    playAgainBtn.addEventListener('mouseover', () => {
        playAgainBtn.style.transform = 'scale(1.05)';
        playAgainBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });
    
    playAgainBtn.addEventListener('mouseout', () => {
        playAgainBtn.style.transform = 'scale(1)';
        playAgainBtn.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    });
    
    chooseLevelBtn.addEventListener('mouseover', () => {
        chooseLevelBtn.style.transform = 'scale(1.05)';
        chooseLevelBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });
    
    chooseLevelBtn.addEventListener('mouseout', () => {
        chooseLevelBtn.style.transform = 'scale(1)';
        chooseLevelBtn.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    });
    
    // Add dialog to document
    document.body.appendChild(dialog);
    
    // Show dialog
    dialog.showModal();
    
    // Add event listeners
    document.getElementById('play-again-btn').addEventListener('click', () => {
        dialog.close();
        restartGame();
    });
    
    document.getElementById('choose-level-btn').addEventListener('click', () => {
        dialog.close();
        window.location.href = 'index.html';
    });
    
    // Handle dialog close
    dialog.addEventListener('close', () => {
        dialog.remove();
    });
}

function restartGame() {
    // Clear everything
    clearGame();
    
    // Reinitialize everything
    initGame();
}

function clearGame() {
    // Stop the game loop
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Clear platforms
    while(platforms.length > 0) {
        const platform = platforms.pop();
        scene.remove(platform);
    }
    
    // Clear minimap
    if (minimapScene) {
        while(minimapScene.children.length > 0) {
            const child = minimapScene.children[0];
            minimapScene.remove(child);
        }
    }
    
    // Reset player
    player.position.set(0, 1, 0);
    player.velocity.set(0, 0, 0);
    player.onGround = false;
    player.canDoubleJump = true;
    
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
    
    // Reset states
    isBoosted = false;
    isFlying = false;
    isInitialized = false;
    isPointerLocked = false;
    isGameActive = true;
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
    const type = index % 16; // More platform types for variety
    
    // Check if we're in Level 4 (Minecraft theme)
    const isLevel4 = window.location.pathname.includes('level4.html');
    
    if (isLevel4) {
        // Minecraft-themed platforms
        switch(type) {
            case 0: // Grass Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x55AA55,
                    metalness: 0.1,
                    roughness: 0.9
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 1: // Stone Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    metalness: 0.2,
                    roughness: 0.8
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 2: // Dirt Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    metalness: 0.1,
                    roughness: 0.9
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 3: // Wood Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    metalness: 0.3,
                    roughness: 0.7
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 4: // Sand Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0xF4A460,
                    metalness: 0.1,
                    roughness: 0.9
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 5: // Gravel Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    metalness: 0.1,
                    roughness: 0.9
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 6: // Cobblestone Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x808080,
                    metalness: 0.2,
                    roughness: 0.8
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 7: // Brick Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0xB22222,
                    metalness: 0.3,
                    roughness: 0.7
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 8: // Moving Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x4CAF50,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    moveSpeed: 0.02,
                    moveRange: 2,
                    startX: x,
                    startZ: z
                };
                break;
                
            case 9: // Disappearing Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0xE91E63,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    disappearTime: 2000,
                    reappearTime: 1000,
                    lastDisappear: 0
                };
                break;
                
            case 10: // Slime Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x00FF00,
                    metalness: 0.3,
                    roughness: 0.7,
                    transparent: true,
                    opacity: 0.8
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    bounceSpeed: 0.03,
                    bounceHeight: 1
                };
                break;
                
            case 11: // Ice Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0xADD8E6,
                    metalness: 0.1,
                    roughness: 0.2,
                    transparent: true,
                    opacity: 0.8
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 12: // Obsidian Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    metalness: 0.8,
                    roughness: 0.2
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 13: // Diamond Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x00FFFF,
                    metalness: 0.9,
                    roughness: 0.1
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 14: // Gold Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0xFFD700,
                    metalness: 0.9,
                    roughness: 0.1
                });
                platform = new THREE.Mesh(geometry, material);
                break;
                
            case 15: // Emerald Block
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({
                    color: 0x50C878,
                    metalness: 0.9,
                    roughness: 0.1
                });
                platform = new THREE.Mesh(geometry, material);
                break;
        }
    } else {
        // Original platform types for other levels
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
                
            case 8: // Moving platform
                geometry = new THREE.BoxGeometry(3, 0.5, 3);
                material = new THREE.MeshStandardMaterial({
                    color: 0xFF5722,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    moveSpeed: 0.02,
                    moveRange: 2,
                    startX: x,
                    startZ: z
                };
                break;
                
            case 9: // Bouncing platform
                geometry = new THREE.BoxGeometry(2, 0.5, 2);
                material = new THREE.MeshStandardMaterial({
                    color: 0xFFC107,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    bounceSpeed: 0.03,
                    bounceHeight: 1
                };
                break;
                
            case 10: // Disappearing platform
                geometry = new THREE.BoxGeometry(2, 0.5, 2);
                material = new THREE.MeshStandardMaterial({
                    color: 0xE91E63,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    disappearTime: 2000,
                    reappearTime: 1000,
                    lastDisappear: 0
                };
                break;
                
            case 11: // Rotating platform
                geometry = new THREE.BoxGeometry(3, 0.5, 3);
                material = new THREE.MeshStandardMaterial({
                    color: 0x673AB7,
                    metalness: 0.5,
                    roughness: 0.5
                });
                platform = new THREE.Mesh(geometry, material);
                platform.userData = {
                    rotationSpeed: 0.01
                };
                break;
        }
    }
    
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    
    // Add collision data based on platform type
    let collisionSize = { width: 1, height: 1, depth: 1 }; // Default Minecraft block size
    
    platform.userData = {
        ...platform.userData,
        ...collisionSize
    };
    
    scene.add(platform);
    platforms.push(platform);
}

function createGrassBlockPlatform(x, y, z) {
    const isLevel4 = window.location.pathname.includes('level4.html');
    
    if (isLevel4) {
        // Create a diamond block as the goal platform
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.3
        });
        
        goalPlatform = new THREE.Mesh(geometry, material);
        goalPlatform.position.set(x, y, z);
        goalPlatform.castShadow = true;
        goalPlatform.receiveShadow = true;
        
        // Add glowing particles around the platform
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Position particles in a circle around the platform
            const angle = (i / particleCount) * Math.PI * 2;
            particle.position.x = Math.cos(angle) * 5;
            particle.position.z = Math.sin(angle) * 5;
            particle.userData = {
                baseY: particle.position.y,
                angle: angle,
                speed: 0.02 + Math.random() * 0.02
            };
            
            goalPlatform.add(particle);
        }
        
        // Add a pulsing glow effect
        const glowGeometry = new THREE.BoxGeometry(2, 2, 2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        goalPlatform.add(glowMesh);
        
        // Update collision data for the platform
        goalPlatform.userData = {
            width: 1,
            height: 1,
            depth: 1,
            isGoal: true
        };
        
        scene.add(goalPlatform);
        platforms.push(goalPlatform);
    } else {
        // Create a flat platform geometry
        const geometry = new THREE.BoxGeometry(8, 1, 8);
        
        // Create a glowing material for the goal platform
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        
        goalPlatform = new THREE.Mesh(geometry, material);
        goalPlatform.position.set(x, y, z);
        goalPlatform.castShadow = true;
        goalPlatform.receiveShadow = true;
        
        // Add glowing particles around the platform
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Position particles in a circle around the platform
            const angle = (i / particleCount) * Math.PI * 2;
            particle.position.x = Math.cos(angle) * 5;
            particle.position.z = Math.sin(angle) * 5;
            particle.userData = {
                baseY: particle.position.y,
                angle: angle,
                speed: 0.02 + Math.random() * 0.02
            };
            
            goalPlatform.add(particle);
        }
        
        // Add a pulsing glow effect
        const glowGeometry = new THREE.BoxGeometry(9, 2, 9);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        goalPlatform.add(glowMesh);
        
        // Update collision data for the platform
        goalPlatform.userData = {
            width: 8,
            height: 1,
            depth: 8,
            isGoal: true
        };
        
        scene.add(goalPlatform);
        platforms.push(goalPlatform);
    }
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
    if (!isGameActive) return;
    
    gameLoop = requestAnimationFrame(animate);
    movePlayer();
    
    // Animate goal platform particles
    if (goalPlatform) {
        goalPlatform.children.forEach(child => {
            if (child.userData && child.userData.angle !== undefined) {
                child.position.y = child.userData.baseY + Math.sin(Date.now() * 0.002 + child.userData.angle) * 0.5;
                child.rotation.y += child.userData.speed;
            }
        });
        
        const glowMesh = goalPlatform.children[goalPlatform.children.length - 1];
        if (glowMesh.material) {
            glowMesh.material.opacity = 0.2 + Math.sin(Date.now() * 0.001) * 0.1;
        }
    }
    
    // Animate special platforms
    platforms.forEach(platform => {
        if (platform.userData) {
            // Moving platform
            if (platform.userData.moveSpeed) {
                platform.position.x = platform.userData.startX + Math.sin(Date.now() * platform.userData.moveSpeed) * platform.userData.moveRange;
                platform.position.z = platform.userData.startZ + Math.cos(Date.now() * platform.userData.moveSpeed) * platform.userData.moveRange;
            }
            
            // Bouncing platform
            if (platform.userData.bounceSpeed) {
                platform.position.y += Math.sin(Date.now() * platform.userData.bounceSpeed) * platform.userData.bounceHeight;
            }
            
            // Disappearing platform
            if (platform.userData.disappearTime) {
                const now = Date.now();
                if (now - platform.userData.lastDisappear > platform.userData.disappearTime + platform.userData.reappearTime) {
                    platform.visible = true;
                    platform.userData.lastDisappear = now;
                } else if (now - platform.userData.lastDisappear > platform.userData.disappearTime) {
                    platform.visible = false;
                }
            }
            
            // Rotating platform
            if (platform.userData.rotationSpeed) {
                platform.rotation.y += platform.userData.rotationSpeed;
            }
        }
    });
    
    renderer.render(scene, camera);
    minimapRenderer.render(minimapScene, minimapCamera);
}

function showCheatMessage(message) {
    // Create or update cheat message
    let cheatMessage = document.getElementById('cheat-message');
    if (!cheatMessage) {
        cheatMessage = document.createElement('div');
        cheatMessage.id = 'cheat-message';
        cheatMessage.style.position = 'fixed';
        cheatMessage.style.top = '50%';
        cheatMessage.style.left = '50%';
        cheatMessage.style.transform = 'translate(-50%, -50%)';
        cheatMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        cheatMessage.style.color = '#00ff00';
        cheatMessage.style.padding = '20px';
        cheatMessage.style.borderRadius = '10px';
        cheatMessage.style.fontSize = '24px';
        cheatMessage.style.fontFamily = 'monospace';
        cheatMessage.style.zIndex = '1000';
        document.body.appendChild(cheatMessage);
    }
    
    cheatMessage.textContent = message;
    cheatMessage.style.opacity = '1';
    
    // Fade out after 2 seconds
    setTimeout(() => {
        cheatMessage.style.opacity = '0';
        setTimeout(() => {
            cheatMessage.remove();
        }, 500);
    }, 2000);
}

// Update the pointer lock change handler
function handlePointerLockChange() {
    const gameContainer = document.getElementById('game-container');
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
} 