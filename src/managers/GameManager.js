import { Rod } from '../components/Rod';
import { Disk } from '../components/Disk';
import { DISK_COLORS, DISK_CONFIG } from '../constants/GameConfig';
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
      { x: -4, z: 0 },
      { x: 0, z: 0 },
      { x: 4, z: 0 }
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
    this.rods.forEach(rod => rod.disks = []);
    
    // Reset move counter
    this.moveCounter = 0;
    
    // Create new disks
    this.createDisks();
  }

  checkWin() {
    return this.rods[2].disks.length === this.numDisks;
  }
}
