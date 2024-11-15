import { Rod } from '../components/Rod';
import { Disk } from '../components/Disk';
import { DISK_COLORS, DISK_CONFIG, GAME_CONFIG } from '../constants/GameConfig';
import { Table } from '../components/Table';

export class GameManager {
  constructor(scene) {
    this.scene = scene;
    this.rods = [];
    this.disks = [];
    this.selectedDisk = null;
    this.moveCounter = 0;
    this.numDisks = 3;
    this.uiManager = null;
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
      // Reset destination status and appearance
      rod.isDestination = (rod === this.rods[2]); // Make third rod the destination
      rod.base.material.color.setHex(rod.isDestination ? 0x4a8a4a : 0x4a4a4a);
      rod.rod.material.color.setHex(rod.isDestination ? 0x80a080 : 0x808080);
    });
    
    // Reset move counter
    this.moveCounter = 0;
    
    // Create new disks
    this.createDisks();
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
      // Update rod appearance
      rod.base.material.color.setHex(rod.isDestination ? 0x4a8a4a : 0x4a4a4a);
      rod.rod.material.color.setHex(rod.isDestination ? 0x80a080 : 0x808080);
    });

    // Randomly distribute disks while maintaining size order
    this.disks.sort((a, b) => b.geometry.parameters.radiusTop - a.geometry.parameters.radiusTop);
    
    this.disks.forEach(disk => {
      const availableRods = this.rods.filter(rod => {
        const topDisk = rod.getTopDisk();
        return !topDisk || topDisk.geometry.parameters.radiusTop > disk.geometry.parameters.radiusTop;
      });
      
      const randomRod = availableRods[Math.floor(Math.random() * availableRods.length)];
      const stackHeight = randomRod.disks.length * 0.35 + 0.3;
      disk.mesh.position.set(randomRod.rod.position.x, stackHeight, 0);
      randomRod.addDisk(disk);
    });
  }
}
