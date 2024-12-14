import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


// Constants for board layout
const SQUARE_SIZE = 1;
const BOARD_SIZE = 8;
const BOARD_OFFSET = (BOARD_SIZE * SQUARE_SIZE) / 2 - SQUARE_SIZE / 2;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Camera setup
const cameras = [];
const aspect = window.innerWidth / window.innerHeight;

// Create cameras with improved positions
cameras[0] = new THREE.OrthographicCamera(-12 * aspect, 12 * aspect, 12, -12, 0.1, 100); // Top
cameras[1] = new THREE.PerspectiveCamera(45, aspect, 0.1, 100); // White
cameras[2] = new THREE.PerspectiveCamera(45, aspect, 0.1, 100); // Black
cameras[3] = new THREE.PerspectiveCamera(45, aspect, 0.1, 100); // Side

// Position cameras
cameras[0].position.set(0, 15, 0);
cameras[1].position.set(0, 8, 12);
cameras[2].position.set(0, 8, -12);
cameras[3].position.set(12, 8, 0);

cameras.forEach(camera => camera.lookAt(0, 0, 0));
let activeCamera = cameras[1];

// Orbit controls
const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create board with coordinate system
const board = new THREE.Group();

// Create board base
const baseGeometry = new THREE.BoxGeometry(BOARD_SIZE * SQUARE_SIZE + 1, 0.5, BOARD_SIZE * SQUARE_SIZE + 1);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = -0.3;
base.receiveShadow = true;
board.add(base);

// Create squares with coordinates
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
for (let x = 0; x < BOARD_SIZE; x++) {
    for (let z = 0; z < BOARD_SIZE; z++) {
        const isWhiteSquare = (x + z) % 2 === 0;
        const square = new THREE.Mesh(
            new THREE.BoxGeometry(SQUARE_SIZE, 0.1, SQUARE_SIZE),
            new THREE.MeshStandardMaterial({ 
                color: isWhiteSquare ? 0xF0D9B5 : 0xB58863
            })
        );

        square.position.set(
            x * SQUARE_SIZE - BOARD_OFFSET,
            0,
            z * SQUARE_SIZE - BOARD_OFFSET
        );
        square.receiveShadow = true;
        
        // Store coordinate information
        square.userData.coordinate = `${files[x]}${z + 1}`;
        board.add(square);
    }
}
scene.add(board);

// Create captured pieces areas
const createCapturedArea = (x, color) => {
    const group = new THREE.Group();
    const width = SQUARE_SIZE * 2;
    const length = BOARD_SIZE * SQUARE_SIZE;
    
    // Create base for captured area
    const areaGeometry = new THREE.BoxGeometry(width, 0.1, length);
    const areaMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3
    });
    const areaBase = new THREE.Mesh(areaGeometry, areaMaterial);
    areaBase.receiveShadow = true;
    group.add(areaBase);
    
    // Position the area
    group.position.set(x, 0, 0);
    return group;
};

const whiteCapturedArea = createCapturedArea(-BOARD_SIZE - SQUARE_SIZE, 0xFFFFFF);
const blackCapturedArea = createCapturedArea(BOARD_SIZE + SQUARE_SIZE, 0x000000);
scene.add(whiteCapturedArea);
scene.add(blackCapturedArea);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Game state
let currentPlayer = 'white';
let isAnimating = false;
let isMoving = false;
const pieces = new Map();
const initialPositions = new Map();
const capturedPieces = [];

// Piece definitions
const pieceDefinitions = [
    { 
        type: 'Pawn',
        mtlFile: 'pawn.mtl',
        objFile: 'pawn.obj',
        positions: Array.from({ length: 8 }, (_, i) => [i, 1]),
        scale: 0.18
    },
    { 
        type: 'Rook',
        mtlFile: 'Rook.mtl',
        objFile: 'Rook.obj',
        positions: [[0, 0], [7, 0]],
        scale: 0.25
    },
    { 
        type: 'Knight',
        mtlFile: 'Knight.mtl',
        objFile: 'Knight.obj',
        positions: [[1, 0], [6, 0]],
        scale: 0.25
    },
    { 
        type: 'Bishop',
        mtlFile: 'Bishop.mtl',
        objFile: 'Bishop.obj',
        positions: [[2, 0], [5, 0]],
        scale: 0.25
    },
    { 
        type: 'Queen',
        mtlFile: 'Queen.mtl',
        objFile: 'Queen.obj',
        positions: [[3, 0]],
        scale: 0.3
    },
    { 
        type: 'King',
        mtlFile: 'King.mtl',
        objFile: 'King.obj',
        positions: [[4, 0]],
        scale: 0.3
    }
];

// Piece loading function
async function loadPiece(pieceInfo, color, position, scale) {
    try {
        const materials = await new Promise((resolve, reject) => {
            mtlLoader.load(
                `models/${pieceInfo.mtlFile}`,
                resolve,
                undefined,
                reject
            );
        });

        materials.preload();
        objLoader.setMaterials(materials);

        const obj = await new Promise((resolve, reject) => {
            objLoader.load(
                `models/${pieceInfo.objFile}`,
                resolve,
                undefined,
                reject
            );
        });

        // Set material and shadows
        obj.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: color === 'white' ? 0xFFFFFF : 0x333333,
                    metalness: 0.5,
                    roughness: 0.5
                });
                child.castShadow = true;
            }
        });

        // Position piece
        obj.rotation.x = -Math.PI / 2;
        obj.scale.set(scale, scale, scale);
        const x = position[0] * SQUARE_SIZE - BOARD_OFFSET;
        const z = position[1] * SQUARE_SIZE - BOARD_OFFSET;
        obj.position.set(x, 0.1, z);

        scene.add(obj);
        pieces.set(`${pieceInfo.type}_${color}_${position}`, obj);
        initialPositions.set(obj, [...position]);
        
        return obj;
    } catch (error) {
        console.error(`Error loading piece: ${pieceInfo.type}`, error);
        throw error;
    }
}

// Initialize pieces
async function initializePieces() {
    const loadingPromises = [];

    for (const def of pieceDefinitions) {
        for (const pos of def.positions) {
            // Load white pieces
            loadingPromises.push(loadPiece(def, 'white', pos, def.scale));
            
            // Load black pieces (mirrored positions)
            const blackPos = [pos[0], BOARD_SIZE - 1 - pos[1]];
            loadingPromises.push(loadPiece(def, 'black', blackPos, def.scale));
        }
    }

    await Promise.all(loadingPromises);
    document.getElementById('loading').style.display = 'none';
}

// Piece movement animation
function animatePiece(piece, targetPosition) {
    const startPos = piece.position.clone();
    const midPos = startPos.clone();
    midPos.y += 2;
    const endPos = new THREE.Vector3(
        targetPosition[0] * SQUARE_SIZE - BOARD_OFFSET,
        0.1,
        targetPosition[1] * SQUARE_SIZE - BOARD_OFFSET
    );

    let progress = 0;
    function animate() {
        progress += 0.02;
        if (progress <= 1) {
            if (progress <= 0.5) {
                piece.position.lerpVectors(startPos, midPos, progress * 2);
            } else {
                piece.position.lerpVectors(midPos, endPos, (progress - 0.5) * 2);
            }
            requestAnimationFrame(animate);
        } else {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            isMoving = false;
        }
    }
    animate();
}

// Handle piece capture
function capturePiece(piece) {
    const isWhite = piece.children[0].material.color.getHex() === 0xFFFFFF;
    const capturedArea = isWhite ? whiteCapturedArea : blackCapturedArea;
    
    const capturedCount = capturedPieces.filter(p => 
        (p.children[0].material.color.getHex() === 0xFFFFFF) === isWhite
    ).length;
    
    const row = Math.floor(capturedCount / 2);
    const col = capturedCount % 2;
    
    piece.position.set(
        col * SQUARE_SIZE - SQUARE_SIZE / 2,
        0.1,
        row * SQUARE_SIZE - BOARD_OFFSET
    );
    
    scene.remove(piece);
    capturedArea.add(piece);
    capturedPieces.push(piece);
}

// Random move function
function moveRandomPiece() {
    if (!isAnimating || isMoving) return;

    const currentPieces = Array.from(pieces.values()).filter(piece => {
        const isWhitePiece = piece.children[0].material.color.getHex() === 0xFFFFFF;
        return (currentPlayer === 'white') === isWhitePiece;
    });

    if (currentPieces.length === 0) return;

    const piece = currentPieces[Math.floor(Math.random() * currentPieces.length)];
    const newPos = getRandomEmptyPosition();

    if (newPos) {
        isMoving = true;
        const pieceAtTarget = getPieceAtPosition(newPos);
        
        if (pieceAtTarget) {
            capturePiece(pieceAtTarget);
            pieces.delete(Array.from(pieces.entries())
                .find(([k, v]) => v === pieceAtTarget)[0]);
        }

        animatePiece(piece, newPos);
        setTimeout(() => moveRandomPiece(), 1000);
    }
}
// Helper functions
function getRandomEmptyPosition() {
    const occupied = new Set();
    pieces.forEach(piece => {
        const x = Math.round((piece.position.x + BOARD_OFFSET) / SQUARE_SIZE);
        const z = Math.round((piece.position.z + BOARD_OFFSET) / SQUARE_SIZE);
        occupied.add(`${x},${z}`);
    });

    const positions = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let z = 0; z < BOARD_SIZE; z++) {
            if (!occupied.has(`${x},${z}`)) {
                positions.push([x, z]);
            }
        }
    }
    
    return positions.length > 0 
        ? positions[Math.floor(Math.random() * positions.length)] 
        : null;
}

function getPieceAtPosition(position) {
    for (const piece of pieces.values()) {
        const x = Math.round((piece.position.x + BOARD_OFFSET) / SQUARE_SIZE);
        const z = Math.round((piece.position.z + BOARD_OFFSET) / SQUARE_SIZE);
        if (x === position[0] && z === position[1]) {
            return piece;
        }
    }
    return null;
}

// Reset function
function resetPieces() {
    // Clear captured pieces
    capturedPieces.forEach(piece => {
        piece.removeFromParent();
    });
    capturedPieces.length = 0;

    // Reset all pieces to their initial positions
    pieces.forEach((piece, key) => {
        const initialPos = initialPositions.get(piece);
        if (initialPos) {
            piece.position.set(
                initialPos[0] * SQUARE_SIZE - BOARD_OFFSET,
                0.1,
                initialPos[1] * SQUARE_SIZE - BOARD_OFFSET
            );
            scene.add(piece);
        }
    });

    currentPlayer = 'white';
    isMoving = false;
}

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateCoordinates(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, activeCamera);
    const intersects = raycaster.intersectObjects(board.children, true);

    if (intersects.length > 0) {
        const square = intersects[0].object;
        if (square.userData.coordinate) {
            document.getElementById('coordinates').textContent = 
                `Square: ${square.userData.coordinate}`;
        }
    }
}

// Event listeners
window.addEventListener('mousemove', updateCoordinates);

window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case '0':
            activeCamera = cameras[0];
            controls.object = activeCamera;
            break;
        case '1':
            activeCamera = cameras[1];
            controls.object = activeCamera;
            break;
        case '2':
            activeCamera = cameras[2];
            controls.object = activeCamera;
            break;
        case '3':
            activeCamera = cameras[3];
            controls.object = activeCamera;
            break;
        case 'r':
        case 'R':
            resetPieces();
            break;
        case ' ':
            isAnimating = !isAnimating;
            if (isAnimating && !isMoving) {
                moveRandomPiece();
            }
            break;
    }
    controls.update();
});

// Window resize handler
window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / window.innerHeight;
    
    cameras.forEach(camera => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = newAspect;
        } else {
            camera.left = -12 * newAspect;
            camera.right = 12 * newAspect;
        }
        camera.updateProjectionMatrix();
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, activeCamera);
}

// Initialize and start
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

initializePieces().then(() => {
    animate();
}).catch(error => {
    console.error('Error initializing pieces:', error);
    document.getElementById('loading').textContent = 'Error loading chess pieces';
});