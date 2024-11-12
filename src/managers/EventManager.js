import * as THREE from 'three';
import { DISK_COLORS } from '../constants/GameConfig';
import { Animation } from '../utils/Animation';

export class EventManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedRodIndex = -1;
  }

  init() {
    // Only listen for keyboard events on the window
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    
    // Add pointer-events back for the canvas only for mouse events if needed
    this.gameManager.scene.renderer.domElement.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        this.onMouseDown(event);
    });
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

  onMouseDown(event) {
    event.preventDefault();
    
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.gameManager.scene.camera);
    
    // Handle disk selection and movement
    const intersects = this.raycaster.intersectObjects(
      this.gameManager.disks.map(disk => disk.mesh)
    );

    if (intersects.length > 0) {
      // Handle disk selection logic
    }
  }
}
