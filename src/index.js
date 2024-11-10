import * as THREE from 'three';

let app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  rods: [],
  disks: [],
  moves: []
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
  solveHanoi(3, 0, 2, 1);
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
  const rodGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.2 });
  for (let i = 0; i < 3; i++) {
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.x = i * 2 - 2;
    rod.castShadow = true;
    rod.receiveShadow = true;
    app.scene.add(rod);
    app.rods.push(rod);
  }
};

// Create disks
const createDisks = () => {
  const diskColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  for (let i = 0; i < 3; i++) {
    const diskGeometry = new THREE.CylinderGeometry(0.5 - i * 0.1, 0.5 - i * 0.1, 0.1, 32);
    const diskMaterial = new THREE.MeshStandardMaterial({ color: diskColors[i % diskColors.length], metalness: 0.3, roughness: 0.5 });
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
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('keydown', onDocumentKeyDown, false);
};

// Handle mouse down events
const onDocumentMouseDown = (event) => {
  event.preventDefault();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, app.camera);

  const intersects = raycaster.intersectObjects(app.rods.concat(app.disks));

  if (intersects.length > 0) {
    const object = intersects[0].object;
    handleObjectSelection(object);
  }
};

// Handle key down events
const onDocumentKeyDown = (event) => {
  const key = event.key;
  if (key >= '1' && key <= '3') {
    const rodIndex = parseInt(key) - 1;
    handleRodSelection(rodIndex);
  }
};

// Handle object selection
const handleObjectSelection = (object) => {
  if (app.rods.includes(object)) {
    const rodIndex = app.rods.indexOf(object);
    handleRodSelection(rodIndex);
  }
};

// Handle rod selection
const handleRodSelection = (rodIndex) => {
  const rodPositionX = rodIndex * 2 - 2;

  if (selectedDisk) {
    if (selectedDisk.position.x === rodPositionX) {
      // Unselect the disk if the same rod is selected again
      selectedDisk.material = selectedDisk.originalMaterial;
      selectedDisk = null;
    } else {
      // Move the selected disk to the new rod if the move is valid
      moveDiskToRod(rodPositionX);
    }
  } else {
    // Select the top disk from the specified rod
    selectTopDiskOnRod(rodPositionX);
  }
};

// Move disk to rod
const moveDiskToRod = (rodPositionX) => {
  const disksOnTargetRod = app.disks.filter(d => d.position.x === rodPositionX);
  const topDiskOnTargetRod = disksOnTargetRod.sort((a, b) => b.position.y - a.position.y)[0];
  if (!topDiskOnTargetRod || topDiskOnTargetRod.geometry.parameters.radiusTop > selectedDisk.geometry.parameters.radiusTop) {
    selectedDisk.position.x = rodPositionX;
    selectedDisk.position.y = -0.9 + disksOnTargetRod.length * 0.1;
    selectedDisk.material = selectedDisk.originalMaterial;
    selectedDisk = null;
  }
};

// Select top disk on rod
const selectTopDiskOnRod = (rodPositionX) => {
  const topDiskOnRod = app.disks.filter(d => d.position.x === rodPositionX).sort((a, b) => b.position.y - a.position.y)[0];
  if (topDiskOnRod) {
    selectedDisk = topDiskOnRod;
    selectedDisk.originalMaterial = selectedDisk.material;
    selectedDisk.material = highlightMaterial;
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

init();
