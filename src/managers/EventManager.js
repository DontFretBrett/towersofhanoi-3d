import * as THREE from 'three';
import { DISK_COLORS, GAME_CONFIG, DISK_CONFIG } from '../constants/GameConfig';
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
    this.setupClickDetection();
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
    const gameManager = this.gameManager;
    const selectedRod = gameManager.rods[rodIndex];

    if (this.selectedRodIndex === -1) {
        // Trying to select a disk
        if (selectedRod.disks.length > 0) {
            const topDisk = selectedRod.getTopDisk();
            // Allow selection even if other disks are moving
            if (!topDisk.isMoving) {
                topDisk.highlight();
                this.selectedRodIndex = rodIndex;
            }
        }
    } else {
        // Trying to move a disk
        const sourceRod = gameManager.rods[this.selectedRodIndex];
        const targetRod = selectedRod;
        const movingDisk = sourceRod.getTopDisk();

        if (this.selectedRodIndex === rodIndex) {
            // Deselect current disk if it's not moving
            if (!movingDisk.isMoving) {
                movingDisk.resetColor();
                this.selectedRodIndex = -1;
            }
        } else if (this.isValidMove(sourceRod, targetRod)) {
            // Allow the new move to proceed
            movingDisk.resetColor();
            this.selectedRodIndex = -1;
            this.moveDisk(sourceRod, targetRod);
        }
    }
  }

  isValidMove(sourceRod, targetRod) {
    if (!sourceRod || !targetRod) return false;
    
    const sourceDisk = sourceRod.getTopDisk();
    if (!sourceDisk) return false;
    if (sourceDisk.isMoving) return false;

    // Important: Check ALL disks that are currently moving to this target rod
    const movingDisksToTarget = this.gameManager.rods.flatMap(rod => 
        rod.disks.filter(disk => 
            disk.isMoving && 
            disk.mesh.position.x === targetRod.rod.position.x
        )
    );

    // If there are any disks moving to the target, use the smallest one for comparison
    if (movingDisksToTarget.length > 0) {
        const smallestMovingDisk = movingDisksToTarget.reduce((smallest, disk) => 
            disk.geometry.parameters.radiusTop < smallest.geometry.parameters.radiusTop ? disk : smallest
        );
        
        // Check if our source disk is larger than any disk that's moving to the target
        if (sourceDisk.geometry.parameters.radiusTop >= smallestMovingDisk.geometry.parameters.radiusTop) {
            return false;
        }
    }

    // Check against the actual top disk on the target rod
    const targetDisk = targetRod.getTopDisk();
    if (!targetDisk) return true;
    
    return sourceDisk.geometry.parameters.radiusTop < targetDisk.geometry.parameters.radiusTop;
  }

  async moveDisk(sourceRod, targetRod) {
    const disk = sourceRod.getTopDisk();
    if (!disk) return;

    disk.resetColor();
    
    const effectiveDiskThickness = DISK_CONFIG.height + DISK_CONFIG.SPACING;
    // Calculate Y position for the center of the disk on the target rod
    // (targetRod.disks.length will be its index in the stack, 0-based)
    const finalHeight = (targetRod.disks.length * effectiveDiskThickness) + effectiveDiskThickness;

    const liftHeight = GAME_CONFIG.ANIMATION.LIFT_HEIGHT;

    try {
        sourceRod.removeDisk();

        // Combined vertical and horizontal movement for smoother transition
        await Animation.moveDisk(
            disk,
            {
                x: targetRod.rod.position.x,
                y: liftHeight, // Lift to this absolute Y
                z: 0
            },
            GAME_CONFIG.ANIMATION.LIFT_DURATION
        );

        // Quick drop down to final calculated height
        await Animation.moveDisk(
            disk,
            {
                x: targetRod.rod.position.x,
                y: finalHeight,
                z: 0
            },
            GAME_CONFIG.ANIMATION.DROP_DURATION
        );

        targetRod.addDisk(disk); // addDisk will use its own logic to place, but animation should target this finalHeight

        // Update move counter
        this.gameManager.moveCounter++;
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateMoveCounter(this.gameManager.moveCounter);
        }

        if (this.gameManager.checkWin()) {
            const moves = this.gameManager.moveCounter;
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

  setupClickDetection() {
    // Remove existing click cylinders
    this.clickCylinders.forEach(cylinder => {
      this.gameManager.scene.remove(cylinder);
      cylinder.geometry.dispose(); // Also dispose geometry and material
      cylinder.material.dispose();
    });
    this.clickCylinders = [];

    // Create new click cylinders
    this.gameManager.rods.forEach((rod, index) => {
      // Using the larger geometry from the original createClickCylinders for consistency
      const clickGeometry = new THREE.CylinderGeometry(1.8, 1.8, 8, 16);
      const clickMaterial = new THREE.MeshBasicMaterial({ 
        visible: false 
      });
      const clickCylinder = new THREE.Mesh(clickGeometry, clickMaterial);
      // Position cylinder at rod x, z, but fixed Y for consistent click height
      clickCylinder.position.set(
        rod.rod.position.x,
        4, // Consistent Y position from original createClickCylinders
        rod.rod.position.z
      );
      clickCylinder.userData.rodIndex = index;
      this.clickCylinders.push(clickCylinder);
      this.gameManager.scene.add(clickCylinder);
    });
  }
}
