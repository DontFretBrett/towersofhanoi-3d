import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

let app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  rods: [],
  disks: [],
  moves: [],
  moveCounter: 0,
  numDisks: 3, // Default number of disks
  timer: {
    startTime: null,
    interval: null,
    isRunning: false
  }
};

let selectedDisk = null;
const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Highlight color

// Initialize the scene, camera, and renderer
const init = () => {
  setupRenderer();
  setupScene();
  setupCamera();
  setupLighting();
  createRods();
  createDisks();
  setupEventListeners();
  setupUIListeners();
  animate();
};

// Setup renderer
const setupRenderer = () => {
  app.renderer = new THREE.WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.renderer.shadowMap.enabled = true;
  app.el.appendChild(app.renderer.domElement);
};

// Setup scene
const setupScene = () => {
  app.scene = new THREE.Scene();
};

// Setup camera
const setupCamera = () => {
  app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  app.camera.position.z = 5;
};

// Setup lighting
const setupLighting = () => {
  // Increase ambient light intensity
  const ambientLight = new THREE.AmbientLight(0x404040, 3.5); // Increased from 2.5 to 3.5
  app.scene.add(ambientLight);

  // Increase directional light intensity
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0); // Increased from 2.0 to 3.0
  directionalLight.position.set(5, 5, 5).normalize();
  directionalLight.castShadow = true;
  app.scene.add(directionalLight);

  // Add additional point lights
  const additionalPointLights = [
    { position: [0, 5, 5], intensity: 1.5 }, // Increased intensity
    { position: [-5, 5, 5], intensity: 1.2 }, // Increased intensity
    { position: [5, 5, -5], intensity: 1.2 } // Increased intensity
  ];

  additionalPointLights.forEach(light => {
    const pointLight = new THREE.PointLight(0xffffff, light.intensity);
    pointLight.position.set(...light.position);
    app.scene.add(pointLight);
  });
};

// Create rods
const createRods = () => {
  const rodGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 32); // Slightly thicker rod
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.2 });
  
  const plateGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32); // Wider bottom plate
  const plateMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5, roughness: 0.2 });

  for (let i = 0; i < 3; i++) {
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.x = i * 2 - 2;
    rod.castShadow = true;
    rod.receiveShadow = true;
    app.scene.add(rod);
    app.rods.push(rod);

    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.x = rod.position.x;
    plate.position.y = -1;
    plate.castShadow = true;
    plate.receiveShadow = true;
    app.scene.add(plate);
  }
};

// Create disks
const createDisks = () => {
  const diskColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const maxRadius = 0.7;  // Slightly smaller than plate
  const minRadius = 0.25; // Minimum disk size
  const radiusStep = (maxRadius - minRadius) / (app.numDisks - 1);
  
  for (let i = 0; i < app.numDisks; i++) {
    const radius = maxRadius - (i * radiusStep);
    const diskGeometry = new THREE.CylinderGeometry(radius, radius, 0.1, 32);
    const diskMaterial = new THREE.MeshStandardMaterial({ 
      color: diskColors[i % diskColors.length], 
      metalness: 0.3, 
      roughness: 0.5 
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.y = -0.9 + i * 0.1;
    disk.position.x = -2;
    disk.castShadow = true;
    disk.receiveShadow = true;
    app.scene.add(disk);
    app.disks.push(disk);
  }
};

// Setup event listeners
const setupEventListeners = () => {
  window.addEventListener('keydown', (event) => {
    const rodNumber = parseInt(event.key);
    
    if (rodNumber >= 1 && rodNumber <= 3) {
      const rodPositionX = (rodNumber - 1) * 2 - 2;
      
      if (!selectedDisk) {
        // Select top disk from the clicked rod
        const disksOnRod = app.disks.filter(d => d.position.x === rodPositionX);
        if (disksOnRod.length > 0) {
          selectedDisk = disksOnRod.sort((a, b) => b.position.y - a.position.y)[0];
          selectedDisk.originalMaterial = selectedDisk.material;
          selectedDisk.material = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            metalness: 0.3,
            roughness: 0.5,
            emissive: 0xffff00,
            emissiveIntensity: 0.2
          });
        }
      } else {
        // If clicking the same rod, unselect the disk
        if (selectedDisk.position.x === rodPositionX) {
          selectedDisk.material = selectedDisk.originalMaterial;
          selectedDisk = null;
        } else {
          // Otherwise, try to move the disk
          moveDiskToRod(rodPositionX);
        }
      }
    }
  });
};

// Helper function to move disk
const moveDiskToRod = (rodPositionX) => {
  const disksOnTargetRod = app.disks.filter(d => d.position.x === rodPositionX);
  const topDiskOnTargetRod = disksOnTargetRod.sort((a, b) => b.position.y - a.position.y)[0];
  
  // Check if move is valid
  if (!topDiskOnTargetRod || 
      topDiskOnTargetRod.geometry.parameters.radiusTop > selectedDisk.geometry.parameters.radiusTop) {
    // Update disk position
    selectedDisk.position.x = rodPositionX;
    selectedDisk.position.y = -0.9 + disksOnTargetRod.length * 0.1;
    
    // Reset material
    selectedDisk.material = selectedDisk.originalMaterial;
    selectedDisk = null;
    
    // Start timer on first move
    if (app.moveCounter === 0) {
      startTimer();
    }
    app.moveCounter++;
    document.getElementById('move-counter').textContent = app.moveCounter;

    // Check for victory (all disks on last rod)
    const lastRodX = 2; // x position of the third rod
    const disksOnLastRod = app.disks.filter(d => d.position.x === lastRodX);
    if (disksOnLastRod.length === app.numDisks) {
      stopTimer();
      setTimeout(() => {
        alert(`Congratulations! You solved it in ${app.moveCounter} moves and ${document.getElementById('timer').textContent}!`);
      }, 100);
    }
  }
};

// Solve Hanoi
const solveHanoi = (n, fromRod, toRod, auxRod) => {
  if (n === 0) return;
  solveHanoi(n - 1, fromRod, auxRod, toRod);
  app.moves.push([fromRod, toRod]);
  solveHanoi(n - 1, auxRod, toRod, fromRod);
};

// Animate the scene
const animate = () => {
  requestAnimationFrame(animate);
  if (app.moves.length > 0) {
    const [fromRod, toRod] = app.moves.shift();
    const disk = app.disks.find(d => d.position.x === fromRod * 2 - 2);
    if (disk) {
      disk.position.x = toRod * 2 - 2;
    }
  }
  app.renderer.render(app.scene, app.camera);
};

// Add this new function
const setupUIListeners = () => {
  document.getElementById('reset').addEventListener('click', resetGame);
  document.getElementById('difficulty').addEventListener('change', (e) => {
    app.numDisks = parseInt(e.target.value);
    resetGame();
  });
};

// Add reset game function
const resetGame = () => {
  // Remove existing disks from scene and array
  while (app.disks.length > 0) {
    const disk = app.disks.pop();
    app.scene.remove(disk);
    disk.geometry.dispose();
    disk.material.dispose();
  }
  
  // Reset move counter
  app.moveCounter = 0;
  document.getElementById('move-counter').textContent = '0';
  
  // Reset selected disk if any
  if (selectedDisk) {
    selectedDisk.material = selectedDisk.originalMaterial;
    selectedDisk = null;
  }
  
  // Create new disks
  createDisks();
  
  // Reset timer
  stopTimer();
  app.timer.startTime = null;
  document.getElementById('timer').textContent = '00:00';
};

// Add timer functions
const startTimer = () => {
  if (!app.timer.isRunning) {
    app.timer.startTime = Date.now();
    app.timer.isRunning = true;
    app.timer.interval = setInterval(updateTimer, 1000);
  }
};

const stopTimer = () => {
  if (app.timer.isRunning) {
    clearInterval(app.timer.interval);
    app.timer.isRunning = false;
  }
};

const updateTimer = () => {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - app.timer.startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
  const seconds = (elapsedTime % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
};

init();
