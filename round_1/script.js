// Script file

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Scene setup
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Board dimensions
const boardSize = 8;
const squareSize = 1;
const outsideOffset = 2; // Distance from board edge for outside pieces

// Camera setup
const cameras = [];
const aspect = window.innerWidth / window.innerHeight;

cameras.push(new THREE.OrthographicCamera(-6 * aspect, 6 * aspect, 6, -6, 0.1, 100)); // Increased view size to see outside pieces
cameras.push(new THREE.PerspectiveCamera(50, aspect, 0.1, 100));
cameras.push(new THREE.PerspectiveCamera(50, aspect, 0.1, 100));
cameras.push(new THREE.PerspectiveCamera(50, aspect, 0.1, 100));

cameras[0].position.set(0, 15, 0); // Increased height for better overview
cameras[1].position.set(0, 8, 15); // Adjusted for better view of outside pieces
cameras[2].position.set(0, 8, -15);
cameras[3].position.set(15, 8, 0);

cameras.forEach(camera => camera.lookAt(0, 0, 0));
let activeCamera = cameras[1];

// Orbit controls
const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create chess board
const board = new THREE.Group();
for (let x = 0; x < boardSize; x++) {
    for (let z = 0; z < boardSize; z++) {
        const color = (x + z) % 2 === 0 ? 0xF0D9B5 : 0xB58863;
        const square = new THREE.Mesh(
            new THREE.BoxGeometry(squareSize, 0.1, squareSize),
            new THREE.MeshStandardMaterial({ color })
        );
        square.position.set(
            x - boardSize/2 + 0.5,
            0,
            z - boardSize/2 + 0.5
        );
        square.receiveShadow = true;
        board.add(square);
    }
}
scene.add(board);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Load 3D models
const objLoader = new OBJLoader();
const pieces = {
    white: [],
    black: []
};
const loadingElement = document.getElementById('loading');

// Track piece positions
const boardPositions = new Set();
for (let x = 0; x < 8; x++) {
    for (let z = 2; z < 6; z++) {
        boardPositions.add(`${x},${z}`);
    }
}

// Define outside positions for captured pieces
const outsidePositions = {
    white: Array(16).fill().map((_, i) => ({
        x: (i % 8) - boardSize/2 - outsideOffset,
        z: Math.floor(i / 8) - boardSize/2 - outsideOffset
    })),
    black: Array(16).fill().map((_, i) => ({
        x: (i % 8) - boardSize/2 - outsideOffset,
        z: Math.floor(i / 8) + boardSize/2 + outsideOffset
    }))
};

function loadPiece(modelUrl, color, x, z, scale = 0.2, isOutside = false) {
    return new Promise((resolve, reject) => {
        objLoader.load(
            modelUrl,
            (obj) => {
                const pieceGroup = new THREE.Group();
                
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
                
                pieceGroup.add(obj);
                obj.rotation.x = -Math.PI / 2;
                pieceGroup.scale.set(scale, scale, scale);
                
                // Position piece based on whether it's outside or on the board
                if (isOutside) {
                    const outsidePos = outsidePositions[color][pieces[color].length];
                    pieceGroup.position.set(outsidePos.x, 0.1, outsidePos.z);
                } else {
                    pieceGroup.position.set(
                        x - boardSize/2 + 0.5,
                        0.1,
                        z - boardSize/2 + 0.5
                    );
                }
                
                pieceGroup.userData = {
                    originalY: 0.1,
                    color: color,
                    isOnBoard: !isOutside
                };
                
                pieces[color].push(pieceGroup);
                scene.add(pieceGroup);
                resolve(pieceGroup);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}

async function initializePieces(modelUrls) {
    loadingElement.style.display = 'block';
    
    try {
        // Load white pawns outside the board
        for (let i = 0; i < 8; i++) {
            await loadPiece(modelUrls.pawn, 'white', i, 1, 0.2, true);
        }
        
        // Load black pawns outside the board
        for (let i = 0; i < 8; i++) {
            await loadPiece(modelUrls.pawn, 'black', i, 6, 0.2, true);
        }
        
        loadingElement.style.display = 'none';
        startGame();
    } catch (error) {
        console.error('Error loading pieces:', error);
        loadingElement.textContent = 'Error loading models. Please check the console.';
    }
}

function getRandomPiece() {
    const color = Math.random() < 0.5 ? 'white' : 'black';
    const piecesArray = pieces[color];
    return piecesArray[Math.floor(Math.random() * piecesArray.length)];
}

function moveRandomPiece() {
    const piece = getRandomPiece();
    
    // Determine if piece should move to/from board
    const shouldBeOnBoard = Math.random() < 0.7; // 70% chance to be on board
    
    let newPos;
    if (shouldBeOnBoard && boardPositions.size > 0) {
        // Move to a random position on the board
        const emptyPositions = Array.from(boardPositions);
        const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        const [x, z] = randomPos.split(',').map(Number);
        newPos = new THREE.Vector3(
            x - boardSize/2 + 0.5,
            piece.userData.originalY,
            z - boardSize/2 + 0.5
        );
        
        // Update position tracking
        if (piece.userData.isOnBoard) {
            const currentPos = `${Math.floor(piece.position.x + 4)},${Math.floor(piece.position.z + 4)}`;
            boardPositions.add(currentPos);
        }
        boardPositions.delete(randomPos);
        piece.userData.isOnBoard = true;
    } else {
        // Move to outside position
        const outsidePos = outsidePositions[piece.userData.color][
            Math.floor(Math.random() * outsidePositions[piece.userData.color].length)
        ];
        newPos = new THREE.Vector3(outsidePos.x, piece.userData.originalY, outsidePos.z);
        
        // Update position tracking
        if (piece.userData.isOnBoard) {
            const currentPos = `${Math.floor(piece.position.x + 4)},${Math.floor(piece.position.z + 4)}`;
            boardPositions.add(currentPos);
        }
        piece.userData.isOnBoard = false;
    }

    // Animate the movement
    const startPos = piece.position.clone();
    const midPos = startPos.clone();
    midPos.y += 1; // Height of jump

    let progress = 0;
    const animate = () => {
        progress += 0.02;
        if (progress <= 1) {
            if (progress <= 0.5) {
                piece.position.lerpVectors(startPos, midPos, progress * 2);
            } else {
                piece.position.lerpVectors(midPos, newPos, (progress - 0.5) * 2);
            }
            requestAnimationFrame(animate);
        } else {
            setTimeout(moveRandomPiece, 500);
        }
    };
    animate();
}

function startGame() {
    setTimeout(() => {
        // Start with moving pieces onto the board
        const moveOntoBoard = () => {
            const piece = getRandomPiece();
            if (!piece.userData.isOnBoard && boardPositions.size > 0) {
                const emptyPositions = Array.from(boardPositions);
                const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                const [x, z] = randomPos.split(',').map(Number);
                
                const newPos = new THREE.Vector3(
                    x - boardSize/2 + 0.5,
                    piece.userData.originalY,
                    z - boardSize/2 + 0.5
                );
                
                boardPositions.delete(randomPos);
                piece.userData.isOnBoard = true;
                
                // Animate the movement
                const startPos = piece.position.clone();
                const midPos = startPos.clone();
                midPos.y += 1;
                
                let progress = 0;
                const animate = () => {
                    progress += 0.02;
                    if (progress <= 1) {
                        if (progress <= 0.5) {
                            piece.position.lerpVectors(startPos, midPos, progress * 2);
                        } else {
                            piece.position.lerpVectors(midPos, newPos, (progress - 0.5) * 2);
                        }
                        requestAnimationFrame(animate);
                    } else {
                        if (boardPositions.size > 8) { // Continue until we have enough pieces on board
                            setTimeout(moveOntoBoard, 500);
                        } else {
                            // Start regular random movements
                            setTimeout(moveRandomPiece, 500);
                        }
                    }
                };
                animate();
            } else {
                setTimeout(moveRandomPiece, 500);
            }
        };
        
        moveOntoBoard();
    }, 1000);
}

// Camera controls
window.addEventListener('keydown', event => {
    const index = parseInt(event.key);
    if (index >= 0 && index <= 3) {
        activeCamera = cameras[index];
        controls.object = activeCamera;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / window.innerHeight;
    
    cameras[0].left = -6 * newAspect;
    cameras[0].right = 6 * newAspect;
    cameras[0].updateProjectionMatrix();
    
    for (let i = 1; i < cameras.length; i++) {
        cameras[i].aspect = newAspect;
        cameras[i].updateProjectionMatrix();
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, activeCamera);
}
animate();

// Initialize with model URLs
const modelUrls = {
    pawn: 'models/pawn.obj'
};

// Start loading pieces
initializePieces(modelUrls);