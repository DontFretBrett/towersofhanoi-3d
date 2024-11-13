import * as THREE from 'three';
import { DISK_COLORS } from '../constants/GameConfig';
import { Animation } from '../utils/Animation';

export class EventManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedRodIndex = -1;
    
    // Create invisible click cylinders for each rod
    this.clickCylinders = [];
  }

  init() {
    // Keyboard events
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    
    // Mouse events
    const canvas = this.gameManager.scene.renderer.domElement;
    canvas.addEventListener('mousedown', (event) => this.onPointerDown(event));
    
    // Touch events
    canvas.addEventListener('touchstart', (event) => {
      event.preventDefault(); // Prevent scrolling
      if (event.touches.length === 1) {
        this.onPointerDown(event.touches[0]);
      }
    }, { passive: false });

    // Create invisible cylinders for click/tap detection
    this.createClickCylinders();
  }

  createClickCylinders() {
    // Clear existing cylinders
    this.clickCylinders.forEach(cylinder => {
      cylinder.geometry.dispose();
      cylinder.material.dispose();
      this.gameManager.scene.remove(cylinder);
    });
    this.clickCylinders = [];

    // Create new invisible cylinders for each rod
    this.gameManager.rods.forEach((rod, index) => {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
      const material = new THREE.MeshBasicMaterial({
        visible: false
      });
      const cylinder = new THREE.Mesh(geometry, material);
      
      // Position cylinder at rod position
      cylinder.position.set(
        rod.rod.position.x,
        2, // Half height of cylinder
        rod.rod.position.z
      );
      
      // Store rod index for later reference
      cylinder.userData.rodIndex = index;
      
      this.clickCylinders.push(cylinder);
      this.gameManager.scene.add(cylinder);
    });
  }

  onPointerDown(event) {
    // Calculate pointer position in normalized device coordinates
    const rect = this.gameManager.scene.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.gameManager.scene.camera);
    
    // Check for intersections with click cylinders
    const intersects = this.raycaster.intersectObjects(this.clickCylinders);
    
    if (intersects.length > 0) {
      const rodIndex = intersects[0].object.userData.rodIndex;
      this.handleRodSelection(rodIndex);
    }
  }

  onKeyDown(event) {
    const key = event.key;
    if (key >= '1' && key <= '3') {
      const rodIndex = parseInt(key) - 1;
      this.handleRodSelection(rodIndex);
    }
  }

  handleRodSelection(rodIndex) {
    console.log('Rod selected:', rodIndex); // Debug log
    const gameManager = this.gameManager;
    const selectedRod = gameManager.rods[rodIndex];

    if (this.selectedRodIndex === -1) {
      // Trying to select a disk
      if (selectedRod.disks.length > 0) {
        const topDisk = selectedRod.getTopDisk();
        topDisk.highlight();
        this.selectedRodIndex = rodIndex;
        console.log('Disk selected from rod:', rodIndex); // Debug log
      }
    } else {
      // Trying to move a disk
      const sourceRod = gameManager.rods[this.selectedRodIndex];
      const targetRod = selectedRod;

      if (this.selectedRodIndex === rodIndex) {
        // Deselect current disk
        const topDisk = sourceRod.getTopDisk();
        topDisk.resetColor();
        this.selectedRodIndex = -1;
        console.log('Disk deselected'); // Debug log
      } else if (this.isValidMove(sourceRod, targetRod)) {
        console.log('Moving disk from rod', this.selectedRodIndex, 'to rod', rodIndex); // Debug log
        this.moveDisk(sourceRod, targetRod);
      } else {
        console.log('Invalid move attempted'); // Debug log
      }
    }
  }

  isValidMove(sourceRod, targetRod) {
    if (sourceRod.disks.length === 0) return false;
    if (targetRod.disks.length === 0) return true;
    
    const movingDisk = sourceRod.getTopDisk();
    const targetDisk = targetRod.getTopDisk();
    
    // Compare disk radiuses for valid move
    const movingRadius = movingDisk.geometry.parameters.radiusTop;
    const targetRadius = targetDisk.geometry.parameters.radiusTop;
    
    return movingRadius < targetRadius;
  }

  async moveDisk(sourceRod, targetRod) {
    const disk = sourceRod.getTopDisk(); // Get disk without removing it yet
    if (!disk) return;

    // Reset color before starting movement
    disk.resetColor();
    
    const finalHeight = targetRod.disks.length * 0.35 + 0.3;
    const liftHeight = 3;

    try {
        // Now remove the disk from source rod
        sourceRod.removeDisk();

        // Step 1: Move up
        await Animation.moveDisk(
            disk,
            {
                x: disk.mesh.position.x,
                y: liftHeight,
                z: 0
            }
        );

        // Step 2: Move horizontally
        await Animation.moveDisk(
            disk,
            {
                x: targetRod.rod.position.x,
                y: liftHeight,
                z: 0
            }
        );

        // Step 3: Move down
        await Animation.moveDisk(
            disk,
            {
                x: targetRod.rod.position.x,
                y: finalHeight,
                z: 0
            }
        );

        targetRod.addDisk(disk);
        this.selectedRodIndex = -1;

        // Update move counter
        this.gameManager.moveCounter++;
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateMoveCounter(this.gameManager.moveCounter);
        }

        if (this.gameManager.checkWin()) {
            const moves = this.gameManager.moveCounter;
            // Stop the timer first
            this.gameManager.uiManager.timer.stop();
            const timeString = this.gameManager.uiManager.timer.getTimeString();
            
            setTimeout(() => {
                alert(`Congratulations! You won!\nMoves: ${moves}\nTime: ${timeString}`);
            }, 100);
        }
    } catch (error) {
        console.error('Movement error:', error);
    }
  }
}
