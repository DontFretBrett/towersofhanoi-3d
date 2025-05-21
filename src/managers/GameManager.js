import { Rod } from '../components/Rod';
import { Disk } from '../components/Disk';
import { StateManager } from './StateManager';
import { DISK_COLORS, DISK_CONFIG, GAME_CONFIG } from '../constants/GameConfig';
import { Table } from '../components/Table';
import { MoveCalculator } from '../utils/MoveCalculator';

export class GameManager {
  constructor(scene) {
    this.scene = scene;
    this.rods = [];
    this.disks = [];
    this.selectedDisk = null;
    this.moveCounter = 0;
    this.optimalMoves = 0;
    this.numDisks = 3;
    this.uiManager = null;
    this.stateManager = new StateManager();
  }

  _getCurrentDiskConfiguration() {
    return this.rods.map(rod =>
      rod.disks.map(disk => ({
        radius: disk.geometry.parameters.radiusTop,
        color: disk.mesh.material.color.getHex()
      }))
    );
  }

  recordCurrentState() {
    const gameState = {
      diskConfiguration: this._getCurrentDiskConfiguration(),
      moveCount: this.moveCounter
    };
    this.stateManager.pushState(gameState);
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  init() {
    // Create and add table first
    const table = new Table();
    this.scene.add(table.getMesh());
    
    this.createRods();
    this.createDisks();
    this.optimalMoves = MoveCalculator.getStandardMinimumMoves(this.numDisks);
    if (this.uiManager) {
      this.uiManager.updateOptimalMoves(this.optimalMoves);
    }
    this.recordCurrentState();
  }

  createRods() {
    const positions = [
      { x: -GAME_CONFIG.ROD.SPACING, z: 0 },
      { x: 0, z: 0 },
      { x: GAME_CONFIG.ROD.SPACING, z: 0 }
    ];

    positions.forEach((pos, index) => {
        const isDestination = index === 2;  // Third rod is destination
        const rod = new Rod(pos, 4, 0.1, isDestination);
        this.rods.push(rod);
        this.scene.add(rod.getMesh());
    });
  }

  createDisks() {
    const numDisks = Math.min(this.numDisks, DISK_COLORS.length);
    const radiusDecrement = (DISK_CONFIG.maxRadius - DISK_CONFIG.minRadius) / (numDisks - 1);
    
    for (let i = 0; i < numDisks; i++) {
        const radius = DISK_CONFIG.maxRadius - (i * radiusDecrement);
        const disk = new Disk(
            radius,
            DISK_CONFIG.height,
            DISK_COLORS[i],
            [
                this.rods[0].rod.position.x, 
                (i * 0.35) + 0.3,
                0
            ]
        );
        this.disks.push(disk);
        this.rods[0].addDisk(disk);
        this.scene.add(disk.mesh);
    }
  }

  reset() {
    // Remove existing disks
    this.disks.forEach(disk => {
        this.scene.remove(disk.mesh);
        disk.dispose();
    });
    
    // Clear arrays
    this.disks = [];
    this.rods.forEach(rod => {
      rod.disks = [];
      // Reset destination status
      rod.isDestination = (rod === this.rods[2]);
      rod.base.material.color.setHex(rod.isDestination ? 0x4a8a4a : 0x4a4a4a);
      rod.rod.material.color.setHex(rod.isDestination ? 0x80a080 : 0x808080);
    });
    
    // Reset move counter
    this.moveCounter = 0;
    
    // Create new disks
    this.createDisks();
    
    // Calculate optimal moves for standard configuration
    this.optimalMoves = MoveCalculator.getStandardMinimumMoves(this.numDisks);
    if (this.uiManager) {
      this.uiManager.updateOptimalMoves(this.optimalMoves);
    }
    this.stateManager.clearHistory();
    this.recordCurrentState();
  }

  checkWin() {
    // Find the destination rod
    const destinationRod = this.rods.find(rod => rod.isDestination);
    
    // Check if all disks are on the destination rod
    const hasAllDisks = destinationRod.disks.length === this.numDisks;
    
    // Verify disks are in correct order (largest to smallest)
    const isCorrectOrder = destinationRod.disks.every((disk, index, array) => {
      if (index === 0) return true;
      const prevDiskRadius = array[index - 1].geometry.parameters.radiusTop;
      const currentDiskRadius = disk.geometry.parameters.radiusTop;
      return prevDiskRadius > currentDiskRadius;
    });

    return hasAllDisks && isCorrectOrder;
  }

  randomize() {
    // Remove existing disks from scene
    this.disks.forEach(disk => {
      this.scene.remove(disk.mesh);
      disk.dispose();
    });
    
    // Clear arrays
    this.disks = [];
    this.rods.forEach(rod => rod.disks = []);
    
    // Reset move counter
    this.moveCounter = 0;
    
    // Create new disks array but don't place them yet
    const numDisks = Math.min(this.numDisks, DISK_COLORS.length);
    const radiusDecrement = (DISK_CONFIG.maxRadius - DISK_CONFIG.minRadius) / (numDisks - 1);
    
    for (let i = 0; i < numDisks; i++) {
      const radius = DISK_CONFIG.maxRadius - (i * radiusDecrement);
      const disk = new Disk(
        radius,
        DISK_CONFIG.height,
        DISK_COLORS[i],
        [0, 0, 0] // temporary position
      );
      this.disks.push(disk);
      this.scene.add(disk.mesh);
    }

    // Randomly choose the destination rod (0, 1, or 2)
    const destinationRodIndex = Math.floor(Math.random() * 3);
    this.rods.forEach((rod, index) => {
      rod.isDestination = (index === destinationRodIndex);
      rod.base.material.color.setHex(rod.isDestination ? 0x4a8a4a : 0x4a4a4a);
      rod.rod.material.color.setHex(rod.isDestination ? 0x80a080 : 0x808080);
    });

    // Sort disks by size (largest to smallest)
    this.disks.sort((a, b) => b.geometry.parameters.radiusTop - a.geometry.parameters.radiusTop);

    // Ensure at least one disk is not on the destination rod
    let firstDiskPlaced = false;
    this.disks.forEach((disk, index) => {
      const availableRods = this.rods.filter(rod => {
        // If this is the first disk and we haven't placed one yet,
        // exclude the destination rod as an option
        if (!firstDiskPlaced && rod.isDestination) {
          return false;
        }
        const topDisk = rod.getTopDisk();
        return !topDisk || topDisk.geometry.parameters.radiusTop > disk.geometry.parameters.radiusTop;
      });
      
      const randomRod = availableRods[Math.floor(Math.random() * availableRods.length)];
      const stackHeight = randomRod.disks.length * 0.35 + 0.3;
      disk.mesh.position.set(randomRod.rod.position.x, stackHeight, 0);
      randomRod.addDisk(disk);

      // Mark that we've placed at least one disk not on destination
      if (!randomRod.isDestination) {
        firstDiskPlaced = true;
      }
    });

    // If all disks somehow ended up on destination rod (extremely unlikely now),
    // move the top disk to a random non-destination rod
    if (!firstDiskPlaced) {
      const destRod = this.rods[destinationRodIndex];
      const topDisk = destRod.removeDisk();
      const nonDestRods = this.rods.filter(rod => !rod.isDestination);
      const randomRod = nonDestRods[Math.floor(Math.random() * nonDestRods.length)];
      const stackHeight = randomRod.disks.length * 0.35 + 0.3;
      topDisk.mesh.position.set(randomRod.rod.position.x, stackHeight, 0);
      randomRod.addDisk(topDisk);
    }

    // Reset selection state
    this.selectedDisk = null;
    
    // Ensure event manager is reset
    if (this.eventManager) {
      this.eventManager.selectedRodIndex = -1;
      this.eventManager.setupClickDetection();
    }

    // Calculate optimal moves
    this.optimalMoves = MoveCalculator.calculateOptimalMoves(
      this.rods,
      this.rods.findIndex(rod => rod.isDestination)
    );
    
    if (this.uiManager) {
      this.uiManager.updateOptimalMoves(this.optimalMoves);
    }
    this.stateManager.clearHistory();
    this.recordCurrentState();
  }

  undoMove() {
    // Step 1: Check History Length
    // If history has only one state (the initial recorded state), there's nothing to undo *to*.
    if (this.stateManager.getHistoryLength() <= 1) {
      console.warn("Undo: Already at initial state or no history to undo to.");
      return;
    }

    // Step 2: Pop and Discard Current State from history
    // This removes the current state. The history's last element is now the state we want to restore.
    this.stateManager.popState(); 

    // Step 3: Get the state to restore (which is now the last one in history)
    const stateToRestore = this.stateManager.history[this.stateManager.history.length - 1];
    
    // This check is a safeguard; theoretically, if getHistoryLength() > 1,
    // after a pop, history should not be empty and its last element should exist.
    if (!stateToRestore) {
      console.error("Undo: Failed to get state to restore after popping. History might be corrupted.");
      return;
    }

    // Step 4: Restore moveCounter
    this.moveCounter = stateToRestore.moveCount;

    // Step 5: Reset Selection State
    if (this.selectedDisk) {
      this.selectedDisk.resetColor(); // Visually unhighlight if a disk was selected
      this.selectedDisk = null;
    }
    // GameManager does not directly manage EventManager's selectedRodIndex.
    // EventManager should ideally observe gameManager.selectedDisk or be reset by UIManager/App.

    // Step 6: Clear Current Disk Arrangement
    // Remove existing disk meshes from the scene and dispose them
    this.disks.forEach(disk => {
      this.scene.remove(disk.mesh);
      // Assuming Disk objects have a dispose method for their geometry/material
      // Based on existing code in reset() and randomize() that calls disk.dispose() directly.
      disk.dispose(); 
    });
    this.disks = []; // Clear the GameManager's master list of disks

    // Clear internal disks array for each rod
    this.rods.forEach(rod => {
      rod.disks = [];
    });

    // Step 7: Recreate and Place Disks from stateToRestore
    stateToRestore.diskConfiguration.forEach((rodConfig, rodIndex) => {
      const targetRodObject = this.rods[rodIndex]; // The actual Rod object
      rodConfig.forEach(diskData => {
        const newDisk = new Disk(
          diskData.radius,
          DISK_CONFIG.height, // Height from constants
          diskData.color      // Color from stored state
        );

        // Calculate Y position based on how many disks are already on this targetRodObject
        // as we are adding them one by one during this restoration loop.
        const yPos = (targetRodObject.disks.length * 0.35) + 0.3; // Consistent with createDisks/moveDisk
        
        newDisk.mesh.position.set(targetRodObject.rod.position.x, yPos, targetRodObject.rod.position.z);
        
        this.scene.add(newDisk.mesh);      // Add new disk's mesh to the scene
        targetRodObject.addDisk(newDisk);  // Add disk to the Rod object's list
        this.disks.push(newDisk);          // Add disk to GameManager's master list
      });
    });

    // Step 8: Update UI
    if (this.uiManager) {
      this.uiManager.updateMoveCounter(this.moveCounter);
    }

    // The game state (this.disks, this.moveCounter, etc.) now matches stateToRestore.
    // The StateManager's history already has stateToRestore as its last element because of popState().
    // No need to call recordCurrentState() here, as that would add a duplicate entry of the restored state.
  }
}
